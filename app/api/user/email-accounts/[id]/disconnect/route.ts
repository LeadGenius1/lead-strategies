import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const account = await prisma.userEmailAccount.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.provider === 'MANAGED_POOL') {
      return NextResponse.json({
        error: 'Pool accounts cannot be disconnected individually. Cancel your pool subscription instead.',
      }, { status: 400 });
    }

    await prisma.userEmailAccount.update({
      where: { id },
      data: {
        status: 'DISCONNECTED',
        accessToken: null,
        refreshToken: null,
        smtpPassword: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
