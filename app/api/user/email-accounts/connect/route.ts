import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@/lib/prisma';
import { testSmtpConnection } from '@/lib/email-smtp/smtp-handler';
import { encryptToken } from '@/lib/email-oauth/token-manager';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email, smtpHost, smtpPort, smtpUsername, smtpPassword, displayName } = body;

    if (!email || !smtpHost || !smtpPort || !smtpUsername || !smtpPassword) {
      return NextResponse.json({ error: 'Missing required SMTP fields' }, { status: 400 });
    }

    const existing = await prisma.userEmailAccount.findUnique({
      where: { userId_email: { userId: session.user.id, email } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Email account already connected' }, { status: 409 });
    }

    const testResult = await testSmtpConnection({
      host: smtpHost,
      port: Number(smtpPort),
      username: smtpUsername,
      password: smtpPassword,
    });

    if (!testResult.success) {
      return NextResponse.json({
        error: 'SMTP connection failed',
        details: testResult.message,
      }, { status: 400 });
    }

    const account = await prisma.userEmailAccount.create({
      data: {
        userId: session.user.id,
        email,
        displayName: displayName || email,
        provider: 'SMTP',
        status: 'WARMING',
        tier: 'FREE',
        dailyLimit: 50,
        smtpHost,
        smtpPort: Number(smtpPort),
        smtpUsername,
        smtpPassword: encryptToken(smtpPassword),
      },
    });

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        provider: account.provider,
        status: account.status,
        tier: account.tier,
        dailyLimit: account.dailyLimit,
      },
    });
  } catch (error) {
    console.error('Error connecting SMTP account:', error);
    return NextResponse.json({ error: 'Failed to connect account' }, { status: 500 });
  }
}
