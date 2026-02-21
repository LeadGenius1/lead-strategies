// Dashboard Routes
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

// Apply authentication
router.use(authenticate);

// GET /api/v1/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const db = getPrisma();

    // Return mock data if no database
    if (!db) {
      return res.json({
        success: true,
        data: {
          totalLeads: 150,
          emailsSent: 450,
          openRate: 32.5,
          replyRate: 8.2,
          activeCampaigns: 3,
          totalWebsites: 2
        }
      });
    }

    const userId = req.user.id;

    const [totalLeads, activeCampaigns, campaigns, totalWebsites] = await Promise.all([
      db.lead.count({ where: { userId } }),
      db.campaign.count({ where: { userId, status: 'active' } }),
      db.campaign.findMany({ where: { userId }, select: { sentCount: true, openCount: true, replyCount: true } }),
      db.website.count({ where: { userId } })
    ]);

    const emailsSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    const opens = campaigns.reduce((sum, c) => sum + (c.openCount || 0), 0);
    const replies = campaigns.reduce((sum, c) => sum + (c.replyCount || 0), 0);

    const openRate = emailsSent > 0 ? ((opens / emailsSent) * 100).toFixed(1) : 0;
    const replyRate = emailsSent > 0 ? ((replies / emailsSent) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalLeads,
        emailsSent,
        openRate: parseFloat(openRate),
        replyRate: parseFloat(replyRate),
        activeCampaigns,
        totalWebsites
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/dashboard/activity
router.get('/activity', async (req, res) => {
  try {
    const db = getPrisma();

    // Return mock activity if no database
    if (!db) {
      return res.json({
        success: true,
        data: [
          { id: 'lead-1', type: 'lead', message: 'New lead: Sarah Chen at CloudScale', time: '2 min ago' },
          { id: 'email-1', type: 'email', message: 'Email opened by Michael Torres', time: '15 min ago' },
          { id: 'reply-1', type: 'reply', message: 'Reply received from Jennifer Park', time: '1 hour ago' },
          { id: 'campaign-1', type: 'campaign', message: 'Campaign "Q1 SaaS Outreach" started', time: '3 hours ago' },
          { id: 'lead-2', type: 'lead', message: 'New lead: David Kim at StartupXYZ', time: '5 hours ago' },
        ]
      });
    }

    const userId = req.user.id;

    // Get recent leads
    const recentLeads = await db.lead.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, company: true, createdAt: true }
    });

    // Get recent campaigns
    const recentCampaigns = await db.campaign.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, name: true, status: true, updatedAt: true }
    });

    // Format activities
    const activities = [];

    recentLeads.forEach(lead => {
      activities.push({
        id: `lead-${lead.id}`,
        type: 'lead',
        message: `New lead: ${lead.name || 'Unknown'}${lead.company ? ` at ${lead.company}` : ''}`,
        time: formatTimeAgo(lead.createdAt)
      });
    });

    recentCampaigns.forEach(campaign => {
      activities.push({
        id: `campaign-${campaign.id}`,
        type: 'campaign',
        message: `Campaign "${campaign.name}" ${campaign.status}`,
        time: formatTimeAgo(campaign.updatedAt)
      });
    });

    // Sort by time and take top 10
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      success: true,
      data: activities.slice(0, 10)
    });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

module.exports = router;
