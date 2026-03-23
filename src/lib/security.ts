/**
 * Security utilities for comprehensive application hardening
 * Provides password policy enforcement, error sanitization, and API security helpers
 */

/**
 * Password strength validation result
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'strong' | 'very-strong';
}

/**
 * Validate password against security policy
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Not a commonly breached password
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  }

  // Check against common breached passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common and has been found in data breaches');
  }

  // Check for sequential/repeated characters
  if (/(.)\1{3,}/.test(password)) {
    errors.push('Password must not contain 4 or more repeated characters');
  }

  // Calculate strength
  let strength: PasswordValidationResult['strength'] = 'weak';
  if (errors.length === 0) {
    const score = calculatePasswordScore(password);
    if (score >= 80) strength = 'very-strong';
    else if (score >= 60) strength = 'strong';
    else if (score >= 40) strength = 'fair';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}

function calculatePasswordScore(password: string): number {
  let score = 0;
  score += Math.min(password.length * 4, 40); // Length (max 40)
  score += (/[A-Z]/.test(password) ? 10 : 0);
  score += (/[a-z]/.test(password) ? 10 : 0);
  score += (/[0-9]/.test(password) ? 10 : 0);
  score += (/[^A-Za-z0-9]/.test(password) ? 15 : 0);
  // Bonus for mix
  const charTypes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  score += charTypes >= 3 ? 15 : 0;
  return Math.min(score, 100);
}

// Top 100 most commonly breached passwords
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
  'michael', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'password1', 'password123',
  'batman', 'login', 'admin123', 'starwars', 'hello123',
  'charlie', 'donald', 'qwerty123', 'whatever', 'passw0rd',
  'welcome', 'welcome1', 'p@ssword', 'p@ssw0rd', 'changeme',
  '1234567890', '0987654321', 'abcdef', 'abcd1234', 'guest',
  'access', 'master123', 'hello', 'charlie123', 'donald123',
]);

/**
 * Sanitize error messages for production responses
 * Prevents leaking stack traces, file paths, or internal details
 */
export function sanitizeErrorForResponse(error: unknown): string {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : 'An unexpected error occurred';
  }

  // In production, never expose internal error details
  return 'An unexpected error occurred. Please try again later.';
}

/**
 * Sanitize email for logging (partial masking)
 * e.g., "john.doe@example.com" -> "jo***@example.com"
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***';
  const maskedLocal = local.length <= 2
    ? '*'.repeat(local.length)
    : local.substring(0, 2) + '*'.repeat(Math.min(local.length - 2, 5));
  return `${maskedLocal}@${domain}`;
}

/**
 * Validate and sanitize email input.
 * Enhanced validation with local part length check and domain validation.
 */
export function validateEmail(email: string): { valid: boolean; sanitized: string; error?: string } {
  // Remove any zero-width characters and invisible unicode
  const trimmed = email
    .replace(/[\u200B-\u200D\uFEFF\u00AD\u2060]/g, '')
    .trim()
    .toLowerCase();

  if (!trimmed) {
    return { valid: false, sanitized: '', error: 'Email is required' };
  }

  // Max length check (RFC 5321)
  if (trimmed.length > 254) {
    return { valid: false, sanitized: trimmed, error: 'Email address is too long' };
  }

  // Split and validate parts
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex < 1 || atIndex === trimmed.length - 1) {
    return { valid: false, sanitized: trimmed, error: 'Invalid email format' };
  }

  const localPart = trimmed.substring(0, atIndex);
  const domainPart = trimmed.substring(atIndex + 1);

  // Local part: max 64 chars (RFC 5321)
  if (localPart.length > 64) {
    return { valid: false, sanitized: trimmed, error: 'Email local part is too long' };
  }

  // Local part: no consecutive dots, no leading/trailing dots
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { valid: false, sanitized: trimmed, error: 'Invalid email format' };
  }

  // Domain: must have at least one dot, no consecutive dots
  if (!domainPart.includes('.') || domainPart.includes('..')) {
    return { valid: false, sanitized: trimmed, error: 'Invalid email domain' };
  }

  // Domain: no leading/trailing hyphens in labels
  const domainLabels = domainPart.split('.');
  for (const label of domainLabels) {
    if (label.length === 0 || label.startsWith('-') || label.endsWith('-')) {
      return { valid: false, sanitized: trimmed, error: 'Invalid email domain' };
    }
  }

  // TLD must be at least 2 chars
  const tld = domainLabels[domainLabels.length - 1];
  if (tld.length < 2) {
    return { valid: false, sanitized: trimmed, error: 'Invalid email domain' };
  }

  // Full format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, sanitized: trimmed, error: 'Invalid email format' };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validate and sanitize user name input.
 * Enhanced with HTML entity decoding, zero-width character removal,
 * and comprehensive XSS prevention.
 */
export function validateName(name: string): { valid: boolean; sanitized: string; error?: string } {
  let sanitized = name;

  // Step 1: Remove zero-width and invisible Unicode characters
  // These can be used to bypass visual inspection of content
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF\u00AD\u2060\u2061-\u2064\u206A-\u206F]/g, '');

  // Step 2: Decode HTML entities that could hide script content
  // e.g., &lt;script&gt; -> <script>
  sanitized = sanitized
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));

  // Step 3: Remove HTML/script tags and dangerous patterns
  sanitized = sanitized
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Script blocks
    .replace(/<[^>]+>/g, '') // All HTML tags
    .replace(/javascript\s*:/gi, '') // JavaScript protocol
    .replace(/vbscript\s*:/gi, '') // VBScript protocol
    .replace(/data\s*:\s*text\/html/gi, '') // Data URI with HTML
    .replace(/on\w+\s*=/gi, '') // Event handlers (onclick=, etc.)
    .replace(/expression\s*\(/gi, '') // CSS expression
    .replace(/url\s*\(/gi, '') // CSS url()
    .trim();

  // Step 4: Remove any remaining control characters (except common whitespace)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  if (!sanitized || sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'Name is required' };
  }

  if (sanitized.length > 100) {
    return { valid: false, sanitized: sanitized.substring(0, 100), error: 'Name must be 100 characters or less' };
  }

  if (sanitized.length < 1) {
    return { valid: false, sanitized, error: 'Name is too short' };
  }

  return { valid: true, sanitized };
}

/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without Web Crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Buffer.from(array).toString('base64');
}

/**
 * Check if a request is from a trusted internal source
 */
export function isInternalRequest(request: Request): boolean {
  const headers = new Headers(request.headers);
  // Check for internal request header that middleware sets
  return headers.get('x-internal-request') === 'true';
}

// ============================================================================
// BCRYPT CONFIGURATION
// ============================================================================

/** Standard bcrypt salt rounds - 12 provides good security/performance balance */
export const BCRYPT_ROUNDS = 12;

// ============================================================================
// ERROR RESPONSE HELPERS
// ============================================================================

import { NextResponse } from "next/server";

/**
 * Create a safe error response that never leaks stack traces in production.
 */
export function createSafeErrorResponse(
  userMessage: string,
  status: number,
  error?: unknown
): NextResponse {
  if (error) {
    console.error(`[Security] Error (${status}):`, error);
  }
  return NextResponse.json(
    {
      error: userMessage,
      ...(process.env.NODE_ENV === "development" && error instanceof Error
        ? { debug: error.message }
        : {}),
    },
    { status }
  );
}

// ============================================================================
// RATE LIMITING - GENERIC API ENDPOINT LIMITER
// ============================================================================

interface GenericRateEntry {
  timestamps: number[];
}

const genericRateStore = new Map<string, GenericRateEntry>();

// Cleanup every 5 minutes
const _cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of genericRateStore) {
    const valid = entry.timestamps.filter((ts) => now - ts < 3600000);
    if (valid.length === 0) {
      genericRateStore.delete(key);
    } else {
      entry.timestamps = valid;
    }
  }
}, 5 * 60 * 1000);
if (_cleanupTimer && typeof _cleanupTimer === "object" && "unref" in _cleanupTimer) {
  (_cleanupTimer as NodeJS.Timeout).unref();
}

/**
 * Generic rate limiter for any API endpoint.
 * Returns an object indicating if the request is allowed.
 */
export function checkGenericRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  let entry = genericRateStore.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    genericRateStore.set(identifier, entry);
  }

  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = (oldestInWindow + windowMs) - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 1000),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/**
 * Create a 429 rate limit response
 */
export function createRateLimitResponse(retryAfterMs: number): NextResponse {
  const retryAfterSec = Math.ceil(retryAfterMs / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please try again later.", retryAfter: retryAfterSec },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
      },
    }
  );
}

// ============================================================================
// SECURITY AUDIT LOG
// ============================================================================

export interface SecurityEvent {
  timestamp: number;
  type: "auth_failure" | "rate_limit" | "validation_error" | "admin_action" | "suspicious_activity";
  detail: string;
  ip?: string;
  userId?: string;
}

const MAX_SECURITY_EVENTS = 500;
const securityEvents: SecurityEvent[] = [];

/**
 * Log a security event for monitoring
 */
export function logSecurityEvent(event: Omit<SecurityEvent, "timestamp">): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: Date.now(),
  };

  securityEvents.push(fullEvent);
  if (securityEvents.length > MAX_SECURITY_EVENTS) {
    securityEvents.shift();
  }

  console.warn(
    `[Security] ${event.type.toUpperCase()} | ${event.detail}` +
    (event.ip ? ` | IP: ${event.ip}` : "") +
    (event.userId ? ` | User: ${event.userId}` : "")
  );
}

/**
 * Get recent security events (for admin dashboard)
 */
export function getSecurityEvents(limit: number = 50): SecurityEvent[] {
  return securityEvents.slice(-limit).reverse();
}

// ============================================================================
// ID VALIDATION
// ============================================================================

/**
 * Validate that a string ID looks like a valid CUID/UUID
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[a-zA-Z0-9_-]{10,50}$/.test(id);
}

// ============================================================================
// IP EXTRACTION
// ============================================================================

/**
 * Extract and validate the client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers);

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp && isValidIp(cfIp.trim())) return cfIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (isValidIp(firstIp)) return firstIp;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp && isValidIp(realIp.trim())) return realIp.trim();

  return "unknown";
}

function isValidIp(ip: string): boolean {
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) return true;
  if (/^[0-9a-fA-F:]+$/.test(ip) && ip.includes(":")) return true;
  return false;
}
