// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — SCHEDULER ENGINE
// Manages per-user BullMQ repeatable jobs for autonomous tasks.
// activateUser() creates repeatable jobs after discovery completes.
// deactivateUser() removes all repeatable jobs for a user.
// ═══════════════════════════════════════════════════════════════

const IORedis = require('ioredis');
const { Queue } = require('bullmq');
const { TASKS, FREQUENCY_MAP, SCHED_KEYS, SCHED_EVENTS, ALL_TASK_IDS } = require('./constants');
const prisma = require('../../../config/database');

const QUEUE_NAME = 'nexus-scheduler';

// --- ioredis connection (BullMQ requires ioredis) ---

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
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    });
  }
  return queue;
}

// --- Engine API ---

/**
 * Activate scheduler for a user after profile + discovery complete.
 * Creates repeatable BullMQ jobs for each task whose required fields are populated.
 *
 * @param {string} userId
 */
async function activateUser(userId) {
  const profile = await prisma.businessProfile.findUnique({ where: { userId } });
  if (!profile || !profile.profileComplete || !profile.discoveryRun) {
    console.warn(`[Scheduler] Cannot activate user ${userId}: profile incomplete or discovery not run`);
    return { activated: false, reason: 'Profile not ready' };
  }

  const q = getQueue();
  if (!q) {
    console.warn('[Scheduler] Queue not available (no REDIS_URL)');
    return { activated: false, reason: 'Queue not available' };
  }

  const contentFreq = profile.contentFreq || 'daily';
  const freqConfig = FREQUENCY_MAP[contentFreq] || FREQUENCY_MAP['daily'];
  const activatedTasks = [];

  for (const taskId of ALL_TASK_IDS) {
    const task = TASKS[taskId];

    // Check if required fields are populated
    const missingFields = task.requiresFields.filter(field => {
      const val = profile[field];
      if (val === null || val === undefined) return true;
      if (Array.isArray(val) && val.length === 0) return true;
      if (typeof val === 'string' && val.trim() === '') return true;
      return false;
    });

    if (missingFields.length > 0) {
      console.log(`[Scheduler] Skipping ${taskId} for user ${userId}: missing ${missingFields.join(', ')}`);
      continue;
    }

    // Determine cron pattern (may be adjusted by contentFreq)
    let cronPattern = task.cronPattern;
    if (taskId === 'content-generator' && freqConfig.contentCron) {
      cronPattern = freqConfig.contentCron;
    } else if (taskId === 'prospect-finder' && freqConfig.prospectCron) {
      cronPattern = freqConfig.prospectCron;
    }

    const repeatJobId = `sched:${userId}:${taskId}`;

    try {
      // Remove existing repeatable job if any (to update cron pattern)
      const repeatable = await q.getRepeatableJobs();
      const existing = repeatable.find(j => j.id === repeatJobId);
      if (existing) {
        await q.removeRepeatableByKey(existing.key);
      }

      // Add repeatable job
      await q.add(taskId, { userId, taskId }, {
        repeat: { pattern: cronPattern },
        jobId: repeatJobId,
      });

      activatedTasks.push({ taskId, cronPattern });
    } catch (err) {
      console.error(`[Scheduler] Failed to add repeatable job ${taskId} for user ${userId}:`, err.message);
    }
  }

  // Store schedule state in Redis
  const conn = getRedisConnection();
  if (conn) {
    const scheduleData = {
      isActive: 'true',
      userId,
      contentFreq,
      activatedAt: new Date().toISOString(),
      taskCount: String(activatedTasks.length),
      tasks: JSON.stringify(activatedTasks.map(t => t.taskId)),
    };
    await conn.hmset(SCHED_KEYS.userSchedule(userId), scheduleData);
  }

  console.log(`[Scheduler] Activated ${activatedTasks.length} tasks for user ${userId} (freq: ${contentFreq})`);
  return { activated: true, tasks: activatedTasks };
}

/**
 * Deactivate all scheduled tasks for a user.
 *
 * @param {string} userId
 */
async function deactivateUser(userId) {
  const q = getQueue();
  if (!q) return { deactivated: false, reason: 'Queue not available' };

  const repeatable = await q.getRepeatableJobs();
  let removed = 0;

  for (const job of repeatable) {
    if (job.id && job.id.startsWith(`sched:${userId}:`)) {
      await q.removeRepeatableByKey(job.key);
      removed++;
    }
  }

  // Update Redis schedule state
  const conn = getRedisConnection();
  if (conn) {
    await conn.hmset(SCHED_KEYS.userSchedule(userId), {
      isActive: 'false',
      deactivatedAt: new Date().toISOString(),
    });
  }

  console.log(`[Scheduler] Deactivated ${removed} tasks for user ${userId}`);
  return { deactivated: true, removed };
}

/**
 * Update schedule when profile changes.
 * Only modifies affected tasks based on which fields changed.
 *
 * @param {string} userId
 * @param {string[]} changedFields - Array of field names that changed
 */
async function updateSchedule(userId, changedFields) {
  if (!changedFields || changedFields.length === 0) return;

  // Check if schedule is active
  const conn = getRedisConnection();
  if (conn) {
    const isActive = await conn.hget(SCHED_KEYS.userSchedule(userId), 'isActive');
    if (isActive !== 'true') return; // Schedule not active, nothing to update
  }

  // If contentFreq changed, re-activate to update cron patterns
  if (changedFields.includes('contentFreq')) {
    return await activateUser(userId);
  }

  // If competitors changed, ensure competitor-watch is active
  // If ICP/targetMarket changed, ensure prospect-finder is active
  // Re-activation handles all these cases
  const fieldToTask = {
    competitors: 'competitor-watch',
    contentThemes: 'content-generator',
    activeChannels: 'content-generator',
    toneOfVoice: 'content-generator',
    icp: 'prospect-finder',
    targetMarket: 'prospect-finder',
    industry: 'market-intel-refresh',
  };

  const affectedTasks = new Set();
  for (const field of changedFields) {
    if (fieldToTask[field]) affectedTasks.add(fieldToTask[field]);
  }

  if (affectedTasks.size > 0) {
    // Re-activate to ensure all tasks have correct config
    return await activateUser(userId);
  }
}

/**
 * Get current schedule status for a user.
 *
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function getSchedule(userId) {
  const conn = getRedisConnection();
  const q = getQueue();

  // Read schedule state from Redis
  let scheduleData = {};
  if (conn) {
    scheduleData = await conn.hgetall(SCHED_KEYS.userSchedule(userId)) || {};
  }

  // Get repeatable jobs for this user
  const tasks = [];
  if (q) {
    const repeatable = await q.getRepeatableJobs();
    for (const job of repeatable) {
      if (job.id && job.id.startsWith(`sched:${userId}:`)) {
        const taskId = job.id.replace(`sched:${userId}:`, '');
        const taskDef = TASKS[taskId];
        if (taskDef) {
          tasks.push({
            taskId,
            name: taskDef.name,
            icon: taskDef.icon,
            schedule: taskDef.schedule,
            cronPattern: job.pattern || job.cron,
            nextRun: job.next ? new Date(job.next).toISOString() : null,
            status: 'active',
          });
        }
      }
    }
  }

  return {
    isActive: scheduleData.isActive === 'true',
    userId,
    contentFreq: scheduleData.contentFreq || 'daily',
    activatedAt: scheduleData.activatedAt || null,
    taskCount: tasks.length,
    tasks,
  };
}

/**
 * Manually trigger a specific task immediately (one-shot, not repeatable).
 *
 * @param {string} userId
 * @param {string} taskId
 * @returns {Promise<{ queued: boolean, jobId: string }>}
 */
async function triggerTask(userId, taskId) {
  if (!TASKS[taskId]) {
    return { queued: false, reason: `Unknown task: ${taskId}` };
  }

  const q = getQueue();
  if (!q) return { queued: false, reason: 'Queue not available' };

  const jobId = `sched:manual:${userId}:${taskId}:${Date.now()}`;
  await q.add(taskId, { userId, taskId, manual: true }, { jobId });

  return { queued: true, jobId };
}

/**
 * Pause a specific task (remove its repeatable job but keep config).
 *
 * @param {string} userId
 * @param {string} taskId
 */
async function pauseTask(userId, taskId) {
  const q = getQueue();
  if (!q) return { paused: false };

  const repeatable = await q.getRepeatableJobs();
  const job = repeatable.find(j => j.id === `sched:${userId}:${taskId}`);
  if (job) {
    await q.removeRepeatableByKey(job.key);
    return { paused: true };
  }
  return { paused: false, reason: 'Job not found' };
}

/**
 * Resume a paused task (re-add its repeatable job).
 *
 * @param {string} userId
 * @param {string} taskId
 */
async function resumeTask(userId, taskId) {
  const task = TASKS[taskId];
  if (!task) return { resumed: false, reason: `Unknown task: ${taskId}` };

  const q = getQueue();
  if (!q) return { resumed: false, reason: 'Queue not available' };

  const profile = await prisma.businessProfile.findUnique({ where: { userId } });
  if (!profile) return { resumed: false, reason: 'No profile' };

  const contentFreq = profile.contentFreq || 'daily';
  const freqConfig = FREQUENCY_MAP[contentFreq] || FREQUENCY_MAP['daily'];

  let cronPattern = task.cronPattern;
  if (taskId === 'content-generator' && freqConfig.contentCron) {
    cronPattern = freqConfig.contentCron;
  } else if (taskId === 'prospect-finder' && freqConfig.prospectCron) {
    cronPattern = freqConfig.prospectCron;
  }

  const repeatJobId = `sched:${userId}:${taskId}`;
  await q.add(taskId, { userId, taskId }, {
    repeat: { pattern: cronPattern },
    jobId: repeatJobId,
  });

  return { resumed: true, cronPattern };
}

module.exports = {
  getQueue,
  getRedisConnection,
  activateUser,
  deactivateUser,
  updateSchedule,
  getSchedule,
  triggerTask,
  pauseTask,
  resumeTask,
};
