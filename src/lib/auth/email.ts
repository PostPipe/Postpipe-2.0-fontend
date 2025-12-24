
import { Resend } from 'resend';

// Initialize Resend only if API key is present
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const EmailTemplate = (content: string, url: string, buttonText: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { background: #000000; padding: 24px; text-align: center; }
    .logo { color: #ffffff; font-size: 24px; font-weight: bold; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .content { padding: 40px 32px; text-align: center; color: #18181b; }
    .title { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #18181b; }
    .text { font-size: 16px; line-height: 1.6; color: #52525b; margin-bottom: 32px; }
    .button { display: inline-block; background-color: #000000; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: background-color 0.2s; font-size: 16px; }
    .button:hover { background-color: #27272a; }
    .footer { background-color: #f4f4f5; padding: 24px; text-align: center; font-size: 14px; color: #71717a; border-top: 1px solid #e4e4e7; }
    .link { color: #71717a; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
       <a href="${appUrl}" class="logo" style="color: #ffffff !important; text-decoration: none; font-size: 24px; font-weight: bold;">PostPipe</a>
    </div>
    <div class="content">
      <h1 class="title">Action Required</h1>
      <p class="text">${content}</p>
      <a href="${url}" class="button" target="_blank" style="color: #ffffff !important; text-decoration: none; display: inline-block; background-color: #000000; padding: 14px 28px; border-radius: 8px; font-weight: 600;">${buttonText}</a>
      <p class="text" style="font-size: 14px; margin-top: 24px;">or copy and paste this link into your browser:<br><a href="${url}" style="color: #2563eb;">${url}</a></p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} PostPipe. All rights reserved.<br>
      <a href="${appUrl}" class="link">Visit Website</a>
    </div>
  </div>
</body>
</html>
`;

export async function sendVerificationEmail(email: string, token: string) {
    const link = `${appUrl}/auth/verify-email?token=${token}`;

    if (!resend) {
        console.log(`[DEV MODE] Verification Email to ${email}: ${link}`);
        return;
    }

    try {
        await resend.emails.send({
            from: 'support@postpipe.in',
            to: email,
            subject: 'Verify your email address',
            html: EmailTemplate(
                'Welcome to PostPipe! Please verify your email address to get started.',
                link,
                'Verify Email'
            ),
        });
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const link = `${appUrl}/auth/reset-password?token=${token}`;

    if (!resend) {
        console.log(`[DEV MODE] Password Reset Email to ${email}: ${link}`);
        return;
    }

    try {
        await resend.emails.send({
            from: 'support@postpipe.in',
            to: email,
            subject: 'Reset your password',
            html: EmailTemplate(
                'You requested a password reset. Click the button below to update your password.',
                link,
                'Reset Password'
            ),
        });
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}

