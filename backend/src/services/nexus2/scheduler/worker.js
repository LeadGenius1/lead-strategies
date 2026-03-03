// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — SCHEDULER WORKER
// BullMQ worker that processes scheduled autonomous tasks.
// Follows exact pattern from marketStrategy/worker.js and
// nexus2/discoveryWorker.js: ioredis for BullMQ, node-redis
// for app logic.
// ═══════════════════════════════════════════════════════════════

const IORedis = require('ioredis');
const { Worker } = require('bullmq');
const { TASKS, SCHED_KEYS, SCHED_EVENTS } = require('./constants');
const { publishEvent } = require('../../marketStrategy/sseManager');
const { trackCost } = require('../../marketStrategy/costTracker');
const { prisma } = require('../../../config/database');

const QUEUE_NAME = 'nexus-scheduler';

// --- ioredis connection (BullMQ requires ioredis) ---

let redisConnection = null;

function getRedisConnection() {
  if (!redisConnection && process.env.REDIS_URL) {
    redisConnection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return redisConnection;
}

// --- Task executor loader ---

const TASK_EXECUTORS = {
  'sender-health':       require('./tasks/senderHealth'),
  'competitor-watch':    require('./tasks/competitorWatch'),
  'content-generator':   require('./tasks/contentGenerator'),
  'prospect-finder':     require('./tasks/prospectFinder'),
  'strategy-refresh':    require('./tasks/strategyRefresh'),
  'performance-report':  require('./tasks/performanceReport'),
  'market-intel-refresh': require('./tasks/marketIntelRefresh'),
};

// --- Worker ---

let worker = null;

/**
 * Create and start the BullMQ worker for scheduled tasks.
 * Called from index.js startup or standalone mode.
 *
 * @param {import("redis").RedisClientType} redis - node-redis v4 client for app logic
 * @returns {Worker}
 */
function createWorker(redis) {
  const conn = getRedisConnection();
  if (!conn) {
    console.warn('[Scheduler] No Redis connection — worker not started');
    return null;
  }

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { userId, taskId, manual } = job.data;
      const taskDef = TASKS[taskId];

      if (!taskDef) {
        console.warn(`[Scheduler] Unknown task: ${taskId}`);
        return { status: 'skipped', reason: 'Unknown task' };
      }

      const executor = TASK_EXECUTORS[taskId];
      if (!executor) {
        console.warn(`[Scheduler] No executor for task: ${taskId}`);
        return { status: 'skipped', reason: 'No executor' };
      }

      const runId = `${taskId}:${Date.now()}`;
      const dateStr = new Date().toISOString().slice(0, 10);

      console.log(`[Scheduler] Running ${taskDef.name} for user ${userId} (${manual ? 'manual' : 'scheduled'})`);

      // Load profile
      const profile = await prisma.businessProfile.findUnique({ where: { userId } });
      if (!profile) {
        console.warn(`[Scheduler] No profile for user ${userId} — skipping ${taskId}`);
        return { status: 'skipped', reason: 'No profile' };
      }

      // Create emit function (publishes to user's feed channel)
      function emit(event) {
        const enriched = {
          ...event,
          taskId,
          taskName: taskDef.name,
          taskIcon: taskDef.icon,
          userId,
          runId,
          ts: new Date().toISOString(),
        };

        // Fire-and-forget — don't block task execution on SSE
        publishEvent(redis, SCHED_KEYS.feedEvents(userId).replace(':events', ''), enriched).catch(() => {});
      }

      // Emit task start
      emit({
        type: SCHED_EVENTS.TASK_START,
        message: `Starting ${taskDef.name}...`,
      });

      try {
        // Execute the task
        const result = await executor.execute({ profile, redis, emit });

        // Store output in Redis (expires after 7 days)
        const outputKey = SCHED_KEYS.taskOutput(userId, taskId, runId);
        await redis.set(outputKey, JSON.stringify({
          ...result,
          runId,
          taskId,
          completedAt: new Date().toISOString(),
        }), { EX: 7 * 24 * 60 * 60 });

        // Record the run
        const runKey = SCHED_KEYS.taskRun(userId, taskId, dateStr);
        await redis.set(runKey, JSON.stringify({
          runId,
          status: result.status,
          costUsd: result.costUsd || 0,
          completedAt: new Date().toISOString(),
        }), { EX: 30 * 24 * 60 * 60 }); // 30 day retention

        // Track scheduler-specific costs
        if (result.costUsd > 0) {
          await redis.hIncrByFloat(SCHED_KEYS.dailyCosts(dateStr), taskId, result.costUsd);
          await redis.hIncrByFloat(SCHED_KEYS.dailyCosts(dateStr), 'total', result.costUsd);
          await redis.expire(SCHED_KEYS.dailyCosts(dateStr), 90 * 24 * 60 * 60);
        }

        // Emit task complete with output summary
        emit({
          type: SCHED_EVENTS.TASK_COMPLETE,
          status: result.status,
          costUsd: result.costUsd || 0,
          message: result.output?.feedMessage || `${taskDef.name} completed`,
          outputKey,
        });

        // Emit task output for feed display
        emit({
          type: SCHED_EVENTS.TASK_OUTPUT,
          status: result.status,
          approvalMode: profile.approvalMode || 'review',
          feedMessage: result.output?.feedMessage || `${taskDef.name} completed`,
          outputPreview: truncateOutput(result.output),
          outputKey,
        });

        console.log(`[Scheduler] ${taskDef.name} completed for user ${userId} (cost: $${(result.costUsd || 0).toFixed(4)})`);
        return result;
      } catch (err) {
        console.error(`[Scheduler] ${taskDef.name} failed for user ${userId}:`, err.message);

        emit({
          type: SCHED_EVENTS.TASK_FAILED,
          error: err.message,
          message: `${taskDef.name} failed: ${err.message}`,
        });

        throw err; // Re-throw so BullMQ marks the job as failed
      }
    },
    {
      connection: conn,
      concurrency: 3,
      limiter: {
        max: 10,
        duration: 60000, // 10 jobs per minute
      },
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Scheduler] Worker job failed: ${job?.data?.taskId} for ${job?.data?.userId}`, err.message);
  });

  worker.on('completed', (job) => {
    console.log(`[Scheduler] Worker job completed: ${job?.data?.taskId} for ${job?.data?.userId}`);
  });

  console.log('[Scheduler] Worker started (concurrency: 3, rate: 10/min)');
  return worker;
}

/**
 * Truncate output for feed preview (keep under 2KB).
 */
function truncateOutput(output) {
  if (!output) return null;
  const str = JSON.stringify(output);
  if (str.length <= 2048) return output;

  // Return just the feedMessage and key counts
  return {
    feedMessage: output.feedMessage || 'Task completed',
    _truncated: true,
  };
}

module.exports = { createWorker, getRedisConnection };

// --- Standalone mode ---
if (require.main === module) {
  (async () => {
    console.log('[Scheduler] Starting standalone worker...');

    const redis = require('redis');
    const client = redis.createClient({ url: process.env.REDIS_URL });
    await client.connect();
    console.log('[Scheduler] Redis connected');

    createWorker(client);
    console.log('[Scheduler] Standalone worker started');
  })();
}
