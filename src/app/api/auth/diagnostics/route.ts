import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const diagnostics: {
      databaseConnected: boolean;
      timestamp: string;
      error?: string;
    } = {
      databaseConnected: false,
      timestamp: new Date().toISOString(),
    };

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      diagnostics.databaseConnected = true;
    } catch (dbError) {
      console.error("[Diagnostics] Database connection failed:", dbError);
      diagnostics.error = "Database connection failed";
      return NextResponse.json(diagnostics, { status: 503 });
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error("[Diagnostics] Error:", error);
    return NextResponse.json(
      {
        error: "Diagnostics failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
