import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { getPoolStatus } from '@/lib/email-pool/pool-manager';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getPoolStatus(session.user.id);

    return NextResponse.json({
      hasPool: !!status,
      pool: status,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pool status' }, { status: 500 });
  }
}
