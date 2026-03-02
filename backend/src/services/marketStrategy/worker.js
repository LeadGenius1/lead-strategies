// ═══════════════════════════════════════════════════════════════
// MARKET STRATEGY PIPELINE — BullMQ WORKER
// Follows Email Sentinel pattern: ioredis for BullMQ, node-redis for app logic.
// Queue: "market-strategy", concurrency: 2
// Can run standalone as a Railway worker service.
// ═══════════════════════════════════════════════════════════════

const IORedis = require("ioredis");
const { Queue, Worker } = require("bullmq");
const { REDIS_KEYS, JOB_STATUS, ALL_AGENT_IDS, AGENT_STATUS } = require("./constants");
const { generateJobId, nowISO } = require("./utils");
const { publishEvent } = require("./sseManager");
const { executePipeline } = require("./pipeline");

const QUEUE_NAME = "market-strategy";

// --- ioredis connection (BullMQ requires ioredis, not node-redis) ---

let redisConnection = null;

function getRedisConnection() {
  if (!redisConnection && process.env.REDIS_URL) {
    redisConnection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return redisConnection;
}

// --- Queue ---

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
        attempts: 1, // Pipeline handles its own retries per-agent
      },
    });
  }
  return queue;
}

// --- addJob: creates Redis state + enqueues BullMQ job ---

/**
 * Create a new market strategy job.
 * 1. Generate jobId
 * 2. Store job metadata + businessInputs in Redis hash
 * 3. Initialize agent state hashes (all pending)
 * 4. Add to user's job zset
 * 5. Enqueue in BullMQ
 *
 * @param {object} businessInputs - Validated POST payload
 * @param {string} userId - Authenticated user's ID
 * @param {import("redis").RedisClientType} redis - node-redis v4 client
 * @returns {Promise<string>} jobId
 */
async function addJob(businessInputs, userId, redis) {
  const jobId = generateJobId();
  const now = nowISO();

  // 1. Store job metadata
  await redis.hSet(REDIS_KEYS.job(jobId), {
    status: JOB_STATUS.QUEUED,
    userId,
    createdAt: now,
    updatedAt: now,
    businessInputs: JSON.stringify(businessInputs),
    currentStage: "0",
    currentAgents: "[]",
    error: "",
    totalCostUsd: "0",
  });

  // 2. Initialize agent state hashes
  for (const agentId of ALL_AGENT_IDS) {
    await redis.hSet(REDIS_KEYS.agentState(jobId, agentId), {
      status: AGENT_STATUS.PENDING,
    });
  }

  // 3. Add to user's job history (zset scored by timestamp)
  await redis.zAdd(REDIS_KEYS.userJobs(userId), {
    score: Date.now(),
    value: jobId,
  });

  // 4. Enqueue in BullMQ
  const q = getQueue();
  if (!q) throw new Error("Market strategy queue not available (no REDIS_URL)");

  await q.add("run-strategy", { jobId }, { jobId });

  return jobId;
}

// --- Worker ---

let worker = null;

/**
 * Create and start the BullMQ worker.
 * Called from index.js startup or standalone mode.
 *
 * @param {import("redis").RedisClientType} redis - node-redis v4 client for app logic
 * @returns {Worker}
 */
function createWorker(redis) {
  const conn = getRedisConnection();
  if (!conn) {
    console.warn("[Market Strategy] No Redis connection — worker not started");
    return null;
  }

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { jobId } = job.data;
      console.log(`[Market Strategy] Processing job: ${jobId}`);

      try {
        // Read businessInputs from Redis
        const jobData = await redis.hGetAll(REDIS_KEYS.job(jobId));
        if (!jobData || !jobData.businessInputs) {
          throw new Error(`Job ${jobId} not found in Redis`);
        }

        const businessInputs = JSON.parse(jobData.businessInputs);

        // Execute the pipeline
        await executePipeline(jobId, businessInputs, { redis });

        console.log(`[Market Strategy] Job ${jobId} completed`);
      } catch (err) {
        console.error(`[Market Strategy] Job ${jobId} failed:`, err.message);

        // Update job status to failed
        await redis.hSet(REDIS_KEYS.job(jobId), {
          status: JOB_STATUS.FAILED,
          error: err.message,
          updatedAt: nowISO(),
        });

        // Emit job_complete with failed status
        await publishEvent(redis, jobId, {
          type: "job_complete",
          jobId,
          status: "failed",
          error: err.message,
          totalCostUsd: null,
          ts: nowISO(),
        });

        throw err; // Re-throw so BullMQ marks the job as failed
      }
    },
    {
      connection: conn,
      concurrency: 2,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[Market Strategy] Worker job failed: ${job?.data?.jobId}`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`[Market Strategy] Worker job completed: ${job?.data?.jobId}`);
  });

  console.log("[Market Strategy] Worker started (concurrency: 2)");
  return worker;
}

module.exports = { getQueue, addJob, createWorker, getRedisConnection };

// --- Standalone mode (Railway worker service) ---
if (require.main === module) {
  (async () => {
    console.log("[Market Strategy] Starting standalone worker...");

    // In standalone mode, we need to create our own node-redis client
    const redis = require("redis");
    const client = redis.createClient({ url: process.env.REDIS_URL });
    await client.connect();
    console.log("[Market Strategy] Redis connected");

    createWorker(client);
    console.log("[Market Strategy] Standalone worker started");
  })();
}
