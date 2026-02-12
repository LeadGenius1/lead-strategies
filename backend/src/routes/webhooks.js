// Webhook Routes
const express = require('express');
const router = express.Router();

let prisma = null;
function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

// POST /api/v1/webhooks/stripe (raw body applied in index.js)
router.post('/stripe', async (req, res) => {
  const Stripe = require('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    let event = req.body;
    if (endpointSecret && typeof req.body === 'object' && !req.body.id) {
      const sig = req.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error('Stripe webhook signature verify failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }
    }

    const db = getPrisma();
    if (event.type === 'transfer.paid' && db) {
      const transfer = event.data.object;
      await db.payout.updateMany({
        where: { stripeTransferId: transfer.id },
        data: { status: 'completed', error: null }
      });
    } else if (event.type === 'transfer.failed' && db) {
      const transfer = event.data.object;
      await db.payout.updateMany({
        where: { stripeTransferId: transfer.id },
        data: { status: 'failed', error: transfer.failure_message || 'Transfer failed' }
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
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
