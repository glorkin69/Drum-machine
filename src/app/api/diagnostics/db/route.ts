import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Database diagnostics endpoint
 * Verifies database connection, schema sync, and core table integrity
 *
 * GET /api/diagnostics/db
 */
export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
  };

  try {
    // 1. Database connection test
    console.log("[DB Diagnostics] Testing database connection...");
    try {
      await prisma.$queryRaw`SELECT 1 as connection_test`;
      diagnostics.checks = {
        ...diagnostics.checks as object,
        connection: { status: "✅ Connected", success: true }
      };
      console.log("[DB Diagnostics] ✅ Database connection successful");
    } catch (connError) {
      diagnostics.checks = {
        ...diagnostics.checks as object,
        connection: {
          status: "❌ Connection failed",
          success: false,
          error: connError instanceof Error ? connError.message : "Unknown error"
        }
      };
      console.error("[DB Diagnostics] ❌ Database connection failed:", connError);
    }

    // 2. Check User table
    console.log("[DB Diagnostics] Checking User table...");
    try {
      const userCount = await prisma.user.count();
      diagnostics.checks = {
        ...diagnostics.checks as object,
        userTable: {
          status: "✅ User table accessible",
          success: true,
          count: userCount
        }
      };
      console.log(`[DB Diagnostics] ✅ User table: ${userCount} records`);
    } catch (userError) {
      diagnostics.checks = {
        ...diagnostics.checks as object,
        userTable: {
          status: "❌ User table error",
          success: false,
          error: userError instanceof Error ? userError.message : "Unknown error"
        }
      };
      console.error("[DB Diagnostics] ❌ User table error:", userError);
    }

    // 3. Check PasswordResetToken table
    console.log("[DB Diagnostics] Checking PasswordResetToken table...");
    try {
      const tokenCount = await prisma.passwordResetToken.count();
      const activeTokens = await prisma.passwordResetToken.count({
        where: { used: false, expiresAt: { gt: new Date() } },
      });
      diagnostics.checks = {
        ...diagnostics.checks as object,
        passwordResetTokenTable: {
          status: "✅ PasswordResetToken table accessible",
          success: true,
          total: tokenCount,
          active: activeTokens
        }
      };
      console.log(`[DB Diagnostics] ✅ PasswordResetToken table: ${tokenCount} total, ${activeTokens} active`);
    } catch (tokenError) {
      diagnostics.checks = {
        ...diagnostics.checks as object,
        passwordResetTokenTable: {
          status: "❌ PasswordResetToken table error",
          success: false,
          error: tokenError instanceof Error ? tokenError.message : "Unknown error"
        }
      };
      console.error("[DB Diagnostics] ❌ PasswordResetToken table error:", tokenError);
    }

    // 4. Check UserSession table
    console.log("[DB Diagnostics] Checking UserSession table...");
    try {
      const sessionCount = await prisma.userSession.count();
      const activeSessions = await prisma.userSession.count({
        where: {
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      });
      diagnostics.checks = {
        ...diagnostics.checks as object,
        userSessionTable: {
          status: "✅ UserSession table accessible",
          success: true,
          total: sessionCount,
          active: activeSessions
        }
      };
      console.log(`[DB Diagnostics] ✅ UserSession table: ${sessionCount} total, ${activeSessions} active`);
    } catch (sessionError) {
      diagnostics.checks = {
        ...diagnostics.checks as object,
        userSessionTable: {
          status: "❌ UserSession table error",
          success: false,
          error: sessionError instanceof Error ? sessionError.message : "Unknown error"
        }
      };
      console.error("[DB Diagnostics] ❌ UserSession table error:", sessionError);
    }

    // 5. Environment variable checks
    console.log("[DB Diagnostics] Checking environment variables...");
    diagnostics.checks = {
      ...diagnostics.checks as object,
      environmentVariables: {
        DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
        RESEND_API_KEY: process.env.RESEND_API_KEY ? "✅ Set" : "⚠️ Not set (emails will log to console)",
        EMAIL_FROM: process.env.EMAIL_FROM ? "✅ Set" : "⚠️ Not set (using default)",
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? "✅ Set" : "⚠️ Not set (auto-detection enabled)",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "✅ Set" : "⚠️ Not set (auto-detection enabled)",
      }
    };

    // 6. Overall status
    const allChecks = diagnostics.checks as Record<string, { success?: boolean }>;
    const failedChecks = Object.entries(allChecks)
      .filter(([key, value]) => key !== "environmentVariables" && value.success === false);

    diagnostics.overallStatus = failedChecks.length === 0 ? "✅ All systems operational" : `⚠️ ${failedChecks.length} check(s) failed`;
    diagnostics.ready = failedChecks.length === 0;

    console.log(`[DB Diagnostics] ${diagnostics.overallStatus}`);

    return NextResponse.json(diagnostics, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[DB Diagnostics] Fatal error:", error);
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        overallStatus: "❌ Diagnostics failed",
        ready: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
