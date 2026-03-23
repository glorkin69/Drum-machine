import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDefaultFingerprint } from "@/lib/style-dna";
import { checkGenericRateLimit, createRateLimitResponse } from "@/lib/security";

/**
 * GET /api/style-profile - Fetch the user's style DNA profile
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to access your style profile" }, { status: 401 });
    }

    // Rate limit: 60 reads per minute per user
    const rateCheck = checkGenericRateLimit(`style:get:${session.user.id}`, 60, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const profile = await prisma.styleProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      // Return default fingerprint for new users
      return NextResponse.json({
        dna: createDefaultFingerprint(),
        feedbackCount: 0,
        isNew: true,
      });
    }

    return NextResponse.json({
      dna: profile.dna,
      feedbackCount: profile.feedbackCount,
      isNew: false,
    });
  } catch (error) {
    console.error("Error fetching style profile:", error);
    return NextResponse.json({ error: "Couldn't load your style profile" }, { status: 500 });
  }
}

/**
 * POST /api/style-profile - Create or update the user's style DNA profile
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to save your style profile" }, { status: 401 });
    }

    // Rate limit: 20 writes per minute per user
    const rateCheck = checkGenericRateLimit(`style:post:${session.user.id}`, 20, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const body = await request.json();
    const { dna } = body;

    if (!dna || typeof dna !== "object") {
      return NextResponse.json({ error: "Invalid style DNA data" }, { status: 400 });
    }

    // Validate fingerprint shape (basic check)
    if (typeof dna.density !== "number" || typeof dna.syncopation !== "number") {
      return NextResponse.json({ error: "Malformed style fingerprint" }, { status: 400 });
    }

    const profile = await prisma.styleProfile.upsert({
      where: { userId: session.user.id },
      update: {
        dna,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        dna,
      },
    });

    return NextResponse.json({
      dna: profile.dna,
      feedbackCount: profile.feedbackCount,
    });
  } catch (error) {
    console.error("Error saving style profile:", error);
    return NextResponse.json({ error: "Couldn't save your style profile" }, { status: 500 });
  }
}
