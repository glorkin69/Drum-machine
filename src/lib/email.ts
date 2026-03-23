import { Resend } from "resend";

// Initialize Resend client - will use RESEND_API_KEY env var
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendPasswordResetEmailParams {
  email: string;
  resetUrl: string;
}

/**
 * Send a password reset email to the user
 * Falls back to console logging if Resend is not configured (development mode)
 */
export async function sendPasswordResetEmail({
  email,
  resetUrl,
}: SendPasswordResetEmailParams): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // If Resend is not configured, log to console (development fallback)
    if (!resend) {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📧 PASSWORD RESET EMAIL (Development Mode)");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`To: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("");
      console.log("⚠️  RESEND_API_KEY not configured");
      console.log("   Email logging to console for development");
      console.log("   Configure RESEND_API_KEY and EMAIL_FROM in");
      console.log("   Avery Secrets panel to send real emails");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return { success: true };
    }

    const fromEmail = process.env.EMAIL_FROM || "noreply@yourdomain.com";

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Reset Your BeatForge 808 Password",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 8px;
              padding: 30px;
              margin: 20px 0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #9b59b6;
              margin: 0;
              font-size: 28px;
            }
            .content {
              background-color: white;
              padding: 25px;
              border-radius: 6px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .button {
              display: inline-block;
              background-color: #9b59b6;
              color: white !important;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .button:hover {
              background-color: #8e44ad;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .code {
              background-color: #f4f4f4;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: monospace;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🥁 BeatForge 808</h1>
            </div>

            <div class="content">
              <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>

              <p>You requested a password reset for your BeatForge 808 account.</p>

              <p>Click the button below to set a new password:</p>

              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>

              <p>Or copy and paste this link into your browser:</p>
              <p class="code">${resetUrl}</p>

              <div class="warning">
                <strong>⏱️ This link will expire in 1 hour</strong>
              </div>

              <p style="margin-top: 25px;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>

            <div class="footer">
              <p>This email was sent by BeatForge 808</p>
              <p>Having trouble? The reset link will only work once and expires in 60 minutes.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Reset Your BeatForge 808 Password

You requested a password reset for your BeatForge 808 account.

Click the link below to set a new password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, you can safely ignore this email.

---
BeatForge 808
      `.trim(),
    });

    if (error) {
      console.error("Resend email error:", error);
      return {
        success: false,
        error: `Failed to send email: ${error.message}`,
      };
    }

    console.log(`✅ Password reset email sent to ${email} (ID: ${data?.id})`);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
