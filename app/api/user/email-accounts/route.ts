import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await prisma.userEmailAccount.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        provider: true,
        status: true,
        tier: true,
        reputationScore: true,
        dailyLimit: true,
        dailySentCount: true,
        bounceRate: true,
        spamComplaintRate: true,
        lastHealthCheck: true,
        lastSentAt: true,
        warmupCurrentDay: true,
        poolRotationOrder: true,
        createdAt: true,
      },
      orderBy: [
        { tier: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const poolSubscription = await prisma.emailPoolSubscription.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        status: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        totalDailyLimit: true,
        poolSize: true,
      },
    });

    return NextResponse.json({ accounts, poolSubscription });
  } catch (error) {
    console.error('Error fetching email accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}
