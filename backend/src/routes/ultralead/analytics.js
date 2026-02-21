// Analytics Routes - UltraLead CRM
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const { prisma } = require('../../config/database');

// GET /api/v1/ultralead/analytics/sales
router.get('/sales', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const userId = req.user.id;

    // Calculate date range
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get won deals in period
    const wonDeals = await prisma.deal.findMany({
      where: {
        userId,
        stage: 'closed_won',
        actualClose: { gte: startDate }
      },
      select: { value: true, actualClose: true }
    });

    const totalRevenue = wonDeals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
    const dealCount = wonDeals.length;

    // Get deal velocity
    const avgDealCycle = await prisma.deal.aggregate({
      where: { userId, stage: 'closed_won', actualClose: { gte: startDate } },
      _avg: { value: true }
    });

    res.json({
      success: true,
      data: {
        period,
        totalRevenue,
        dealsClosed: dealCount,
        avgDealSize: dealCount > 0 ? totalRevenue / dealCount : 0,
        deals: wonDeals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/ultralead/analytics/pipeline
router.get('/pipeline', async (req, res) => {
  try {
    const userId = req.user.id;

    const dealsByStage = await prisma.deal.groupBy({
      by: ['stage'],
      where: { userId, stage: { notIn: ['closed_won', 'closed_lost'] } },
      _count: true,
      _sum: { value: true }
    });

    const totalPipelineValue = dealsByStage.reduce((sum, s) => sum + Number(s._sum.value || 0), 0);

    res.json({
      success: true,
      data: {
        stages: dealsByStage.map(s => ({
          stage: s.stage,
          count: s._count,
          value: Number(s._sum.value || 0)
        })),
        totalPipelineValue,
        totalDeals: dealsByStage.reduce((sum, s) => sum + s._count, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/ultralead/analytics/activity
router.get('/activity', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const userId = req.user.id;

    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activityByType = await prisma.activity.groupBy({
      by: ['type'],
      where: { userId, createdAt: { gte: startDate } },
      _count: true
    });

    const completedActivities = await prisma.activity.count({
      where: { userId, isCompleted: true, completedAt: { gte: startDate } }
    });

    res.json({
      success: true,
      data: {
        period,
        byType: activityByType.map(a => ({ type: a.type, count: a._count })),
        completed: completedActivities,
        total: activityByType.reduce((sum, a) => sum + a._count, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/ultralead/analytics/forecast
router.get('/forecast', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get open deals with probability
    const openDeals = await prisma.deal.findMany({
      where: { userId, stage: { notIn: ['closed_won', 'closed_lost'] } },
      select: { value: true, probability: true, expectedClose: true, stage: true }
    });

    // Calculate weighted forecast
    const weightedForecast = openDeals.reduce((sum, deal) => {
      const probability = deal.probability || 0;
      return sum + (Number(deal.value || 0) * probability / 100);
    }, 0);

    // Best case (100% close rate)
    const bestCase = openDeals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);

    // Worst case (0% - committed only)
    const worstCase = 0;

    res.json({
      success: true,
      data: {
        weighted: weightedForecast,
        bestCase,
        worstCase,
        dealCount: openDeals.length,
        deals: openDeals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/ultralead/analytics/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get team members' performance
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        team: { members: { some: { userId: req.user.id } } }
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    const leaderboard = await Promise.all(
      teamMembers.map(async (member) => {
        const wonDeals = await prisma.deal.aggregate({
          where: {
            ownerId: member.userId,
            stage: 'closed_won',
            actualClose: { gte: startDate }
          },
          _sum: { value: true },
          _count: true
        });

        return {
          user: member.user,
          revenue: Number(wonDeals._sum.value || 0),
          deals: wonDeals._count
        };
      })
    );

    // Sort by revenue
    leaderboard.sort((a, b) => b.revenue - a.revenue);

    res.json({
      success: true,
      data: {
        period,
        leaderboard
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
