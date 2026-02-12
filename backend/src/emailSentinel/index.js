// Email Sentinel - backend only (Redis). Frontend never connects to Redis.
const { getQueue, scheduleHealthChecks } = require('./queue');
const { createEmailSentinelWorker } = require('./worker');

async function canConnectToRedis() {
  const url = process.env.REDIS_URL;
  if (!url) return false;
  try {
    const IORedis = require('ioredis');
    const test = new IORedis(url, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      connectTimeout: 5000,
    });
    await test.ping();
    await test.quit();
    return true;
  } catch (err) {
    const code = err?.code;
    if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
      console.warn('[Email Sentinel] Redis unreachable, skipping:', err.message);
    }
    return false;
  }
}

async function startEmailSentinel() {
  if (!process.env.REDIS_URL) return;
  try {
    if (!(await canConnectToRedis())) return;
    createEmailSentinelWorker();
    await scheduleHealthChecks();
    console.log('[Email Sentinel] Started on backend (Redis)');
  } catch (err) {
    console.warn('[Email Sentinel] Failed to start:', err.message);
  }
}

module.exports = {
  getQueue,
  scheduleHealthChecks,
  startEmailSentinel,
  canConnectToRedis,
};
