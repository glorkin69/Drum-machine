/**
 * Session Recordings API
 * GET  /api/collab/recordings - List recordings
 * POST /api/collab/recordings - Save a recording
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkGenericRateLimit, createRateLimitResponse } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 60 reads per minute per user
    const rateCheck = checkGenericRateLimit(`recordings:list:${session.user.id}`, 60, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const sessionId = request.nextUrl.searchParams.get("sessionId");

    const where = sessionId
      ? { sessionId, session: { OR: [{ hostId: session.user.id }, { participants: { some: { userId: session.user.id } } }] } }
      : { session: { OR: [{ hostId: session.user.id }, { participants: { some: { userId: session.user.id } } }] } };

    const recordings = await prisma.collabRecording.findMany({
      where,
      select: {
        id: true,
        sessionId: true,
        name: true,
        duration: true,
        startBpm: true,
        startGenre: true,
        startPart: true,
        participants: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(recordings);
  } catch (error) {
    console.error("List recordings error:", error);
    return NextResponse.json({ error: "Failed to list recordings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 10 recording saves per minute per user
    const rateCheck = checkGenericRateLimit(`recordings:save:${session.user.id}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const body = await request.json();
    const { sessionId, name, duration, events, startBpm, startGenre, startPart, startPattern, participants } = body;

    if (!sessionId || !name) {
      return NextResponse.json({ error: "Session ID and name are required" }, { status: 400 });
    }

    // Verify session access
    const collabSession = await prisma.collabSession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { hostId: session.user.id },
          { participants: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!collabSession) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 });
    }

    // Limit recordings per session
    const recordingCount = await prisma.collabRecording.count({
      where: { sessionId },
    });
    if (recordingCount >= 20) {
      return NextResponse.json(
        { error: "Maximum recordings per session reached (20)" },
        { status: 400 }
      );
    }

    const recording = await prisma.collabRecording.create({
      data: {
        sessionId,
        name: name.slice(0, 100),
        duration: duration || 0,
        events: events || [],
        startBpm: startBpm || 120,
        startGenre: startGenre || "rock",
        startPart: startPart || "verse",
        startPattern: startPattern || {},
        participants: participants || [],
      },
    });

    return NextResponse.json(recording, { status: 201 });
  } catch (error) {
    console.error("Save recording error:", error);
    return NextResponse.json({ error: "Failed to save recording" }, { status: 500 });
  }
}
