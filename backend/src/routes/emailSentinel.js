// Email Sentinel trigger - backend only. Frontend proxies to this.
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getQueue } = require('../emailSentinel');

const router = express.Router();
router.use(authenticate);

router.post('/trigger', async (req, res) => {
  try {
    const queue = getQueue();
    if (!queue) {
      return res.status(503).json({ error: 'Redis not configured - Email Sentinel runs on backend only' });
    }

    const { action, data = {} } = req.body || {};

    switch (action) {
      case 'health-check':
        await queue.add('health-check-all', {});
        break;
      case 'health-check-single':
        await queue.add('health-check-single', { accountId: data.accountId });
        break;
      case 'warmup-progress':
        await queue.add('warmup-progression', {});
        break;
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

    res.json({ success: true, message: `Job ${action} queued` });
  } catch (error) {
    console.error('Email Sentinel trigger error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;
