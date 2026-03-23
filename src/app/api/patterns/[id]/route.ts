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
    const rateCheck = checkGenericRateLimit(`pattern:get:${session.user.id}`, 120, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const { id } = await params;

    // Validate ID format
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid pattern ID" }, { status: 400 });
    }

    const pattern = await prisma.savedPattern.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!pattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
    }

    return NextResponse.json(pattern);
  } catch (error) {
    console.error("Error fetching pattern:", error);
    return NextResponse.json({ error: "Failed to fetch pattern" }, { status: 500 });
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
    const rateCheck = checkGenericRateLimit(`pattern:delete:${session.user.id}`, 30, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const { id } = await params;

    // Validate ID format
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid pattern ID" }, { status: 400 });
    }

    // Verify ownership
    const pattern = await prisma.savedPattern.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!pattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
    }

    await prisma.savedPattern.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pattern:", error);
    return NextResponse.json({ error: "Failed to delete pattern" }, { status: 500 });
  }
}
