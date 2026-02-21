// Ad Serving Routes
// Public endpoints for serving and tracking ads on VideoSite.AI

const express = require('express');
const router = express.Router();

let prisma = null;
function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = require('../config/database').prisma;
  }
  return prisma;
}

// GET /api/v1/ads/serve - Serve a relevant ad (NO AUTH - public)
router.get('/serve', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const now = new Date();
    const { category, videoId } = req.query;

    const where = {
      status: 'APPROVED',
      budgetSpent: { lt: prisma ? undefined : 0 },
      startDate: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
    };

    // Find active campaigns where budgetSpent < budgetTotal
    const campaigns = await db.adCampaign.findMany({
      where: {
        status: 'APPROVED',
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { costPerView: 'desc' },
      take: 10,
    });

    // Filter: budget not exhausted, and optionally match category
    let eligible = campaigns.filter(c => c.budgetSpent < c.budgetTotal);
    if (category) {
      const catLower = category.toLowerCase();
      const catMatch = eligible.filter(c =>
        c.targetCategories.some(t => t.toLowerCase() === catLower)
      );
      if (catMatch.length > 0) eligible = catMatch;
    }

    if (eligible.length === 0) {
      return res.json({ success: true, ad: null });
    }

    // Weight by CPV — pick random from top 5
    const top = eligible.slice(0, 5);
    const selected = top[Math.floor(Math.random() * top.length)];

    // Increment impressions
    await db.adCampaign.update({
      where: { id: selected.id },
      data: { impressions: { increment: 1 } },
    });

    res.json({
      success: true,
      ad: {
        id: selected.id,
        videoUrl: selected.videoUrl,
        thumbnailUrl: selected.thumbnailUrl,
        title: selected.title,
        description: selected.description,
        callToAction: selected.callToAction,
        clickUrl: selected.clickUrl,
        tier: selected.tier,
      },
    });
  } catch (error) {
    console.error('Serve ad error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/v1/ads/:campaignId/track-view - Track ad view (NO AUTH)
router.post('/:campaignId/track-view', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const campaign = await db.adCampaign.findUnique({ where: { id: req.params.campaignId } });
    if (!campaign || campaign.status !== 'APPROVED') {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const newSpent = campaign.budgetSpent + campaign.costPerView;
    const updateData = {
      views: { increment: 1 },
      budgetSpent: newSpent,
    };

    // If budget exhausted, mark completed
    if (newSpent >= campaign.budgetTotal) {
      updateData.status = 'COMPLETED';
    }

    await db.adCampaign.update({
      where: { id: req.params.campaignId },
      data: updateData,
    });

    res.json({ success: true, tracked: true });
  } catch (error) {
    console.error('Track ad view error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/v1/ads/:campaignId/track-click - Track ad click (NO AUTH)
router.post('/:campaignId/track-click', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const campaign = await db.adCampaign.findUnique({ where: { id: req.params.campaignId } });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    await db.adCampaign.update({
      where: { id: req.params.campaignId },
      data: { clicks: { increment: 1 } },
    });

    res.json({ success: true, tracked: true });
  } catch (error) {
    console.error('Track ad click error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
