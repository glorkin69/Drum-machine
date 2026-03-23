# Production Authentication Setup & Troubleshooting Guide

This guide helps you diagnose and fix authentication issues in production.

## Quick Fix Checklist

If authentication is not working, follow these steps in order:

### 1. Verify Environment Variables

**Required environment variables for production:**

```bash
# REQUIRED: Generate a secure secret
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# REQUIRED: Your PostgreSQL database URL
DATABASE_URL=postgresql://user:password@host:5432/database

# OPTIONAL: Only set if you have domain issues (www vs non-www)
# Leave blank to use auto-detection (recommended)
NEXTAUTH_URL=https://yourdomain.com
```

### 2. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and set it as `NEXTAUTH_SECRET` in your production environment.

### 3. Check NEXTAUTH_URL Configuration

**Common mistake:** Setting `NEXTAUTH_URL=http://localhost:3000` in production

**Solutions:**
- **Option A (Recommended):** Leave `NEXTAUTH_URL` unset - NextAuth will auto-detect your domain
- **Option B:** Set it to your exact production domain: `NEXTAUTH_URL=https://yourdomain.com`

**Important:**
- Use `https://` in production (not `http://`)
- Match the exact domain users access (with or without `www`)
- Do NOT include trailing slashes

### 4. Verify Database Connection

Test your database connection:

```bash
npx prisma db push
```

If this fails, your `DATABASE_URL` is incorrect.

### 5. Create an Admin Account

Create your first admin account using a custom script:

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/create-admin.ts
```

See `ADMIN_ACCOUNT.md` for detailed instructions on creating admin accounts.

### 6. Use Diagnostics Endpoints

**Environment Check:**
```
GET /api/auth/env-check
```

Returns:
- Environment variable status
- Configuration recommendations
- Security warnings

**User Verification:**
```
GET /api/auth/diagnostics?email=your-admin@example.com
```

Returns:
- Database connection status
- User existence verification
- Password hash status

### 7. Check Browser Console & Server Logs

**Browser Console (F12):**
- Look for `[Login]` prefixed messages
- Check for CORS errors
- Verify no cookie blocking warnings

**Server Logs:**
- Look for `[Auth]` prefixed messages
- Check for database connection errors
- Verify JWT token creation

## Common Production Issues

### Issue 1: "Invalid email or password" for all accounts

**Cause:** `NEXTAUTH_SECRET` mismatch or not set

**Fix:**
1. Generate a new secret: `openssl rand -base64 32`
2. Set it in production environment variables
3. Redeploy the application
4. Clear browser cookies and try again

### Issue 2: Login appears successful but redirects back to login

**Cause:** Cookie not being set due to domain/HTTPS mismatch

**Fix:**
1. Ensure `NEXTAUTH_URL` matches your production domain exactly
2. Verify you're using HTTPS in production
3. Check browser cookie settings (not blocking third-party cookies)
4. Clear browser cookies and try again

### Issue 3: "Database connection failed"

**Cause:** `DATABASE_URL` is incorrect or database is not accessible

**Fix:**
1. Verify `DATABASE_URL` format: `postgresql://user:password@host:5432/database`
2. Test connection with `npx prisma db push`
3. Check firewall rules (database must accept connections from your app)
4. Verify database credentials are correct

### Issue 4: No users exist / cannot login

**Cause:** No admin account created yet

**Fix:**
1. Create an admin account using a custom script (see `ADMIN_ACCOUNT.md`)
2. Use diagnostics: `/api/auth/diagnostics?email=your-admin@example.com`
3. Verify `userExists: true` and `hasPassword: true` in response

### Issue 5: Session expires immediately

**Cause:** Cookie security settings or JWT secret issues

**Fix:**
1. Verify `NEXTAUTH_SECRET` is set correctly
2. Check that cookies are not being blocked
3. Ensure HTTPS is enabled in production
4. Try clearing all site cookies and logging in fresh

### Issue 6: CORS errors in browser console

**Cause:** Domain mismatch between frontend and API

**Fix:**
1. Ensure `NEXTAUTH_URL` matches the domain in browser address bar
2. Check for www vs non-www mismatch
3. Verify all requests go to the same domain

## Environment Variable Checklist

| Variable | Required? | Production Value | Notes |
|----------|-----------|------------------|-------|
| `NEXTAUTH_SECRET` | ✅ Yes | 32+ char random string | Generate with `openssl rand -base64 32` |
| `DATABASE_URL` | ✅ Yes | `postgresql://...` | Must be PostgreSQL, not SQLite |
| `NEXTAUTH_URL` | ⚠️ Optional | `https://yourdomain.com` OR leave blank | Auto-detection works best |
| `NODE_ENV` | ✅ Yes | `production` | Usually auto-set by hosting platform |

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is at least 32 characters
- [ ] `NEXTAUTH_SECRET` is different from development
- [ ] `DATABASE_URL` uses secure credentials
- [ ] `NEXTAUTH_URL` uses HTTPS (if set)
- [ ] Admin accounts use strong, unique passwords
- [ ] `/api/auth/env-check` endpoint is removed or protected in production
- [ ] Number of admin accounts is limited to necessary users only

## Testing Authentication

### Test 1: Environment Check
```bash
curl https://yourdomain.com/api/auth/env-check
```

Expected: All checks should pass, no warnings about localhost or short secrets.

### Test 2: Database Verification
```bash
curl https://yourdomain.com/api/auth/diagnostics?email=your-admin@example.com
```

Expected:
```json
{
  "databaseConnected": true,
  "userExists": true,
  "hasPassword": true
}
```

### Test 3: Login Flow
1. Open browser in incognito mode
2. Navigate to `/login`
3. Enter your admin credentials
4. Should redirect to `/dashboard`
5. Should stay logged in on page refresh

### Test 4: Session Persistence
1. Log in successfully
2. Refresh the page
3. Should remain logged in
4. Check browser cookies - should see `__Secure-next-auth.session-token` (production) or `next-auth.session-token` (development)

## Deployment Platform Specific Notes

### Vercel
- Set environment variables in Project Settings → Environment Variables
- Ensure they're set for Production environment
- Redeploy after changing environment variables
- `NEXTAUTH_URL` auto-detection usually works - leave blank

### Railway
- Set environment variables in Variables tab
- Railway auto-provides `DATABASE_URL` if PostgreSQL add-on is used
- Restart deployment after changing variables

### Render
- Set environment variables in Environment section
- Use Render PostgreSQL database for `DATABASE_URL`
- Auto-deploy on changes if enabled

### DigitalOcean App Platform
- Set environment variables in App Settings
- Use DigitalOcean Managed Database for PostgreSQL
- Ensure firewall allows connection from app

### Docker/Self-Hosted
- Use `.env` file or pass variables via `docker run -e`
- Ensure PostgreSQL is accessible (not localhost if in separate container)
- Use Docker networks for database connection

## Still Having Issues?

If authentication still doesn't work after following this guide:

1. **Check environment variables:**
   - Visit `/api/auth/env-check`
   - Ensure all required variables are set
   - Fix any warnings shown

2. **Check database:**
   - Visit `/api/auth/diagnostics?email=your-admin@example.com`
   - Verify database connection and user existence

3. **Check browser console:**
   - Press F12 to open DevTools
   - Look for errors in Console tab
   - Check Network tab for failed requests

4. **Check server logs:**
   - Look for `[Auth]`, `[Login]`, or `[Middleware]` prefixed messages
   - Identify where the authentication flow is failing

5. **Clear everything and retry:**
   - Clear all browser cookies for your domain
   - Clear browser cache
   - Try in incognito/private mode
   - Test with your admin account

## After Successful Login

Once authentication is working:

1. **Secure the diagnostics endpoints:**
   - Remove or protect `/api/auth/env-check` in production
   - Add authentication to `/api/auth/diagnostics`

2. **Secure admin accounts:**
   - Ensure all admin accounts use strong, unique passwords
   - Limit the number of admin accounts to necessary users only
   - Regularly audit who has admin access

3. **Monitor authentication:**
   - Check server logs regularly
   - Monitor failed login attempts
   - Set up alerts for authentication errors

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js Production Checklist](https://next-auth.js.org/deployment)
- [Prisma Documentation](https://www.prisma.io/docs/)
