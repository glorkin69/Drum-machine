# Preview Environment Authentication Fix

## Issue
Login fails with `CredentialsSignin` error in the preview environment.

## Root Cause
The preview environment may not be loading environment variables from the `.env` file at runtime, even though they exist in the file. This causes NextAuth to fail because `NEXTAUTH_SECRET` is not available.

## Diagnosis Completed

### ✅ Database Connection
- Database is accessible and working correctly
- PostgreSQL connection established successfully

### ✅ User Accounts
Found 3 users in database:
1. `demo@example.com` (Admin) - Password: `demo123`
2. `tim@tim.com` (Admin)
3. `tharding886@gmail.com` (Regular user)

### ✅ Password Verification
- Passwords are correctly hashed with bcrypt
- Password comparison works correctly
- Test credentials verified: `demo@example.com` / `demo123`

### ✅ Code Configuration
- NextAuth configuration is correct
- Middleware is properly configured
- Auth flow implementation is correct
- Build succeeds without errors

### ❌ Runtime Environment Issue
The `.env` file contains:
```
NEXTAUTH_SECRET=KIsOl2d251Wdd6A+7bkwSlBEEtXUSCQYHJgsMwMgwDY=
DATABASE_URL=postgresql://...
```

However, these variables may not be loaded at runtime in the preview environment.

## Solution

### Option 1: Configure Environment Variables in Preview Platform (RECOMMENDED)

The Avery preview environment should have environment variables configured at the platform level, not just in the `.env` file.

**Required Environment Variables:**

```bash
# REQUIRED - Authentication Secret (44+ characters)
NEXTAUTH_SECRET=KIsOl2d251Wdd6A+7bkwSlBEEtXUSCQYHJgsMwMgwDY=

# REQUIRED - Database Connection
DATABASE_URL=postgresql://avery_c0ac84abe5a14440ba0201a36870d6c2:x0VcQKEBO8T_fEK8ZcOpxY8wD2S79OjmqWq_05Py0mE@10.1.0.4:5432/preview_c0ac84ab_e5a1_4440_ba02_01a36870d6c2

# OPTIONAL - Only if auto-detection fails
# NEXTAUTH_URL=https://your-preview-url.com

# OPTIONAL - Set to production for proper cookie security
NODE_ENV=production
```

**How to set these in Avery:**
1. Go to your project settings
2. Navigate to "Environment Variables" or "Secrets"
3. Add each variable with its value
4. Redeploy the preview environment

### Option 2: Verify Runtime Environment

Use the diagnostic endpoints to verify environment variables are loaded:

1. **Runtime Check:**
   ```
   https://your-preview-url/api/runtime-check
   ```
   Should show:
   - ✅ `nextauthSecretExists: true`
   - ✅ `nextauthSecretLength: 44` (or more)
   - ✅ `databaseUrlExists: true`
   - ✅ `nodeEnv: "production"` (or "development")

2. **Environment Check:**
   ```
   https://your-preview-url/api/auth/env-check
   ```
   Should show no warnings about missing variables or localhost URLs.

3. **Database Check:**
   ```
   https://your-preview-url/api/auth/diagnostics?email=demo@example.com
   ```
   Should show:
   - `databaseConnected: true`
   - `userExists: true`
   - `hasPassword: true`

### Option 3: Add Explicit .env Loading (Last Resort)

If environment variables still aren't loading, you can add explicit .env file loading:

1. Install dotenv if not already installed:
   ```bash
   npm install dotenv
   ```

2. Create `env-loader.ts` in the project root:
   ```typescript
   // Load .env file explicitly for preview environments
   import { config } from 'dotenv';
   import { resolve } from 'path';

   // Load .env file
   config({ path: resolve(process.cwd(), '.env') });

   // Verify critical variables
   if (!process.env.NEXTAUTH_SECRET) {
     console.error('❌ NEXTAUTH_SECRET not loaded!');
   }
   if (!process.env.DATABASE_URL) {
     console.error('❌ DATABASE_URL not loaded!');
   }
   ```

3. Import this at the top of `src/lib/auth.ts`:
   ```typescript
   import '../../env-loader';
   import { type NextAuthOptions } from "next-auth";
   // ... rest of the file
   ```

   **Note:** This is not the recommended approach as it should be handled by the platform.

## Test Credentials

After fixing the environment variable issue, test with these credentials:

```
Email:    demo@example.com
Password: demo123
```

This account has admin privileges and the password has been verified to work correctly.

## Verification Steps

1. **Check Runtime Environment:**
   - Visit `/api/runtime-check`
   - Ensure all environment variables show as loaded

2. **Test Login:**
   - Go to `/login`
   - Enter: `demo@example.com` / `demo123`
   - Should redirect to `/dashboard` successfully

3. **Verify Session Persistence:**
   - After successful login, refresh the page
   - Should remain logged in
   - Session cookie should be set correctly

4. **Check Admin Access:**
   - Navigate to `/admin`
   - Should show admin panel with user management

## Common Issues & Fixes

### Issue: "CredentialsSignin" Error
- **Cause:** NEXTAUTH_SECRET not loaded at runtime
- **Fix:** Set environment variable in platform settings

### Issue: "Invalid email or password" (but credentials are correct)
- **Cause:** Database connection issue or password mismatch
- **Fix:** Check `/api/auth/diagnostics?email=demo@example.com`

### Issue: Login succeeds but redirects back to login
- **Cause:** Cookie security settings incompatible with environment
- **Fix:** Ensure NODE_ENV is set correctly (production or development)

### Issue: "Session expired" immediately after login
- **Cause:** NEXTAUTH_SECRET mismatch between requests
- **Fix:** Ensure NEXTAUTH_SECRET is consistent across all instances

### Issue: HTTPS/HTTP cookie issues
- **Cause:** Preview URL uses HTTPS but cookies expect HTTP
- **Fix:** Set `NEXTAUTH_URL` to match your exact preview URL

## Security Note

After fixing authentication, consider removing or protecting these diagnostic endpoints in production:
- `/api/runtime-check`
- `/api/auth/env-check`
- `/api/auth/diagnostics`

These endpoints expose configuration information that shouldn't be publicly accessible.

## Additional Tools Created

The following utility scripts are available for database management:

1. **check-db.js** - Lists all users in database
   ```bash
   node check-db.js
   ```

2. **reset-password.js** - Reset a user's password
   ```bash
   node reset-password.js [email] [new-password]
   # Example:
   node reset-password.js demo@example.com newpass123
   ```

3. **quick-test.js** - Test specific credentials
   ```bash
   node quick-test.js
   ```

## Next Steps

1. ✅ Verify `.env` file exists with correct values
2. ⚠️ **Configure environment variables in Avery platform settings**
3. ⚠️ **Redeploy preview environment**
4. ✅ Test login with `demo@example.com` / `demo123`
5. ✅ Verify diagnostic endpoints show success
6. ✅ Test session persistence
7. ✅ Verify admin panel access

## Support

If authentication still fails after following these steps:
1. Check server logs for `[Auth]` prefixed messages
2. Check browser console for client-side errors
3. Verify all diagnostic endpoints return successful responses
4. Ensure the preview environment is actually using the updated configuration
