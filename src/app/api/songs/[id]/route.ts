import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidId, checkGenericRateLimit, createRateLimitResponse } from "@/lib/security";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 120 reads per minute per user
    const rateCheck = checkGenericRateLimit(`song:get:${session.user.id}`, 120, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const { id } = await params;

    // Validate ID format
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid song ID" }, { status: 400 });
    }

    const song = await prisma.savedSong.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    return NextResponse.json(song);
  } catch (error) {
    console.error("Error fetching song:", error);
    return NextResponse.json({ error: "Failed to fetch song" }, { status: 500 });
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

    // Rate limit: 30 deletes per minute per user
    const rateCheck = checkGenericRateLimit(`song:delete:${session.user.id}`, 30, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const { id } = await params;

    // Validate ID format
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid song ID" }, { status: 400 });
    }

    const song = await prisma.savedSong.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    await prisma.savedSong.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting song:", error);
    return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
  }
}
