import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateSessionToken, createSession } from "@/lib/session-manager";
import { maskEmail } from "@/lib/security";
import { checkAccountLockout, recordFailedAttempt, clearLockout } from "@/lib/account-lockout";
import { writeAuditLog } from "@/lib/audit-log";
import { recordFailedLogin } from "@/lib/security-monitor";
import { recordFailedAuth as recordIdsFailedAuth } from "@/lib/ids";

// Dummy hash for constant-time comparison when user not found (timing attack prevention)
const DUMMY_HASH = "$2a$12$000000000000000000000uGSBEwoFgMMboLMSauiOPJ3dMlGjIe6";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials");
          return null;
        }

        // Normalize email to lowercase for consistency
        const normalizedEmail = credentials.email.trim().toLowerCase();
        const maskedEmail = maskEmail(normalizedEmail);

        // Extract IP for audit logging
        const forwardedFor = (req?.headers as Record<string, string>)?.["x-forwarded-for"];
        const ipAddress = forwardedFor?.split(",")[0]?.trim() || undefined;

        console.log(`[Auth] Login attempt for: ${maskedEmail}`);

        // ---- Account Lockout Check ----
        try {
          const lockoutStatus = await checkAccountLockout(normalizedEmail);
          if (lockoutStatus.locked) {
            const remainingMin = Math.ceil(lockoutStatus.remainingMs / 60000);
            console.warn(`[Auth] Account locked for: ${maskedEmail} (${remainingMin}min remaining)`);
            writeAuditLog({
              type: "auth_failure",
              detail: `Login blocked - account locked (${remainingMin}min remaining, ${lockoutStatus.failedCount} failures)`,
              ip: ipAddress,
              metadata: { email: maskedEmail },
            }).catch(() => {});
            return null;
          }
        } catch (lockoutError) {
          console.error("[Auth] Lockout check failed:", lockoutError);
          // Continue with login attempt if lockout check fails
        }

        // Verify database connection
        try {
          await prisma.$queryRaw`SELECT 1`;
        } catch (dbError) {
          console.error("[Auth] Database connection failed:", dbError);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.password) {
          // Perform a dummy bcrypt compare to prevent timing-based user enumeration
          await bcrypt.compare(credentials.password, DUMMY_HASH);
          console.log(`[Auth] Login failed for: ${maskedEmail} (user not found or no password)`);
          try {
            await recordFailedAttempt(normalizedEmail, ipAddress);
          } catch { /* ignore lockout tracking errors */ }
          writeAuditLog({
            type: "auth_failure",
            detail: "Failed login attempt - invalid credentials",
            ip: ipAddress,
            metadata: { email: maskedEmail },
          }).catch(() => {});
          // Record in security monitor for real-time alerting
          recordFailedLogin(ipAddress || "unknown", maskedEmail);
          // Record in IDS for behavioral threat scoring
          recordIdsFailedAuth(ipAddress || "unknown");
          return null;
        }

        console.log(`[Auth] Comparing password for: ${maskedEmail}`);
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log(`[Auth] Login failed for: ${maskedEmail} (invalid password)`);
          try {
            const lockoutResult = await recordFailedAttempt(normalizedEmail, ipAddress);
            if (lockoutResult.locked) {
              console.warn(`[Auth] Account now locked for: ${maskedEmail}`);
            }
          } catch { /* ignore lockout tracking errors */ }
          writeAuditLog({
            type: "auth_failure",
            detail: "Failed login attempt - invalid credentials",
            ip: ipAddress,
            userId: user.id,
            metadata: { email: maskedEmail },
          }).catch(() => {});
          // Record in security monitor for real-time alerting
          recordFailedLogin(ipAddress || "unknown", maskedEmail);
          // Record in IDS for behavioral threat scoring
          recordIdsFailedAuth(ipAddress || "unknown");
          return null;
        }

        // ---- Successful Login ----
        console.log(`[Auth] Login successful for: ${maskedEmail}`);

        // Clear any lockout records on successful login
        try {
          await clearLockout(normalizedEmail);
        } catch { /* ignore */ }

        // Generate a session token for DB tracking
        const sessionToken = generateSessionToken();

        // Extract request metadata for session tracking
        const userAgent = (req?.headers as Record<string, string>)?.["user-agent"] || undefined;

        // Create session record in database (enforces max 3 concurrent sessions)
        try {
          await createSession({
            userId: user.id,
            sessionToken,
            userAgent,
            ipAddress,
          });
        } catch (sessionError) {
          console.error("[Auth] Failed to create session:", sessionError);
          // Still allow login even if session tracking fails
        }

        // Audit log successful login (non-blocking)
        writeAuditLog({
          type: "auth_success",
          detail: "Successful login",
          ip: ipAddress,
          userId: user.id,
          metadata: { email: maskedEmail },
        }).catch(() => {});

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          sessionToken,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours - matches session timeout
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.email = token.email!;
        session.user.isAdmin = token.isAdmin ?? false;
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
        token.sessionToken = (user as { sessionToken?: string }).sessionToken;
      }
      // Refresh isAdmin from DB on session update
      if (trigger === "update" && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isAdmin: true },
        });
        if (dbUser) {
          token.isAdmin = dbUser.isAdmin;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Debug: Log authentication configuration - NEVER in production
  debug: process.env.NODE_ENV === "development",
  // Cookie configuration - use secure cookies when served over HTTPS
  // Detect HTTPS from NEXT_PUBLIC_APP_URL, NEXTAUTH_URL, or NODE_ENV
  useSecureCookies:
    process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ||
    process.env.NEXTAUTH_URL?.startsWith("https://") ||
    false,
};
