import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const checks = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    checks: {
      nextauthSecretSet: !!process.env.NEXTAUTH_SECRET,
      nextauthUrlSet: !!process.env.NEXTAUTH_URL,
      databaseUrlSet: !!process.env.DATABASE_URL,
    },
  };

  return NextResponse.json(checks, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
