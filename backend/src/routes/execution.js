// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — EXECUTION API ROUTES
// 4 endpoints for execution history, details, retry, platforms.
// All routes require authentication.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { prisma } = require('../config/database');
const { getRedisClient } = require('../config/redis');
const { EXEC_KEYS, EXECUTION_TYPES } = require('../services/nexus2/execution/constants');
const { QUEUE_NAME } = require('../services/nexus2/execution/worker');
const IORedis = require('ioredis');
const { Queue } = require('bullmq');
const instantlyService = require('../services/instantly');

// All routes require authentication
router.use(authenticate);

// ─── GET /history — User's Execution History ────────────────────

router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const redis = getRedisClient();
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);

    if (!redis) {
      return res.json({ history: [], message: 'Redis not available' });
    }

    const raw = await redis.lRange(EXEC_KEYS.history(userId), 0, limit - 1);
    const history = raw.map(item => {
      try { return JSON.parse(item); } catch { return null; }
    }).filter(Boolean);

    res.json({ history, total: history.length });
  } catch (err) {
    console.error('[Execution API] GET /history error:', err.message);
    res.status(500).json({ error: 'Failed to get execution history' });
  }
});

// ─── GET /platforms — Connected Platforms Status ────────────────

router.get('/platforms', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get connected channels from DB
    const channels = await prisma.channel.findMany({
      where: { userId },
      select: { type: true, status: true, name: true, updatedAt: true },
    });

    const platforms = {};
    for (const ch of channels) {
      platforms[ch.type] = {
        connected: ch.status === 'connected',
        name: ch.name || ch.type,
        updatedAt: ch.updatedAt,
      };
    }

    // Check Instantly health
    const instantlyHealth = await instantlyService.healthCheck();
    platforms.instantly = {
      connected: instantlyHealth.healthy,
      name: 'Instantly.ai',
      reason: instantlyHealth.reason,
    };

    // Check Twilio config
    platforms.twilio = {
      connected: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      name: 'Twilio SMS',
    };

    res.json({ platforms });
  } catch (err) {
    console.error('[Execution API] GET /platforms error:', err.message);
    res.status(500).json({ error: 'Failed to get platform status' });
  }
});

// ─── GET /:execId — Single Execution Details ───────────────────

router.get('/:execId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { execId } = req.params;
    const redis = getRedisClient();

    if (!redis) {
      return res.status(503).json({ error: 'Redis not available' });
    }

    const data = await redis.get(EXEC_KEYS.execution(userId, execId));
    if (!data) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    const execution = JSON.parse(data);

    // Verify ownership
    if (execution.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ execution });
  } catch (err) {
    console.error('[Execution API] GET /:execId error:', err.message);
    res.status(500).json({ error: 'Failed to get execution details' });
  }
});

// ─── POST /retry/:execId — Re-queue Failed Execution ───────────

router.post('/retry/:execId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { execId } = req.params;
    const redis = getRedisClient();

    if (!redis) {
      return res.status(503).json({ error: 'Redis not available' });
    }

    const data = await redis.get(EXEC_KEYS.execution(userId, execId));
    if (!data) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    const execution = JSON.parse(data);

    if (execution.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (execution.status !== 'failed') {
      return res.status(400).json({ error: 'Only failed executions can be retried' });
    }

    // Re-queue the job
    const ioConn = process.env.REDIS_URL
      ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
      : null;

    if (!ioConn) {
      return res.status(503).json({ error: 'Cannot connect to queue' });
    }

    const execQueue = new Queue(QUEUE_NAME, { connection: ioConn });
    await execQueue.add(execution.executionType, {
      userId,
      outputId: execution.outputId,
      executionType: execution.executionType,
      payload: req.body.payload || {},
    });

    await execQueue.close();
    await ioConn.quit();

    res.json({ retried: true, executionType: execution.executionType });
  } catch (err) {
    console.error('[Execution API] POST /retry error:', err.message);
    res.status(500).json({ error: 'Failed to retry execution' });
  }
});

module.exports = router;
