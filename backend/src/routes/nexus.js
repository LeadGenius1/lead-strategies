// NEXUS Blueprint API Routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { prisma } = require('../config/database');

// All routes require authentication
router.use(authenticate);

// GET /api/v1/nexus/summary - Full NEXUS dashboard data
router.get('/summary', async (req, res) => {
  try {
    const modules = await prisma.nexusModule.findMany({
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { moduleNumber: 'asc' }
    });

    const pendingRecommendations = await prisma.nexusRecommendation.findMany({
      where: { status: 'PENDING' },
      orderBy: { priority: 'desc' },
      take: 10
    });

    const stats = {
      total: modules.length,
      completed: modules.filter(m => m.status === 'COMPLETED').length,
      inProgress: modules.filter(m => m.status === 'IN_PROGRESS').length,
      notStarted: modules.filter(m => m.status === 'NOT_STARTED').length,
      blocked: modules.filter(m => m.status === 'BLOCKED').length,
      avgProgress: modules.length > 0
        ? Math.round(modules.reduce((sum, m) => sum + m.progress, 0) / modules.length)
        : 0
    };

    res.json({
      success: true,
      data: { modules, stats, pendingRecommendations }
    });
  } catch (error) {
    console.error('NEXUS summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to load NEXUS data' });
  }
});

// GET /api/v1/nexus/modules/:moduleNumber - Single module detail
router.get('/modules/:moduleNumber', async (req, res) => {
  try {
    const moduleNumber = parseInt(req.params.moduleNumber);
    const module = await prisma.nexusModule.findUnique({
      where: { moduleNumber },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!module) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }

    res.json({ success: true, data: { module } });
  } catch (error) {
    console.error('NEXUS module detail error:', error);
    res.status(500).json({ success: false, error: 'Failed to load module' });
  }
});

// PATCH /api/v1/nexus/modules/:moduleNumber - Update module status/progress
router.patch('/modules/:moduleNumber', async (req, res) => {
  try {
    const moduleNumber = parseInt(req.params.moduleNumber);
    const { status, progress, currentState } = req.body;

    const existing = await prisma.nexusModule.findUnique({ where: { moduleNumber } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;
    if (currentState !== undefined) updateData.currentState = currentState;

    const updated = await prisma.nexusModule.update({
      where: { moduleNumber },
      data: updateData
    });

    // Log the update
    await prisma.nexusUpdate.create({
      data: {
        moduleId: existing.id,
        updateType: 'STATUS_CHANGE',
        content: `Updated: ${Object.keys(updateData).join(', ')}`,
        previousValue: JSON.stringify({ status: existing.status, progress: existing.progress }),
        newValue: JSON.stringify(updateData),
        aiGenerated: false,
      }
    });

    res.json({ success: true, data: { module: updated } });
  } catch (error) {
    console.error('NEXUS module update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update module' });
  }
});

// GET /api/v1/nexus/recommendations - List recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const status = req.query.status || undefined;
    const where = status ? { status } : {};

    const recommendations = await prisma.nexusRecommendation.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 50
    });

    res.json({ success: true, data: { recommendations } });
  } catch (error) {
    console.error('NEXUS recommendations error:', error);
    res.status(500).json({ success: false, error: 'Failed to load recommendations' });
  }
});

// POST /api/v1/nexus/recommendations - Create recommendation
router.post('/recommendations', async (req, res) => {
  try {
    const { moduleId, title, rationale, impact, effort, priority, aiConfidence, generatedBy, actionItems, expectedOutcome } = req.body;

    if (!title || !rationale || !impact || !expectedOutcome) {
      return res.status(400).json({ success: false, error: 'title, rationale, impact, and expectedOutcome are required' });
    }

    const recommendation = await prisma.nexusRecommendation.create({
      data: {
        moduleId: moduleId || null,
        title,
        rationale,
        impact,
        effort: effort || 'MEDIUM',
        priority: priority || 5,
        aiConfidence: aiConfidence || 0.8,
        generatedBy: generatedBy || 'manual',
        actionItems: actionItems || [],
        expectedOutcome,
      }
    });

    res.status(201).json({ success: true, data: { recommendation } });
  } catch (error) {
    console.error('NEXUS create recommendation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create recommendation' });
  }
});

// PATCH /api/v1/nexus/recommendations/:id - Update recommendation status
router.patch('/recommendations/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' });
    }

    const updated = await prisma.nexusRecommendation.update({
      where: { id: req.params.id },
      data: {
        status,
        reviewedAt: ['APPROVED', 'REJECTED', 'IMPLEMENTED'].includes(status) ? new Date() : undefined
      }
    });

    res.json({ success: true, data: { recommendation: updated } });
  } catch (error) {
    console.error('NEXUS update recommendation error:', error);
    res.status(500).json({ success: false, error: 'Failed to update recommendation' });
  }
});

module.exports = router;
