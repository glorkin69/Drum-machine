import { NextResponse } from "next/server";

// --- Types ---

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxAttempts: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Identifier for logging (e.g. "register", "login") */
  name: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // epoch ms when the oldest entry expires
}

// --- In-Memory Store ---

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      // Remove entries whose timestamps are all expired (oldest window we track is 1h)
      const validTimestamps = entry.timestamps.filter(
        (ts) => now - ts < 60 * 60 * 1000
      );
      if (validTimestamps.length === 0) {
        store.delete(key);
      } else {
        entry.timestamps = validTimestamps;
      }
    }
  }, CLEANUP_INTERVAL_MS);
  // Allow Node to exit even if the timer is running
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

startCleanup();

// --- Core Rate Limit Check ---

function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Slide window: keep only timestamps within the current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (entry.timestamps.length >= config.maxAttempts) {
    // Rate limited
    const oldestInWindow = entry.timestamps[0];
    const resetAt = oldestInWindow + config.windowMs;
    return {
      success: false,
      remaining: 0,
      resetAt,
    };
  }

  // Record this attempt
  entry.timestamps.push(now);

  return {
    success: true,
    remaining: config.maxAttempts - entry.timestamps.length,
    resetAt: now + config.windowMs,
  };
}

// --- IP Extraction ---

function getClientIP(request: Request): string {
  const headers = new Headers(request.headers);

  // Check common proxy headers
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; take the first (client) IP
    return forwarded.split(",")[0].trim();
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }

  // Fallback
  return "unknown";
}

// --- Compute Retry-After with Exponential Backoff ---

function computeRetryAfter(
  key: string,
  config: RateLimitConfig,
  result: RateLimitResult
): number {
  // Base retry: seconds until window resets
  const baseRetrySeconds = Math.max(
    1,
    Math.ceil((result.resetAt - Date.now()) / 1000)
  );

  // Count how many times the client has been rate-limited recently
  // by checking how many timestamps are over the limit
  const entry = store.get(key);
  const overCount = entry
    ? Math.max(0, entry.timestamps.length - config.maxAttempts)
    : 0;

  // Exponential backoff multiplier (capped at 8x)
  const multiplier = Math.min(8, Math.pow(2, overCount));

  return Math.min(baseRetrySeconds * multiplier, 3600); // Cap at 1 hour
}

// --- Pre-configured Rate Limiters ---

/** /api/auth/register - 5 attempts per IP per hour */
const REGISTER_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  name: "register",
};

/** /api/auth/[...nextauth] (login) - 10 attempts per IP per 15 minutes */
const LOGIN_CONFIG: RateLimitConfig = {
  maxAttempts: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
  name: "login",
};

/** /api/auth/password-reset/request - 3 attempts per IP per hour */
const PASSWORD_RESET_REQUEST_CONFIG: RateLimitConfig = {
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  name: "password-reset-request",
};

/** /api/auth/password-reset/confirm - 5 attempts per IP per hour */
const PASSWORD_RESET_CONFIRM_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  name: "password-reset-confirm",
};

// --- Public API ---

/**
 * Apply rate limiting to a request. Returns a NextResponse with 429 status
 * if the rate limit is exceeded, or null if the request is allowed.
 */
export function applyRateLimit(
  request: Request,
  endpoint: "register" | "login" | "password-reset-request" | "password-reset-confirm"
): NextResponse | null {
  const configMap: Record<string, RateLimitConfig> = {
    register: REGISTER_CONFIG,
    login: LOGIN_CONFIG,
    "password-reset-request": PASSWORD_RESET_REQUEST_CONFIG,
    "password-reset-confirm": PASSWORD_RESET_CONFIRM_CONFIG,
  };

  const config = configMap[endpoint];
  if (!config) return null;

  const ip = getClientIP(request);
  const key = `rate-limit:${config.name}:${ip}`;
  const result = checkRateLimit(key, config);

  if (!result.success) {
    const retryAfter = computeRetryAfter(key, config, result);

    console.warn(
      `[RateLimit] ${config.name} limit exceeded for IP ${ip} | ` +
        `Max: ${config.maxAttempts}/${config.windowMs / 1000}s | ` +
        `Retry-After: ${retryAfter}s`
    );

    // Feed into security monitor for real-time alerting
    try {
      const { recordRateLimitHit } = require("@/lib/security-monitor");
      recordRateLimitHit(ip, config.name);
    } catch { /* ignore if security-monitor not loaded */ }

    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(config.maxAttempts),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}

/**
 * Get rate limit headers for successful requests (optional - for transparency).
 */
export function getRateLimitHeaders(
  request: Request,
  endpoint: "register" | "login" | "password-reset-request" | "password-reset-confirm"
): Record<string, string> {
  const configMap: Record<string, RateLimitConfig> = {
    register: REGISTER_CONFIG,
    login: LOGIN_CONFIG,
    "password-reset-request": PASSWORD_RESET_REQUEST_CONFIG,
    "password-reset-confirm": PASSWORD_RESET_CONFIRM_CONFIG,
  };

  const config = configMap[endpoint];
  if (!config) return {};

  const ip = getClientIP(request);
  const key = `rate-limit:${config.name}:${ip}`;
  const entry = store.get(key);

  const now = Date.now();
  const windowStart = now - config.windowMs;
  const count = entry
    ? entry.timestamps.filter((ts) => ts > windowStart).length
    : 0;

  return {
    "X-RateLimit-Limit": String(config.maxAttempts),
    "X-RateLimit-Remaining": String(Math.max(0, config.maxAttempts - count)),
    "X-RateLimit-Reset": String(Math.ceil((now + config.windowMs) / 1000)),
  };
}
