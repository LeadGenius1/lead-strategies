// Documents Routes - UltraLead CRM
const express = require('express');


const router = express.Router();
const { prisma } = require('../../config/database');

// GET /api/v1/ultralead/documents
router.get('/', async (req, res) => {
  try {
    const { type, dealId, status, limit = 50, offset = 0 } = req.query;
    const where = { userId: req.user.id };

    if (type) where.type = type;
    if (dealId) where.dealId = dealId;
    if (status) where.status = status;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
        include: { deal: { select: { name: true } } }
      }),
      prisma.document.count({ where })
    ]);

    res.json({ success: true, data: { documents, total, limit: parseInt(limit), offset: parseInt(offset) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/ultralead/documents/:id
router.get('/:id', async (req, res) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { deal: true }
    });
    if (!document) return res.status(404).json({ success: false, error: 'Document not found' });
    res.json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/ultralead/documents
router.post('/', async (req, res) => {
  try {
    const document = await prisma.document.create({
      data: { userId: req.user.id, ...req.body }
    });
    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/ultralead/documents/:id
router.put('/:id', async (req, res) => {
  try {
    const document = await prisma.document.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: req.body
    });
    if (document.count === 0) return res.status(404).json({ success: false, error: 'Document not found' });
    const updated = await prisma.document.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/ultralead/documents/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.document.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
