import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { isValidId, checkGenericRateLimit, createRateLimitResponse, maskEmail } from "@/lib/security";
import { writeAuditLog } from "@/lib/audit-log";

export async function DELETE(
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

  // Rate limit: 10 deletions per hour per admin
  const rateCheck = checkGenericRateLimit(`admin:delete:${session.user.id}`, 10, 3600_000);
  if (!rateCheck.allowed) {
    return createRateLimitResponse(rateCheck.retryAfterMs);
  }

  // Prevent self-deletion
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Delete user (cascade deletes savedPatterns via schema)
  await prisma.user.delete({ where: { id } });

  // Persistent audit log
  writeAuditLog({
    type: "admin_action",
    severity: "warning",
    detail: `User ${maskEmail(user.email)} deleted by admin`,
    userId: session.user.id,
    metadata: {
      deletedUserId: id,
      deletedEmail: maskEmail(user.email),
      adminEmail: maskEmail(session.user.email || ""),
    },
  }).catch(() => {});

  return NextResponse.json({ message: "User deleted successfully" });
}
