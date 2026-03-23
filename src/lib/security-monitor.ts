/**
 * Real-time Security Monitor
 *
 * Detects suspicious patterns, generates alerts, and provides
 * real-time security intelligence for the admin dashboard.
 *
 * Monitors:
 * - Multiple failed login attempts (brute force detection)
 * - Admin access from new IPs
 * - Error spikes indicating attacks or system issues
 * - Rate limit violations indicating abuse
 * - Privilege escalation events
 */

// ============================================================================
// TYPES
// ============================================================================

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export type AlertType =
  | "brute_force"
  | "admin_new_ip"
  | "error_spike"
  | "rate_limit_abuse"
  | "privilege_escalation"
  | "suspicious_pattern"
  | "account_lockout_surge"
  | "waf_attack_burst"
  | "ids_auto_block"
  | "honeypot_triggered"
  | "geo_block"
  | "behavior_anomaly";

export interface SecurityAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  ip?: string;
  userId?: string;
  acknowledged: boolean;
  metadata?: Record<string, unknown>;
}

export interface MonitorStats {
  totalAlerts: number;
  unacknowledged: number;
  bySeverity: Record<AlertSeverity, number>;
  byType: Record<string, number>;
  failedLoginsLast15m: number;
  apiErrorsLast15m: number;
  rateLimitsLast15m: number;
  wafBlocksLast15m: number;
  activeThreats: number;
}

export interface ThreatTimeline {
  timestamp: string;
  events: number;
  alerts: number;
  blocked: number;
}

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

const MAX_ALERTS = 500;
const alerts: SecurityAlert[] = [];

// Tracking windows for pattern detection
interface EventWindow {
  timestamps: number[];
}

const failedLogins = new Map<string, EventWindow>(); // IP -> timestamps
const adminIps = new Map<string, Set<string>>(); // userId -> set of known IPs
const apiErrors: number[] = []; // timestamps of API errors
const rateLimitHits = new Map<string, EventWindow>(); // IP -> timestamps
const wafBlocks: number[] = []; // timestamps of WAF blocks
const threatTimeline: ThreatTimeline[] = []; // hourly timeline data

let alertCounter = 0;

// ============================================================================
// CLEANUP
// ============================================================================

const WINDOW_MS = 15 * 60 * 1000; // 15 minute window
const CLEANUP_INTERVAL = 5 * 60 * 1000; // cleanup every 5 min

function cleanupWindow(window: EventWindow): void {
  const cutoff = Date.now() - WINDOW_MS;
  window.timestamps = window.timestamps.filter((t) => t > cutoff);
}

const _cleanup = setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;

  for (const [key, win] of failedLogins) {
    cleanupWindow(win);
    if (win.timestamps.length === 0) failedLogins.delete(key);
  }

  for (const [key, win] of rateLimitHits) {
    cleanupWindow(win);
    if (win.timestamps.length === 0) rateLimitHits.delete(key);
  }

  // Keep only recent api errors / waf blocks
  while (apiErrors.length > 0 && apiErrors[0] < cutoff) apiErrors.shift();
  while (wafBlocks.length > 0 && wafBlocks[0] < cutoff) wafBlocks.shift();

  // Trim timeline to last 72 hours
  const timelineCutoff = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
  while (threatTimeline.length > 0 && threatTimeline[0].timestamp < timelineCutoff) {
    threatTimeline.shift();
  }
}, CLEANUP_INTERVAL);

if (_cleanup && typeof _cleanup === "object" && "unref" in _cleanup) {
  (_cleanup as NodeJS.Timeout).unref();
}

// ============================================================================
// ALERT GENERATION
// ============================================================================

function createAlert(params: {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  ip?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}): SecurityAlert {
  alertCounter++;
  const alert: SecurityAlert = {
    id: `alert_${Date.now()}_${alertCounter}`,
    type: params.type,
    severity: params.severity,
    title: params.title,
    description: params.description,
    timestamp: new Date().toISOString(),
    ip: params.ip,
    userId: params.userId,
    acknowledged: false,
    metadata: params.metadata,
  };

  alerts.push(alert);
  if (alerts.length > MAX_ALERTS) {
    alerts.splice(0, alerts.length - MAX_ALERTS);
  }

  // Console alert for immediate visibility
  const prefix =
    params.severity === "critical"
      ? "🚨🚨"
      : params.severity === "high"
        ? "🚨"
        : params.severity === "medium"
          ? "⚠️"
          : "🔔";
  console.warn(
    `${prefix} [Security Alert] ${params.severity.toUpperCase()}: ${params.title} | ${params.description}` +
      (params.ip ? ` | IP: ${params.ip}` : "")
  );

  return alert;
}

// ============================================================================
// EVENT RECORDING & PATTERN DETECTION
// ============================================================================

// Thresholds for alerting
const FAILED_LOGIN_THRESHOLD = 5; // 5 failures from same IP in 15 min
const RATE_LIMIT_ABUSE_THRESHOLD = 10; // 10 rate-limits from same IP in 15 min
const ERROR_SPIKE_THRESHOLD = 20; // 20 API errors in 15 min
const WAF_BURST_THRESHOLD = 15; // 15 WAF blocks in 15 min

/**
 * Record a failed login attempt and check for brute force patterns.
 */
export function recordFailedLogin(ip: string, email?: string): void {
  const now = Date.now();

  if (!failedLogins.has(ip)) {
    failedLogins.set(ip, { timestamps: [] });
  }
  const window = failedLogins.get(ip)!;
  window.timestamps.push(now);
  cleanupWindow(window);

  if (window.timestamps.length >= FAILED_LOGIN_THRESHOLD) {
    // Check if we already have an active alert for this IP
    const existingAlert = alerts.find(
      (a) =>
        a.type === "brute_force" &&
        a.ip === ip &&
        !a.acknowledged &&
        Date.now() - new Date(a.timestamp).getTime() < WINDOW_MS
    );

    if (!existingAlert) {
      createAlert({
        type: "brute_force",
        severity: window.timestamps.length >= 15 ? "critical" : "high",
        title: "Brute Force Attack Detected",
        description: `${window.timestamps.length} failed login attempts from IP ${ip} in the last 15 minutes${email ? ` (targeting ${email})` : ""}`,
        ip,
        metadata: {
          attemptCount: window.timestamps.length,
          targetEmail: email,
        },
      });
    }
  }

  updateTimeline(0, 0, 0);
}

/**
 * Record admin access and detect new/unusual IPs.
 */
export function recordAdminAccess(userId: string, ip: string, email?: string): void {
  if (!adminIps.has(userId)) {
    adminIps.set(userId, new Set());
  }
  const knownIps = adminIps.get(userId)!;

  if (!knownIps.has(ip) && knownIps.size > 0) {
    // Admin accessing from a new IP
    createAlert({
      type: "admin_new_ip",
      severity: "medium",
      title: "Admin Access from New IP",
      description: `Admin ${email || userId} accessed from new IP ${ip} (previously seen from ${knownIps.size} IPs)`,
      ip,
      userId,
      metadata: {
        knownIps: Array.from(knownIps).slice(0, 5),
        email,
      },
    });
  }

  knownIps.add(ip);
}

/**
 * Record an API error and check for error spikes.
 */
export function recordApiError(statusCode: number, path: string, ip?: string): void {
  const now = Date.now();
  apiErrors.push(now);

  const cutoff = now - WINDOW_MS;
  while (apiErrors.length > 0 && apiErrors[0] < cutoff) apiErrors.shift();

  if (apiErrors.length >= ERROR_SPIKE_THRESHOLD) {
    // Only alert every 5 minutes for error spikes
    const recentSpikeAlert = alerts.find(
      (a) =>
        a.type === "error_spike" &&
        !a.acknowledged &&
        Date.now() - new Date(a.timestamp).getTime() < 5 * 60 * 1000
    );

    if (!recentSpikeAlert) {
      createAlert({
        type: "error_spike",
        severity: apiErrors.length >= 50 ? "critical" : "high",
        title: "API Error Spike Detected",
        description: `${apiErrors.length} API errors in the last 15 minutes (latest: ${statusCode} on ${path})`,
        ip,
        metadata: {
          errorCount: apiErrors.length,
          latestStatus: statusCode,
          latestPath: path,
        },
      });
    }
  }

  updateTimeline(1, 0, 0);
}

/**
 * Record a rate limit hit and check for abuse patterns.
 */
export function recordRateLimitHit(ip: string, endpoint?: string): void {
  const now = Date.now();

  if (!rateLimitHits.has(ip)) {
    rateLimitHits.set(ip, { timestamps: [] });
  }
  const window = rateLimitHits.get(ip)!;
  window.timestamps.push(now);
  cleanupWindow(window);

  if (window.timestamps.length >= RATE_LIMIT_ABUSE_THRESHOLD) {
    const existingAlert = alerts.find(
      (a) =>
        a.type === "rate_limit_abuse" &&
        a.ip === ip &&
        !a.acknowledged &&
        Date.now() - new Date(a.timestamp).getTime() < WINDOW_MS
    );

    if (!existingAlert) {
      createAlert({
        type: "rate_limit_abuse",
        severity: "medium",
        title: "Rate Limit Abuse Detected",
        description: `IP ${ip} hit rate limits ${window.timestamps.length} times in 15 minutes${endpoint ? ` (targeting ${endpoint})` : ""}`,
        ip,
        metadata: {
          hitCount: window.timestamps.length,
          endpoint,
        },
      });
    }
  }
}

/**
 * Record a WAF block and check for attack bursts.
 */
export function recordWafBlock(ip: string, category: string): void {
  const now = Date.now();
  wafBlocks.push(now);

  const cutoff = now - WINDOW_MS;
  while (wafBlocks.length > 0 && wafBlocks[0] < cutoff) wafBlocks.shift();

  if (wafBlocks.length >= WAF_BURST_THRESHOLD) {
    const recentBurstAlert = alerts.find(
      (a) =>
        a.type === "waf_attack_burst" &&
        !a.acknowledged &&
        Date.now() - new Date(a.timestamp).getTime() < 5 * 60 * 1000
    );

    if (!recentBurstAlert) {
      createAlert({
        type: "waf_attack_burst",
        severity: "high",
        title: "WAF Attack Burst Detected",
        description: `${wafBlocks.length} WAF blocks in the last 15 minutes (latest: ${category} from ${ip})`,
        ip,
        metadata: {
          blockCount: wafBlocks.length,
          latestCategory: category,
        },
      });
    }
  }

  updateTimeline(0, 0, 1);
}

/**
 * Record a privilege escalation event.
 */
export function recordPrivilegeChange(
  adminEmail: string,
  targetEmail: string,
  action: "promote" | "demote"
): void {
  createAlert({
    type: "privilege_escalation",
    severity: "medium",
    title: `User ${action === "promote" ? "Promoted to Admin" : "Demoted from Admin"}`,
    description: `${adminEmail} ${action}d ${targetEmail}`,
    metadata: { adminEmail, targetEmail, action },
  });
}

/**
 * Record an IDS auto-block event.
 */
export function recordIdsAutoBlock(ip: string, threatScore: number, threatLevel: string): void {
  createAlert({
    type: "ids_auto_block",
    severity: threatScore >= 80 ? "critical" : "high",
    title: "IDS Auto-Blocked IP",
    description: `IP ${ip} auto-blocked by IDS (threat score: ${threatScore}, level: ${threatLevel})`,
    ip,
    metadata: { threatScore, threatLevel },
  });
  updateTimeline(0, 1, 1);
}

/**
 * Record a honeypot trap trigger.
 */
export function recordHoneypotHit(ip: string, path: string): void {
  // Deduplicate: only alert once per IP per 15 minutes
  const existingAlert = alerts.find(
    (a) =>
      a.type === "honeypot_triggered" &&
      a.ip === ip &&
      !a.acknowledged &&
      Date.now() - new Date(a.timestamp).getTime() < WINDOW_MS
  );

  if (!existingAlert) {
    createAlert({
      type: "honeypot_triggered",
      severity: "high",
      title: "Honeypot Trap Triggered",
      description: `IP ${ip} accessed honeypot endpoint: ${path}`,
      ip,
      metadata: { path },
    });
  }
  updateTimeline(1, 0, 0);
}

/**
 * Record a behavioral anomaly detected by IDS.
 */
export function recordBehaviorAnomaly(
  ip: string,
  anomalyType: string,
  details: string
): void {
  const existingAlert = alerts.find(
    (a) =>
      a.type === "behavior_anomaly" &&
      a.ip === ip &&
      !a.acknowledged &&
      Date.now() - new Date(a.timestamp).getTime() < WINDOW_MS
  );

  if (!existingAlert) {
    createAlert({
      type: "behavior_anomaly",
      severity: "medium",
      title: "Behavioral Anomaly Detected",
      description: `IP ${ip}: ${details}`,
      ip,
      metadata: { anomalyType, details },
    });
  }
}

// ============================================================================
// TIMELINE TRACKING
// ============================================================================

function updateTimeline(events: number, alertCount: number, blocked: number): void {
  const now = new Date();
  // Round to current hour
  now.setMinutes(0, 0, 0);
  const hourKey = now.toISOString();

  const existing = threatTimeline.find((t) => t.timestamp === hourKey);
  if (existing) {
    existing.events += events;
    existing.alerts += alertCount;
    existing.blocked += blocked;
  } else {
    threatTimeline.push({
      timestamp: hourKey,
      events: events,
      alerts: alertCount,
      blocked: blocked,
    });
  }
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all alerts, optionally filtered.
 */
export function getAlerts(options?: {
  limit?: number;
  severity?: AlertSeverity;
  type?: AlertType;
  unacknowledgedOnly?: boolean;
}): SecurityAlert[] {
  let filtered = [...alerts];

  if (options?.severity) {
    filtered = filtered.filter((a) => a.severity === options.severity);
  }
  if (options?.type) {
    filtered = filtered.filter((a) => a.type === options.type);
  }
  if (options?.unacknowledgedOnly) {
    filtered = filtered.filter((a) => !a.acknowledged);
  }

  const limit = options?.limit || 100;
  return filtered.slice(-limit).reverse();
}

/**
 * Acknowledge an alert by ID.
 */
export function acknowledgeAlert(alertId: string): boolean {
  const alert = alerts.find((a) => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    return true;
  }
  return false;
}

/**
 * Acknowledge all alerts.
 */
export function acknowledgeAllAlerts(): number {
  let count = 0;
  for (const alert of alerts) {
    if (!alert.acknowledged) {
      alert.acknowledged = true;
      count++;
    }
  }
  return count;
}

/**
 * Get monitor statistics.
 */
export function getMonitorStats(): MonitorStats {
  const unacked = alerts.filter((a) => !a.acknowledged);

  const bySeverity: Record<AlertSeverity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  const byType: Record<string, number> = {};

  for (const alert of alerts) {
    bySeverity[alert.severity]++;
    byType[alert.type] = (byType[alert.type] || 0) + 1;
  }

  // Count events in last 15 minutes
  const cutoff = Date.now() - WINDOW_MS;
  let failedLoginsCount = 0;
  for (const [, win] of failedLogins) {
    failedLoginsCount += win.timestamps.filter((t) => t > cutoff).length;
  }

  let rateLimitCount = 0;
  for (const [, win] of rateLimitHits) {
    rateLimitCount += win.timestamps.filter((t) => t > cutoff).length;
  }

  const activeThreats = unacked.filter(
    (a) => a.severity === "high" || a.severity === "critical"
  ).length;

  return {
    totalAlerts: alerts.length,
    unacknowledged: unacked.length,
    bySeverity,
    byType,
    failedLoginsLast15m: failedLoginsCount,
    apiErrorsLast15m: apiErrors.filter((t) => t > cutoff).length,
    rateLimitsLast15m: rateLimitCount,
    wafBlocksLast15m: wafBlocks.filter((t) => t > cutoff).length,
    activeThreats,
  };
}

/**
 * Get threat timeline data for charting.
 */
export function getThreatTimeline(hours: number = 24): ThreatTimeline[] {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  return threatTimeline.filter((t) => t.timestamp >= cutoff);
}
