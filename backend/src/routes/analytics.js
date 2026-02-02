// Analytics Routes
const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// GET /api/v1/analytics/overview
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalLeads: 150,
      totalEmails: 450,
      openRate: 32.5,
      clickRate: 12.3,
      replyRate: 8.2,
      conversionRate: 2.5
    }
  });
});

// GET /api/v1/analytics/campaigns
router.get('/campaigns', (req, res) => {
  res.json({
    success: true,
    data: {
      campaigns: [
        { id: 1, name: 'Q1 Outreach', sent: 150, opened: 48, clicked: 12, replied: 8 },
        { id: 2, name: 'Product Launch', sent: 200, opened: 72, clicked: 24, replied: 15 }
      ]
    }
  });
});

// GET /api/v1/analytics/leads
router.get('/leads', (req, res) => {
  res.json({
    success: true,
    data: {
      bySource: [
        { source: 'Apollo', count: 80 },
        { source: 'Form', count: 45 },
        { source: 'Manual', count: 25 }
      ],
      byStatus: [
        { status: 'new', count: 50 },
        { status: 'contacted', count: 60 },
        { status: 'replied', count: 30 },
        { status: 'converted', count: 10 }
      ]
    }
  });
});

module.exports = router;
