import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { applyRateLimit } from "@/lib/rate-limit";
import { maskEmail, validateEmail } from "@/lib/security";

export async function POST(request: Request) {
  // Rate limit: 3 attempts per IP per hour
  const rateLimitResponse = applyRateLimit(request, "password-reset-request");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "We'll need your email to send you a reset link" },
        { status: 400 }
      );
    }

    // Validate and normalize email
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.error || "That doesn't look like a valid email address" },
        { status: 400 }
      );
    }
    const normalizedEmail = emailCheck.sanitized;

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Invalidate any existing unused tokens for this email
      await prisma.passwordResetToken.updateMany({
        where: {
          email: normalizedEmail,
          used: false,
        },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });

      // Generate new secure token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store token in database
      await prisma.passwordResetToken.create({
        data: {
          token,
          email: normalizedEmail,
          expiresAt,
        },
      });

      // Generate reset URL
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      // Send password reset email
      const emailResult = await sendPasswordResetEmail({
        email: normalizedEmail,
        resetUrl,
      });

      // Log email sending result for debugging
      if (!emailResult.success) {
        console.error(
          `Failed to send password reset email to ${maskEmail(normalizedEmail)}:`,
          emailResult.error
        );
        // Don't expose email sending failures to prevent email enumeration
        // The user still gets the success message
      } else {
        console.log(`✅ Password reset email sent successfully to ${maskEmail(normalizedEmail)}`);
      }
    }

    // Always return the same message to prevent email enumeration
    // Even if user doesn't exist or email fails, return success
    return NextResponse.json({
      message:
        "If we've got an account with that email, check your inbox for a reset link (and your spam folder just in case!)",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Something went sideways on our end. Mind trying again in a sec?" },
      { status: 500 }
    );
  }
}
