// BullMQ queue for Email Sentinel - backend only (Redis)
const IORedis = require('ioredis');
const { Queue } = require('bullmq');

const QUEUE_NAME = 'email-infrastructure-sentinel';

let queue = null;
let redisConnection = null;

function getRedisConnection() {
  if (!redisConnection && process.env.REDIS_URL) {
    redisConnection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return redisConnection;
}

function getQueue() {
  if (!queue) {
    const conn = getRedisConnection();
    if (!conn) return null;
    queue = new Queue(QUEUE_NAME, {
      connection: conn,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    });
  }
  return queue;
}

async function scheduleHealthChecks() {
  const q = getQueue();
  if (!q) return;
  await q.add('health-check-all', {}, { repeat: { every: 15 * 60 * 1000 }, jobId: 'recurring-health-check' });
  await q.add('warmup-progression', {}, { repeat: { pattern: '0 9 * * *' }, jobId: 'recurring-warmup' });
  await q.add('daily-report', {}, { repeat: { pattern: '0 8 * * *' }, jobId: 'recurring-daily-report' });
  await q.add('reset-daily-counts', {}, { repeat: { pattern: '0 0 * * *' }, jobId: 'recurring-daily-reset' });
}

module.exports = { getQueue, getRedisConnection, scheduleHealthChecks };
