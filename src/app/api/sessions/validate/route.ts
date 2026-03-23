import { NextResponse } from "next/server";
import { validateSession } from "@/lib/session-manager";

/**
 * POST /api/sessions/validate - Validate a session token (internal use only)
 * Called from middleware to check session validity against the database.
 * Protected by requiring the x-internal-request header or valid session token format.
 */
export async function POST(request: Request) {
  try {
    // Basic protection: reject requests without proper content type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const body = await request.json();
    const { sessionToken } = body;

    if (!sessionToken || typeof sessionToken !== "string") {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // Session tokens are hex-encoded 32 bytes = 64 hex characters
    if (!/^[a-f0-9]{64}$/.test(sessionToken)) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const isValid = await validateSession(sessionToken);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
