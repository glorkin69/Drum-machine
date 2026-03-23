/**
 * Persistent Security Audit Logging
 *
 * Writes security events to the database for compliance, forensics,
 * and admin monitoring. Falls back to console logging on DB errors.
 */

import { prisma } from "@/lib/prisma";

export type AuditEventType =
  | "auth_failure"
  | "auth_success"
  | "rate_limit"
  | "admin_action"
  | "suspicious_activity"
  | "account_lockout"
  | "password_change"
  | "password_reset"
  | "session_revoked"
  | "registration"
  | "waf_block"
  | "api_error"
  | "privilege_change"
  | "data_access"
  | "session_timeout"
  | "admin_access";

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLogEntry {
  type: AuditEventType;
  severity?: AuditSeverity;
  detail: string;
  ip?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Write a security audit event to the database.
 * Non-blocking: errors are logged to console but never thrown.
 */
export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  const severity = entry.severity || inferSeverity(entry.type);

  // Always console log for immediate visibility
  const prefix = severity === "critical" ? "🚨" : severity === "warning" ? "⚠️" : "ℹ️";
  console.warn(
    `${prefix} [Audit] ${entry.type} | ${entry.detail}` +
      (entry.ip ? ` | IP: ${entry.ip}` : "") +
      (entry.userId ? ` | User: ${entry.userId}` : "")
  );

  try {
    await prisma.securityAuditLog.create({
      data: {
        type: entry.type,
        severity,
        detail: entry.detail.substring(0, 2000), // Truncate for safety
        ip: entry.ip?.substring(0, 45) || null,
        userId: entry.userId || null,
        metadata: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : undefined,
      },
    });
  } catch (error) {
    // Never let audit logging break the application
    console.error("[Audit] Failed to write audit log to database:", error);
  }
}

/**
 * Query audit logs for admin dashboard
 */
export async function queryAuditLogs(options: {
  limit?: number;
  type?: AuditEventType;
  severity?: AuditSeverity;
  userId?: string;
  since?: Date;
}) {
  const { limit = 100, type, severity, userId, since } = options;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (severity) where.severity = severity;
  if (userId) where.userId = userId;
  if (since) where.createdAt = { gte: since };

  return prisma.securityAuditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 500),
  });
}

/**
 * Get audit log summary stats for admin dashboard
 */
export async function getAuditStats(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const [total, bySeverity, byType] = await Promise.all([
    prisma.securityAuditLog.count({ where: { createdAt: { gte: since } } }),
    prisma.securityAuditLog.groupBy({
      by: ["severity"],
      where: { createdAt: { gte: since } },
      _count: true,
    }),
    prisma.securityAuditLog.groupBy({
      by: ["type"],
      where: { createdAt: { gte: since } },
      _count: true,
    }),
  ]);

  return {
    total,
    bySeverity: Object.fromEntries(bySeverity.map((s) => [s.severity, s._count])),
    byType: Object.fromEntries(byType.map((t) => [t.type, t._count])),
    since: since.toISOString(),
  };
}

/**
 * Clean up old audit logs (keep 90 days by default)
 */
export async function cleanupAuditLogs(retentionDays: number = 90): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const result = await prisma.securityAuditLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  return result.count;
}

function inferSeverity(type: AuditEventType): AuditSeverity {
  switch (type) {
    case "account_lockout":
    case "waf_block":
    case "suspicious_activity":
      return "warning";
    case "admin_action":
    case "password_change":
    case "password_reset":
    case "privilege_change":
    case "admin_access":
      return "info";
    case "auth_failure":
    case "rate_limit":
      return "warning";
    case "api_error":
      return "warning";
    case "auth_success":
    case "registration":
    case "session_revoked":
    case "data_access":
    case "session_timeout":
      return "info";
    default:
      return "info";
  }
}
