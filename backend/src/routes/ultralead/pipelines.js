// Pipelines Routes - UltraLead CRM
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const { prisma } = require('../../config/database');

// GET /api/v1/ultralead/pipelines
router.get('/', async (req, res) => {
  try {
    const pipelines = await prisma.pipeline.findMany({
      where: { userId: req.user.id },
      include: { stages: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: pipelines });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/ultralead/pipelines/:id
router.get('/:id', async (req, res) => {
  try {
    const pipeline = await prisma.pipeline.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { stages: { orderBy: { position: 'asc' } } }
    });
    if (!pipeline) return res.status(404).json({ success: false, error: 'Pipeline not found' });
    res.json({ success: true, data: pipeline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/ultralead/pipelines
router.post('/', async (req, res) => {
  try {
    const { name, description, stages = [] } = req.body;

    const pipeline = await prisma.pipeline.create({
      data: {
        userId: req.user.id,
        name,
        description,
        stages: {
          create: stages.map((stage, index) => ({
            name: stage.name,
            position: index,
            probability: stage.probability || 0,
            color: stage.color,
            rottingDays: stage.rottingDays
          }))
        }
      },
      include: { stages: { orderBy: { position: 'asc' } } }
    });

    res.status(201).json({ success: true, data: pipeline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/ultralead/pipelines/:id
router.put('/:id', async (req, res) => {
  try {
    const pipeline = await prisma.pipeline.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { name: req.body.name, description: req.body.description }
    });
    if (pipeline.count === 0) return res.status(404).json({ success: false, error: 'Pipeline not found' });
    const updated = await prisma.pipeline.findUnique({ where: { id: req.params.id }, include: { stages: true } });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/ultralead/pipelines/:id/stages
router.post('/:id/stages', async (req, res) => {
  try {
    const pipeline = await prisma.pipeline.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!pipeline) return res.status(404).json({ success: false, error: 'Pipeline not found' });

    const stage = await prisma.pipelineStage.create({
      data: { pipelineId: req.params.id, ...req.body }
    });
    res.status(201).json({ success: true, data: stage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/ultralead/pipelines/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.pipeline.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Pipeline deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
