import { Queue } from 'bullmq';
import { getRedisConnection } from '@/lib/redis';

const QUEUE_NAME = 'email-infrastructure-sentinel';

export const emailSentinelQueue = new Queue(QUEUE_NAME, {
  connection: getRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

export async function scheduleHealthChecks() {
  await emailSentinelQueue.add(
    'health-check-all',
    {},
    { repeat: { every: 15 * 60 * 1000 }, jobId: 'recurring-health-check' }
  );
  await emailSentinelQueue.add(
    'warmup-progression',
    {},
    { repeat: { pattern: '0 9 * * *' }, jobId: 'recurring-warmup' }
  );
  await emailSentinelQueue.add(
    'daily-report',
    {},
    { repeat: { pattern: '0 8 * * *' }, jobId: 'recurring-daily-report' }
  );
  await emailSentinelQueue.add(
    'reset-daily-counts',
    {},
    { repeat: { pattern: '0 0 * * *' }, jobId: 'recurring-daily-reset' }
  );
}

export type SentinelJobType =
  | 'health-check-all'
  | 'health-check-single'
  | 'warmup-progression'
  | 'daily-report'
  | 'auto-pause'
  | 'reputation-update'
  | 'reset-daily-counts';
