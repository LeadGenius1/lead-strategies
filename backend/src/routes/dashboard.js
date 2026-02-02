// Dashboard Routes
const express = require('express');
const router = express.Router();

// GET /api/v1/dashboard/stats
router.get('/stats', (req, res) => {
  res.json({
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
});

// GET /api/v1/dashboard/activity
router.get('/activity', (req, res) => {
  res.json({
    success: true,
    data: {
      activities: [
        { id: 1, type: 'lead', message: 'New lead discovered', time: new Date() },
        { id: 2, type: 'email', message: 'Email sent to John Doe', time: new Date() },
        { id: 3, type: 'reply', message: 'Reply received from Jane Smith', time: new Date() }
      ]
    }
  });
});

module.exports = router;
