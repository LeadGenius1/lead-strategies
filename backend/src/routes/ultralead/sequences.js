// Sequences Routes - UltraLead CRM (Automated Outreach)
const express = require('express');


const router = express.Router();
const { prisma } = require('../../config/database');

// GET /api/v1/ultralead/sequences
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const sequences = await prisma.sequence.findMany({
      where,
      include: { steps: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: sequences });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/ultralead/sequences/:id
router.get('/:id', async (req, res) => {
  try {
    const sequence = await prisma.sequence.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { steps: { orderBy: { position: 'asc' } } }
    });
    if (!sequence) return res.status(404).json({ success: false, error: 'Sequence not found' });
    res.json({ success: true, data: sequence });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/ultralead/sequences
router.post('/', async (req, res) => {
  try {
    const { name, description, channels, steps = [] } = req.body;

    const sequence = await prisma.sequence.create({
      data: {
        userId: req.user.id,
        name,
        description,
        channels: channels || [],
        steps: {
          create: steps.map((step, index) => ({
            position: index,
            channel: step.channel,
            delayDays: step.delayDays || 1,
            delayHours: step.delayHours || 0,
            subject: step.subject,
            body: step.body
          }))
        }
      },
      include: { steps: { orderBy: { position: 'asc' } } }
    });

    res.status(201).json({ success: true, data: sequence });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/ultralead/sequences/:id
router.put('/:id', async (req, res) => {
  try {
    const sequence = await prisma.sequence.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: req.body
    });
    if (sequence.count === 0) return res.status(404).json({ success: false, error: 'Sequence not found' });
    const updated = await prisma.sequence.findUnique({ where: { id: req.params.id }, include: { steps: true } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/ultralead/sequences/:id/activate
router.put('/:id/activate', async (req, res) => {
  try {
    const sequence = await prisma.sequence.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { status: 'active' }
    });
    if (sequence.count === 0) return res.status(404).json({ success: false, error: 'Sequence not found' });
    const updated = await prisma.sequence.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/ultralead/sequences/:id/pause
router.put('/:id/pause', async (req, res) => {
  try {
    const sequence = await prisma.sequence.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { status: 'paused' }
    });
    if (sequence.count === 0) return res.status(404).json({ success: false, error: 'Sequence not found' });
    const updated = await prisma.sequence.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/ultralead/sequences/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.sequence.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Sequence deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
