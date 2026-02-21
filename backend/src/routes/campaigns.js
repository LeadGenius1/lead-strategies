// Campaign Routes
const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Lazy-load Prisma only when DATABASE_URL is available
let prisma = null;

function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {

    prisma = require('../config/database').prisma;
  }
  return prisma;
}

// Mock data for development without database
const mockCampaigns = [
  { id: '1', name: 'Q1 SaaS Outreach', status: 'active', sentCount: 150, openCount: 48, replyCount: 12, createdAt: new Date() },
  { id: '2', name: 'Tech Startup Campaign', status: 'draft', sentCount: 0, openCount: 0, replyCount: 0, createdAt: new Date() },
  { id: '3', name: 'Enterprise Sales Push', status: 'active', sentCount: 300, openCount: 98, replyCount: 23, createdAt: new Date() },
];

router.use(authenticate);

// GET /api/v1/campaigns
router.get('/', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({ success: true, data: mockCampaigns });
    }
    const campaigns = await db.campaign.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/campaigns/replies - Campaign replies only
router.get('/replies', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.json({ success: true, data: { replies: [] } });
    const events = await db.emailEvent.findMany({
      where: { eventType: 'replied', campaign: { userId: req.user.id } },
      include: { campaign: { select: { name: true } }, lead: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    const replies = events.map((e) => {
      const ed = (e.eventData && typeof e.eventData === 'object') ? e.eventData : {};
      return {
        id: e.id,
        from_name: e.lead?.name || ed.fromName || 'Unknown',
        from_email: e.lead?.email || ed.fromEmail || '',
        body: ed.body || ed.content || '',
        received_at: e.createdAt,
        campaign_name: e.campaign?.name
      };
    });
    res.json({ success: true, data: { replies } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/campaigns
router.post('/', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.status(201).json({ success: true, data: { id: Date.now().toString(), ...req.body, status: 'draft', createdAt: new Date() } });
    }
    const campaign = await db.campaign.create({
      data: {
        ...req.body,
        userId: req.user.id,
        status: 'draft'
      }
    });
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/campaigns/:id
router.get('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      const campaign = mockCampaigns.find(c => c.id === req.params.id);
      if (!campaign) return res.status(404).json({ success: false, error: 'Not found' });
      return res.json({ success: true, data: campaign });
    }
    const campaign = await db.campaign.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/campaigns/:id
router.put('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({ success: true, data: { id: req.params.id, ...req.body } });
    }
    const campaign = await db.campaign.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    const updated = await db.campaign.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/campaigns/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({ success: true, message: 'Campaign deleted (mock)' });
    }
    await db.campaign.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/campaigns/:id/start
router.post('/:id/start', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({ success: true, data: { id: req.params.id, status: 'active' }, message: 'Campaign started (mock)' });
    }
    const updated = await db.campaign.update({
      where: { id: req.params.id },
      data: { status: 'active' }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/campaigns/:id/pause
router.post('/:id/pause', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({ success: true, data: { id: req.params.id, status: 'paused' }, message: 'Campaign paused (mock)' });
    }
    const updated = await db.campaign.update({
      where: { id: req.params.id },
      data: { status: 'paused' }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
