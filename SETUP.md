# BeatForge 808 - Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ (for development)
- PostgreSQL database (provided by Avery)
- Resend account (free tier available) - for password reset emails

## Environment Configuration

### 1. Required Environment Variables

Copy `.env.example` to `.env.local` and configure the required variables:

```bash
cp .env.example .env.local
```

#### Critical Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ (Avery) | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | NextAuth session encryption key |
| `NEXTAUTH_URL` | ✅ (Production) | Your application's public URL |
| `RESEND_API_KEY` | ⚠️ (For emails) | Resend API key for password resets |
| `EMAIL_FROM` | ⚠️ (For emails) | Sender email address |
| `NEXT_PUBLIC_APP_URL` | ⚠️ (For emails) | URL for password reset links |

### 2. Setting Up Resend for Password Reset Emails

If you want users to be able to reset their passwords via email, you need to configure Resend.

#### Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Click **Sign Up** (free tier available)
3. Enter your email and create an account
4. Verify your email address

#### Step 2: Get Your API Key

1. Log in to [Resend Dashboard](https://resend.com/dashboard)
2. Click **API Keys** in the left sidebar
3. Click **Create API Key**
4. Choose a name (e.g., "BeatForge 808")
5. Copy the API key (starts with `re_`)
   - ⚠️ Store this somewhere safe - Resend won't show it again

#### Step 3: Verify Your Email Domain

**For Development/Testing:**
- You can use any email address as `EMAIL_FROM` during development
- Password reset emails will be sent to your test user accounts

**For Production:**
- You must verify a domain with Resend
- Steps:
  1. In Resend Dashboard, click **Domains**
  2. Click **Add Domain**
  3. Enter your domain (e.g., `yourdomain.com`)
  4. Resend provides DNS records to add
  5. Add these records to your domain's DNS settings
  6. Wait for verification (usually 5-30 minutes)
  7. Use emails like `noreply@yourdomain.com` as `EMAIL_FROM`

#### Step 4: Configure Environment Variables

##### For Avery Platform:

1. Go to your Avery project dashboard
2. Click **Secrets** panel
3. Add these secrets:

```
Key: RESEND_API_KEY
Value: re_your_api_key_here (from Step 2)

Key: EMAIL_FROM
Value: noreply@yourdomain.com (or test@example.com for development)

Key: NEXT_PUBLIC_APP_URL
Value: https://your-domain.com (production) or http://localhost:3000 (dev)
```

##### For Local Development:

Add to `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. NextAuth Configuration

#### Generate NEXTAUTH_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and set it in your environment variables.

#### For Production

Set `NEXTAUTH_URL` to your production domain:

```env
NEXTAUTH_URL=https://yourdomain.com
```

This ensures NextAuth correctly validates callback URLs in production.

## Verification

### Check Email Configuration

When you request a password reset:

1. **With RESEND_API_KEY configured:**
   - User will receive an email with a reset link
   - Check console for success message: `✅ Password reset email sent to user@example.com`

2. **Without RESEND_API_KEY (Development Mode):**
   - Email will be logged to console instead
   - You'll see the reset link in the server logs
   - Look for: `📧 PASSWORD RESET EMAIL (Development Mode)`
   - This is perfect for testing without email setup

### Example Console Output (Development Mode)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 PASSWORD RESET EMAIL (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: user@example.com
Reset URL: http://localhost:3000/reset-password?token=abc123...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  RESEND_API_KEY not configured
   Email logging to console for development
   Configure RESEND_API_KEY and EMAIL_FROM in
   Avery Secrets panel to send real emails
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Troubleshooting

### Password Reset Emails Not Working

#### Issue: "RESEND_API_KEY not configured" in console

**Solution:**
- Verify you've set `RESEND_API_KEY` in your environment variables
- Check that the key starts with `re_`
- For Avery: Add it to Secrets panel, then trigger a server restart
- For local development: Restart your dev server after updating `.env.local`

#### Issue: "Invalid API key" error

**Solution:**
- Double-check the API key from Resend (copy the entire value)
- Ensure there are no extra spaces or characters
- Generate a new key in Resend dashboard if needed

#### Issue: "Invalid sender email" error

**Solution:**
- Verify `EMAIL_FROM` is a valid email format
- For production: Ensure the domain is verified in Resend dashboard
- For development: You can use any format like `noreply@example.com`

#### Issue: Emails not arriving in user inbox

**Solution:**
1. Check that `NEXT_PUBLIC_APP_URL` is correct
2. Verify `EMAIL_FROM` domain is verified in Resend (for production)
3. Check user's spam folder
4. In Resend dashboard, check email logs for bounce/reject reasons
5. Test with your own email address first

### NextAuth Issues

#### Issue: "NextAuth callback failed" in production

**Solution:**
- Set `NEXTAUTH_URL` to your exact production domain with protocol
- Example: `https://yourdomain.com` (not `yourdomain.com` or `http://...`)
- Restart your application after updating

## Features by Configuration

### Development (No Resend Setup)
✅ User registration and login
✅ Password reset flow (reset link shown in console)
✅ All drum machine features
❌ Password reset emails to user

### Development (With Resend)
✅ All features above
✅ Real password reset emails to test accounts
✅ Ability to test email styling

### Production
✅ All features
✅ Real password reset emails to users
✅ Domain-verified email sender

## Next Steps

1. **Users & Authentication:**
   - Create your first admin account during deployment
   - Set up user roles and permissions
   - Test password reset flow

2. **Customization:**
   - Update email templates in `src/lib/email.ts`
   - Customize drum machine patterns
   - Add your branding

3. **Monitoring:**
   - Monitor Resend dashboard for email delivery issues
   - Set up application error logging
   - Track authentication metrics

## Support

For issues or questions:
- Check `PRODUCTION_AUTH_FIX.md` for authentication troubleshooting
- Review `CLAUDE.md` for architecture details
- Check the password reset API implementation in `src/app/api/auth/password-reset/`

## Security Notes

🔒 **Important:**
- Never commit `.env` files with real API keys
- Use Avery's Secrets panel for production credentials
- Rotate API keys regularly
- Monitor email delivery logs for suspicious activity
- Set up rate limiting for password reset requests in production
