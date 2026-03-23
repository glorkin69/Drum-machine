import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkGenericRateLimit,
  createRateLimitResponse,
  getClientIp,
  isValidId,
} from "@/lib/security";

/**
 * POST /api/analytics/track
 * Track page views. Rate-limited to prevent analytics poisoning.
 * Only called internally from middleware - validates origin.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 60 tracking events per minute per IP
    const ip = getClientIp(request);
    const rateCheck = checkGenericRateLimit(`analytics:${ip}`, 60, 60_000);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const body = await request.json();
    const { path, sessionId, userId } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Validate path format - must start with / and be reasonable length
    if (!path.startsWith("/") || path.length > 500) {
      return NextResponse.json({ error: "Invalid path format" }, { status: 400 });
    }

    // Validate sessionId format if provided
    if (sessionId && (typeof sessionId !== "string" || sessionId.length > 50)) {
      return NextResponse.json({ error: "Invalid sessionId" }, { status: 400 });
    }

    // Validate userId format if provided
    if (userId && (typeof userId !== "string" || !isValidId(userId))) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // Extract country from geo headers (Vercel, Cloudflare, etc.)
    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-country") ||
      null;

    const userAgent = request.headers.get("user-agent") || null;

    await prisma.pageView.create({
      data: {
        path: path.substring(0, 500),
        country: country?.substring(0, 10) || null,
        userAgent: userAgent?.substring(0, 500) || null,
        userId: userId || null,
        sessionId: sessionId?.substring(0, 50) || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Analytics Track] Error:", error);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
