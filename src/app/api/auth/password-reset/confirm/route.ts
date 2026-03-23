import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";
import { revokeAllSessions } from "@/lib/session-manager";
import { validatePassword, BCRYPT_ROUNDS, logSecurityEvent } from "@/lib/security";

export async function POST(request: Request) {
  // Rate limit: 5 attempts per IP per hour
  const rateLimitResponse = applyRateLimit(request, "password-reset-confirm");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { token, newPassword } = body;

    console.log("[Password Reset] Confirm request received");

    if (!token || !newPassword) {
      console.log("[Password Reset] Missing token or password");
      return NextResponse.json(
        { error: "We need both the reset link and your new password to make this work" },
        { status: 400 }
      );
    }

    // Validate token format
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json(
        { error: "Invalid reset token format" },
        { status: 400 }
      );
    }

    // Enforce strong password policy
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        {
          error: "Password doesn't meet security requirements",
          details: passwordCheck.errors,
        },
        { status: 400 }
      );
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      console.log("[Password Reset] Token not found in database");
      return NextResponse.json(
        { error: "Hmm, that link doesn't exist. Want to request a new one?" },
        { status: 400 }
      );
    }

    if (resetToken.used) {
      console.log("[Password Reset] Token already used");
      return NextResponse.json(
        { error: "That link was already used! Request a fresh one to try again." },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      console.log("[Password Reset] Token expired");
      return NextResponse.json(
        { error: "That link timed out. Reset links only last an hour." },
        { status: 400 }
      );
    }

    console.log("[Password Reset] Token validated successfully");

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Find the user first to get their ID for session invalidation
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
      select: { id: true },
    });

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { used: true },
      }),
    ]);

    // Invalidate all active sessions on password change for security
    if (user) {
      try {
        await revokeAllSessions(user.id);
        logSecurityEvent({
          type: "admin_action",
          detail: `Password reset completed for user ${resetToken.email}`,
          userId: user.id,
        });
        console.log(`[Password Reset] ✅ Password successfully reset for user ${user.id}`);
      } catch (sessionError) {
        console.error("[Security] Failed to revoke sessions after password reset:", sessionError);
      }
    }

    return NextResponse.json({
      message: "Password changed! You're all set to get back to making beats.",
    });
  } catch (error) {
    console.error("Password reset confirm error:", error);
    return NextResponse.json(
      { error: "Oops, something broke on our end. Give it another shot?" },
      { status: 500 }
    );
  }
}
