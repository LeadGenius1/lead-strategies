// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — DISCOVERY WORKER (BullMQ)
// Processes jobs from the "nexus-discovery" queue.
// Follows exact pattern from marketStrategy/worker.js:
//   ioredis for BullMQ, node-redis for app logic.
// ═══════════════════════════════════════════════════════════════

const IORedis = require('ioredis');
const { Queue, Worker } = require('bullmq');
const { runDiscovery } = require('./discoveryAgent');

const QUEUE_NAME = 'nexus-discovery';

// --- ioredis connection (BullMQ requires ioredis, not node-redis) ---

let redisConnection = null;

function getRedisConnection() {
  if (!redisConnection && process.env.REDIS_URL) {
    redisConnection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return redisConnection;
}

// --- Queue (exported for use by businessProfile.js route) ---

let queue = null;

function getQueue() {
  if (!queue) {
    const conn = getRedisConnection();
    if (!conn) return null;
    queue = new Queue(QUEUE_NAME, {
      connection: conn,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 50,
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
      },
    });
  }
  return queue;
}

// --- Worker ---

let worker = null;

/**
 * Create and start the BullMQ worker for discovery jobs.
 * Called from index.js startup or standalone mode.
 *
 * @param {import("redis").RedisClientType} redis - node-redis v4 client for app logic
 * @returns {Worker}
 */
function createWorker(redis) {
  const conn = getRedisConnection();
  if (!conn) {
    console.warn('[Discovery] No Redis connection — worker not started');
    return null;
  }

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { profileId, userId, tasks } = job.data;
      const jobId = job.id || job.opts?.jobId || `discovery-${profileId}`;

      console.log(`[Discovery] Processing job: ${jobId} (profile: ${profileId}, tasks: ${tasks.length})`);

      try {
        const results = await runDiscovery(profileId, userId, tasks, redis, jobId);
        console.log(`[Discovery] Job ${jobId} completed: ${results.completed.length} OK, ${results.failed.length} failed`);
        return results;
      } catch (err) {
        console.error(`[Discovery] Job ${jobId} failed:`, err.message);
        throw err; // Re-throw so BullMQ marks the job as failed
      }
    },
    {
      connection: conn,
      concurrency: 1, // Discovery is heavy (multiple API calls) — run one at a time
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Discovery] Worker job failed: ${job?.id}`, err.message);
  });

  worker.on('completed', (job) => {
    console.log(`[Discovery] Worker job completed: ${job?.id}`);
  });

  console.log('[Discovery] Worker started (concurrency: 1)');
  return worker;
}

module.exports = { getQueue, createWorker, getRedisConnection };

// --- Standalone mode (can run as separate Railway worker service) ---
if (require.main === module) {
  (async () => {
    console.log('[Discovery] Starting standalone worker...');

    const redis = require('redis');
    const client = redis.createClient({ url: process.env.REDIS_URL });
    await client.connect();
    console.log('[Discovery] Redis connected');

    createWorker(client);
    console.log('[Discovery] Standalone worker started');
  })();
}
