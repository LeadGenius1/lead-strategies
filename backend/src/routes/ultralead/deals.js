// Deals Routes - UltraLead CRM
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const { prisma } = require('../../config/database');

// GET /api/v1/ultralead/deals
router.get('/', async (req, res) => {
  try {
    const { stage, companyId, priority, limit = 50, offset = 0 } = req.query;
    const where = { userId: req.user.id };

    if (stage) where.stage = stage;
    if (companyId) where.companyId = companyId;
    if (priority) where.priority = priority;

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { updatedAt: 'desc' },
        include: { company: { select: { name: true } }, contacts: { select: { firstName: true, lastName: true, email: true } } }
      }),
      prisma.deal.count({ where })
    ]);

    res.json({ success: true, data: { deals, total, limit: parseInt(limit), offset: parseInt(offset) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/ultralead/deals/:id
router.get('/:id', async (req, res) => {
  try {
    const deal = await prisma.deal.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { company: true, contacts: true, activities: { take: 10, orderBy: { createdAt: 'desc' } }, meetings: true, documents: true }
    });
    if (!deal) return res.status(404).json({ success: false, error: 'Deal not found' });
    res.json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/ultralead/deals
router.post('/', async (req, res) => {
  try {
    const deal = await prisma.deal.create({
      data: { userId: req.user.id, ...req.body }
    });
    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/ultralead/deals/:id
router.put('/:id', async (req, res) => {
  try {
    const deal = await prisma.deal.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: req.body
    });
    if (deal.count === 0) return res.status(404).json({ success: false, error: 'Deal not found' });
    const updated = await prisma.deal.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/ultralead/deals/:id/stage - Update deal stage (drag-drop)
router.put('/:id/stage', async (req, res) => {
  try {
    const { stage, probability } = req.body;
    const deal = await prisma.deal.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { stage, probability }
    });
    if (deal.count === 0) return res.status(404).json({ success: false, error: 'Deal not found' });
    const updated = await prisma.deal.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/ultralead/deals/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.deal.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Deal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
