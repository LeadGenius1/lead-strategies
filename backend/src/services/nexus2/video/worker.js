// ═══════════════════════════════════════════════════════════════
// VIDEO CREATION ENGINE — BULLMQ WORKER
// Follows ioredis lazy-init pattern from scheduler/worker.js.
// Queue: video-creation, concurrency: 1, rate: 5/hour.
// ═══════════════════════════════════════════════════════════════

const IORedis = require('ioredis');
const { Queue, Worker } = require('bullmq');
const { VIDEO_TIERS, VIDEO_STATUS, VIDEO_TEMPLATES } = require('./constants');
const { createAutoVideo, createPersonalizedVideo } = require('./engine');
const { prisma } = require('../../../config/database');

const QUEUE_NAME = 'video-creation';

// ── ioredis connection (BullMQ requires ioredis, not node-redis) ──
let ioRedisConn = null;

function getIORedis() {
  if (!ioRedisConn && process.env.REDIS_URL) {
    ioRedisConn = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return ioRedisConn;
}

// ── Queue (lazy-init) ──
let videoQueue = null;

function getVideoQueue() {
  if (!videoQueue) {
    const conn = getIORedis();
    if (!conn) return null;
    videoQueue = new Queue(QUEUE_NAME, { connection: conn });
  }
  return videoQueue;
}

/**
 * Add a video creation job to the queue.
 *
 * @param {object} data - Job payload
 * @param {string} data.userId - Owner
 * @param {string} data.tier - 'auto' or 'personalized'
 * @param {string} data.script - Video script text
 * @param {string} data.projectName - Display name
 * @param {string} [data.tone] - Voice tone
 * @param {string} [data.industry] - Industry context
 * @param {string} [data.format] - Video format key
 * @param {string} [data.templateId] - Tier 2 template ID
 * @param {string[]} [data.photos] - Tier 2 photo URLs
 * @param {string[]} [data.channels] - Distribution channels
 * @returns {Promise<{ jobId: string, status: string }>}
 */
async function addVideoJob(data) {
  const queue = getVideoQueue();
  if (!queue) {
    throw new Error('Video queue not available — Redis not configured');
  }

  const job = await queue.add('create-video', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 30_000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  });

  return { jobId: job.id, status: 'queued' };
}

// ── Worker ──
let worker = null;

function startVideoWorker() {
  const conn = getIORedis();
  if (!conn) {
    console.warn('[VideoWorker] No Redis — worker not started');
    return null;
  }

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { userId, tier, script, projectName, tone, industry, format, templateId, photos, channels } = job.data;
      const projectId = job.id;

      console.log(`[VideoWorker] Processing job ${projectId} (tier=${tier})`);

      // Emit function — publishes SSE-style events via ioredis pub/sub
      function emit(event) {
        const enriched = {
          ...event,
          jobId: projectId,
          userId,
          tier,
          ts: new Date().toISOString(),
        };
        // Publish to user's feed channel (ioredis supports publish natively)
        conn.publish(`nexus:feed:${userId}`, JSON.stringify(enriched)).catch(() => {});
      }

      try {
        let result;

        if (tier === VIDEO_TIERS.PERSONALIZED) {
          const template = VIDEO_TEMPLATES.find(t => t.id === templateId) || VIDEO_TEMPLATES[0];
          result = await createPersonalizedVideo({
            script, projectId, projectName, photos: photos || [], template, tone, emit,
          });
        } else {
          result = await createAutoVideo({
            script, projectId, projectName, tone, industry, format, emit,
          });
        }

        // Save Video record to database
        try {
          await prisma.video.create({
            data: {
              userId,
              title: projectName,
              description: script,
              url: result.videoUrl || '',
              status: 'ready',
            },
          });
        } catch (dbErr) {
          console.warn('[VideoWorker] DB save failed (non-fatal):', dbErr.message);
        }

        // Emit completion event
        emit({
          type: 'VIDEO_COMPLETE',
          cardType: 'VIDEO',
          status: VIDEO_STATUS.COMPLETE,
          message: `Video "${projectName}" is ready!`,
          videoUrl: result.videoUrl,
          channels: channels || [],
        });

        return result;

      } catch (err) {
        console.error(`[VideoWorker] Job ${projectId} failed:`, err.message);

        emit({
          type: 'VIDEO_PROGRESS',
          cardType: 'VIDEO',
          status: VIDEO_STATUS.FAILED,
          message: `Video creation failed: ${err.message}`,
        });

        throw err;
      }
    },
    {
      connection: conn,
      concurrency: 1,
      limiter: { max: 5, duration: 3_600_000 }, // 5 per hour
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[VideoWorker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('completed', (job) => {
    console.log(`[VideoWorker] Job ${job.id} completed`);
  });

  console.log('[VideoWorker] Started (concurrency=1, limit=5/hr)');
  return worker;
}

module.exports = { getVideoQueue, addVideoJob, startVideoWorker };
