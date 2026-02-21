// Conversations Routes (Unified Inbox)
const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Lazy-load Prisma only when DATABASE_URL is available
let prisma = null;

function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {

    prisma = require('../config/database').prisma;
  }
  return prisma;
}

// Mock data for development without database
const mockConversations = [
  { id: '1', contactName: 'Sarah Chen', contactEmail: 'sarah@cloudscale.com', channel: 'email', status: 'open', subject: 'Partnership Inquiry', updatedAt: new Date(), messages: [{ id: 'm1', content: 'Hi, I saw your platform and wanted to discuss a potential partnership...', direction: 'inbound', createdAt: new Date() }] },
  { id: '2', contactName: 'Michael Torres', contactEmail: 'michael@techcorp.com', channel: 'email', status: 'open', subject: 'Re: Demo Request', updatedAt: new Date(Date.now() - 3600000), messages: [{ id: 'm2', content: 'Thanks for the demo! I have a few follow-up questions...', direction: 'inbound', createdAt: new Date(Date.now() - 3600000) }] },
  { id: '3', contactName: 'Jennifer Park', contactEmail: 'jen@innovate.io', channel: 'sms', status: 'replied', subject: 'Quick Question', updatedAt: new Date(Date.now() - 7200000), messages: [{ id: 'm3', content: 'Can we schedule a call for tomorrow?', direction: 'inbound', createdAt: new Date(Date.now() - 7200000) }] },
];

router.use(authenticate);

// GET /api/v1/conversations - List all conversations/threads
router.get('/', async (req, res) => {
  try {
    const db = getPrisma();
    const { channel, status, limit = 50, offset = 0 } = req.query;

    if (!db) {
      let filtered = [...mockConversations];
      if (channel && channel !== 'all') filtered = filtered.filter(c => c.channel === channel);
      if (status && status !== 'all') filtered = filtered.filter(c => c.status === status);
      return res.json({ success: true, data: { conversations: filtered } });
    }

    const where = { userId: req.user.id };
    if (channel) where.channelId = channel;
    if (status) where.status = status;

    const conversations = await db.conversation.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: { take: 1, orderBy: { createdAt: 'desc' } }
      }
    });

    res.json({ success: true, data: { conversations } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/conversations/:id
router.get('/:id', async (req, res) => {
  try {
    const db = getPrisma();

    if (!db) {
      const conversation = mockConversations.find(c => c.id === req.params.id);
      if (!conversation) return res.status(404).json({ success: false, error: 'Not found' });
      return res.json({ success: true, data: conversation });
    }

    const conversation = await db.conversation.findFirst({
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
    const db = getPrisma();
    const { content } = req.body;

    if (!db) {
      return res.json({ success: true, data: { id: Date.now().toString(), content, isOutgoing: true, sentAt: new Date() } });
    }

    const conversation = await db.conversation.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    const message = await db.message.create({
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
