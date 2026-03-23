/**
 * Web Application Firewall (WAF) - Application-level protection
 *
 * Provides comprehensive request filtering:
 * - Global rate limiting (100 req/min per IP)
 * - SQL injection detection
 * - XSS attack filtering
 * - Path traversal prevention
 * - Command injection (React2Shell) protection
 * - Bot/scanner detection
 * - Request size enforcement
 * - Suspicious payload scanning
 * - IP allowlist/blocklist integration (IDS)
 * - Honeypot trap detection
 * - Geo-blocking support
 * - CSRF protection headers
 * - Automated threat response
 */

import { NextRequest, NextResponse } from "next/server";
import {
  isIpAllowlisted,
  isIpBlocklisted,
  isIdsAutoBlocked,
  isHoneypotPath,
  isCountryBlocked,
  recordRequest,
  recordSuspiciousPayload,
  getIdsConfig,
} from "@/lib/ids";

// ============================================================================
// TYPES
// ============================================================================

export type WafAction = "block" | "allow" | "challenge" | "log";
export type WafRuleCategory =
  | "rate-limit"
  | "sqli"
  | "xss"
  | "path-traversal"
  | "command-injection"
  | "bot-detection"
  | "payload-size"
  | "protocol-violation"
  | "suspicious-pattern";

export interface WafEvent {
  timestamp: number;
  ip: string;
  method: string;
  path: string;
  category: WafRuleCategory;
  action: WafAction;
  detail: string;
  userAgent: string;
  country?: string;
}

export interface WafConfig {
  enabled: boolean;
  /** Global rate limit: requests per window */
  globalRateLimit: number;
  /** Rate limit window in ms */
  globalRateLimitWindowMs: number;
  /** API-specific rate limit (stricter) */
  apiRateLimit: number;
  apiRateLimitWindowMs: number;
  /** Max request body size in bytes */
  maxBodySize: number;
  /** Max URL length */
  maxUrlLength: number;
  /** Enable bot protection */
  botProtection: boolean;
  /** Log only mode (don't block, just log) */
  logOnly: boolean;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: WafConfig = {
  enabled: true,
  globalRateLimit: 100,
  globalRateLimitWindowMs: 60 * 1000, // 1 minute
  apiRateLimit: 60,
  apiRateLimitWindowMs: 60 * 1000, // 1 minute
  maxBodySize: 1_000_000, // 1MB
  maxUrlLength: 2048,
  botProtection: true,
  logOnly: false,
};

let config: WafConfig = { ...DEFAULT_CONFIG };

export function getWafConfig(): WafConfig {
  return { ...config };
}

export function updateWafConfig(updates: Partial<WafConfig>): void {
  config = { ...config, ...updates };
}

// ============================================================================
// RATE LIMITING (Global - separate from auth-specific rate limits)
// ============================================================================

interface RateBucket {
  count: number;
  windowStart: number;
}

const globalRateStore = new Map<string, RateBucket>();
const apiRateStore = new Map<string, RateBucket>();

// Cleanup every 2 minutes
const RATE_CLEANUP_MS = 2 * 60 * 1000;
let rateCleanupTimer: ReturnType<typeof setInterval> | null = null;

function startRateCleanup() {
  if (rateCleanupTimer) return;
  rateCleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of globalRateStore) {
      if (now - bucket.windowStart > config.globalRateLimitWindowMs * 2) {
        globalRateStore.delete(key);
      }
    }
    for (const [key, bucket] of apiRateStore) {
      if (now - bucket.windowStart > config.apiRateLimitWindowMs * 2) {
        apiRateStore.delete(key);
      }
    }
  }, RATE_CLEANUP_MS);
  if (rateCleanupTimer && typeof rateCleanupTimer === "object" && "unref" in rateCleanupTimer) {
    rateCleanupTimer.unref();
  }
}

startRateCleanup();

function checkGlobalRate(ip: string, isApi: boolean): boolean {
  const store = isApi ? apiRateStore : globalRateStore;
  const limit = isApi ? config.apiRateLimit : config.globalRateLimit;
  const windowMs = isApi ? config.apiRateLimitWindowMs : config.globalRateLimitWindowMs;
  const key = `waf:${isApi ? "api" : "global"}:${ip}`;
  const now = Date.now();

  let bucket = store.get(key);
  if (!bucket || now - bucket.windowStart > windowMs) {
    bucket = { count: 0, windowStart: now };
    store.set(key, bucket);
  }

  bucket.count++;
  return bucket.count <= limit;
}

function getRateInfo(ip: string, isApi: boolean): { remaining: number; resetAt: number } {
  const store = isApi ? apiRateStore : globalRateStore;
  const limit = isApi ? config.apiRateLimit : config.globalRateLimit;
  const windowMs = isApi ? config.apiRateLimitWindowMs : config.globalRateLimitWindowMs;
  const key = `waf:${isApi ? "api" : "global"}:${ip}`;

  const bucket = store.get(key);
  if (!bucket) return { remaining: limit, resetAt: Date.now() + windowMs };

  return {
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.windowStart + windowMs,
  };
}

// ============================================================================
// SQL INJECTION DETECTION
// ============================================================================

const SQL_INJECTION_PATTERNS: RegExp[] = [
  // Classic SQL injection
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|UNION)\b\s)/i,
  // Comment-based injection
  /(--|#|\/\*|\*\/)/,
  // Quote-based injection
  /('|")\s*(OR|AND)\s*('|"|\d)/i,
  // Boolean-based blind injection
  /\b(OR|AND)\b\s+\d+\s*=\s*\d+/i,
  // WAITFOR/SLEEP-based time injection
  /(WAITFOR\s+DELAY|SLEEP\s*\(|BENCHMARK\s*\()/i,
  // UNION SELECT injection
  /UNION\s+(ALL\s+)?SELECT/i,
  // Hex-encoded injection
  /0x[0-9a-fA-F]+/,
  // Stacked queries
  /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)/i,
  // Information schema probing
  /INFORMATION_SCHEMA/i,
  // Common SQL functions used in injection
  /(CONCAT|CHAR|ASCII|SUBSTR|SUBSTRING|MID|ORD|LENGTH)\s*\(/i,
];

function detectSqlInjection(input: string): string | null {
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return `SQL injection pattern detected: ${pattern.source.substring(0, 50)}`;
    }
  }
  return null;
}

// ============================================================================
// XSS DETECTION
// ============================================================================

const XSS_PATTERNS: RegExp[] = [
  // Script tags
  /<script[\s>]/i,
  /<\/script>/i,
  // Event handlers
  /\bon\w+\s*=/i,
  // JavaScript protocol
  /javascript\s*:/i,
  // Data URI with script
  /data\s*:\s*text\/html/i,
  // SVG with script
  /<svg[\s/].*?on\w+/i,
  // iframe injection
  /<iframe/i,
  // Object/embed tags
  /<(object|embed|applet)/i,
  // Expression in CSS
  /expression\s*\(/i,
  // VBScript
  /vbscript\s*:/i,
  // Base64 encoded script indicators
  /base64[^a-z0-9]*,.*?<script/i,
  // Template injection
  /\{\{.*?(constructor|__proto__|prototype)/i,
];

function detectXss(input: string): string | null {
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      return `XSS pattern detected: ${pattern.source.substring(0, 50)}`;
    }
  }
  return null;
}

// ============================================================================
// PATH TRAVERSAL DETECTION
// ============================================================================

const PATH_TRAVERSAL_PATTERNS: RegExp[] = [
  // Directory traversal
  /\.\.[/\\]/,
  /[/\\]\.\./,
  // Null byte injection
  /%00/,
  /\x00/,
  // Encoded traversal
  /%2e%2e[%2f%5c]/i,
  /%252e%252e/i,
  // Absolute path access
  /^\/etc\//,
  /^\/proc\//,
  /^\/sys\//,
  /^\/dev\//,
  /^[A-Z]:\\(?:Windows|Program)/i,
  // Common sensitive files
  /\.(env|htaccess|htpasswd|git|svn|ssh)/i,
  // WP config
  /wp-config\.php/i,
];

function detectPathTraversal(path: string): string | null {
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(path)) {
      return `Path traversal attempt: ${pattern.source.substring(0, 50)}`;
    }
  }
  return null;
}

// ============================================================================
// COMMAND INJECTION / REACT2SHELL DETECTION
// ============================================================================

const COMMAND_INJECTION_PATTERNS: RegExp[] = [
  // Shell metacharacters
  /[;&|`$]\s*(cat|ls|dir|type|echo|wget|curl|nc|bash|sh|cmd|powershell)/i,
  // Backtick execution
  /`[^`]*`/,
  // $() command substitution
  /\$\([^)]+\)/,
  // Pipe to shell
  /\|\s*(bash|sh|zsh|cmd|powershell)/i,
  // Common injection targets
  /(\/bin\/(bash|sh|zsh|cat|nc|wget|curl))/i,
  // Environment variable extraction
  /\$\{?[A-Z_]+\}?/,
  // Reverse shell patterns
  /(nc|ncat|netcat)\s+-[elp]/i,
  /\/dev\/(tcp|udp)/i,
  // Node.js specific
  /(require|import)\s*\(\s*['"]child_process/i,
  /process\.env/i,
  /eval\s*\(/i,
  // Python injection
  /__import__\s*\(/i,
  /os\.system/i,
];

function detectCommandInjection(input: string): string | null {
  for (const pattern of COMMAND_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return `Command injection pattern: ${pattern.source.substring(0, 50)}`;
    }
  }
  return null;
}

// ============================================================================
// BOT / SCANNER DETECTION
// ============================================================================

const MALICIOUS_USER_AGENTS: RegExp[] = [
  // Vulnerability scanners
  /nikto/i,
  /sqlmap/i,
  /nmap/i,
  /masscan/i,
  /dirbuster/i,
  /gobuster/i,
  /wfuzz/i,
  /burpsuite/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
  /w3af/i,
  /zap\/|zaproxy/i,
  // Exploit tools
  /metasploit/i,
  /hydra/i,
  /medusa/i,
  // Generic bad bots
  /havij/i,
  /pangolin/i,
  /webinspect/i,
];

const SUSPICIOUS_USER_AGENTS: RegExp[] = [
  // Empty or very short user agent
  /^.{0,5}$/,
  // Known scraper frameworks
  /scrapy/i,
  /mechanize/i,
  /python-requests\/\d/i,
  // Headless browsers often used for attacks
  /phantomjs/i,
  /slimerjs/i,
];

function detectMaliciousBot(userAgent: string): string | null {
  if (!userAgent || userAgent.trim().length === 0) {
    return "Empty User-Agent header";
  }

  for (const pattern of MALICIOUS_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      return `Malicious scanner detected: ${pattern.source}`;
    }
  }

  return null;
}

function detectSuspiciousBot(userAgent: string): string | null {
  for (const pattern of SUSPICIOUS_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      return `Suspicious bot pattern: ${pattern.source}`;
    }
  }
  return null;
}

// ============================================================================
// PROTOCOL VIOLATION DETECTION
// ============================================================================

function detectProtocolViolations(request: NextRequest): string | null {
  const url = request.nextUrl.toString();

  // URL too long (potential buffer overflow)
  if (url.length > config.maxUrlLength) {
    return `URL exceeds max length: ${url.length} > ${config.maxUrlLength}`;
  }

  // Invalid HTTP method for the endpoint
  const method = request.method.toUpperCase();
  const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
  if (!validMethods.includes(method)) {
    return `Invalid HTTP method: ${method}`;
  }

  // Check for abnormal header count (header bomb)
  let headerCount = 0;
  request.headers.forEach(() => headerCount++);
  if (headerCount > 100) {
    return `Excessive headers: ${headerCount}`;
  }

  return null;
}

// ============================================================================
// SUSPICIOUS PATTERN DETECTION (request content)
// ============================================================================

function scanQueryParams(searchParams: URLSearchParams): { category: WafRuleCategory; detail: string } | null {
  for (const [key, value] of searchParams.entries()) {
    // Check keys and values for attacks
    const combined = `${key}=${value}`;

    const sqli = detectSqlInjection(combined);
    if (sqli) return { category: "sqli", detail: sqli };

    const xss = detectXss(combined);
    if (xss) return { category: "xss", detail: xss };

    const cmd = detectCommandInjection(combined);
    if (cmd) return { category: "command-injection", detail: cmd };
  }

  return null;
}

// ============================================================================
// IP EXTRACTION
// ============================================================================

export function getClientIp(request: NextRequest): string {
  // Cloudflare
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // Standard proxy headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

// ============================================================================
// EVENT LOGGING (in-memory ring buffer for admin dashboard)
// ============================================================================

const MAX_EVENTS = 1000;
const wafEvents: WafEvent[] = [];
const blockedIps = new Map<string, { count: number; lastBlocked: number }>();

function logWafEvent(event: WafEvent): void {
  wafEvents.push(event);
  if (wafEvents.length > MAX_EVENTS) {
    wafEvents.shift();
  }

  // Track blocked IPs
  if (event.action === "block") {
    const existing = blockedIps.get(event.ip) || { count: 0, lastBlocked: 0 };
    existing.count++;
    existing.lastBlocked = event.timestamp;
    blockedIps.set(event.ip, existing);

    // Feed into security monitor for real-time alerting
    try {
      const { recordWafBlock } = require("@/lib/security-monitor");
      recordWafBlock(event.ip, event.category);
    } catch { /* ignore if security-monitor not loaded */ }
  }

  // Console logging for server logs
  const emoji = event.action === "block" ? "🛡️" : event.action === "log" ? "⚠️" : "ℹ️";
  console.warn(
    `${emoji} [WAF] ${event.action.toUpperCase()} | ${event.category} | IP: ${event.ip} | ` +
    `${event.method} ${event.path} | ${event.detail}`
  );
}

export function getWafEvents(limit: number = 100, category?: WafRuleCategory): WafEvent[] {
  let events = [...wafEvents];
  if (category) {
    events = events.filter((e) => e.category === category);
  }
  return events.slice(-limit).reverse();
}

export function getWafStats(): {
  totalBlocked: number;
  totalLogged: number;
  byCategory: Record<string, number>;
  topBlockedIps: Array<{ ip: string; count: number; lastBlocked: number }>;
  recentEvents: number;
} {
  const now = Date.now();
  const last24h = now - 24 * 60 * 60 * 1000;
  const recentEvents = wafEvents.filter((e) => e.timestamp > last24h);

  const totalBlocked = recentEvents.filter((e) => e.action === "block").length;
  const totalLogged = recentEvents.filter((e) => e.action === "log").length;

  const byCategory: Record<string, number> = {};
  for (const event of recentEvents) {
    byCategory[event.category] = (byCategory[event.category] || 0) + 1;
  }

  const topBlockedIps = Array.from(blockedIps.entries())
    .filter(([, info]) => info.lastBlocked > last24h)
    .map(([ip, info]) => ({ ip, ...info }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalBlocked,
    totalLogged,
    byCategory,
    topBlockedIps,
    recentEvents: recentEvents.length,
  };
}

// ============================================================================
// IP REPUTATION (auto-block repeat offenders)
// ============================================================================

const IP_BLOCK_THRESHOLD = 20; // Block after 20 violations in 10 minutes
const IP_BLOCK_WINDOW_MS = 10 * 60 * 1000;
const IP_BLOCK_DURATION_MS = 30 * 60 * 1000; // Block for 30 minutes

const ipViolations = new Map<string, number[]>();
const temporaryBlocks = new Map<string, number>(); // IP -> unblock timestamp

function recordViolation(ip: string): void {
  const now = Date.now();
  let violations = ipViolations.get(ip) || [];
  violations.push(now);
  // Keep only violations within window
  violations = violations.filter((ts) => now - ts < IP_BLOCK_WINDOW_MS);
  ipViolations.set(ip, violations);

  if (violations.length >= IP_BLOCK_THRESHOLD) {
    temporaryBlocks.set(ip, now + IP_BLOCK_DURATION_MS);
    console.warn(`🚫 [WAF] IP ${ip} auto-blocked for ${IP_BLOCK_DURATION_MS / 60000} minutes (${violations.length} violations)`);
  }
}

function isIpBlocked(ip: string): boolean {
  const unblockAt = temporaryBlocks.get(ip);
  if (!unblockAt) return false;

  if (Date.now() > unblockAt) {
    temporaryBlocks.delete(ip);
    ipViolations.delete(ip);
    return false;
  }

  return true;
}

// Cleanup IP violations periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, violations] of ipViolations) {
    const valid = violations.filter((ts) => now - ts < IP_BLOCK_WINDOW_MS);
    if (valid.length === 0) {
      ipViolations.delete(ip);
    } else {
      ipViolations.set(ip, valid);
    }
  }
  for (const [ip, unblockAt] of temporaryBlocks) {
    if (now > unblockAt) {
      temporaryBlocks.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref?.();

// ============================================================================
// MAIN WAF CHECK
// ============================================================================

/**
 * Run all WAF checks on an incoming request.
 * Returns a NextResponse (block/challenge) or null (allow).
 */
export function runWafCheck(request: NextRequest): NextResponse | null {
  if (!config.enabled) return null;

  const ip = getClientIp(request);
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  const userAgent = request.headers.get("user-agent") || "";
  const country = request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country") || undefined;

  const baseEvent: Omit<WafEvent, "category" | "action" | "detail"> = {
    timestamp: Date.now(),
    ip,
    method,
    path: pathname,
    userAgent,
    country,
  };

  // Skip WAF for static assets
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico"
  ) {
    return null;
  }

  // ---- Check 0a: IP Allowlist (always allow) ----
  if (isIpAllowlisted(ip)) {
    // Record request for analytics but skip all security checks
    recordRequest({ ip, path: pathname, method, userAgent });
    return null;
  }

  // ---- Check 0b: IP Blocklist (always block) ----
  if (isIpBlocklisted(ip)) {
    logWafEvent({
      ...baseEvent,
      category: "rate-limit",
      action: "block",
      detail: "IP is on the admin-managed blocklist",
    });
    return createBlockResponse("Access denied", 403);
  }

  // ---- Check 0c: IDS Auto-Block ----
  if (isIdsAutoBlocked(ip)) {
    logWafEvent({
      ...baseEvent,
      category: "suspicious-pattern",
      action: "block",
      detail: "IP auto-blocked by Intrusion Detection System (high threat score)",
    });
    return createBlockResponse("Access denied", 403);
  }

  // ---- Check 0d: Geo-Blocking ----
  if (country && isCountryBlocked(country)) {
    logWafEvent({
      ...baseEvent,
      category: "bot-detection",
      action: config.logOnly ? "log" : "block",
      detail: `Request from blocked country: ${country}`,
    });
    if (!config.logOnly) return createBlockResponse("Access denied", 403);
  }

  // ---- Check 0e: Honeypot Trap ----
  const idsConf = getIdsConfig();
  if (idsConf.honeypotEnabled && isHoneypotPath(pathname)) {
    logWafEvent({
      ...baseEvent,
      category: "suspicious-pattern",
      action: config.logOnly ? "log" : "block",
      detail: `Honeypot trap triggered: ${pathname}`,
    });
    recordRequest({ ip, path: pathname, method, userAgent });
    recordSuspiciousPayload(ip);
    recordViolation(ip);
    if (!config.logOnly) return createBlockResponse("Not Found", 404);
  }

  // ---- Check 1: Is IP auto-blocked (WAF rate violations)? ----
  if (isIpBlocked(ip)) {
    logWafEvent({
      ...baseEvent,
      category: "rate-limit",
      action: "block",
      detail: "IP temporarily blocked due to repeated violations",
    });
    return createBlockResponse("Access denied", 403);
  }

  // ---- Check 2: Protocol violations ----
  const protocolIssue = detectProtocolViolations(request);
  if (protocolIssue) {
    const event: WafEvent = {
      ...baseEvent,
      category: "protocol-violation",
      action: config.logOnly ? "log" : "block",
      detail: protocolIssue,
    };
    logWafEvent(event);
    recordViolation(ip);
    if (!config.logOnly) return createBlockResponse("Bad request", 400);
  }

  // ---- Check 3: Bot detection ----
  if (config.botProtection) {
    const maliciousBot = detectMaliciousBot(userAgent);
    if (maliciousBot) {
      const event: WafEvent = {
        ...baseEvent,
        category: "bot-detection",
        action: config.logOnly ? "log" : "block",
        detail: maliciousBot,
      };
      logWafEvent(event);
      recordViolation(ip);
      if (!config.logOnly) return createBlockResponse("Access denied", 403);
    }

    // Log suspicious bots but don't block
    const suspiciousBot = detectSuspiciousBot(userAgent);
    if (suspiciousBot) {
      logWafEvent({
        ...baseEvent,
        category: "bot-detection",
        action: "log",
        detail: suspiciousBot,
      });
    }
  }

  // ---- Check 4: Global rate limiting ----
  const isApi = pathname.startsWith("/api/");
  if (!checkGlobalRate(ip, isApi)) {
    const rateInfo = getRateInfo(ip, isApi);
    const event: WafEvent = {
      ...baseEvent,
      category: "rate-limit",
      action: config.logOnly ? "log" : "block",
      detail: `Global rate limit exceeded (${isApi ? "API" : "page"})`,
    };
    logWafEvent(event);
    recordViolation(ip);
    if (!config.logOnly) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateInfo.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(isApi ? config.apiRateLimit : config.globalRateLimit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // ---- Check 5: Path traversal ----
  const pathTraversal = detectPathTraversal(pathname);
  if (pathTraversal) {
    const event: WafEvent = {
      ...baseEvent,
      category: "path-traversal",
      action: config.logOnly ? "log" : "block",
      detail: pathTraversal,
    };
    logWafEvent(event);
    recordViolation(ip);
    if (!config.logOnly) return createBlockResponse("Access denied", 403);
  }

  // ---- Check 6: Query parameter scanning ----
  const queryIssue = scanQueryParams(request.nextUrl.searchParams);
  if (queryIssue) {
    const event: WafEvent = {
      ...baseEvent,
      category: queryIssue.category,
      action: config.logOnly ? "log" : "block",
      detail: queryIssue.detail,
    };
    logWafEvent(event);
    recordViolation(ip);
    recordSuspiciousPayload(ip);
    if (!config.logOnly) return createBlockResponse("Malicious request detected", 403);
  }

  // ---- Check 7: URL path payload scanning ----
  const decodedPath = decodeURIComponent(pathname);
  const pathSqli = detectSqlInjection(decodedPath);
  if (pathSqli) {
    logWafEvent({ ...baseEvent, category: "sqli", action: config.logOnly ? "log" : "block", detail: pathSqli });
    recordViolation(ip);
    recordSuspiciousPayload(ip);
    if (!config.logOnly) return createBlockResponse("Malicious request detected", 403);
  }

  const pathXss = detectXss(decodedPath);
  if (pathXss) {
    logWafEvent({ ...baseEvent, category: "xss", action: config.logOnly ? "log" : "block", detail: pathXss });
    recordViolation(ip);
    recordSuspiciousPayload(ip);
    if (!config.logOnly) return createBlockResponse("Malicious request detected", 403);
  }

  const pathCmd = detectCommandInjection(decodedPath);
  if (pathCmd) {
    logWafEvent({ ...baseEvent, category: "command-injection", action: config.logOnly ? "log" : "block", detail: pathCmd });
    recordViolation(ip);
    recordSuspiciousPayload(ip);
    if (!config.logOnly) return createBlockResponse("Malicious request detected", 403);
  }

  // All checks passed - record request for IDS behavioral analysis
  recordRequest({ ip, path: pathname, method, userAgent });

  return null;
}

/**
 * WAF check for request body (call from API route handlers)
 * Since middleware can't easily read body, this should be called in API routes
 */
export function scanRequestBody(
  body: string,
  ip: string,
  path: string
): { blocked: boolean; category?: WafRuleCategory; detail?: string } {
  if (!config.enabled) return { blocked: false };

  // Size check
  if (body.length > config.maxBodySize) {
    logWafEvent({
      timestamp: Date.now(),
      ip,
      method: "POST",
      path,
      category: "payload-size",
      action: config.logOnly ? "log" : "block",
      detail: `Body exceeds max size: ${body.length} > ${config.maxBodySize}`,
      userAgent: "",
    });
    if (!config.logOnly) {
      recordViolation(ip);
      return { blocked: true, category: "payload-size", detail: "Request body too large" };
    }
  }

  // SQL injection in body
  const sqli = detectSqlInjection(body);
  if (sqli) {
    logWafEvent({
      timestamp: Date.now(),
      ip,
      method: "POST",
      path,
      category: "sqli",
      action: config.logOnly ? "log" : "block",
      detail: sqli,
      userAgent: "",
    });
    if (!config.logOnly) {
      recordViolation(ip);
      recordSuspiciousPayload(ip);
      return { blocked: true, category: "sqli", detail: sqli };
    }
  }

  // XSS in body
  const xss = detectXss(body);
  if (xss) {
    logWafEvent({
      timestamp: Date.now(),
      ip,
      method: "POST",
      path,
      category: "xss",
      action: config.logOnly ? "log" : "block",
      detail: xss,
      userAgent: "",
    });
    if (!config.logOnly) {
      recordViolation(ip);
      recordSuspiciousPayload(ip);
      return { blocked: true, category: "xss", detail: xss };
    }
  }

  // Command injection in body
  const cmd = detectCommandInjection(body);
  if (cmd) {
    logWafEvent({
      timestamp: Date.now(),
      ip,
      method: "POST",
      path,
      category: "command-injection",
      action: config.logOnly ? "log" : "block",
      detail: cmd,
      userAgent: "",
    });
    if (!config.logOnly) {
      recordViolation(ip);
      recordSuspiciousPayload(ip);
      return { blocked: true, category: "command-injection", detail: cmd };
    }
  }

  return { blocked: false };
}

// ============================================================================
// HELPERS
// ============================================================================

function createBlockResponse(message: string, status: number): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: message,
      status,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "X-WAF-Block": "true",
        // Prevent caching of block responses
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

/**
 * Add WAF security headers to a response
 */
export function addWafHeaders(response: NextResponse, ip: string, isApi: boolean): NextResponse {
  const rateInfo = getRateInfo(ip, isApi);
  const limit = isApi ? config.apiRateLimit : config.globalRateLimit;

  response.headers.set("X-WAF-Protected", "true");
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(rateInfo.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateInfo.resetAt / 1000)));

  return response;
}
