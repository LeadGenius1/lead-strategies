// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — EXECUTION WORKER
// BullMQ worker that processes platform execution jobs.
// Same ioredis + node-redis pattern as scheduler/worker.js.
// ═══════════════════════════════════════════════════════════════

const IORedis = require('ioredis');
const { Worker } = require('bullmq');
const { execute } = require('./engine');
const { EXEC_KEYS } = require('./constants');
const { publishEvent } = require('../../marketStrategy/sseManager');

const QUEUE_NAME = 'nexus-execution';

// --- ioredis connection (BullMQ requires ioredis) ---

let redisConnection = null;

function getRedisConnection() {
  if (!redisConnection && process.env.REDIS_URL) {
    redisConnection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return redisConnection;
}

// --- Worker ---

let worker = null;

/**
 * Create and start the BullMQ worker for execution jobs.
 * Called from index.js startup.
 *
 * @param {import("redis").RedisClientType} redis - node-redis v4 client for app logic
 * @returns {Worker}
 */
function createWorker(redis) {
  const conn = getRedisConnection();
  if (!conn) {
    console.warn('[Execution] No Redis connection — worker not started');
    return null;
  }

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { userId, outputId, executionType, payload } = job.data;

      console.log(`[Execution] Processing ${executionType} for user ${userId}`);

      // Create emit function that publishes to user's feed channel
      function emit(event) {
        publishEvent(redis, EXEC_KEYS.feedChannel(userId), event).catch(() => {});
      }

      const result = await execute({
        userId,
        outputId,
        executionType,
        payload,
        redis,
        emit,
      });

      console.log(`[Execution] ${executionType} ${result.status} for user ${userId}`);
      return result;
    },
    {
      connection: conn,
      concurrency: 2,
      limiter: {
        max: 5,
        duration: 60000, // 5 jobs per minute
      },
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Execution] Job failed: ${job?.data?.executionType} for ${job?.data?.userId}`, err.message);
  });

  worker.on('completed', (job) => {
    console.log(`[Execution] Job completed: ${job?.data?.executionType} for ${job?.data?.userId}`);
  });

  console.log('[Execution] Worker started (concurrency: 2, rate: 5/min)');
  return worker;
}

module.exports = { createWorker, getRedisConnection, QUEUE_NAME };
