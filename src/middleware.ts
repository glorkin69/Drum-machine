import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { runWafCheck, addWafHeaders, getClientIp } from "@/lib/waf";

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Paths to skip tracking (API routes, static files, etc.)
const skipTrackingPrefixes = ["/api/", "/_next", "/favicon.ico"];

function generateSessionId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================================
  // CVE-2025-29927 PROTECTION (Enhanced)
  // Block any external request that sends internal Next.js headers.
  // These headers are internal to Next.js and should never come from clients.
  // Allowing them could bypass middleware authentication entirely.
  // Also block case-insensitive variants and related internal headers.
  // ============================================================
  const forbiddenHeaders = [
    "x-middleware-subrequest",
    "x-middleware-invoke",
    "x-middleware-next",
    "x-nextjs-data",
  ];
  for (const header of forbiddenHeaders) {
    if (request.headers.has(header)) {
      return new NextResponse(
        JSON.stringify({ error: "Forbidden" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // ============================================================
  // WAF CHECK - First line of defense (before any other logic)
  // ============================================================
  const wafResponse = runWafCheck(request);
  if (wafResponse) {
    return wafResponse;
  }

  // ============================================================
  // SECURITY HEADERS - Applied to all responses
  // ============================================================
  const addSecurityHeaders = (response: NextResponse): NextResponse => {
    // Remove server identification headers
    response.headers.delete("x-powered-by");
    response.headers.delete("server");

    // Add security response headers that middleware can set
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=(), interest-cohort=(), payment=(), usb=()");

    return response;
  };

  // Allow all auth API routes
  if (pathname.startsWith("/api/auth")) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Allow analytics tracking API
  if (pathname.startsWith("/api/analytics")) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Allow collab sync SSE endpoint (auth is handled in the route handler)
  if (pathname.includes("/api/collab/")) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Allow public paths
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isPublicPath) {
    const response = NextResponse.next();
    trackPageView(request, response, pathname);
    addWafHeaders(response, getClientIp(request), false);
    return addSecurityHeaders(response);
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Allow guest access to dashboard with guest=true query parameter
    if (!token) {
      if (pathname === "/dashboard" && request.nextUrl.searchParams.get("guest") === "true") {
        const response = NextResponse.next();
        trackPageView(request, response, pathname);
        addWafHeaders(response, getClientIp(request), false);
        return addSecurityHeaders(response);
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate session against database for authenticated non-API requests
    const sessionToken = (token as Record<string, unknown>).sessionToken as string | undefined;
    if (sessionToken && !pathname.startsWith("/api/")) {
      const response = NextResponse.next();
      response.headers.set("x-session-token", sessionToken);

      // Validate session asynchronously - log errors instead of silently swallowing
      try {
        const validateUrl = new URL("/api/sessions/validate", request.url);
        fetch(validateUrl.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken }),
        }).catch((err) => {
          console.error("[Middleware] Session validation failed:", err.message);
        });
      } catch (err) {
        console.error("[Middleware] Session validation setup failed:", err);
      }
    }

    // Protect admin routes - check isAdmin in JWT
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (!token.isAdmin) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }

    // Track pageview for authenticated page requests (not API routes)
    const response = NextResponse.next();
    const isApi = pathname.startsWith("/api/");
    const shouldTrack = !skipTrackingPrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );
    if (shouldTrack) {
      trackPageView(request, response, pathname, token.sub);
    }

    // Add WAF rate limit headers
    addWafHeaders(response, getClientIp(request), isApi);

    return addSecurityHeaders(response);
  } catch (error) {
    console.error("[Middleware] Authentication error:", error);
    // On JWT error, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("error", "AuthError");
    return NextResponse.redirect(loginUrl);
  }
}

function trackPageView(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
  userId?: string
) {
  // Get or create session ID from cookie
  let sessionId = request.cookies.get("_av_sid")?.value;
  if (!sessionId) {
    sessionId = generateSessionId();
    response.cookies.set("_av_sid", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
  }

  // Fire-and-forget tracking request
  const trackUrl = new URL("/api/analytics/track", request.url);
  try {
    fetch(trackUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") || "",
        "x-vercel-ip-country":
          request.headers.get("x-vercel-ip-country") || "",
        "cf-ipcountry": request.headers.get("cf-ipcountry") || "",
        "x-country": request.headers.get("x-country") || "",
      },
      body: JSON.stringify({
        path: pathname,
        sessionId,
        userId: userId || null,
      }),
    }).catch(() => {
      // Silently ignore tracking errors
    });
  } catch {
    // Silently ignore tracking errors
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
