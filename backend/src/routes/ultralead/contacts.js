// Contacts Routes - UltraLead CRM
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const { prisma } = require('../../config/database');

// GET /api/v1/ultralead/contacts
router.get('/', async (req, res) => {
  try {
    const { search, companyId, lifecycle, limit = 50, offset = 0 } = req.query;
    const where = { userId: req.user.id };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (companyId) where.companyId = companyId;
    if (lifecycle) where.lifecycle = lifecycle;

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { updatedAt: 'desc' },
        include: { company: { select: { name: true } } }
      }),
      prisma.contact.count({ where })
    ]);

    res.json({ success: true, data: { contacts, total, limit: parseInt(limit), offset: parseInt(offset) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/ultralead/contacts/:id
router.get('/:id', async (req, res) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { company: true, deals: true, activities: { take: 10, orderBy: { createdAt: 'desc' } }, calls: { take: 5 } }
    });
    if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' });
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/ultralead/contacts
router.post('/', async (req, res) => {
  try {
    const contact = await prisma.contact.create({
      data: { userId: req.user.id, ...req.body }
    });
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/ultralead/contacts/:id
router.put('/:id', async (req, res) => {
  try {
    const contact = await prisma.contact.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: req.body
    });
    if (contact.count === 0) return res.status(404).json({ success: false, error: 'Contact not found' });
    const updated = await prisma.contact.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/ultralead/contacts/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.contact.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
