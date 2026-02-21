// BullMQ worker for Email Sentinel - backend only (Redis)
const { Worker } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const { getQueue, getRedisConnection } = require('./queue');
const { checkAllAccountHealth, checkSingleAccountHealth } = require('./healthChecker');
const { progressWarmup } = require('./warmupManager');

const QUEUE_NAME = 'email-infrastructure-sentinel';
const { prisma } = require('../config/database');

async function autoPauseAccount(accountId, reason) {
  await prisma.userEmailAccount.update({
    where: { id: accountId },
    data: { status: 'PAUSED' },
  });
}

async function updateReputation(accountId, metrics = {}) {
  const { bounceRate = 0, spamRate = 0 } = metrics;
  let score = 100;
  if (bounceRate > 0.05) score -= 30;
  else if (bounceRate > 0.02) score -= 15;
  if (spamRate > 0.003) score -= 40;
  else if (spamRate > 0.001) score -= 20;
  score = Math.max(0, Math.min(100, score));

  await prisma.userEmailAccount.update({
    where: { id: accountId },
    data: {
      reputationScore: score,
      bounceRate,
      spamComplaintRate: spamRate,
      lastHealthCheck: new Date(),
    },
  });
}

async function generateDailyReport() {
  const accounts = await prisma.userEmailAccount.findMany({
    where: { status: { not: 'DISCONNECTED' } },
  });
  return {
    total: accounts.length,
    free: accounts.filter((a) => a.tier === 'FREE').length,
    pro: accounts.filter((a) => a.tier === 'PRO').length,
    active: accounts.filter((a) => a.status === 'ACTIVE').length,
    warming: accounts.filter((a) => a.status === 'WARMING').length,
    paused: accounts.filter((a) => a.status === 'PAUSED').length,
    avgReputation:
      accounts.length > 0
        ? Math.round(accounts.reduce((sum, a) => sum + a.reputationScore, 0) / accounts.length)
        : 0,
    highBounce: accounts.filter((a) => a.bounceRate > 0.05).length,
  };
}

async function resetDailyCounts() {
  const result = await prisma.userEmailAccount.updateMany({
    where: { status: { in: ['ACTIVE', 'WARMING'] } },
    data: { dailySentCount: 0, dailySentResetAt: new Date() },
  });
  return result.count;
}

function createEmailSentinelWorker() {
  const conn = getRedisConnection();
  if (!conn) return null;

  const queue = getQueue();
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const jobType = job.name;
      switch (jobType) {
        case 'health-check-all':
          return await checkAllAccountHealth(queue);
        case 'health-check-single':
          return await checkSingleAccountHealth(job.data.accountId, queue);
        case 'warmup-progression':
          return await progressWarmup();
        case 'auto-pause':
          return await autoPauseAccount(job.data.accountId, job.data.reason);
        case 'reputation-update':
          return await updateReputation(job.data.accountId, job.data.metrics);
        case 'daily-report':
          return await generateDailyReport();
        case 'reset-daily-counts':
          return await resetDailyCounts();
        default:
          return null;
      }
    },
    {
      connection: conn,
      concurrency: 5,
      limiter: { max: 10, duration: 60000 },
    }
  );

  worker.on('failed', (job, err) => {
    console.error('[Email Sentinel] Failed:', job?.name, err.message);
  });

  return worker;
}

module.exports = { createEmailSentinelWorker };
