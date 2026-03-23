import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";
import { validatePassword, validateEmail, validateName, maskEmail, BCRYPT_ROUNDS } from "@/lib/security";
import { writeAuditLog } from "@/lib/audit-log";

export async function POST(request: Request) {
  // Rate limit: 5 attempts per IP per hour
  const rateLimitResponse = applyRateLimit(request, "register");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "We need your email, a password, and your name to get you set up" },
        { status: 400 }
      );
    }

    // Validate and sanitize email
    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      return NextResponse.json(
        { error: emailResult.error || "That doesn't look like a valid email address" },
        { status: 400 }
      );
    }
    const normalizedEmail = emailResult.sanitized;

    // Validate password strength
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        {
          error: "Password doesn't meet security requirements",
          details: passwordCheck.errors,
        },
        { status: 400 }
      );
    }

    // Sanitize name
    const nameResult = validateName(name);
    if (!nameResult.valid) {
      return NextResponse.json(
        { error: nameResult.error || "Please provide a valid name" },
        { status: 400 }
      );
    }
    const sanitizedName = nameResult.sanitized;

    const maskedEmail = maskEmail(normalizedEmail);
    console.log(`[Registration] Attempting to register user: ${maskedEmail}`);

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error("[Registration] Database connection failed:", dbError);
      return NextResponse.json(
        { error: "We're having some backend trouble. Try again in a moment?" },
        { status: 503 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      console.log(`[Registration] Duplicate registration attempt for: ${maskedEmail}`);
      // Generic message to prevent email enumeration
      // Use same status 409 but vague message
      return NextResponse.json(
        { error: "Unable to create account. Please try a different email or sign in." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: sanitizedName,
      },
    });

    console.log(`[Registration] User created successfully: ${user.id} - ${maskedEmail}`);

    // Audit log registration (non-blocking)
    writeAuditLog({
      type: "registration",
      detail: "New user registration",
      userId: user.id,
      metadata: { email: maskedEmail },
    }).catch(() => {});

    return NextResponse.json(
      { message: "Welcome aboard! Time to make some beats.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Registration] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong on our end. Give it another shot?" },
      { status: 500 }
    );
  }
}
