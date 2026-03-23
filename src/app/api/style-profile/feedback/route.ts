import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzePattern, mergeFingerprints, createDefaultFingerprint, hashPattern } from "@/lib/style-dna";
import type { StyleFingerprint } from "@/lib/style-dna";
import {
  checkGenericRateLimit,
  createRateLimitResponse,
  getClientIp,
} from "@/lib/security";

const MAX_FEEDBACK_PER_USER = 1000;

/**
 * POST /api/style-profile/feedback - Submit pattern feedback (like/dislike)
 * Updates the user's style DNA profile based on feedback.
 * Rate limited to 30 feedback submissions per minute per user.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to provide feedback" }, { status: 401 });
    }

    // Rate limit: 30 feedback submissions per minute per user
    const rateCheck = checkGenericRateLimit(
      `feedback:${session.user.id}`,
      30,
      60_000
    );
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const body = await request.json();
    const { pattern, liked, genre, songPart, artistDna, patternLength } = body;

    // Validate
    if (!pattern || typeof liked !== "boolean" || !genre || !songPart) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pHash = hashPattern(pattern, patternLength || 16);

    // Check feedback limit
    const feedbackCount = await prisma.patternFeedback.count({
      where: { userId: session.user.id },
    });

    if (feedbackCount >= MAX_FEEDBACK_PER_USER) {
      // Delete oldest feedback to make room
      const oldest = await prisma.patternFeedback.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
      });
      if (oldest) {
        await prisma.patternFeedback.delete({ where: { id: oldest.id } });
      }
    }

    // Save feedback
    await prisma.patternFeedback.create({
      data: {
        userId: session.user.id,
        patternHash: pHash,
        genre,
        songPart,
        artistDna: artistDna || null,
        liked,
        patternData: pattern,
      },
    });

    // Update style profile based on feedback
    const patternFp = analyzePattern(pattern, patternLength || 16);

    const existingProfile = await prisma.styleProfile.findUnique({
      where: { userId: session.user.id },
    });

    let currentDna: StyleFingerprint = createDefaultFingerprint();
    let currentFeedbackCount = 0;

    if (existingProfile) {
      currentDna = existingProfile.dna as unknown as StyleFingerprint;
      currentFeedbackCount = existingProfile.feedbackCount;
    }

    // If liked, merge the pattern's fingerprint toward the user's DNA
    // If disliked, push away (invert the merge direction)
    let updatedDna: StyleFingerprint;
    if (liked) {
      // Merge toward this pattern's style (weight decreases as more feedback is given)
      const weight = Math.max(0.05, 0.2 - currentFeedbackCount * 0.001);
      updatedDna = mergeFingerprints(currentDna, patternFp, weight);
    } else {
      // Push away: create an "anti-fingerprint" and merge toward it
      const antiFp = invertFingerprint(patternFp, currentDna);
      const weight = Math.max(0.03, 0.1 - currentFeedbackCount * 0.001);
      updatedDna = mergeFingerprints(currentDna, antiFp, weight);
    }

    await prisma.styleProfile.upsert({
      where: { userId: session.user.id },
      update: {
        dna: updatedDna as never,
        feedbackCount: currentFeedbackCount + 1,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        dna: updatedDna as never,
        feedbackCount: 1,
      },
    });

    return NextResponse.json({
      dna: updatedDna,
      feedbackCount: currentFeedbackCount + 1,
    });
  } catch (error) {
    console.error("Error processing feedback:", error);
    return NextResponse.json({ error: "Couldn't process your feedback" }, { status: 500 });
  }
}

/**
 * Create an "anti-fingerprint" that pushes the DNA away from the disliked pattern.
 */
function invertFingerprint(disliked: StyleFingerprint, current: StyleFingerprint): StyleFingerprint {
  const invert = (dislikedVal: number, currentVal: number) => {
    // Move away from the disliked value
    const diff = currentVal - dislikedVal;
    return Math.max(0, Math.min(1, currentVal + diff * 0.5));
  };

  return {
    density: invert(disliked.density, current.density),
    syncopation: invert(disliked.syncopation, current.syncopation),
    kickDensity: invert(disliked.kickDensity, current.kickDensity),
    snareDensity: invert(disliked.snareDensity, current.snareDensity),
    hihatDensity: invert(disliked.hihatDensity, current.hihatDensity),
    percDensity: invert(disliked.percDensity, current.percDensity),
    backbeatStrength: invert(disliked.backbeatStrength, current.backbeatStrength),
    downbeatStrength: invert(disliked.downbeatStrength, current.downbeatStrength),
    layering: invert(disliked.layering, current.layering),
    swingTendency: invert(disliked.swingTendency, current.swingTendency),
    complexity: invert(disliked.complexity, current.complexity),
    genreAffinity: { ...current.genreAffinity },
    instrumentWeights: { ...current.instrumentWeights },
  };
}
