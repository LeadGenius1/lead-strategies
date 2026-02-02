// Conversations Routes (Unified Inbox)
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /api/v1/conversations - List all conversations/threads
router.get('/', async (req, res) => {
  try {
    const { channel, status, limit = 50, offset = 0 } = req.query;

    const where = { userId: req.user.id };
    if (channel) where.channelId = channel;
    if (status) where.status = status;

    const conversations = await prisma.conversation.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: { take: 1, orderBy: { createdAt: 'desc' } }
      }
    });

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/conversations/:id
router.get('/:id', async (req, res) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/conversations/:id/reply
router.post('/:id/reply', async (req, res) => {
  try {
    const { content } = req.body;

    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content,
        isOutgoing: true,
        sentAt: new Date()
      }
    });

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
