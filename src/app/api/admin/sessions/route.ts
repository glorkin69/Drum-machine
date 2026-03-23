import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getActiveSessionStats, cleanupSessions } from "@/lib/session-manager";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/sessions - Admin: get active session statistics
 */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const stats = await getActiveSessionStats();

    // Get user details for session counts
    const userIds = stats.perUser.map((s) => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const sessionsByUser = stats.perUser.map((s) => ({
      userId: s.userId,
      email: userMap.get(s.userId)?.email || "Unknown",
      name: userMap.get(s.userId)?.name || null,
      activeSessions: s._count.id,
    }));

    // Get recent sessions for monitoring
    const recentSessions = await prisma.userSession.findMany({
      where: {
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: "desc" },
      take: 50,
      select: {
        id: true,
        userId: true,
        userAgent: true,
        ipAddress: true,
        lastActiveAt: true,
        createdAt: true,
        user: {
          select: { email: true, name: true },
        },
      },
    });

    return NextResponse.json({
      totalActiveSessions: stats.totalActive,
      uniqueUsers: stats.perUser.length,
      sessionsByUser,
      recentSessions: recentSessions.map((s) => ({
        id: s.id,
        userId: s.userId,
        email: s.user.email,
        name: s.user.name,
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        lastActiveAt: s.lastActiveAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch session stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch session statistics" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/sessions - Admin: cleanup expired sessions
 */
export async function POST() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const cleaned = await cleanupSessions();
    return NextResponse.json({
      message: `Cleaned up ${cleaned} expired/revoked sessions`,
      cleaned,
    });
  } catch (error) {
    console.error("Failed to cleanup sessions:", error);
    return NextResponse.json(
      { error: "Failed to cleanup sessions" },
      { status: 500 }
    );
  }
}
