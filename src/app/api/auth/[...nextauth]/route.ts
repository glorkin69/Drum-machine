import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rate-limit";

const nextAuthHandler = NextAuth(authOptions);

// Wrap POST to apply rate limiting on login (credential submissions)
// CRITICAL: Must pass the full route context (including params) to NextAuth
// so it correctly uses the App Router handler instead of the Pages Router handler.
// Without params, NextAuth routes to NextAuthApiHandler which expects Pages API (req.query, res.status)
// and crashes. With params, it correctly uses NextAuthRouteHandler for App Router.
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  // Rate limit: 10 attempts per IP per 15 minutes
  const rateLimitResponse = applyRateLimit(request, "login");
  if (rateLimitResponse) return rateLimitResponse;

  return nextAuthHandler(request, context) as Promise<NextResponse>;
}

// GET requests (session checks, CSRF) are not rate limited
export { nextAuthHandler as GET };
