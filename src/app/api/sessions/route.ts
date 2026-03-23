import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserSessions, revokeAllSessions } from "@/lib/session-manager";
import { getToken } from "next-auth/jwt";

/**
 * GET /api/sessions - List current user's active sessions
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await getUserSessions(session.user.id);

    // Don't expose full session tokens - just return enough to identify current session
    const sanitized = sessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      lastActiveAt: s.lastActiveAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      // We'll use this on the client to highlight "current session"
      tokenPrefix: s.sessionToken.substring(0, 8),
    }));

    return NextResponse.json({ sessions: sanitized });
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sessions - Log out all other devices
 */
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get current session token to exclude it
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const currentToken = (token as Record<string, unknown>)?.sessionToken as string | undefined;

    const count = await revokeAllSessions(session.user.id, currentToken);

    return NextResponse.json({
      message: `Logged out ${count} other session(s)`,
      revokedCount: count,
    });
  } catch (error) {
    console.error("Failed to revoke sessions:", error);
    return NextResponse.json(
      { error: "Failed to log out other sessions" },
      { status: 500 }
    );
  }
}
