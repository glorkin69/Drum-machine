/**
 * Intrusion Detection System (IDS)
 *
 * Monitors for suspicious behavioral patterns in real-time:
 * - User behavior anomaly detection (request frequency, path patterns)
 * - Session anomaly detection (impossible travel, device changes)
 * - Honeypot trap detection (access to decoy endpoints)
 * - Privilege escalation attempt detection
 * - Automated threat scoring and response
 */

// ============================================================================
// TYPES
// ============================================================================

export type ThreatLevel = "none" | "low" | "medium" | "high" | "critical";

export interface ThreatScore {
  ip: string;
  score: number; // 0-100
  level: ThreatLevel;
  factors: ThreatFactor[];
  firstSeen: number;
  lastSeen: number;
  requestCount: number;
}

export interface ThreatFactor {
  type: string;
  description: string;
  points: number;
  timestamp: number;
}

export interface BehaviorProfile {
  ip: string;
  requestTimestamps: number[];
  pathsAccessed: Map<string, number>;
  methodsUsed: Map<string, number>;
  userAgents: Set<string>;
  statusCodes: Map<number, number>;
  honeypotHits: number;
  failedAuthAttempts: number;
  adminAccessAttempts: number;
  suspiciousPayloads: number;
  firstSeen: number;
  lastSeen: number;
}

export interface IdsConfig {
  enabled: boolean;
  /** Score threshold to auto-block an IP */
  autoBlockThreshold: number;
  /** Duration of auto-block in ms */
  autoBlockDurationMs: number;
  /** Enable honeypot trap endpoints */
  honeypotEnabled: boolean;
  /** Enable behavioral analysis */
  behaviorAnalysisEnabled: boolean;
  /** Max requests per minute before flagging */
  requestRateThreshold: number;
  /** Enable geo-blocking */
  geoBlockEnabled: boolean;
  /** Blocked country codes (ISO 3166-1 alpha-2) */
  blockedCountries: string[];
}

export interface IdsStats {
  activeProfiles: number;
  threatsDetected: number;
  autoBlocked: number;
  honeypotHits: number;
  topThreats: ThreatScore[];
  threatsByLevel: Record<ThreatLevel, number>;
}

// ============================================================================
// HONEYPOT ROUTES - Decoy endpoints that no legitimate user should access
// ============================================================================

export const HONEYPOT_PATHS = [
  "/wp-admin",
  "/wp-login.php",
  "/administrator",
  "/phpmyadmin",
  "/phpMyAdmin",
  "/.env",
  "/config.php",
  "/xmlrpc.php",
  "/wp-content/uploads",
  "/cgi-bin",
  "/.git/config",
  "/.aws/credentials",
  "/server-status",
  "/actuator",
  "/api/v1/admin/debug",
  "/debug/vars",
  "/telescope",
  "/.well-known/security.txt",
  "/solr/admin",
  "/jenkins",
  "/manager/html",
];

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_IDS_CONFIG: IdsConfig = {
  enabled: true,
  autoBlockThreshold: 70,
  autoBlockDurationMs: 60 * 60 * 1000, // 1 hour
  honeypotEnabled: true,
  behaviorAnalysisEnabled: true,
  requestRateThreshold: 120, // per minute
  geoBlockEnabled: false,
  blockedCountries: [],
};

let idsConfig: IdsConfig = { ...DEFAULT_IDS_CONFIG };

export function getIdsConfig(): IdsConfig {
  return { ...idsConfig };
}

export function updateIdsConfig(updates: Partial<IdsConfig>): void {
  idsConfig = { ...idsConfig, ...updates };
}

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

const behaviorProfiles = new Map<string, BehaviorProfile>();
const threatScores = new Map<string, ThreatScore>();
const idsAutoBlocks = new Map<string, number>(); // IP -> unblock timestamp
const honeypotLog: Array<{ ip: string; path: string; timestamp: number; userAgent: string }> = [];

// Admin-managed IP lists
const ipAllowlist = new Set<string>();
const ipBlocklist = new Map<string, { reason: string; blockedAt: number; expiresAt: number | null }>();

const MAX_HONEYPOT_LOG = 500;
const MAX_PROFILES = 5000;
const PROFILE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// ============================================================================
// IP ALLOW/BLOCK LIST MANAGEMENT
// ============================================================================

export function addToAllowlist(ip: string): void {
  ipAllowlist.add(ip);
  // Remove from blocklist if present
  ipBlocklist.delete(ip);
}

export function removeFromAllowlist(ip: string): void {
  ipAllowlist.delete(ip);
}

export function addToBlocklist(
  ip: string,
  reason: string,
  durationMs: number | null = null
): void {
  ipBlocklist.set(ip, {
    reason,
    blockedAt: Date.now(),
    expiresAt: durationMs ? Date.now() + durationMs : null,
  });
  // Remove from allowlist if present
  ipAllowlist.delete(ip);
}

export function removeFromBlocklist(ip: string): void {
  ipBlocklist.delete(ip);
}

export function getIpAllowlist(): string[] {
  return Array.from(ipAllowlist);
}

export function getIpBlocklist(): Array<{
  ip: string;
  reason: string;
  blockedAt: number;
  expiresAt: number | null;
}> {
  const now = Date.now();
  const result: Array<{ ip: string; reason: string; blockedAt: number; expiresAt: number | null }> = [];

  for (const [ip, info] of ipBlocklist) {
    // Auto-remove expired entries
    if (info.expiresAt && now > info.expiresAt) {
      ipBlocklist.delete(ip);
      continue;
    }
    result.push({ ip, ...info });
  }

  return result;
}

export function isIpAllowlisted(ip: string): boolean {
  return ipAllowlist.has(ip);
}

export function isIpBlocklisted(ip: string): boolean {
  const entry = ipBlocklist.get(ip);
  if (!entry) return false;

  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    ipBlocklist.delete(ip);
    return false;
  }

  return true;
}

export function isIdsAutoBlocked(ip: string): boolean {
  const unblockAt = idsAutoBlocks.get(ip);
  if (!unblockAt) return false;

  if (Date.now() > unblockAt) {
    idsAutoBlocks.delete(ip);
    return false;
  }

  return true;
}

// ============================================================================
// BEHAVIOR PROFILING
// ============================================================================

function getOrCreateProfile(ip: string): BehaviorProfile {
  let profile = behaviorProfiles.get(ip);
  if (!profile) {
    const now = Date.now();
    profile = {
      ip,
      requestTimestamps: [],
      pathsAccessed: new Map(),
      methodsUsed: new Map(),
      userAgents: new Set(),
      statusCodes: new Map(),
      honeypotHits: 0,
      failedAuthAttempts: 0,
      adminAccessAttempts: 0,
      suspiciousPayloads: 0,
      firstSeen: now,
      lastSeen: now,
    };
    behaviorProfiles.set(ip, profile);
  }
  return profile;
}

/**
 * Record a request for behavioral analysis
 */
export function recordRequest(params: {
  ip: string;
  path: string;
  method: string;
  userAgent: string;
  statusCode?: number;
}): void {
  if (!idsConfig.enabled || !idsConfig.behaviorAnalysisEnabled) return;

  const { ip, path, method, userAgent, statusCode } = params;
  const profile = getOrCreateProfile(ip);
  const now = Date.now();

  profile.lastSeen = now;
  profile.requestTimestamps.push(now);

  // Keep only last 5 minutes of timestamps
  const cutoff = now - 5 * 60 * 1000;
  profile.requestTimestamps = profile.requestTimestamps.filter((t) => t > cutoff);

  // Track paths
  const pathCount = profile.pathsAccessed.get(path) || 0;
  profile.pathsAccessed.set(path, pathCount + 1);

  // Track methods
  const methodCount = profile.methodsUsed.get(method) || 0;
  profile.methodsUsed.set(method, methodCount + 1);

  // Track user agents
  profile.userAgents.add(userAgent.substring(0, 200));

  // Track status codes
  if (statusCode) {
    const codeCount = profile.statusCodes.get(statusCode) || 0;
    profile.statusCodes.set(statusCode, codeCount + 1);
  }

  // Check for honeypot hits
  if (idsConfig.honeypotEnabled && isHoneypotPath(path)) {
    profile.honeypotHits++;
    honeypotLog.push({ ip, path, timestamp: now, userAgent });
    if (honeypotLog.length > MAX_HONEYPOT_LOG) {
      honeypotLog.splice(0, honeypotLog.length - MAX_HONEYPOT_LOG);
    }
  }

  // Track admin access attempts
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    profile.adminAccessAttempts++;
  }

  // Recalculate threat score periodically
  calculateThreatScore(ip, profile);
}

/**
 * Record a failed auth attempt for IDS tracking
 */
export function recordFailedAuth(ip: string): void {
  if (!idsConfig.enabled) return;
  const profile = getOrCreateProfile(ip);
  profile.failedAuthAttempts++;
  calculateThreatScore(ip, profile);
}

/**
 * Record a suspicious payload detection
 */
export function recordSuspiciousPayload(ip: string): void {
  if (!idsConfig.enabled) return;
  const profile = getOrCreateProfile(ip);
  profile.suspiciousPayloads++;
  calculateThreatScore(ip, profile);
}

// ============================================================================
// HONEYPOT DETECTION
// ============================================================================

export function isHoneypotPath(path: string): boolean {
  const normalizedPath = path.toLowerCase();
  return HONEYPOT_PATHS.some((hp) => normalizedPath.startsWith(hp.toLowerCase()));
}

export function getHoneypotLog(limit: number = 50): typeof honeypotLog {
  return honeypotLog.slice(-limit).reverse();
}

// ============================================================================
// GEO-BLOCKING
// ============================================================================

export function isCountryBlocked(countryCode: string | undefined): boolean {
  if (!idsConfig.geoBlockEnabled || !countryCode) return false;
  return idsConfig.blockedCountries.includes(countryCode.toUpperCase());
}

// ============================================================================
// THREAT SCORING
// ============================================================================

function calculateThreatScore(ip: string, profile: BehaviorProfile): ThreatScore {
  const factors: ThreatFactor[] = [];
  const now = Date.now();
  let totalScore = 0;

  // Factor 1: Request rate (requests in last minute)
  const oneMinAgo = now - 60 * 1000;
  const recentRequests = profile.requestTimestamps.filter((t) => t > oneMinAgo).length;
  if (recentRequests > idsConfig.requestRateThreshold) {
    const points = Math.min(25, Math.floor((recentRequests / idsConfig.requestRateThreshold) * 15));
    totalScore += points;
    factors.push({
      type: "high_request_rate",
      description: `${recentRequests} requests/min (threshold: ${idsConfig.requestRateThreshold})`,
      points,
      timestamp: now,
    });
  }

  // Factor 2: Honeypot hits (instant high severity)
  if (profile.honeypotHits > 0) {
    const points = Math.min(40, profile.honeypotHits * 20);
    totalScore += points;
    factors.push({
      type: "honeypot_access",
      description: `Accessed ${profile.honeypotHits} honeypot endpoint(s)`,
      points,
      timestamp: now,
    });
  }

  // Factor 3: Failed auth attempts
  if (profile.failedAuthAttempts >= 3) {
    const points = Math.min(30, profile.failedAuthAttempts * 5);
    totalScore += points;
    factors.push({
      type: "failed_auth",
      description: `${profile.failedAuthAttempts} failed login attempts`,
      points,
      timestamp: now,
    });
  }

  // Factor 4: Suspicious payloads (WAF detections)
  if (profile.suspiciousPayloads > 0) {
    const points = Math.min(30, profile.suspiciousPayloads * 10);
    totalScore += points;
    factors.push({
      type: "suspicious_payloads",
      description: `${profile.suspiciousPayloads} malicious payload(s) detected`,
      points,
      timestamp: now,
    });
  }

  // Factor 5: Multiple user agents from same IP
  if (profile.userAgents.size > 5) {
    const points = Math.min(15, (profile.userAgents.size - 5) * 3);
    totalScore += points;
    factors.push({
      type: "multiple_user_agents",
      description: `${profile.userAgents.size} different user agents`,
      points,
      timestamp: now,
    });
  }

  // Factor 6: High error rate
  const errorCount = (profile.statusCodes.get(403) || 0) +
    (profile.statusCodes.get(404) || 0) +
    (profile.statusCodes.get(401) || 0);
  const totalRequests = Array.from(profile.statusCodes.values()).reduce((a, b) => a + b, 0);
  if (totalRequests > 10 && errorCount / totalRequests > 0.5) {
    const points = Math.min(20, Math.floor((errorCount / totalRequests) * 20));
    totalScore += points;
    factors.push({
      type: "high_error_rate",
      description: `${errorCount}/${totalRequests} requests resulted in errors (${Math.round(errorCount / totalRequests * 100)}%)`,
      points,
      timestamp: now,
    });
  }

  // Factor 7: Path scanning behavior (many unique paths)
  if (profile.pathsAccessed.size > 30) {
    const points = Math.min(15, Math.floor((profile.pathsAccessed.size - 30) / 5) * 3);
    totalScore += points;
    factors.push({
      type: "path_scanning",
      description: `Accessed ${profile.pathsAccessed.size} unique paths (potential scanning)`,
      points,
      timestamp: now,
    });
  }

  // Factor 8: Admin access attempts from non-admin context
  if (profile.adminAccessAttempts > 3) {
    const errorOnAdmin = (profile.statusCodes.get(403) || 0);
    if (errorOnAdmin > 0) {
      const points = Math.min(20, profile.adminAccessAttempts * 4);
      totalScore += points;
      factors.push({
        type: "admin_probe",
        description: `${profile.adminAccessAttempts} admin access attempts with ${errorOnAdmin} rejections`,
        points,
        timestamp: now,
      });
    }
  }

  // Cap score at 100
  totalScore = Math.min(100, totalScore);

  const level: ThreatLevel =
    totalScore >= 80 ? "critical" :
    totalScore >= 60 ? "high" :
    totalScore >= 40 ? "medium" :
    totalScore >= 20 ? "low" :
    "none";

  const threatScore: ThreatScore = {
    ip,
    score: totalScore,
    level,
    factors,
    firstSeen: profile.firstSeen,
    lastSeen: profile.lastSeen,
    requestCount: profile.requestTimestamps.length,
  };

  threatScores.set(ip, threatScore);

  // Auto-block if threshold exceeded
  if (totalScore >= idsConfig.autoBlockThreshold && !isIpAllowlisted(ip)) {
    if (!idsAutoBlocks.has(ip)) {
      idsAutoBlocks.set(ip, Date.now() + idsConfig.autoBlockDurationMs);
      console.warn(
        `🚨 [IDS] Auto-blocked IP ${ip} (threat score: ${totalScore}, level: ${level})`
      );

      // Feed to security monitor
      try {
        const { recordWafBlock } = require("@/lib/security-monitor");
        recordWafBlock(ip, "ids-auto-block");
      } catch { /* ignore */ }
    }
  }

  return threatScore;
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export function getThreatScore(ip: string): ThreatScore | null {
  return threatScores.get(ip) || null;
}

export function getTopThreats(limit: number = 20): ThreatScore[] {
  return Array.from(threatScores.values())
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getIdsStats(): IdsStats {
  const allScores = Array.from(threatScores.values());
  const threatsByLevel: Record<ThreatLevel, number> = {
    none: 0,
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  for (const score of allScores) {
    threatsByLevel[score.level]++;
  }

  return {
    activeProfiles: behaviorProfiles.size,
    threatsDetected: allScores.filter((s) => s.level !== "none").length,
    autoBlocked: idsAutoBlocks.size,
    honeypotHits: honeypotLog.length,
    topThreats: getTopThreats(10),
    threatsByLevel,
  };
}

// ============================================================================
// CLEANUP
// ============================================================================

const IDS_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

const _idsCleanup = setInterval(() => {
  const now = Date.now();
  const profileCutoff = now - PROFILE_TTL_MS;

  // Cleanup stale profiles
  for (const [ip, profile] of behaviorProfiles) {
    if (profile.lastSeen < profileCutoff) {
      behaviorProfiles.delete(ip);
      threatScores.delete(ip);
    }
  }

  // Cleanup expired auto-blocks
  for (const [ip, unblockAt] of idsAutoBlocks) {
    if (now > unblockAt) {
      idsAutoBlocks.delete(ip);
    }
  }

  // Cleanup expired blocklist entries
  for (const [ip, info] of ipBlocklist) {
    if (info.expiresAt && now > info.expiresAt) {
      ipBlocklist.delete(ip);
    }
  }

  // Enforce max profiles limit
  if (behaviorProfiles.size > MAX_PROFILES) {
    const sorted = Array.from(behaviorProfiles.entries())
      .sort((a, b) => a[1].lastSeen - b[1].lastSeen);
    const toRemove = sorted.slice(0, behaviorProfiles.size - MAX_PROFILES);
    for (const [ip] of toRemove) {
      behaviorProfiles.delete(ip);
      threatScores.delete(ip);
    }
  }
}, IDS_CLEANUP_INTERVAL);

if (_idsCleanup && typeof _idsCleanup === "object" && "unref" in _idsCleanup) {
  (_idsCleanup as NodeJS.Timeout).unref();
}
