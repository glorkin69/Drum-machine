import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkGenericRateLimit, createRateLimitResponse, isValidId } from "@/lib/security";

/**
 * GET /api/collab/sessions/[id]/recordings
 * List all recordings for a session.
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
    const rateCheck = checkGenericRateLimit(`collab:recordings:${session.user.id}`, 60, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const { id: sessionId } = await params;

    if (!isValidId(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    // Verify session exists and user has access
    const collabSession = await prisma.collabSession.findUnique({
      where: { id: sessionId },
      select: {
        hostId: true,
        visibility: true,
        participants: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });

    if (!collabSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isHost = collabSession.hostId === session.user.id;
    const isParticipant = collabSession.participants.length > 0;
    const isPublic = collabSession.visibility === "public";

    if (!isHost && !isParticipant && !isPublic) {
      return NextResponse.json({ error: "You don't have access to this session" }, { status: 403 });
    }

    const recordings = await prisma.collabRecording.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        duration: true,
        startBpm: true,
        startGenre: true,
        startPart: true,
        participants: true,
        createdAt: true,
      },
    });

    return NextResponse.json(recordings);
  } catch (error) {
    console.error("Error fetching recordings:", error);
    return NextResponse.json({ error: "Couldn't load recordings. Try again?" }, { status: 500 });
  }
}

/**
 * POST /api/collab/sessions/[id]/recordings
 * Save a new recording for a session.
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

    // Rate limit: 10 recording saves per minute per user
    const rateCheck = checkGenericRateLimit(`collab:rec-save:${session.user.id}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const { id: sessionId } = await params;

    if (!isValidId(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    // Verify session exists and user is a participant
    const collabSession = await prisma.collabSession.findUnique({
      where: { id: sessionId },
      select: {
        isActive: true,
        participants: {
          where: { userId: session.user.id, leftAt: null },
          select: { id: true },
        },
      },
    });

    if (!collabSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (collabSession.participants.length === 0) {
      return NextResponse.json({ error: "You must be an active participant to save recordings" }, { status: 403 });
    }

    const body = await request.json();
    const { name, duration, events, startBpm, startGenre, startPart, startPattern, participants } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Recording name is required" }, { status: 400 });
    }

    if (!Array.isArray(events)) {
      return NextResponse.json({ error: "Events must be an array" }, { status: 400 });
    }

    // Limit recordings per session
    const recordingCount = await prisma.collabRecording.count({
      where: { sessionId },
    });

    if (recordingCount >= 50) {
      return NextResponse.json(
        { error: "Recording limit reached (max 50 per session). Delete some to make room." },
        { status: 403 }
      );
    }

    const recording = await prisma.collabRecording.create({
      data: {
        sessionId,
        name: name.trim(),
        duration: typeof duration === "number" ? duration : 0,
        events: events,
        startBpm: typeof startBpm === "number" ? startBpm : 120,
        startGenre: typeof startGenre === "string" ? startGenre : "rock",
        startPart: typeof startPart === "string" ? startPart : "verse",
        startPattern: startPattern || {},
        participants: Array.isArray(participants) ? participants : [],
      },
    });

    return NextResponse.json(recording, { status: 201 });
  } catch (error) {
    console.error("Error saving recording:", error);
    return NextResponse.json({ error: "Couldn't save the recording. Try again?" }, { status: 500 });
  }
}
