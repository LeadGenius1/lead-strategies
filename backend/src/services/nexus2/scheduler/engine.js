// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — SCHEDULER ENGINE
// Manages per-user BullMQ repeatable jobs for autonomous tasks.
// activateUser() creates repeatable jobs after discovery completes.
// deactivateUser() removes all repeatable jobs for a user.
// ═══════════════════════════════════════════════════════════════

const IORedis = require('ioredis');
const { Queue } = require('bullmq');
const { TASKS, FREQUENCY_MAP, SCHED_KEYS, SCHED_EVENTS, ALL_TASK_IDS } = require('./constants');
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
      // BullMQ v5 removeRepeatable takes (name, repeatOpts, jobId) — reliable
      // across both legacy and hash-based key storage.
      try {
        // Try removing with current cron pattern first
        await q.removeRepeatable(taskId, { pattern: cronPattern }, repeatJobId);
      } catch (_) { /* ignore — job may not exist yet */ }

      // Also try legacy key-based removal as fallback
      const repeatable = await q.getRepeatableJobs();
      for (const rj of repeatable) {
        if (rj.name === taskId && rj.key) {
          await q.removeRepeatableByKey(rj.key);
        }
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

  // Store schedule state in Redis (include cron patterns for reliable removal)
  const conn = getRedisConnection();
  if (conn) {
    const scheduleData = {
      isActive: 'true',
      userId,
      contentFreq,
      activatedAt: new Date().toISOString(),
      taskCount: String(activatedTasks.length),
      tasks: JSON.stringify(activatedTasks.map(t => t.taskId)),
      taskCrons: JSON.stringify(Object.fromEntries(activatedTasks.map(t => [t.taskId, t.cronPattern]))),
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

  // Load stored task-to-cron mapping from Redis
  const conn = getRedisConnection();
  let storedCrons = {};
  let storedTasks = [];
  if (conn) {
    const scheduleData = await conn.hgetall(SCHED_KEYS.userSchedule(userId)) || {};
    storedTasks = scheduleData.tasks ? JSON.parse(scheduleData.tasks) : [];
    storedCrons = scheduleData.taskCrons ? JSON.parse(scheduleData.taskCrons) : {};
  }

  let removed = 0;

  // Remove by name using removeRepeatable (works with BullMQ v5 hash-based keys)
  for (const taskId of storedTasks) {
    const cronPattern = storedCrons[taskId] || (TASKS[taskId] && TASKS[taskId].cronPattern);
    if (cronPattern) {
      try {
        await q.removeRepeatable(taskId, { pattern: cronPattern }, `sched:${userId}:${taskId}`);
        removed++;
      } catch (_) { /* job may already be removed */ }
    }
  }

  // Fallback: also scan and remove any remaining repeatable jobs by name
  const repeatable = await q.getRepeatableJobs();
  for (const job of repeatable) {
    if (storedTasks.includes(job.name)) {
      try {
        await q.removeRepeatableByKey(job.key);
        removed++;
      } catch (_) { /* already removed */ }
    }
  }

  // Update Redis schedule state (conn already declared above)
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

  // Get repeatable jobs for this user.
  // BullMQ v5 uses hash-based keys: getRepeatableJobs() returns { key, name, pattern, next }
  // where key is an MD5 hash (no .id field). Match by job.name cross-referenced with
  // the stored task list from Redis to determine which tasks belong to this user.
  const storedTasks = scheduleData.tasks ? JSON.parse(scheduleData.tasks) : [];
  const storedCrons = scheduleData.taskCrons ? JSON.parse(scheduleData.taskCrons) : {};
  const tasks = [];

  if (q && storedTasks.length > 0) {
    const repeatable = await q.getRepeatableJobs();
    const matchedNames = new Set();

    for (const job of repeatable) {
      // Match by job.name (reliably set in both legacy and hash-based paths)
      if (job.name && storedTasks.includes(job.name) && !matchedNames.has(job.name)) {
        matchedNames.add(job.name);
        const taskDef = TASKS[job.name];
        if (taskDef) {
          tasks.push({
            taskId: job.name,
            name: taskDef.name,
            icon: taskDef.icon,
            schedule: taskDef.schedule,
            cronPattern: job.pattern || storedCrons[job.name] || taskDef.cronPattern,
            nextRun: job.next ? new Date(job.next).toISOString() : null,
            status: 'active',
          });
        }
      }
    }

    // Include stored tasks not found in repeatable jobs (may be paused or pending)
    for (const taskId of storedTasks) {
      if (!matchedNames.has(taskId) && TASKS[taskId]) {
        const taskDef = TASKS[taskId];
        tasks.push({
          taskId,
          name: taskDef.name,
          icon: taskDef.icon,
          schedule: taskDef.schedule,
          cronPattern: storedCrons[taskId] || taskDef.cronPattern,
          nextRun: null,
          status: 'scheduled', // stored but not yet in BullMQ repeatable list
        });
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

  // Load stored cron pattern from Redis
  const conn = getRedisConnection();
  let cronPattern = TASKS[taskId]?.cronPattern;
  if (conn) {
    const taskCronsStr = await conn.hget(SCHED_KEYS.userSchedule(userId), 'taskCrons');
    if (taskCronsStr) {
      const storedCrons = JSON.parse(taskCronsStr);
      if (storedCrons[taskId]) cronPattern = storedCrons[taskId];
    }
  }

  const repeatJobId = `sched:${userId}:${taskId}`;

  // Use removeRepeatable with original params (BullMQ v5 compatible)
  if (cronPattern) {
    try {
      await q.removeRepeatable(taskId, { pattern: cronPattern }, repeatJobId);
      return { paused: true };
    } catch (_) { /* fall through to key-based removal */ }
  }

  // Fallback: scan repeatable jobs by name
  const repeatable = await q.getRepeatableJobs();
  const job = repeatable.find(j => j.name === taskId);
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
