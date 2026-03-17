import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { getPrefixedEnv } from './config';

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
    prefix?: string;
}

export const sendEmail = async (options: EmailOptions) => {
    const prefix = options.prefix;
    const emailProvider = getPrefixedEnv('EMAIL_PROVIDER', prefix) || 'resend';
    
    if (emailProvider === 'resend') {
        const apiKey = getPrefixedEnv('RESEND_API_KEY', prefix);
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not configured');
        }
        const resend = new Resend(apiKey);
        const { data, error } = await resend.emails.send({
            from: options.from || getPrefixedEnv('RESEND_FROM_EMAIL', prefix) || 'Acme <onboarding@resend.dev>',
            to: [options.to],
            subject: options.subject,
            html: options.html,
        });
        if (error) throw error;
        return data;
    } else if (emailProvider === 'nodemailer') {
        const transporter = nodemailer.createTransport({
            host: getPrefixedEnv('SMTP_HOST', prefix),
            port: parseInt(getPrefixedEnv('SMTP_PORT', prefix) || '587'),
            secure: getPrefixedEnv('SMTP_SECURE', prefix) === 'true',
            auth: {
                user: getPrefixedEnv('SMTP_USER', prefix),
                pass: getPrefixedEnv('SMTP_PASS', prefix),
            },
        });

        const info = await transporter.sendMail({
            from: options.from || getPrefixedEnv('SMTP_FROM_EMAIL', prefix) || getPrefixedEnv('SMTP_USER', prefix),
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
        return info;
    } else {
        throw new Error(`Unsupported email provider: ${emailProvider}`);
    }
};
