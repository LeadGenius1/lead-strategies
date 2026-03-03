// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — SCHEDULER API ROUTES
// 8 endpoints for viewing/controlling autonomous schedule.
// All routes require authentication.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { prisma } = require('../config/database');
const { getRedisClient } = require('../config/redis');
const engine = require('../services/nexus2/scheduler/engine');
const { TASKS, SCHED_KEYS, SCHED_EVENTS, ALL_TASK_IDS } = require('../services/nexus2/scheduler/constants');
const { publishEvent, createSSEStream } = require('../services/marketStrategy/sseManager');
const IORedis = require('ioredis');

// All routes require authentication
router.use(authenticate);

// ─── GET / — Schedule Overview ─────────────────────────────

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const schedule = await engine.getSchedule(userId);

    // Get today's stats from Redis
    const redis = getRedisClient();
    const dateStr = new Date().toISOString().slice(0, 10);
    let todayStats = { tasksCompleted: 0, tasksPending: 0, draftsAwaitingReview: 0, costToday: 0 };

    if (redis) {
      // Count today's completed task runs
      for (const taskId of ALL_TASK_IDS) {
        const runKey = SCHED_KEYS.taskRun(userId, taskId, dateStr);
        const runData = await redis.get(runKey);
        if (runData) {
          todayStats.tasksCompleted++;
        }
      }
      todayStats.tasksPending = schedule.taskCount - todayStats.tasksCompleted;

      // Get today's scheduler costs
      const costData = await redis.hGetAll(SCHED_KEYS.dailyCosts(dateStr));
      todayStats.costToday = parseFloat(costData?.total || '0');
    }

    // Get profile's approval mode
    const profile = await prisma.businessProfile.findUnique({
      where: { userId },
      select: { approvalMode: true, contentFreq: true },
    });

    res.json({
      isActive: schedule.isActive,
      approvalMode: profile?.approvalMode || 'review',
      contentFreq: profile?.contentFreq || 'daily',
      tasks: schedule.tasks,
      todayStats,
    });
  } catch (err) {
    console.error('[Scheduler API] GET / error:', err.message);
    res.status(500).json({ error: 'Failed to get schedule' });
  }
});

// ─── GET /feed — SSE Stream ───────────────────────────────

router.get('/feed', async (req, res) => {
  try {
    const userId = req.user.id;
    const redis = getRedisClient();
    if (!redis) {
      return res.status(503).json({ error: 'Redis not available' });
    }

    // Use the sseManager pattern with user-scoped keys
    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    let subscriber = null;
    let heartbeatInterval = null;
    let closed = false;

    function send(eventType, data) {
      if (closed) return;
      res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
    }

    function sendRaw(payload) {
      if (closed) return;
      try {
        const parsed = JSON.parse(payload);
        if (parsed.type) {
          res.write(`event: ${parsed.type}\ndata: ${payload}\n\n`);
        }
      } catch { /* skip malformed */ }
    }

    function cleanup() {
      if (closed) return;
      closed = true;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (subscriber) {
        const channel = SCHED_KEYS.feedChannel(userId);
        subscriber.unsubscribe(channel).catch(() => {});
        subscriber.disconnect();
      }
    }

    res.on('close', cleanup);

    // Replay recent events (last 50)
    const feedKey = SCHED_KEYS.feedEvents(userId);
    const events = await redis.lRange(feedKey, -50, -1);
    for (const payload of events) {
      sendRaw(payload);
    }

    if (closed) return;

    // Subscribe to live events
    if (process.env.REDIS_URL) {
      subscriber = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        lazyConnect: true,
      });
      await subscriber.connect();

      const channel = SCHED_KEYS.feedChannel(userId);
      await subscriber.subscribe(channel);

      subscriber.on('message', (_ch, message) => {
        sendRaw(message);
      });
    }

    // Heartbeat every 30s
    heartbeatInterval = setInterval(() => {
      if (closed) return;
      res.write(`event: heartbeat\ndata: ${JSON.stringify({ ts: new Date().toISOString() })}\n\n`);
    }, 30000);
  } catch (err) {
    console.error('[Scheduler API] GET /feed error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start feed' });
    }
  }
});

// ─── GET /history — Past Task Runs ────────────────────────

router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const redis = getRedisClient();
    const days = parseInt(req.query.days) || 7;
    const history = [];

    if (redis) {
      const now = new Date();
      for (let d = 0; d < days; d++) {
        const date = new Date(now);
        date.setUTCDate(date.getUTCDate() - d);
        const dateStr = date.toISOString().slice(0, 10);

        for (const taskId of ALL_TASK_IDS) {
          const runKey = SCHED_KEYS.taskRun(userId, taskId, dateStr);
          const runData = await redis.get(runKey);
          if (runData) {
            const parsed = JSON.parse(runData);
            history.push({
              taskId,
              taskName: TASKS[taskId]?.name || taskId,
              taskIcon: TASKS[taskId]?.icon || '',
              date: dateStr,
              ...parsed,
            });
          }
        }
      }
    }

    // Sort by completedAt descending
    history.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));

    res.json({ history, days });
  } catch (err) {
    console.error('[Scheduler API] GET /history error:', err.message);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// ─── POST /trigger/:taskId — Run Task Immediately ─────────

router.post('/trigger/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    if (!TASKS[taskId]) {
      return res.status(400).json({ error: `Unknown task: ${taskId}` });
    }

    // Verify user has a completed profile
    const profile = await prisma.businessProfile.findUnique({
      where: { userId },
      select: { profileComplete: true, discoveryRun: true },
    });

    if (!profile || !profile.profileComplete) {
      return res.status(400).json({ error: 'Complete your Business Profile first' });
    }

    const result = await engine.triggerTask(userId, taskId);
    res.json(result);
  } catch (err) {
    console.error('[Scheduler API] POST /trigger error:', err.message);
    res.status(500).json({ error: 'Failed to trigger task' });
  }
});

// ─── PUT /task/:taskId — Pause/Resume/Configure ──────────

router.put('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { action } = req.body; // "pause" | "resume"
    const userId = req.user.id;

    if (!TASKS[taskId]) {
      return res.status(400).json({ error: `Unknown task: ${taskId}` });
    }

    if (action === 'pause') {
      const result = await engine.pauseTask(userId, taskId);
      return res.json(result);
    }

    if (action === 'resume') {
      const result = await engine.resumeTask(userId, taskId);
      return res.json(result);
    }

    res.status(400).json({ error: 'Invalid action. Use "pause" or "resume".' });
  } catch (err) {
    console.error('[Scheduler API] PUT /task error:', err.message);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// ─── GET /outputs/:taskId — Latest Task Output ───────────

router.get('/outputs/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const redis = getRedisClient();

    if (!TASKS[taskId]) {
      return res.status(400).json({ error: `Unknown task: ${taskId}` });
    }

    if (!redis) {
      return res.status(503).json({ error: 'Redis not available' });
    }

    // Get latest run for today or scan recent days
    const now = new Date();
    for (let d = 0; d < 7; d++) {
      const date = new Date(now);
      date.setUTCDate(date.getUTCDate() - d);
      const dateStr = date.toISOString().slice(0, 10);

      const runKey = SCHED_KEYS.taskRun(userId, taskId, dateStr);
      const runData = await redis.get(runKey);
      if (runData) {
        const parsed = JSON.parse(runData);
        // Fetch full output
        if (parsed.runId) {
          const outputKey = SCHED_KEYS.taskOutput(userId, taskId, parsed.runId);
          const outputData = await redis.get(outputKey);
          if (outputData) {
            return res.json({ found: true, ...JSON.parse(outputData) });
          }
        }
        return res.json({ found: true, ...parsed, output: null });
      }
    }

    res.json({ found: false, message: 'No recent output for this task' });
  } catch (err) {
    console.error('[Scheduler API] GET /outputs error:', err.message);
    res.status(500).json({ error: 'Failed to get output' });
  }
});

// ─── POST /approve/:outputId — Approve Draft ─────────────

router.post('/approve/:outputId', async (req, res) => {
  try {
    const { outputId } = req.params;
    const userId = req.user.id;
    const redis = getRedisClient();

    if (!redis) {
      return res.status(503).json({ error: 'Redis not available' });
    }

    // outputId format: sched:output:{userId}:{taskId}:{runId}
    // or just the key directly
    const key = outputId.startsWith('sched:') ? outputId : null;
    if (!key) {
      return res.status(400).json({ error: 'Invalid output ID' });
    }

    // Verify ownership
    if (!key.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const outputData = await redis.get(key);
    if (!outputData) {
      return res.status(404).json({ error: 'Output not found' });
    }

    const output = JSON.parse(outputData);
    output.approved = true;
    output.approvedAt = new Date().toISOString();
    output.approvedBy = userId;

    await redis.set(key, JSON.stringify(output), { EX: 30 * 24 * 60 * 60 });

    // Emit approval event
    await publishEvent(redis, SCHED_KEYS.feedEvents(userId).replace(':events', ''), {
      type: SCHED_EVENTS.TASK_OUTPUT,
      taskId: output.taskId,
      status: 'approved',
      message: `Output approved for ${TASKS[output.taskId]?.name || output.taskId}`,
      ts: new Date().toISOString(),
    });

    res.json({ approved: true, outputId: key });
  } catch (err) {
    console.error('[Scheduler API] POST /approve error:', err.message);
    res.status(500).json({ error: 'Failed to approve output' });
  }
});

// ─── POST /reject/:outputId — Reject Draft ───────────────

router.post('/reject/:outputId', async (req, res) => {
  try {
    const { outputId } = req.params;
    const userId = req.user.id;
    const redis = getRedisClient();

    if (!redis) {
      return res.status(503).json({ error: 'Redis not available' });
    }

    const key = outputId.startsWith('sched:') ? outputId : null;
    if (!key) {
      return res.status(400).json({ error: 'Invalid output ID' });
    }

    if (!key.includes(userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const outputData = await redis.get(key);
    if (!outputData) {
      return res.status(404).json({ error: 'Output not found' });
    }

    const output = JSON.parse(outputData);
    output.rejected = true;
    output.rejectedAt = new Date().toISOString();
    output.rejectedBy = userId;
    output.rejectionReason = req.body.reason || '';

    await redis.set(key, JSON.stringify(output), { EX: 7 * 24 * 60 * 60 });

    // Emit rejection event
    await publishEvent(redis, SCHED_KEYS.feedEvents(userId).replace(':events', ''), {
      type: SCHED_EVENTS.TASK_OUTPUT,
      taskId: output.taskId,
      status: 'rejected',
      message: `Output rejected for ${TASKS[output.taskId]?.name || output.taskId}`,
      ts: new Date().toISOString(),
    });

    res.json({ rejected: true, outputId: key });
  } catch (err) {
    console.error('[Scheduler API] POST /reject error:', err.message);
    res.status(500).json({ error: 'Failed to reject output' });
  }
});

module.exports = router;
