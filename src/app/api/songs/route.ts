import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateSongData, checkSongLimit } from "@/lib/validation";
import { checkGenericRateLimit, createRateLimitResponse } from "@/lib/security";
import { ZodError } from "zod";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You'll need to sign in first" }, { status: 401 });
    }

    // Rate limit: 60 reads per minute per user
    const rateCheck = checkGenericRateLimit(`songs:get:${session.user.id}`, 60, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const songs = await prisma.savedSong.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        loop: true,
        blocks: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return list with block count (avoid sending full block data in list)
    const songList = songs.map((s) => ({
      id: s.id,
      name: s.name,
      loop: s.loop,
      blockCount: Array.isArray(s.blocks) ? (s.blocks as unknown[]).length : 0,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json(songList);
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json({ error: "Couldn't load your songs. Want to try again?" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You'll need to sign in first" }, { status: 401 });
    }

    // Rate limit: 20 saves per minute per user
    const rateCheck = checkGenericRateLimit(`songs:post:${session.user.id}`, 20, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    // Check storage limit before processing
    const limitCheck = await checkSongLimit(session.user.id, prisma);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `You've hit the song limit (${limitCheck.count}/${limitCheck.limit}). Delete a few to make room for new ones.`,
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Validate and sanitize song data
    const validatedData = validateSongData(body);

    // Save to database with validated data
    const saved = await prisma.savedSong.create({
      data: {
        name: validatedData.name,
        blocks: validatedData.blocks,
        loop: validatedData.loop,
        userId: session.user.id,
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Error saving song:", error);

    // Handle validation errors with detailed messages
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        {
          error: "Validation failed",
          message: firstError.message,
          field: firstError.path.join("."),
        },
        { status: 400 }
      );
    }

    // Handle generic errors - sanitize in production
    if (error instanceof Error && process.env.NODE_ENV === "development") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Couldn't save that song. Try again?" }, { status: 500 });
  }
}
