# Email Service Configuration Guide

## Overview
BeatForge 808 uses **Resend** for sending password reset emails. This guide will help you configure the email service properly.

---

## Quick Diagnostics

Before configuring email, verify your database and authentication system:

1. **Run Database Diagnostics**:
   ```bash
   curl http://localhost:3000/api/diagnostics/db
   ```
   Or visit: `http://localhost:3000/api/diagnostics/db` in your browser

2. **Check Console Logs**: The system will automatically log detailed authentication and email status to the console.

---

## Email Configuration Steps

### 1. Get a Resend API Key

1. Visit [resend.com](https://resend.com) and create a free account
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Copy your API key (starts with `re_...`)

### 2. Verify Your Domain (Optional but Recommended)

**For Development/Testing:**
- You can skip domain verification and use Resend's test email addresses
- Emails will be delivered to your verified email only

**For Production:**
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Add your domain (e.g., `yourdomain.com`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually < 1 hour)

### 3. Configure Environment Variables

Add these variables to your `.env` file or **Avery Secrets panel**:

```bash
# Required: Your Resend API key
RESEND_API_KEY=re_your_api_key_here

# Required: Sender email address (must match verified domain)
EMAIL_FROM=noreply@yourdomain.com

# Optional: Your app's public URL (used for password reset links)
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

#### Using Avery Secrets Panel (Recommended for Production)

1. Click the **Secrets** icon in Avery dashboard
2. Add the following secrets:
   - Key: `RESEND_API_KEY`, Value: `re_your_api_key_here`
   - Key: `EMAIL_FROM`, Value: `noreply@yourdomain.com`
   - Key: `NEXT_PUBLIC_APP_URL`, Value: `https://your-domain.com`
3. Restart your app

---

## Testing Email Configuration

### Method 1: Request a Password Reset

1. Go to `/forgot-password` on your app
2. Enter a valid user email address
3. Check the console logs for the email output

**Without RESEND_API_KEY configured:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 PASSWORD RESET EMAIL (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: user@example.com
Reset URL: http://localhost:3000/reset-password?token=abc123...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**With RESEND_API_KEY configured:**
```
✅ Password reset email sent to u***@example.com (ID: abc123...)
```

### Method 2: Check Database Diagnostics

Run: `curl http://localhost:3000/api/diagnostics/db | jq .checks.environmentVariables`

You should see:
```json
{
  "RESEND_API_KEY": "✅ Set",
  "EMAIL_FROM": "✅ Set",
  "NEXT_PUBLIC_APP_URL": "✅ Set"
}
```

---

## Database Sync Verification

The database schema is already up to date with all migrations applied. You can verify:

### Check Migration Status
```bash
npx prisma migrate status
```

Expected output:
```
Database schema is up to date!
```

### Verify PasswordResetToken Table
```bash
npx prisma studio
```

Then navigate to the `PasswordResetToken` table to view active reset tokens.

---

## Troubleshooting

### Issue: Emails Not Sending

**Symptoms:**
- No emails received after password reset request
- Console shows "Development Mode" message

**Solutions:**
1. Verify `RESEND_API_KEY` is set in environment variables
2. Check that the API key is valid (not expired)
3. Ensure `EMAIL_FROM` matches your verified domain
4. Check Resend dashboard for delivery logs

### Issue: Invalid Reset Links

**Symptoms:**
- Reset link shows "Invalid or expired"
- Console shows "Token not found in database"

**Solutions:**
1. Verify database connection: `curl http://localhost:3000/api/diagnostics/db`
2. Check `NEXT_PUBLIC_APP_URL` or `NEXTAUTH_URL` is set correctly
3. Ensure the reset token hasn't expired (1 hour validity)
4. Verify the token wasn't already used

### Issue: Password Reset Fails After Email

**Symptoms:**
- Email received successfully
- Reset form shows error on submission

**Solutions:**
1. Check console logs for detailed error messages
2. Verify new password meets requirements:
   - At least 8 characters
   - Contains uppercase and lowercase letters
   - Contains at least one number
   - Contains at least one special character
3. Ensure database is accessible
4. Check that the token is still valid (not expired or used)

### Issue: Authentication Not Working After Password Reset

**Symptoms:**
- Password reset successful
- Cannot log in with new password

**Solutions:**
1. **Clear browser cache and cookies**
2. Wait a few seconds for database to sync
3. Try a hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
4. Check console logs during login attempt for detailed error messages
5. Verify database connectivity: `curl http://localhost:3000/api/diagnostics/db`
6. If issue persists, try resetting password again

**Enhanced Debugging:**
- Login attempts now log detailed information:
  ```
  [Auth] Login attempt for: u***@example.com
  [Auth] Comparing password for: u***@example.com
  [Auth] Login successful for: u***@example.com
  ```
- Password reset operations log:
  ```
  [Password Reset] Confirm request received
  [Password Reset] Token validated successfully
  [Password Reset] ✅ Password successfully reset for user abc123
  ```

### Common Database Sync Issues

**Scenario: "User not found" after password reset**
1. Verify the user exists: Check `npx prisma studio` → User table
2. Check email case sensitivity (all emails stored in lowercase)
3. Run diagnostics: `curl http://localhost:3000/api/diagnostics/db`

**Scenario: Session conflicts**
- All sessions are automatically invalidated on password reset
- User must log in again with new password
- Check active sessions: `npx prisma studio` → UserSession table

---

## Development Mode (No Email Service)

If `RESEND_API_KEY` is not configured:
- Password reset emails will **log to console** instead
- Copy the reset URL from console logs
- Paste into browser to test the flow
- Perfect for local development

---

## Production Checklist

Before deploying to production:

- [ ] `RESEND_API_KEY` configured in Avery Secrets
- [ ] `EMAIL_FROM` uses verified domain
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] Domain verified in Resend dashboard
- [ ] Test password reset flow end-to-end
- [ ] Check email deliverability (spam folder, etc.)
- [ ] Run database diagnostics: `/api/diagnostics/db`
- [ ] Verify database migrations applied: `npx prisma migrate status`
- [ ] Monitor logs for authentication errors

---

## Security Notes

1. **Rate Limiting**: Password reset requests are limited to 3 per IP per hour
2. **Token Expiry**: Reset tokens expire after 1 hour
3. **Single Use**: Each token can only be used once
4. **Session Invalidation**: All active sessions are revoked on password change
5. **Email Enumeration Protection**: System returns same message for valid/invalid emails
6. **Timing Attack Prevention**: Constant-time comparison for user lookups

---

## Need Help?

- Check console logs for detailed error messages
- Run diagnostics: `http://localhost:3000/api/diagnostics/db`
- Review [Resend documentation](https://resend.com/docs)
- Check [NextAuth.js documentation](https://next-auth.js.org)
