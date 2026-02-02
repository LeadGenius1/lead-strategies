// Webhook Routes
const express = require('express');
const router = express.Router();

// POST /api/v1/webhooks/stripe
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    // Process Stripe webhook
    console.log('Stripe webhook received');
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/webhooks/instantly
router.post('/instantly', async (req, res) => {
  try {
    const event = req.body;
    console.log('Instantly webhook:', event.type);
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/webhooks/twilio
router.post('/twilio', async (req, res) => {
  try {
    console.log('Twilio webhook received');
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
