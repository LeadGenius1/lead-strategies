import { NextRequest, NextResponse } from 'next/server';
import { hasRedis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    if (!hasRedis()) {
      return NextResponse.json({ error: 'Redis not configured - set REDIS_URL' }, { status: 503 });
    }

    const { emailSentinelQueue } = await import('@/agents/email-infrastructure-sentinel');
    const body = await req.json().catch(() => ({}));
    const { action, data = {} } = body;

    switch (action) {
      case 'health-check':
        await emailSentinelQueue.add('health-check-all', {});
        break;
      case 'health-check-single':
        await emailSentinelQueue.add('health-check-single', { accountId: data.accountId });
        break;
      case 'warmup-progress':
        await emailSentinelQueue.add('warmup-progression', {});
        break;
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Job ${action} queued` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
