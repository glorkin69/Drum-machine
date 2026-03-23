import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_SESSION_PARTICIPANTS } from "@/lib/collab-types";
import { checkGenericRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security";

/**
 * POST /api/collab/sessions/join
 * Join an existing collaboration session by invite code.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You'll need to sign in first" }, { status: 401 });
    }

    // Rate limit: 10 join attempts per 5 minutes per IP (prevent invite code enumeration)
    const ip = getClientIp(request);
    const rateCheck = checkGenericRateLimit(`collab:join:${ip}`, 10, 5 * 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode || typeof inviteCode !== "string") {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    // Validate invite code format (8 uppercase alphanumeric chars)
    const normalizedCode = inviteCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6,8}$/.test(normalizedCode)) {
      return NextResponse.json({ error: "Invalid invite code format" }, { status: 400 });
    }

    // Find the session by invite code
    const collabSession = await prisma.collabSession.findUnique({
      where: { inviteCode: normalizedCode },
      include: {
        host: { select: { id: true, name: true } },
        participants: {
          where: { leftAt: null },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!collabSession) {
      return NextResponse.json({ error: "No session found with that invite code" }, { status: 404 });
    }

    if (!collabSession.isActive) {
      return NextResponse.json({ error: "This session has ended" }, { status: 410 });
    }

    // Check if the user is already in the session
    const existingParticipant = collabSession.participants.find(
      (p) => p.userId === session.user.id
    );

    if (existingParticipant) {
      // Already in the session, just return it
      return NextResponse.json(collabSession);
    }

    // Check participant limit
    if (collabSession.participants.length >= MAX_SESSION_PARTICIPANTS) {
      return NextResponse.json(
        { error: `Session is full (max ${MAX_SESSION_PARTICIPANTS} participants)` },
        { status: 403 }
      );
    }

    // Check if the user previously left and rejoin
    const previousParticipant = await prisma.collabParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId: collabSession.id,
          userId: session.user.id,
        },
      },
    });

    if (previousParticipant) {
      // Re-activate the participant
      await prisma.collabParticipant.update({
        where: { id: previousParticipant.id },
        data: { leftAt: null, role: "collaborator" },
      });
    } else {
      // Create a new participant
      await prisma.collabParticipant.create({
        data: {
          sessionId: collabSession.id,
          userId: session.user.id,
          role: "collaborator",
          assignedInstruments: [],
        },
      });
    }

    // Fetch the updated session
    const updatedSession = await prisma.collabSession.findUnique({
      where: { id: collabSession.id },
      include: {
        host: { select: { id: true, name: true } },
        participants: {
          where: { leftAt: null },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error joining collab session:", error);
    return NextResponse.json({ error: "Couldn't join the session. Try again?" }, { status: 500 });
  }
}
