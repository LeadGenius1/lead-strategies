import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { testSmtpConnection } from '@/lib/email-smtp/smtp-handler';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { smtpHost, smtpPort, smtpUsername, smtpPassword } = await req.json();

    const result = await testSmtpConnection({
      host: smtpHost,
      port: Number(smtpPort),
      username: smtpUsername,
      password: smtpPassword,
    });

    return NextResponse.json(result);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      message: `Test failed: ${err.message}`,
    }, { status: 500 });
  }
}
