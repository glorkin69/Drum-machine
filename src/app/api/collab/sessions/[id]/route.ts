import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkGenericRateLimit, createRateLimitResponse, isValidId } from "@/lib/security";

/**
 * GET /api/collab/sessions/[id]
 * Get full session details including participants.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You'll need to sign in first" }, { status: 401 });
    }

    // Rate limit: 60 reads per minute per user
    const rateCheck = checkGenericRateLimit(`collab:detail:${session.user.id}`, 60, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const collabSession = await prisma.collabSession.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, name: true } },
        participants: {
          where: { leftAt: null },
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { recordings: true } },
      },
    });

    if (!collabSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if user has access: must be host, participant, or session is public
    const isHost = collabSession.hostId === session.user.id;
    const isParticipant = collabSession.participants.some(
      (p) => p.userId === session.user.id
    );
    const isPublic = collabSession.visibility === "public";

    if (!isHost && !isParticipant && !isPublic) {
      return NextResponse.json({ error: "You don't have access to this session" }, { status: 403 });
    }

    return NextResponse.json(collabSession);
  } catch (error) {
    console.error("Error fetching collab session:", error);
    return NextResponse.json({ error: "Couldn't load the session. Try again?" }, { status: 500 });
  }
}

/**
 * PATCH /api/collab/sessions/[id]
 * Update session settings (host only).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You'll need to sign in first" }, { status: 401 });
    }

    // Rate limit: 30 updates per minute per user
    const rateCheck = checkGenericRateLimit(`collab:update:${session.user.id}`, 30, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const body = await request.json();

    const collabSession = await prisma.collabSession.findUnique({
      where: { id },
      select: { hostId: true, isActive: true },
    });

    if (!collabSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!collabSession.isActive) {
      return NextResponse.json({ error: "This session has ended" }, { status: 410 });
    }

    if (collabSession.hostId !== session.user.id) {
      return NextResponse.json({ error: "Only the host can update session settings" }, { status: 403 });
    }

    // Build update data from allowed fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = ["name", "genre", "songPart", "emotion", "bpm", "patternLength", "visibility", "patternData"];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "name") {
          const name = String(body.name).trim();
          if (name.length === 0 || name.length > 100) {
            return NextResponse.json({ error: "Session name must be 1-100 characters" }, { status: 400 });
          }
          updateData.name = name;
        } else if (field === "bpm") {
          updateData.bpm = Math.min(300, Math.max(40, Number(body.bpm)));
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.collabSession.update({
      where: { id },
      data: updateData,
      include: {
        host: { select: { id: true, name: true } },
        participants: {
          where: { leftAt: null },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating collab session:", error);
    return NextResponse.json({ error: "Couldn't update the session. Try again?" }, { status: 500 });
  }
}

/**
 * DELETE /api/collab/sessions/[id]
 * Close/deactivate a session (host only).
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You'll need to sign in first" }, { status: 401 });
    }

    // Rate limit: 10 deletes per minute per user
    const rateCheck = checkGenericRateLimit(`collab:delete:${session.user.id}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const collabSession = await prisma.collabSession.findUnique({
      where: { id },
      select: { hostId: true, isActive: true },
    });

    if (!collabSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (collabSession.hostId !== session.user.id) {
      return NextResponse.json({ error: "Only the host can close the session" }, { status: 403 });
    }

    if (!collabSession.isActive) {
      return NextResponse.json({ error: "Session is already closed" }, { status: 410 });
    }

    // Mark session as inactive and set leftAt for all active participants
    await prisma.$transaction([
      prisma.collabSession.update({
        where: { id },
        data: { isActive: false },
      }),
      prisma.collabParticipant.updateMany({
        where: { sessionId: id, leftAt: null },
        data: { leftAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Session closed" });
  } catch (error) {
    console.error("Error closing collab session:", error);
    return NextResponse.json({ error: "Couldn't close the session. Try again?" }, { status: 500 });
  }
}
