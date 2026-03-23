/**
 * Single Recording API
 * GET    /api/collab/recordings/[id] - Get recording with events
 * DELETE /api/collab/recordings/[id] - Delete a recording
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkGenericRateLimit, createRateLimitResponse, isValidId } from "@/lib/security";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 60 reads per minute per user
    const rateCheck = checkGenericRateLimit(`recordings:get:${session.user.id}`, 60, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid recording ID" }, { status: 400 });
    }

    const recording = await prisma.collabRecording.findUnique({
      where: { id },
      include: {
        session: {
          select: {
            hostId: true,
            participants: { select: { userId: true } },
          },
        },
      },
    });

    if (!recording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    // Check access
    const hasAccess =
      recording.session.hostId === session.user.id ||
      recording.session.participants.some((p) => p.userId === session.user!.id);

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      id: recording.id,
      sessionId: recording.sessionId,
      name: recording.name,
      duration: recording.duration,
      events: recording.events,
      startBpm: recording.startBpm,
      startGenre: recording.startGenre,
      startPart: recording.startPart,
      startPattern: recording.startPattern,
      participants: recording.participants,
      createdAt: recording.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Get recording error:", error);
    return NextResponse.json({ error: "Failed to get recording" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 10 deletes per minute per user
    const rateCheck = checkGenericRateLimit(`recordings:delete:${session.user.id}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid recording ID" }, { status: 400 });
    }

    const recording = await prisma.collabRecording.findUnique({
      where: { id },
      include: {
        session: { select: { hostId: true } },
      },
    });

    if (!recording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    if (recording.session.hostId !== session.user.id) {
      return NextResponse.json({ error: "Only the session host can delete recordings" }, { status: 403 });
    }

    await prisma.collabRecording.delete({ where: { id } });

    return NextResponse.json({ message: "Recording deleted" });
  } catch (error) {
    console.error("Delete recording error:", error);
    return NextResponse.json({ error: "Failed to delete recording" }, { status: 500 });
  }
}
