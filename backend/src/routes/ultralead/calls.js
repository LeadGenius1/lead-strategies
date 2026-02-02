// Calls Routes - UltraLead CRM (Twilio Integration)
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/v1/ultralead/calls
router.get('/', async (req, res) => {
  try {
    const { direction, status, contactId, limit = 50, offset = 0 } = req.query;
    const where = { userId: req.user.id };

    if (direction) where.direction = direction;
    if (status) where.status = status;
    if (contactId) where.contactId = contactId;

    const [calls, total] = await Promise.all([
      prisma.call.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
        include: { contact: { select: { firstName: true, lastName: true, email: true } } }
      }),
      prisma.call.count({ where })
    ]);

    res.json({ success: true, data: { calls, total, limit: parseInt(limit), offset: parseInt(offset) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/ultralead/calls/:id
router.get('/:id', async (req, res) => {
  try {
    const call = await prisma.call.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { contact: true }
    });
    if (!call) return res.status(404).json({ success: false, error: 'Call not found' });
    res.json({ success: true, data: call });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/ultralead/calls - Initiate a call
router.post('/', async (req, res) => {
  try {
    const { toNumber, contactId } = req.body;

    // Create call record
    const call = await prisma.call.create({
      data: {
        userId: req.user.id,
        contactId,
        direction: 'outbound',
        status: 'initiated',
        fromNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
        toNumber,
        startedAt: new Date()
      }
    });

    // In production, integrate with Twilio to make the actual call
    // const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    // const twilioCall = await twilioClient.calls.create({ ... });

    res.status(201).json({ success: true, data: call });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/ultralead/calls/:id - Update call (notes, outcome)
router.put('/:id', async (req, res) => {
  try {
    const call = await prisma.call.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: req.body
    });
    if (call.count === 0) return res.status(404).json({ success: false, error: 'Call not found' });
    const updated = await prisma.call.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
