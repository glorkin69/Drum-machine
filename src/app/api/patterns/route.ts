import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validatePatternData, checkPatternLimit } from "@/lib/validation";
import { checkGenericRateLimit, createRateLimitResponse } from "@/lib/security";
import { ZodError } from "zod";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You'll need to sign in first" }, { status: 401 });
    }

    // Rate limit: 60 reads per minute per user
    const rateCheck = checkGenericRateLimit(`patterns:get:${session.user.id}`, 60, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const patterns = await prisma.savedPattern.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, genre: true, songPart: true, emotion: true, bpm: true },
    });

    return NextResponse.json(patterns);
  } catch (error) {
    console.error("Error fetching patterns:", error);
    return NextResponse.json({ error: "Couldn't load your patterns. Mind trying again?" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You'll need to sign in first" }, { status: 401 });
    }

    // Rate limit: 30 saves per minute per user
    const rateCheck = checkGenericRateLimit(`patterns:post:${session.user.id}`, 30, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    // Check storage limit before processing
    const limitCheck = await checkPatternLimit(session.user.id, prisma);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `You've hit the pattern limit (${limitCheck.count}/${limitCheck.limit}). Delete a few to make room for new ones.`,
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Validate and sanitize pattern data
    const validatedData = validatePatternData(body);

    // Save to database with validated data
    const saved = await prisma.savedPattern.create({
      data: {
        name: validatedData.name,
        genre: validatedData.genre,
        songPart: validatedData.songPart,
        emotion: validatedData.emotion || null,
        bpm: validatedData.bpm,
        pattern: validatedData.pattern,
        userId: session.user.id,
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Error saving pattern:", error);

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

    return NextResponse.json({ error: "Couldn't save that pattern. Try again?" }, { status: 500 });
  }
}
