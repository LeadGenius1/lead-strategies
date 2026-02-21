// Activities Routes - UltraLead CRM
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const { prisma } = require('../../config/database');

// GET /api/v1/ultralead/activities
router.get('/', async (req, res) => {
  try {
    const { type, isCompleted, contactId, dealId, limit = 50, offset = 0 } = req.query;
    const where = { userId: req.user.id };

    if (type) where.type = type;
    if (isCompleted !== undefined) where.isCompleted = isCompleted === 'true';
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
        include: { contact: { select: { firstName: true, lastName: true } }, deal: { select: { name: true } } }
      }),
      prisma.activity.count({ where })
    ]);

    res.json({ success: true, data: { activities, total, limit: parseInt(limit), offset: parseInt(offset) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/ultralead/activities
router.post('/', async (req, res) => {
  try {
    const activity = await prisma.activity.create({
      data: { userId: req.user.id, ...req.body }
    });
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/ultralead/activities/:id
router.put('/:id', async (req, res) => {
  try {
    const activity = await prisma.activity.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: req.body
    });
    if (activity.count === 0) return res.status(404).json({ success: false, error: 'Activity not found' });
    const updated = await prisma.activity.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/ultralead/activities/:id/complete
router.put('/:id/complete', async (req, res) => {
  try {
    const activity = await prisma.activity.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isCompleted: true, completedAt: new Date() }
    });
    if (activity.count === 0) return res.status(404).json({ success: false, error: 'Activity not found' });
    const updated = await prisma.activity.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/ultralead/activities/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.activity.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
