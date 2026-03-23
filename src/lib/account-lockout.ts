/**
 * Account Lockout Protection
 *
 * Tracks failed login attempts and temporarily locks accounts
 * after too many consecutive failures. Prevents brute-force attacks.
 */

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit-log";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RESET_WINDOW_MS = 60 * 60 * 1000; // Reset counter after 1 hour of no failures

/**
 * Check if an account is currently locked out.
 * Returns { locked: true, remainingMs } if locked, or { locked: false }.
 */
export async function checkAccountLockout(
  email: string
): Promise<{ locked: boolean; remainingMs: number; failedCount: number }> {
  const normalizedEmail = email.trim().toLowerCase();

  const lockout = await prisma.accountLockout.findUnique({
    where: { email: normalizedEmail },
  });

  if (!lockout) {
    return { locked: false, remainingMs: 0, failedCount: 0 };
  }

  // Check if lockout has expired
  if (lockout.lockedUntil && new Date() < lockout.lockedUntil) {
    const remainingMs = lockout.lockedUntil.getTime() - Date.now();
    return { locked: true, remainingMs, failedCount: lockout.failedCount };
  }

  // Check if failed attempts should be reset (no failures in the reset window)
  if (Date.now() - lockout.lastFailedAt.getTime() > RESET_WINDOW_MS) {
    await prisma.accountLockout.delete({ where: { email: normalizedEmail } });
    return { locked: false, remainingMs: 0, failedCount: 0 };
  }

  return { locked: false, remainingMs: 0, failedCount: lockout.failedCount };
}

/**
 * Record a failed login attempt. May trigger account lockout.
 */
export async function recordFailedAttempt(
  email: string,
  ip?: string
): Promise<{ locked: boolean; failedCount: number; lockoutDurationMs: number }> {
  const normalizedEmail = email.trim().toLowerCase();

  const lockout = await prisma.accountLockout.upsert({
    where: { email: normalizedEmail },
    create: {
      email: normalizedEmail,
      failedCount: 1,
      lastFailedAt: new Date(),
    },
    update: {
      failedCount: { increment: 1 },
      lastFailedAt: new Date(),
    },
  });

  // Calculate escalating lockout duration
  if (lockout.failedCount >= MAX_FAILED_ATTEMPTS) {
    // Escalating lockout: 15 min, 30 min, 1 hour (doubles each threshold)
    const escalationLevel = Math.floor((lockout.failedCount - MAX_FAILED_ATTEMPTS) / MAX_FAILED_ATTEMPTS);
    const lockoutMs = LOCKOUT_DURATION_MS * Math.pow(2, Math.min(escalationLevel, 3));
    const lockedUntil = new Date(Date.now() + lockoutMs);

    await prisma.accountLockout.update({
      where: { email: normalizedEmail },
      data: { lockedUntil },
    });

    await writeAuditLog({
      type: "account_lockout",
      severity: "warning",
      detail: `Account locked after ${lockout.failedCount} failed attempts (${Math.ceil(lockoutMs / 60000)} min lockout)`,
      ip,
      metadata: { email: normalizedEmail, failedCount: lockout.failedCount },
    });

    return { locked: true, failedCount: lockout.failedCount, lockoutDurationMs: lockoutMs };
  }

  return { locked: false, failedCount: lockout.failedCount, lockoutDurationMs: 0 };
}

/**
 * Clear lockout record after a successful login.
 */
export async function clearLockout(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    await prisma.accountLockout.deleteMany({ where: { email: normalizedEmail } });
  } catch {
    // Ignore if record doesn't exist
  }
}

/**
 * Clean up expired lockout records (maintenance task)
 */
export async function cleanupExpiredLockouts(): Promise<number> {
  const cutoff = new Date(Date.now() - RESET_WINDOW_MS);
  const result = await prisma.accountLockout.deleteMany({
    where: { lastFailedAt: { lt: cutoff } },
  });
  return result.count;
}
