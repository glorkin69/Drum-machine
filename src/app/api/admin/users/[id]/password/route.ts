import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import bcrypt from "bcryptjs";
import { revokeAllSessions } from "@/lib/session-manager";
import { validatePassword, BCRYPT_ROUNDS, isValidId, checkGenericRateLimit, createRateLimitResponse, maskEmail } from "@/lib/security";
import { writeAuditLog } from "@/lib/audit-log";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  // Validate ID format
  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  // Rate limit: 5 password resets per hour per admin (sensitive operation)
  const rateCheck = checkGenericRateLimit(`admin:password:${session.user.id}`, 5, 3600_000);
  if (!rateCheck.allowed) {
    return createRateLimitResponse(rateCheck.retryAfterMs);
  }

  // Prevent admins from changing their own password through this interface
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own password through the admin portal. Use your account settings instead." },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { newPassword } = body;

  if (!newPassword || typeof newPassword !== "string") {
    return NextResponse.json(
      { error: "New password is required" },
      { status: 400 }
    );
  }

  // Enforce strong password policy
  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.valid) {
    return NextResponse.json(
      { error: "Password doesn't meet security requirements", details: passwordCheck.errors },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Hash new password with stronger rounds
  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  // Invalidate all sessions for the user whose password was changed
  try {
    await revokeAllSessions(id);
  } catch (sessionError) {
    console.error("[Security] Failed to revoke sessions after admin password change:", sessionError);
  }

  // Persistent audit log for critical admin action
  writeAuditLog({
    type: "admin_action",
    severity: "critical",
    detail: `Admin password reset for user ${maskEmail(user.email)}`,
    userId: session.user.id,
    metadata: {
      targetUserId: id,
      targetEmail: maskEmail(user.email),
      adminEmail: maskEmail(session.user.email || ""),
      sessionsRevoked: true,
    },
  }).catch(() => {});

  return NextResponse.json({ message: "Password updated successfully. All user sessions have been invalidated." });
}
