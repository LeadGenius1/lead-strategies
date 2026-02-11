import nodemailer from 'nodemailer';

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  secure?: boolean;
}

export async function testSmtpConnection(config: SmtpConfig): Promise<{
  success: boolean;
  message: string;
  details?: unknown;
}> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? config.port === 465,
      auth: {
        user: config.username,
        pass: config.password,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    await transporter.verify();

    return {
      success: true,
      message: 'SMTP connection verified successfully',
    };
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; command?: string };
    return {
      success: false,
      message: `Connection failed: ${err.message || 'Unknown error'}`,
      details: { code: err.code, command: err.command },
    };
  }
}

export const SMTP_PRESETS: Record<string, Partial<SmtpConfig>> = {
  gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
  outlook: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
  yahoo: { host: 'smtp.mail.yahoo.com', port: 465, secure: true },
  zoho: { host: 'smtp.zoho.com', port: 465, secure: true },
};
