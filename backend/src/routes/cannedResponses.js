// Canned Responses Routes
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const { prisma } = require('../config/database');

router.use(authenticate);

// GET /api/v1/canned-responses
router.get('/', async (req, res) => {
  try {
    const responses = await prisma.cannedResponse.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: responses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/canned-responses
router.post('/', async (req, res) => {
  try {
    const { name, content, category } = req.body;
    const response = await prisma.cannedResponse.create({
      data: { userId: req.user.id, name, content, category }
    });
    res.status(201).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/canned-responses/:id
router.put('/:id', async (req, res) => {
  try {
    const response = await prisma.cannedResponse.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/canned-responses/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.cannedResponse.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
