// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — AI ASSISTANT API ROUTES
// Chat, file upload, memory management endpoints.
// All routes require authentication.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { prisma } = require('../config/database');
const { getRedisClient } = require('../config/redis');
const { streamChat } = require('../services/nexus2/assistant/service');
const { generateGreeting } = require('../services/nexus2/assistant/greeting');
const { processFile } = require('../services/nexus2/assistant/fileProcessor');

const AGENT_NAME = 'lead-hunter';

// Multer config for file uploads (memory storage, 50MB max)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc', '.csv', '.xlsx', '.txt', '.md', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed`));
    }
  },
});

// Simple in-memory rate limit for uploads (20/hour per user)
const uploadCounts = new Map();
function checkUploadLimit(userId) {
  const now = Date.now();
  const hourAgo = now - 3600000;
  const entries = (uploadCounts.get(userId) || []).filter((t) => t > hourAgo);
  if (entries.length >= 20) return false;
  entries.push(now);
  uploadCounts.set(userId, entries);
  return true;
}

// All routes require authentication
router.use(authenticate);

// ─── POST /chat — SSE Streaming Chat ────────────────────

router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId, fileIds } = req.body;
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
      fileIds: Array.isArray(fileIds) ? fileIds : undefined,
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

// ─── POST /upload — File Upload ──────────────────────────

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!checkUploadLimit(userId)) {
      return res.status(429).json({ error: 'Upload limit reached (20 files per hour)' });
    }

    const sessionId = req.body.sessionId || null;
    const result = await processFile(req.file, userId, sessionId);

    res.json({
      success: true,
      file: {
        id: result.fileId,
        filename: result.filename,
        size: req.file.size,
        extractedText: result.extractedText
          ? result.extractedText.substring(0, 500) + (result.extractedText.length > 500 ? '...' : '')
          : null,
        truncated: result.truncated || false,
      },
    });
  } catch (err) {
    console.error('[Assistant API] POST /upload error:', err.message);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ─── GET /memories — List User Memories ─────────────────

router.get('/memories', async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query;

    const where = { userId };
    if (category) where.category = category;

    const memories = await prisma.leadHunterMemory.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        category: true,
        key: true,
        value: true,
        source: true,
        confidence: true,
        updatedAt: true,
      },
    });

    res.json({ memories, count: memories.length });
  } catch (err) {
    console.error('[Assistant API] GET /memories error:', err.message);
    res.status(500).json({ error: 'Failed to list memories' });
  }
});

// ─── DELETE /memories/:id — Delete a Memory ─────────────

router.delete('/memories/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const memoryId = req.params.id;

    const memory = await prisma.leadHunterMemory.findFirst({
      where: { id: memoryId, userId },
    });

    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    await prisma.leadHunterMemory.delete({ where: { id: memoryId } });
    res.json({ deleted: true });
  } catch (err) {
    console.error('[Assistant API] DELETE /memories error:', err.message);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// ─── DELETE /memories — Clear All Memories ───────────────

router.delete('/memories', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await prisma.leadHunterMemory.deleteMany({ where: { userId } });
    res.json({ deleted: result.count });
  } catch (err) {
    console.error('[Assistant API] DELETE /memories (all) error:', err.message);
    res.status(500).json({ error: 'Failed to clear memories' });
  }
});

module.exports = router;
