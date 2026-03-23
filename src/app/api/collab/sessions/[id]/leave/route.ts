import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkGenericRateLimit, createRateLimitResponse, isValidId } from "@/lib/security";

/**
 * POST /api/collab/sessions/[id]/leave
 * Leave a collaboration session. If the host leaves, the session is closed.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You'll need to sign in first" }, { status: 401 });
    }

    // Rate limit: 10 leave actions per minute per user
    const rateCheck = checkGenericRateLimit(`collab:leave:${session.user.id}`, 10, 60_000);
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

    if (!collabSession.isActive) {
      return NextResponse.json({ error: "This session has already ended" }, { status: 410 });
    }

    // Find the participant record
    const participant = await prisma.collabParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId: id,
          userId: session.user.id,
        },
      },
    });

    if (!participant || participant.leftAt !== null) {
      return NextResponse.json({ error: "You're not in this session" }, { status: 400 });
    }

    // If the host is leaving, close the entire session
    if (collabSession.hostId === session.user.id) {
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

      return NextResponse.json({ success: true, message: "Session closed (host left)" });
    }

    // Regular participant leaves
    await prisma.collabParticipant.update({
      where: { id: participant.id },
      data: { leftAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "You left the session" });
  } catch (error) {
    console.error("Error leaving collab session:", error);
    return NextResponse.json({ error: "Couldn't leave the session. Try again?" }, { status: 500 });
  }
}
