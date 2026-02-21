// Companies Routes - UltraLead CRM
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const { prisma } = require('../../config/database');

// GET /api/v1/ultralead/companies
router.get('/', async (req, res) => {
  try {
    const { search, industry, accountTier, limit = 50, offset = 0 } = req.query;
    const where = { userId: req.user.id };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (industry) where.industry = industry;
    if (accountTier) where.accountTier = accountTier;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { contacts: true, deals: true } } }
      }),
      prisma.company.count({ where })
    ]);

    res.json({ success: true, data: { companies, total, limit: parseInt(limit), offset: parseInt(offset) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/ultralead/companies/:id
router.get('/:id', async (req, res) => {
  try {
    const company = await prisma.company.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { contacts: true, deals: true, activities: { take: 10, orderBy: { createdAt: 'desc' } } }
    });
    if (!company) return res.status(404).json({ success: false, error: 'Company not found' });
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/ultralead/companies
router.post('/', async (req, res) => {
  try {
    const company = await prisma.company.create({
      data: { userId: req.user.id, ...req.body }
    });
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/ultralead/companies/:id
router.put('/:id', async (req, res) => {
  try {
    const company = await prisma.company.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: req.body
    });
    if (company.count === 0) return res.status(404).json({ success: false, error: 'Company not found' });
    const updated = await prisma.company.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/ultralead/companies/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.company.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
