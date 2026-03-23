# Setting Up RESEND_API_KEY for Password Reset Emails

## Quick Summary

`RESEND_API_KEY` is required to send password reset emails to your users. Without it, the app will log reset links to the console instead (good for testing).

## Get Your API Key in 2 Minutes

### Step 1: Create a Resend Account (Free)

1. Go to [https://resend.com](https://resend.com)
2. Click **Sign Up**
3. Enter your email and create an account
4. Check your email and verify your account

### Step 2: Copy Your API Key

1. Log in to [Resend Dashboard](https://resend.com/dashboard)
2. Click **API Keys** in the left sidebar
3. Click **Create API Key**
4. Give it a name (e.g., "BeatForge 808 Production")
5. **Copy the entire key** (starts with `re_`)
6. ⚠️ Save it somewhere safe - Resend won't show it again

### Step 3: Add to Your Environment

#### For Avery Platform:

1. Go to your Avery project
2. Click the **Secrets** panel
3. Add a new secret:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_paste_your_key_here`
4. Click **Save** or **Add Secret**
5. The app will use this key on next deployment/restart

#### For Local Development:

1. Open `.env.local` (or create it from `.env.example`)
2. Add this line:
   ```env
   RESEND_API_KEY=re_paste_your_key_here
   ```
3. Restart your dev server (`npm run dev`)

#### For Production Deployment:

1. Go to your production environment's secrets/environment variables
2. Add `RESEND_API_KEY=re_your_production_key`
3. Deploy/restart your app

## What Gets Configured Automatically

The following are already set up in the app:

- ✅ Email templates (in `src/lib/email.ts`)
- ✅ Password reset flow (in `src/app/api/auth/password-reset/`)
- ✅ Email sending service (Resend integration)
- ✅ Fallback to console logging (development mode)

## Testing It Works

### Development Mode (Without API Key)

1. Go to **Forgot Password** page
2. Enter an email and click "Send reset link"
3. Check your **server console** for output like:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 PASSWORD RESET EMAIL (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: user@example.com
Reset URL: http://localhost:3000/reset-password?token=abc123...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Copy the reset URL and paste it in your browser to test the reset flow.

### Production Mode (With API Key)

1. User goes to **Forgot Password** page
2. User receives email within seconds
3. User clicks link and resets password
4. Check **Resend Dashboard → Emails** to see delivery status

## Troubleshooting

### ❌ "RESEND_API_KEY not configured" in console

**Solution:**
- Add `RESEND_API_KEY` to your environment variables
- For Avery: Make sure it's in the **Secrets** panel (not env file)
- For local: Make sure `.env.local` has the correct key
- Restart your app after adding the key

### ❌ "Invalid API key" error

**Solution:**
- Copy the entire key from Resend (including `re_` prefix)
- Make sure there are no extra spaces
- Generate a new key if needed

### ❌ Emails not arriving

**Solution:**
1. Check that `EMAIL_FROM` is set (defaults to `noreply@yourdomain.com`)
2. In Resend Dashboard → **Emails**, check email delivery status
3. Check user's spam folder
4. For production: Verify your domain in Resend (see below)

### ✅ "re_" prefix missing from key

Your key should look like: `re_XXXXXXXXXXXXXXXXXXXXXXXX`

If it doesn't start with `re_`, regenerate a new key in Resend.

## Production: Verify Your Domain

For production emails to work reliably, you should verify your domain:

1. In **Resend Dashboard**, click **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Resend provides DNS records
5. Add these to your domain's DNS settings
6. Wait for verification (usually 5-30 minutes)
7. Then use email like `noreply@yourdomain.com` as `EMAIL_FROM`

## Key Files

- **Email sending:** `src/lib/email.ts`
- **Password reset API:** `src/app/api/auth/password-reset/`
- **Forgot password form:** `src/app/forgot-password/page.tsx`
- **Reset password form:** `src/app/reset-password/page.tsx`

## Environment Variables Reference

```env
# Required for emails to be sent via Resend
RESEND_API_KEY=re_your_api_key_here

# Sender email address
EMAIL_FROM=noreply@yourdomain.com

# URL for password reset links in emails
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## FAQ

**Q: Can I test without a Resend account?**
A: Yes! Without `RESEND_API_KEY`, the app logs reset links to console. Perfect for testing.

**Q: What if I want to use a different email service?**
A: Edit `src/lib/email.ts` to use your email service (SendGrid, Nodemailer, etc.)

**Q: Is Resend free?**
A: Yes, free tier includes 100 emails/day. See [Resend pricing](https://resend.com/pricing).

**Q: Do users need to verify their email?**
A: No, the current implementation doesn't require email verification. Only password reset sends emails.

**Q: How long are reset links valid?**
A: 1 hour from creation.

## Next Steps

1. ✅ Sign up for Resend (2 minutes)
2. ✅ Copy your API key
3. ✅ Add to environment variables
4. ✅ Test by requesting a password reset
5. ✅ For production: Verify your domain

---

For more detailed setup, see [SETUP.md](./SETUP.md)
