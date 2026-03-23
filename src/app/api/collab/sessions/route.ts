import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/collab-types";
import { checkGenericRateLimit, createRateLimitResponse } from "@/lib/security";

/**
 * GET /api/collab/sessions
 * List the current user's collaboration sessions (hosted + joined).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You'll need to sign in first" }, { status: 401 });
    }

    // Rate limit: 60 reads per minute per user
    const rateCheck = checkGenericRateLimit(`collab:list:${session.user.id}`, 60, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const userId = session.user.id;

    // Fetch sessions where the user is host or participant
    const [hosted, participating] = await Promise.all([
      prisma.collabSession.findMany({
        where: { hostId: userId, isActive: true },
        include: {
          host: { select: { id: true, name: true } },
          participants: {
            where: { leftAt: null },
            include: { user: { select: { id: true, name: true } } },
          },
          _count: { select: { recordings: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.collabSession.findMany({
        where: {
          isActive: true,
          participants: {
            some: { userId, leftAt: null },
          },
          hostId: { not: userId },
        },
        include: {
          host: { select: { id: true, name: true } },
          participants: {
            where: { leftAt: null },
            include: { user: { select: { id: true, name: true } } },
          },
          _count: { select: { recordings: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return NextResponse.json({ hosted, participating });
  } catch (error) {
    console.error("Error fetching collab sessions:", error);
    return NextResponse.json({ error: "Couldn't load your sessions. Try again?" }, { status: 500 });
  }
}

/**
 * POST /api/collab/sessions
 * Create a new collaboration session.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You'll need to sign in first" }, { status: 401 });
    }

    // Rate limit: 10 session creations per hour per user
    const rateCheck = checkGenericRateLimit(`collab:create:${session.user.id}`, 10, 3600_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const body = await request.json();
    const { name, genre, songPart, emotion, bpm, patternLength, visibility, patternData } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Session name is required" }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: "Session name must be 100 characters or less" }, { status: 400 });
    }

    // Check if user already has too many active sessions as host
    const activeHostedCount = await prisma.collabSession.count({
      where: { hostId: session.user.id, isActive: true },
    });

    if (activeHostedCount >= 5) {
      return NextResponse.json(
        { error: "You can host up to 5 active sessions. Close one to create a new one." },
        { status: 403 }
      );
    }

    // Generate a unique invite code with retry
    let inviteCode = generateInviteCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.collabSession.findUnique({ where: { inviteCode } });
      if (!existing) break;
      inviteCode = generateInviteCode();
      attempts++;
    }

    const collabSession = await prisma.collabSession.create({
      data: {
        name: name.trim(),
        hostId: session.user.id,
        genre: genre || "rock",
        songPart: songPart || "verse",
        emotion: emotion || null,
        bpm: typeof bpm === "number" ? Math.min(300, Math.max(40, bpm)) : 120,
        patternLength: typeof patternLength === "number" ? patternLength : 16,
        visibility: visibility || "private",
        inviteCode,
        patternData: patternData || null,
        participants: {
          create: {
            userId: session.user.id,
            role: "host",
            assignedInstruments: [],
          },
        },
      },
      include: {
        host: { select: { id: true, name: true } },
        participants: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json(collabSession, { status: 201 });
  } catch (error) {
    console.error("Error creating collab session:", error);
    return NextResponse.json({ error: "Couldn't create the session. Try again?" }, { status: 500 });
  }
}
