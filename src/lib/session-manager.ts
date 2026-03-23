import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours of inactivity
const MAX_SESSIONS_PER_USER = 3;

/**
 * Generate a unique session token (used as JWT jti claim)
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a new session record in the database.
 * Enforces the max concurrent session limit by revoking oldest sessions.
 */
export async function createSession(params: {
  userId: string;
  sessionToken: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<void> {
  const { userId, sessionToken, userAgent, ipAddress } = params;

  const expiresAt = new Date(Date.now() + SESSION_TIMEOUT_MS);

  // Count active sessions for user
  const activeSessions = await prisma.userSession.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActiveAt: "asc" },
  });

  // If at limit, revoke the oldest session(s)
  if (activeSessions.length >= MAX_SESSIONS_PER_USER) {
    const sessionsToRevoke = activeSessions.slice(
      0,
      activeSessions.length - MAX_SESSIONS_PER_USER + 1
    );
    await prisma.userSession.updateMany({
      where: {
        id: { in: sessionsToRevoke.map((s) => s.id) },
      },
      data: { isRevoked: true, revokedAt: new Date() },
    });
  }

  // Create the new session
  await prisma.userSession.create({
    data: {
      userId,
      sessionToken,
      userAgent: userAgent?.substring(0, 500),
      ipAddress: ipAddress?.substring(0, 45),
      lastActiveAt: new Date(),
      expiresAt,
    },
  });
}

/**
 * Validate a session token. Returns true if session is valid and active.
 * Also refreshes the session's lastActiveAt and extends expiry (sliding window).
 */
export async function validateSession(sessionToken: string): Promise<boolean> {
  if (!sessionToken) return false;

  const session = await prisma.userSession.findUnique({
    where: { sessionToken },
  });

  if (!session) return false;
  if (session.isRevoked) return false;

  // Check if session has expired (either hard expiry or inactivity timeout)
  const now = new Date();
  if (now > session.expiresAt) return false;

  const inactiveTime = now.getTime() - session.lastActiveAt.getTime();
  if (inactiveTime > SESSION_TIMEOUT_MS) {
    // Mark as expired due to inactivity
    await prisma.userSession.update({
      where: { id: session.id },
      data: { isRevoked: true, revokedAt: now },
    });
    return false;
  }

  // Refresh session activity (sliding window) - only update every 5 minutes to avoid excessive writes
  if (inactiveTime > 5 * 60 * 1000) {
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        lastActiveAt: now,
        expiresAt: new Date(now.getTime() + SESSION_TIMEOUT_MS),
      },
    });
  }

  return true;
}

/**
 * Revoke a specific session by ID (for "log out this device")
 */
export async function revokeSession(sessionId: string, userId: string): Promise<boolean> {
  const result = await prisma.userSession.updateMany({
    where: {
      id: sessionId,
      userId,
      isRevoked: false,
    },
    data: { isRevoked: true, revokedAt: new Date() },
  });
  return result.count > 0;
}

/**
 * Revoke all sessions for a user (for "log out all devices" or password change)
 */
export async function revokeAllSessions(
  userId: string,
  exceptToken?: string
): Promise<number> {
  const where: { userId: string; isRevoked: boolean; sessionToken?: { not: string } } = {
    userId,
    isRevoked: false,
  };

  if (exceptToken) {
    where.sessionToken = { not: exceptToken };
  }

  const result = await prisma.userSession.updateMany({
    where,
    data: { isRevoked: true, revokedAt: new Date() },
  });
  return result.count;
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string) {
  return prisma.userSession.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActiveAt: "desc" },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      lastActiveAt: true,
      createdAt: true,
      sessionToken: true,
    },
  });
}

/**
 * Get active session counts per user for admin monitoring
 */
export async function getActiveSessionStats() {
  const now = new Date();
  const stats = await prisma.userSession.groupBy({
    by: ["userId"],
    where: {
      isRevoked: false,
      expiresAt: { gt: now },
    },
    _count: { id: true },
  });

  const totalActive = await prisma.userSession.count({
    where: {
      isRevoked: false,
      expiresAt: { gt: now },
    },
  });

  return { perUser: stats, totalActive };
}

/**
 * Clean up expired/revoked sessions older than 7 days
 */
export async function cleanupSessions(): Promise<number> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const result = await prisma.userSession.deleteMany({
    where: {
      OR: [
        { isRevoked: true, revokedAt: { lt: cutoff } },
        { expiresAt: { lt: cutoff } },
      ],
    },
  });
  return result.count;
}
