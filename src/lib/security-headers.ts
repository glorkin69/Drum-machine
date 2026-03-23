/**
 * Enhanced Security Headers
 *
 * Provides security header configuration and CSP nonce generation
 * for comprehensive web application protection.
 */

import crypto from "crypto";

/**
 * Generate a cryptographically secure CSP nonce
 */
export function generateCspNonce(): string {
  return crypto.randomBytes(16).toString("base64");
}

/**
 * Build Content Security Policy header value.
 * Uses nonce-based script loading instead of unsafe-inline/unsafe-eval.
 *
 * Note: Next.js requires 'unsafe-eval' in development mode for hot reload.
 * In production, we use nonces for inline scripts.
 */
export function buildCspHeader(nonce?: string): string {
  const isDev = process.env.NODE_ENV === "development";

  // In production, use nonces; in dev, allow unsafe-eval for HMR
  const scriptSrc = isDev
    ? "'self' 'unsafe-eval' 'unsafe-inline'"
    : nonce
      ? `'self' 'nonce-${nonce}' 'strict-dynamic'`
      : "'self' 'unsafe-inline'";

  const styleSrc = "'self' 'unsafe-inline'"; // CSS-in-JS requires unsafe-inline

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

/**
 * Full set of security headers for response hardening
 */
export const SECURITY_HEADERS: Record<string, string> = {
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Legacy XSS protection (defense in depth)
  "X-XSS-Protection": "1; mode=block",
  // Restrict browser features
  "Permissions-Policy":
    "camera=(), microphone=(self), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  // Force HTTPS for 2 years with preload
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  // Disable DNS prefetching
  "X-DNS-Prefetch-Control": "off",
  // Prevent window.opener access
  "Cross-Origin-Opener-Policy": "same-origin",
  // Restrict resource sharing
  "Cross-Origin-Resource-Policy": "same-origin",
  // Prevent embedding in cross-origin contexts
  "Cross-Origin-Embedder-Policy": "credentialless",
  // Prevent caching of sensitive responses
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
};

/**
 * Headers specifically for API responses (subset of full headers)
 */
export const API_SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
  "X-Frame-Options": "DENY",
};
