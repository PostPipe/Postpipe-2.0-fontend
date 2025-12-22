
import { Resend } from 'resend';

// Initialize Resend only if API key is present
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendVerificationEmail(email: string, token: string) {
    const link = `${appUrl}/auth/verify-email?token=${token}`;

    if (!resend) {
        console.log(`[DEV MODE] Verification Email to ${email}: ${link}`);
        return;
    }

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verify your email',
            html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
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
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Reset your password',
            html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
        });
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}
