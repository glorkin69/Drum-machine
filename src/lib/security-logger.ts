/**
 * Structured Security Logger
 *
 * Provides centralized, structured (JSON) logging for all security events.
 * Wraps the persistent audit-log system with enhanced metadata capture,
 * API call tracking, and structured output for easy parsing/aggregation.
 */

import { writeAuditLog, type AuditEventType, type AuditSeverity } from "@/lib/audit-log";
import { maskEmail, getClientIp } from "@/lib/security";

// ============================================================================
// TYPES
// ============================================================================

export interface SecurityLogEntry {
  timestamp: string;
  level: AuditSeverity;
  category: SecurityCategory;
  event: string;
  message: string;
  ip?: string;
  userId?: string;
  userEmail?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export type SecurityCategory =
  | "authentication"
  | "authorization"
  | "admin_access"
  | "privilege_change"
  | "api_call"
  | "rate_limit"
  | "waf"
  | "data_access"
  | "session"
  | "password"
  | "suspicious";

// Map security categories to audit event types
const CATEGORY_TO_AUDIT_TYPE: Record<SecurityCategory, AuditEventType> = {
  authentication: "auth_success",
  authorization: "suspicious_activity",
  admin_access: "admin_action",
  privilege_change: "admin_action",
  api_call: "admin_action",
  rate_limit: "rate_limit",
  waf: "waf_block",
  data_access: "admin_action",
  session: "session_revoked",
  password: "password_change",
  suspicious: "suspicious_activity",
};

// ============================================================================
// IN-MEMORY STRUCTURED LOG BUFFER (for real-time dashboard)
// ============================================================================

const MAX_LOG_BUFFER = 1000;
const logBuffer: SecurityLogEntry[] = [];

function addToBuffer(entry: SecurityLogEntry): void {
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG_BUFFER) {
    logBuffer.splice(0, logBuffer.length - MAX_LOG_BUFFER);
  }
}

/**
 * Get recent structured log entries from the in-memory buffer.
 */
export function getRecentLogs(options?: {
  limit?: number;
  category?: SecurityCategory;
  level?: AuditSeverity;
  since?: number;
}): SecurityLogEntry[] {
  let filtered = logBuffer;

  if (options?.category) {
    filtered = filtered.filter((e) => e.category === options.category);
  }
  if (options?.level) {
    filtered = filtered.filter((e) => e.level === options.level);
  }
  if (options?.since) {
    const sinceDate = new Date(options.since).toISOString();
    filtered = filtered.filter((e) => e.timestamp >= sinceDate);
  }

  const limit = options?.limit || 100;
  return filtered.slice(-limit).reverse();
}

// ============================================================================
// CORE LOGGING FUNCTION
// ============================================================================

/**
 * Write a structured security log entry.
 * Persists to database via audit-log AND stores in memory buffer.
 */
export async function logSecurity(params: {
  category: SecurityCategory;
  event: string;
  message: string;
  level?: AuditSeverity;
  request?: Request;
  userId?: string;
  userEmail?: string;
  statusCode?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const {
    category,
    event,
    message,
    level = "info",
    request,
    userId,
    userEmail,
    statusCode,
    duration,
    metadata,
  } = params;

  const ip = request ? getClientIp(request) : undefined;
  const userAgent = request
    ? new Headers(request.headers).get("user-agent") || undefined
    : undefined;
  const method = request ? request.method : undefined;
  const path = request ? new URL(request.url).pathname : undefined;

  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    event,
    message,
    ip,
    userId,
    userEmail: userEmail ? maskEmail(userEmail) : undefined,
    userAgent: userAgent?.substring(0, 200),
    method,
    path,
    statusCode,
    duration,
    metadata,
  };

  // Add to in-memory buffer
  addToBuffer(entry);

  // Structured JSON console output
  const jsonLog = JSON.stringify({
    ...entry,
    _type: "security_event",
  });

  if (level === "critical") {
    console.error(`[SECURITY] ${jsonLog}`);
  } else if (level === "warning") {
    console.warn(`[SECURITY] ${jsonLog}`);
  } else {
    console.log(`[SECURITY] ${jsonLog}`);
  }

  // Persist to database via audit-log
  const auditType =
    category === "authentication" && event.includes("fail")
      ? "auth_failure"
      : category === "authentication" && event.includes("success")
        ? "auth_success"
        : CATEGORY_TO_AUDIT_TYPE[category];

  await writeAuditLog({
    type: auditType,
    severity: level,
    detail: `[${event}] ${message}`,
    ip,
    userId,
    metadata: {
      ...metadata,
      category,
      event,
      method,
      path,
      statusCode,
      duration,
      userAgent: userAgent?.substring(0, 100),
    },
  });
}

// ============================================================================
// CONVENIENCE LOGGING FUNCTIONS
// ============================================================================

/** Log a successful authentication event */
export async function logAuthSuccess(
  request: Request,
  userId: string,
  email: string
): Promise<void> {
  await logSecurity({
    category: "authentication",
    event: "login_success",
    message: `User ${maskEmail(email)} logged in successfully`,
    level: "info",
    request,
    userId,
    userEmail: email,
  });
}

/** Log a failed authentication attempt */
export async function logAuthFailure(
  request: Request,
  email: string,
  reason: string
): Promise<void> {
  await logSecurity({
    category: "authentication",
    event: "login_failure",
    message: `Failed login for ${maskEmail(email)}: ${reason}`,
    level: "warning",
    request,
    userEmail: email,
    metadata: { reason },
  });
}

/** Log a logout event */
export async function logLogout(
  request: Request,
  userId: string,
  email?: string
): Promise<void> {
  await logSecurity({
    category: "authentication",
    event: "logout",
    message: `User ${email ? maskEmail(email) : userId} logged out`,
    level: "info",
    request,
    userId,
    userEmail: email,
  });
}

/** Log admin panel access */
export async function logAdminAccess(
  request: Request,
  userId: string,
  email: string,
  action: string
): Promise<void> {
  await logSecurity({
    category: "admin_access",
    event: "admin_panel_access",
    message: `Admin ${maskEmail(email)} accessed: ${action}`,
    level: "info",
    request,
    userId,
    userEmail: email,
    metadata: { action },
  });
}

/** Log a privilege change (promote/demote) */
export async function logPrivilegeChange(
  request: Request,
  adminUserId: string,
  adminEmail: string,
  targetUserId: string,
  targetEmail: string,
  action: "promote" | "demote"
): Promise<void> {
  await logSecurity({
    category: "privilege_change",
    event: `user_${action}`,
    message: `Admin ${maskEmail(adminEmail)} ${action}d user ${maskEmail(targetEmail)}`,
    level: "warning",
    request,
    userId: adminUserId,
    userEmail: adminEmail,
    metadata: { targetUserId, targetEmail: maskEmail(targetEmail), action },
  });
}

/** Log an API call for monitoring */
export async function logApiCall(
  request: Request,
  statusCode: number,
  duration: number,
  userId?: string
): Promise<void> {
  const url = new URL(request.url);

  // Only log notable API calls (errors, admin routes, slow requests)
  const isAdminRoute = url.pathname.startsWith("/api/admin");
  const isError = statusCode >= 400;
  const isSlow = duration > 5000;

  if (!isAdminRoute && !isError && !isSlow) return;

  const level: AuditSeverity = statusCode >= 500
    ? "critical"
    : isError
      ? "warning"
      : "info";

  await logSecurity({
    category: "api_call",
    event: isError ? "api_error" : isSlow ? "api_slow" : "api_admin_call",
    message: `${request.method} ${url.pathname} → ${statusCode} (${duration}ms)`,
    level,
    request,
    userId,
    statusCode,
    duration,
  });
}

/** Log sensitive data access */
export async function logDataAccess(
  request: Request,
  userId: string,
  resource: string,
  action: string
): Promise<void> {
  await logSecurity({
    category: "data_access",
    event: "sensitive_data_access",
    message: `User ${userId} ${action} ${resource}`,
    level: "info",
    request,
    userId,
    metadata: { resource, action },
  });
}

/** Log suspicious activity */
export async function logSuspiciousActivity(
  request: Request,
  reason: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logSecurity({
    category: "suspicious",
    event: "suspicious_activity",
    message: reason,
    level: "warning",
    request,
    metadata: details,
  });
}
