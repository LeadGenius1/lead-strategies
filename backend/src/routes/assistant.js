// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — AI ASSISTANT API ROUTES
// 6 endpoints for the cockpit AI chat assistant.
// All routes require authentication.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');
const { prisma } = require('../config/database');
const { getRedisClient } = require('../config/redis');
const { streamChat } = require('../services/nexus2/assistant/service');
const { generateGreeting } = require('../services/nexus2/assistant/greeting');

const AGENT_NAME = 'nexus-assistant';

// All routes require authentication
router.use(authenticate);

// ─── POST /chat — SSE Streaming Chat ────────────────────

router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'message is required' });
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const redis = getRedisClient();

    await streamChat({
      userId,
      message: message.trim(),
      sessionId,
      res,
      redis,
    });
  } catch (err) {
    console.error('[Assistant API] POST /chat error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Chat failed' });
    }
  }
});

// ─── GET /greeting — Ambient Greeting ───────────────────

router.get('/greeting', async (req, res) => {
  try {
    const userId = req.user.id;
    const redis = getRedisClient();
    const result = await generateGreeting(userId, redis);
    res.json(result);
  } catch (err) {
    console.error('[Assistant API] GET /greeting error:', err.message);
    res.status(500).json({ error: 'Failed to generate greeting' });
  }
});

// ─── POST /conversation — Create New Session ────────────

router.post('/conversation', async (req, res) => {
  try {
    const sessionId = crypto.randomUUID();
    res.json({ sessionId });
  } catch (err) {
    console.error('[Assistant API] POST /conversation error:', err.message);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// ─── GET /conversations — List User Sessions ────────────

router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get distinct sessions with their latest message
    const sessions = await prisma.conversationHistory.findMany({
      where: { userId, agentName: AGENT_NAME },
      distinct: ['sessionId'],
      orderBy: { timestamp: 'desc' },
      take: 20,
      select: { sessionId: true, content: true, timestamp: true },
    });

    res.json({
      conversations: sessions.map((s) => ({
        sessionId: s.sessionId,
        preview: s.content?.substring(0, 100) || '',
        lastActive: s.timestamp,
      })),
    });
  } catch (err) {
    console.error('[Assistant API] GET /conversations error:', err.message);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
});

// ─── GET /conversation/:id — Messages for a Session ─────

router.get('/conversation/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const messages = await prisma.conversationHistory.findMany({
      where: { userId, sessionId, agentName: AGENT_NAME },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        toolCalls: true,
        timestamp: true,
      },
    });

    res.json({ sessionId, messages });
  } catch (err) {
    console.error('[Assistant API] GET /conversation error:', err.message);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// ─── DELETE /conversation/:id — Delete Session ──────────

router.delete('/conversation/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const result = await prisma.conversationHistory.deleteMany({
      where: { userId, sessionId, agentName: AGENT_NAME },
    });

    res.json({ deleted: result.count });
  } catch (err) {
    console.error('[Assistant API] DELETE /conversation error:', err.message);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

module.exports = router;
