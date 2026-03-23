import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkGenericRateLimit,
  createRateLimitResponse,
  getClientIp,
  logSecurityEvent,
} from "@/lib/security";

export async function GET(request: Request) {
  try {
    // Rate limit: 10 verification attempts per IP per 15 minutes
    // Prevents brute-force token guessing
    const ip = getClientIp(request);
    const rateCheck = checkGenericRateLimit(`pw-verify:${ip}`, 10, 15 * 60_000);
    if (!rateCheck.allowed) {
      logSecurityEvent({
        type: "rate_limit",
        detail: "Password reset token verification rate limit exceeded",
        ip,
      });
      return createRateLimitResponse(rateCheck.retryAfterMs);
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, message: "We need that reset link, friend" },
        { status: 400 }
      );
    }

    // Validate token format (should be hex string from crypto.randomBytes)
    if (!/^[a-f0-9]{64}$/.test(token)) {
      logSecurityEvent({
        type: "suspicious_activity",
        detail: "Malformed password reset token format",
        ip,
      });
      return NextResponse.json({
        valid: false,
        message: "That link isn't ringing any bells. Time to request a fresh one.",
      });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({
        valid: false,
        message: "That link isn't ringing any bells. Time to request a fresh one.",
      });
    }

    if (resetToken.used) {
      return NextResponse.json({
        valid: false,
        message: "You already used that link! But hey, you can request another one.",
      });
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({
        valid: false,
        message: "That link expired (they only stick around for an hour). Ask for a new one!",
      });
    }

    // Mask email for privacy (show first 2 chars + domain)
    const emailParts = resetToken.email.split("@");
    const maskedEmail = emailParts[0].substring(0, 2) + "***@" + emailParts[1];

    return NextResponse.json({
      valid: true,
      email: maskedEmail,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { valid: false, message: "Hit a snag checking your link. Try refreshing?" },
      { status: 500 }
    );
  }
}
