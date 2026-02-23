const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { prisma } = require('../config/database');
const { NexusOrchestrator } = require('../services/nexus-orchestrator');

/**
 * POST /api/v1/nexus/chat
 * Process NEXUS conversation message
 */
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const userId = req.user.userId || req.user.id;

    // Initialize NEXUS orchestrator
    const nexus = new NexusOrchestrator(prisma, String(userId));
    await nexus.initialize(sessionId || null);

    // Process message
    const response = await nexus.processMessage(message);

    // Get updated history
    const history = await nexus.getHistory(10);

    return res.json({
      success: true,
      response,
      history,
      sessionId: nexus.conversationManager.currentSessionId,
    });
  } catch (error) {
    console.error('NEXUS chat error:', error);
    return res.status(500).json({ error: error.message || 'NEXUS chat failed' });
  }
});

/**
 * GET /api/v1/nexus/chat?sessionId=xxx
 * Get conversation history
 */
router.get('/chat', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user.userId || req.user.id;

    const nexus = new NexusOrchestrator(prisma, String(userId));
    await nexus.initialize(sessionId || null);

    const history = await nexus.getHistory();

    return res.json({
      success: true,
      history,
      sessionId: nexus.conversationManager.currentSessionId,
    });
  } catch (error) {
    console.error('NEXUS history error:', error);
    return res.status(500).json({ error: error.message || 'Failed to load history' });
  }
});

/**
 * GET /api/v1/nexus/sessions
 * Get recent conversation sessions
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { ConversationManager } = require('../services/conversation-manager');

    const manager = new ConversationManager(prisma, String(userId));
    const sessions = await manager.getRecentSessions();

    return res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('NEXUS sessions error:', error);
    return res.status(500).json({ error: error.message || 'Failed to load sessions' });
  }
});

module.exports = router;
