// Conversation Notes Routes
const express = require('express');

const { authenticate } = require('../middleware/auth');

const router = express.Router();
const { prisma } = require('../config/database');

router.use(authenticate);

// GET /api/v1/conversation-notes/:conversationId
router.get('/:conversationId', async (req, res) => {
  try {
    const notes = await prisma.conversationNote.findMany({
      where: { conversationId: req.params.conversationId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/conversation-notes
router.post('/', async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const note = await prisma.conversationNote.create({
      data: { conversationId, content, userId: req.user.id }
    });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/conversation-notes/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.conversationNote.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
