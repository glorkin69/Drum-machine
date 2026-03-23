import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { isValidId, checkGenericRateLimit, createRateLimitResponse, maskEmail } from "@/lib/security";
import { writeAuditLog } from "@/lib/audit-log";
import { recordPrivilegeChange, recordAdminAccess } from "@/lib/security-monitor";
import { getClientIp } from "@/lib/security";

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

  // Rate limit: 5 promotions per hour per admin (prevent rapid privilege changes)
  const rateCheck = checkGenericRateLimit(`admin:promote:${session.user.id}`, 5, 3600_000);
  if (!rateCheck.allowed) {
    return createRateLimitResponse(rateCheck.retryAfterMs);
  }

  // Prevent self-promotion (security: admin shouldn't be able to re-promote themselves)
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Cannot promote yourself" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.isAdmin) {
    return NextResponse.json(
      { error: "User is already an admin" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id },
    data: { isAdmin: true },
  });

  // Persistent audit log for critical admin action
  writeAuditLog({
    type: "admin_action",
    severity: "critical",
    detail: `User ${maskEmail(user.email)} promoted to admin`,
    userId: session.user.id,
    metadata: {
      promotedUserId: id,
      promotedEmail: maskEmail(user.email),
      adminEmail: maskEmail(session.user.email || ""),
    },
  }).catch(() => {});

  // Security monitor: track privilege change + admin access
  const ip = getClientIp(request);
  recordPrivilegeChange(
    maskEmail(session.user.email || ""),
    maskEmail(user.email),
    "promote"
  );
  recordAdminAccess(session.user.id, ip, session.user.email || undefined);

  return NextResponse.json({ message: "User promoted to admin" });
}
