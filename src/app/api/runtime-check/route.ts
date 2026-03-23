import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    runtime: {
      nodeEnv: process.env.NODE_ENV || "NOT SET",
      nextauthSecretExists: !!process.env.NEXTAUTH_SECRET,
      nextauthUrlExists: !!process.env.NEXTAUTH_URL,
      databaseUrlExists: !!process.env.DATABASE_URL,
    },
  };

  return NextResponse.json(diagnostics, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
