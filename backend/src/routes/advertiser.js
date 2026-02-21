// Advertiser Platform Routes
// Campaign management and analytics for advertisers

const express = require('express');
const { authenticate } = require('../middleware/auth');
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

// CPV rates per tier
const TIER_CPV = { STARTER: 0.05, PROFESSIONAL: 0.10, PREMIUM: 0.20 };

// All advertiser routes require auth
router.use(authenticate);

// POST /api/v1/advertiser/register - Create advertiser account
router.post('/register', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const { companyName, contactEmail, contactPhone, website } = req.body;
    if (!companyName || !contactEmail) {
      return res.status(400).json({ error: 'companyName and contactEmail are required' });
    }

    const existing = await db.advertiser.findUnique({ where: { userId: req.user.id } });
    if (existing) {
      return res.status(400).json({ error: 'Advertiser account already exists' });
    }

    const advertiser = await db.advertiser.create({
      data: {
        userId: req.user.id,
        companyName,
        contactEmail,
        contactPhone: contactPhone || null,
        website: website || null,
      },
    });

    res.status(201).json({ success: true, data: advertiser });
  } catch (error) {
    console.error('Advertiser register error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/v1/advertiser/profile - Get advertiser profile
router.get('/profile', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const advertiser = await db.advertiser.findUnique({
      where: { userId: req.user.id },
      include: { campaigns: { select: { id: true, status: true, budgetTotal: true, budgetSpent: true } } },
    });
    if (!advertiser) {
      return res.status(404).json({ error: 'No advertiser account found' });
    }

    res.json({ success: true, data: advertiser });
  } catch (error) {
    console.error('Get advertiser profile error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/v1/advertiser/campaigns - Create ad campaign
router.post('/campaigns', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const advertiser = await db.advertiser.findUnique({ where: { userId: req.user.id } });
    if (!advertiser) {
      return res.status(403).json({ error: 'Register as an advertiser first' });
    }

    const { name, title, description, videoUrl, thumbnailUrl, clickUrl, tier, budgetTotal, startDate, endDate, callToAction, targetCategories } = req.body;
    if (!name || !title || !videoUrl || !clickUrl || !budgetTotal || !startDate) {
      return res.status(400).json({ error: 'name, title, videoUrl, clickUrl, budgetTotal, and startDate are required' });
    }

    const tierKey = (tier || 'PROFESSIONAL').toUpperCase();
    const costPerView = TIER_CPV[tierKey] || TIER_CPV.PROFESSIONAL;

    if (budgetTotal < 100) {
      return res.status(400).json({ error: 'Minimum budget is $100' });
    }

    const campaign = await db.adCampaign.create({
      data: {
        advertiserId: advertiser.id,
        name,
        title,
        description: description || null,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        clickUrl,
        callToAction: callToAction || 'Learn More',
        tier: tierKey,
        costPerView,
        budgetTotal,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        targetCategories: targetCategories || [],
      },
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/v1/advertiser/campaigns - List campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const advertiser = await db.advertiser.findUnique({ where: { userId: req.user.id } });
    if (!advertiser) {
      return res.status(403).json({ error: 'Register as an advertiser first' });
    }

    const { status, limit = 50, offset = 0 } = req.query;
    const where = { advertiserId: advertiser.id };
    if (status) where.status = status.toUpperCase();

    const campaigns = await db.adCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: parseInt(offset),
      take: Math.min(50, parseInt(limit)),
    });

    res.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('List campaigns error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/v1/advertiser/campaigns/:id - Get campaign details
router.get('/campaigns/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const advertiser = await db.advertiser.findUnique({ where: { userId: req.user.id } });
    if (!advertiser) {
      return res.status(403).json({ error: 'Register as an advertiser first' });
    }

    const campaign = await db.adCampaign.findFirst({
      where: { id: req.params.id, advertiserId: advertiser.id },
    });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// PATCH /api/v1/advertiser/campaigns/:id - Update campaign
router.patch('/campaigns/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const advertiser = await db.advertiser.findUnique({ where: { userId: req.user.id } });
    if (!advertiser) {
      return res.status(403).json({ error: 'Register as an advertiser first' });
    }

    const campaign = await db.adCampaign.findFirst({
      where: { id: req.params.id, advertiserId: advertiser.id },
    });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (!['PENDING', 'PAUSED', 'APPROVED'].includes(campaign.status)) {
      return res.status(400).json({ error: `Cannot update campaign with status ${campaign.status}` });
    }

    const { status, budgetTotal, endDate } = req.body;
    const updateData = {};
    if (status) updateData.status = status.toUpperCase();
    if (budgetTotal !== undefined) updateData.budgetTotal = budgetTotal;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    const updated = await db.adCampaign.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/v1/advertiser/analytics - Overall advertiser performance
router.get('/analytics', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const advertiser = await db.advertiser.findUnique({ where: { userId: req.user.id } });
    if (!advertiser) {
      return res.status(403).json({ error: 'Register as an advertiser first' });
    }

    const campaigns = await db.adCampaign.findMany({
      where: { advertiserId: advertiser.id },
      select: { budgetSpent: true, views: true, clicks: true, impressions: true },
    });

    const totalSpent = campaigns.reduce((sum, c) => sum + c.budgetSpent, 0);
    const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);

    res.json({
      success: true,
      data: {
        totalCampaigns: campaigns.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
        totalViews,
        totalClicks,
        totalImpressions,
        avgCPV: totalViews > 0 ? Math.round((totalSpent / totalViews) * 100) / 100 : 0,
        ctr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0,
      },
    });
  } catch (error) {
    console.error('Advertiser analytics error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
