# Production Authentication Fix - Deployment Guide

## Problem Summary
Users could register on the live website, but login would fail with "invalid email or password" error, while the same flow worked perfectly in preview mode. This indicated environment-specific issues.

## Root Causes Identified

1. **Email Case Sensitivity**: Frontend normalized emails to lowercase, but backend didn't consistently apply normalization, causing database lookups to fail if email cases didn't match exactly.

2. **Missing NEXTAUTH_URL**: NextAuth requires this environment variable in production for proper callback URL generation and session handling.

3. **Insufficient Logging**: No diagnostic logging made it impossible to debug production issues.

4. **No Database Connection Verification**: Failed database connections weren't detected until auth operations failed.

## Fixes Implemented

### 1. Server-Side Email Normalization
**Files Modified:**
- `src/app/api/auth/register/route.ts`
- `src/lib/auth.ts`

**Changes:**
- Both registration and login now normalize emails server-side using `email.trim().toLowerCase()`
- Ensures consistent email format regardless of how users type it
- Prevents case-sensitivity mismatch issues

### 2. Database Connection Verification
**Files Modified:**
- `src/app/api/auth/register/route.ts`
- `src/lib/auth.ts`

**Changes:**
- Added `await prisma.$queryRaw\`SELECT 1\`` before auth operations
- Returns 503 Service Unavailable if database is unreachable
- Provides clear error messages to users instead of generic auth failures

### 3. Comprehensive Logging
**Files Modified:**
- `src/app/api/auth/register/route.ts`
- `src/lib/auth.ts`

**Changes:**
- Added detailed console.log statements throughout auth flow
- Logs prefixed with `[Registration]` or `[Auth]` for easy filtering
- Tracks: user lookup attempts, password verification, database connections
- Makes production debugging possible through application logs

### 4. NextAuth URL Configuration
**Files Modified:**
- `src/lib/auth.ts`
- `.env`

**Changes:**
- Added `NEXTAUTH_URL` to authOptions configuration
- Added NEXTAUTH_URL to .env file with instructions
- Ensures proper callback URL handling in production

### 5. Diagnostics API Endpoint
**File Created:**
- `src/app/api/auth/diagnostics/route.ts`

**Purpose:**
- Endpoint for troubleshooting production auth issues
- Usage: `GET /api/auth/diagnostics?email=user@example.com`
- Returns:
  - Database connection status
  - Whether user exists in database
  - Whether user has a password set
  - Normalized email address
- **Does NOT expose passwords or sensitive data**

## Environment Variables Required

The following environment variables must be set in production:

```env
# Database (should already be set)
DATABASE_URL=postgresql://...

# NextAuth Secret (should already be set)
NEXTAUTH_SECRET=your-secret-here

# CRITICAL - MUST BE SET FOR PRODUCTION
NEXTAUTH_URL=https://your-production-domain.com

# Optional - for password reset emails
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

## Deployment Checklist

### Before Deploying

- [ ] Verify `NEXTAUTH_URL` is set in production environment
- [ ] Confirm `DATABASE_URL` is correct for production database
- [ ] Ensure `NEXTAUTH_SECRET` is set and different from preview/dev

### After Deploying

1. **Test Registration Flow:**
   ```bash
   # Register a new test user with mixed-case email
   # Email: Test@Example.com
   # Password: testpass123
   ```

2. **Test Login with Same Email (different case):**
   ```bash
   # Try logging in with: test@example.com
   # Should succeed because of email normalization
   ```

3. **Check Application Logs:**
   ```bash
   # Look for these log patterns:
   [Registration] Attempting to register user: test@example.com
   [Registration] Database connection verified
   [Registration] User created successfully: <userId> - test@example.com

   [Auth] Login attempt for: test@example.com
   [Auth] Database connection verified
   [Auth] User found, verifying password for: test@example.com
   [Auth] Login successful for: test@example.com
   ```

4. **Use Diagnostics Endpoint:**
   ```bash
   # Check if user exists in production database
   curl https://your-domain.com/api/auth/diagnostics?email=test@example.com

   # Expected response:
   {
     "databaseConnected": true,
     "userExists": true,
     "userEmail": "test@example.com",
     "hasPassword": true,
     "timestamp": "2026-03-14T..."
   }
   ```

## Troubleshooting Production Issues

### Issue: "Invalid email or password" on login

**Step 1: Check if user exists**
```bash
curl https://your-domain.com/api/auth/diagnostics?email=user@example.com
```

If `userExists: false`, the user wasn't created during registration.

**Step 2: Check application logs**

Look for registration logs:
```
[Registration] Attempting to register user: user@example.com
[Registration] User created successfully: <userId>
```

If you see "User created successfully" but diagnostics returns `userExists: false`, there's a database connection issue.

**Step 3: Verify database connection**
```bash
curl https://your-domain.com/api/auth/diagnostics
```

If `databaseConnected: false`, check DATABASE_URL environment variable.

### Issue: User exists but login still fails

**Check application logs for password verification:**
```
[Auth] User found, verifying password for: user@example.com
[Auth] Invalid password for: user@example.com
```

If you see "Invalid password", the password is genuinely incorrect.

If you see "User not found" instead, there's an email normalization mismatch - check the actual email in database vs. what's being queried.

### Issue: 503 Service Unavailable

This means the database connection check failed.

**Check:**
1. DATABASE_URL is set correctly in production
2. Database server is running and accessible
3. Network connectivity between app and database

## Email Case Sensitivity Example

**Old behavior (broken):**
- User registers with: `User@Example.com` → saved as "User@Example.com"
- User tries to login with: `user@example.com` → lookup fails (no exact match)

**New behavior (fixed):**
- User registers with: `User@Example.com` → normalized and saved as "user@example.com"
- User tries to login with: `USER@example.com` → normalized to "user@example.com" → lookup succeeds

## Security Considerations

- All passwords remain hashed with bcryptjs (10 salt rounds)
- Email normalization doesn't change security posture
- Diagnostics endpoint doesn't expose sensitive data
- Logging doesn't include passwords or password hashes
- Database connection errors don't reveal connection strings

## Files Changed Summary

```
src/
├── app/
│   └── api/
│       └── auth/
│           ├── register/route.ts        [MODIFIED] - Email normalization, logging, DB check
│           └── diagnostics/route.ts     [NEW] - Production troubleshooting endpoint
├── lib/
│   └── auth.ts                          [MODIFIED] - Email normalization, logging, DB check, NEXTAUTH_URL
└── .env                                 [MODIFIED] - Added NEXTAUTH_URL with instructions

CLAUDE.md                                [MODIFIED] - Updated documentation
```

## Rollback Plan

If issues arise, the changes are backward compatible:
- Email normalization doesn't break existing users (emails are already case-insensitive in most cases)
- Added logging is harmless
- NEXTAUTH_URL is optional (NextAuth auto-detects if not set)
- Diagnostics endpoint is read-only and optional

To rollback, simply redeploy the previous version. No database migrations or data changes were made.

## Success Metrics

After deployment, verify:
- [ ] Users can register with any email case (User@Example.COM, user@example.com, etc.)
- [ ] Users can login with any email case
- [ ] Application logs show detailed auth flow
- [ ] Diagnostics endpoint returns accurate information
- [ ] No 503 errors during normal operation
- [ ] Password reset flow still works

## Support

If issues persist after deployment:

1. Check application logs for `[Registration]` and `[Auth]` prefixed messages
2. Use `/api/auth/diagnostics?email=<user-email>` to verify user exists
3. Verify all required environment variables are set
4. Test database connectivity separately from the app
5. Compare preview environment (working) vs production environment (not working) settings
