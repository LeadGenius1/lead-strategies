// Webhook Routes
const express = require('express');
const router = express.Router();

let prisma = null;
function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {

    prisma = require('../config/database').prisma;
  }
  return prisma;
}

// POST /api/v1/webhooks/stripe (raw body applied in index.js)
router.post('/stripe', async (req, res) => {
  const Stripe = require('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    let event;

    // Verify webhook signature (REQUIRED in production)
    if (!endpointSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not set — rejecting webhook');
      return res.status(503).json({ error: 'Webhook verification not configured' });
    }

    const sig = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Stripe webhook signature verify failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    const db = getPrisma();
    if (!db) {
      console.error('Stripe webhook: database not available');
      return res.status(500).json({ error: 'Database not available' });
    }

    console.log(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      // ── Subscription checkout completed ──────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') break;

        const userId = session.metadata?.userId;
        if (!userId) {
          console.warn('checkout.session.completed: no userId in metadata');
          break;
        }

        await db.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            subscriptionStatus: 'active',
            trialEndsAt: null
          }
        });
        console.log(`User ${userId} subscription activated (sub: ${session.subscription})`);
        break;
      }

      // ── Subscription updated (plan change, renewal, etc.) ───────
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        const statusMap = {
          active: 'active',
          past_due: 'past_due',
          unpaid: 'unpaid',
          trialing: 'trial',
          paused: 'paused'
        };

        await db.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: statusMap[subscription.status] || subscription.status,
            stripeSubscriptionId: subscription.id
          }
        });
        console.log(`User ${userId} subscription updated to ${subscription.status}`);
        break;
      }

      // ── Subscription canceled / expired ─────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        await db.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'canceled',
            stripeSubscriptionId: null
          }
        });
        console.log(`User ${userId} subscription canceled`);
        break;
      }

      // ── Invoice payment failed ──────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        if (!subId) break;

        // Find user by their stored subscription ID
        const user = await db.user.findFirst({
          where: { stripeSubscriptionId: subId },
          select: { id: true }
        });

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: { subscriptionStatus: 'past_due' }
          });
          console.log(`User ${user.id} payment failed (invoice: ${invoice.id})`);
        }
        break;
      }

      // ── VideoSite payout transfers (existing) ───────────────────
      case 'transfer.paid': {
        const transfer = event.data.object;
        await db.payout.updateMany({
          where: { stripeTransferId: transfer.id },
          data: { status: 'completed', error: null }
        });
        break;
      }

      case 'transfer.failed': {
        const transfer = event.data.object;
        await db.payout.updateMany({
          where: { stripeTransferId: transfer.id },
          data: { status: 'failed', error: transfer.failure_message || 'Transfer failed' }
        });
        break;
      }

      default:
        console.log(`Stripe webhook unhandled event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/webhooks/instantly
// Secured via shared secret in query param or header
router.post('/instantly', async (req, res) => {
  try {
    const secret = process.env.INSTANTLY_WEBHOOK_SECRET;
    if (secret) {
      const provided = req.query.secret || req.headers['x-webhook-secret'];
      if (provided !== secret) {
        console.warn('Instantly webhook: invalid secret');
        return res.status(401).json({ error: 'Invalid webhook secret' });
      }
    }
    const event = req.body;
    console.log(JSON.stringify({ level: 'info', msg: 'Instantly webhook received', type: event.type, timestamp: new Date().toISOString() }));
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/webhooks/twilio
// Secured via Twilio signature validation
router.post('/twilio', async (req, res) => {
  try {
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (authToken) {
      const twilioSig = req.headers['x-twilio-signature'];
      if (!twilioSig) {
        console.warn('Twilio webhook: missing signature');
        return res.status(401).json({ error: 'Missing Twilio signature' });
      }
      // Twilio signature validation
      const crypto = require('crypto');
      const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const params = req.body || {};
      const data = url + Object.keys(params).sort().reduce((acc, key) => acc + key + params[key], '');
      const expected = crypto.createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64');
      if (twilioSig !== expected) {
        console.warn('Twilio webhook: invalid signature');
        return res.status(401).json({ error: 'Invalid Twilio signature' });
      }
    }
    console.log(JSON.stringify({ level: 'info', msg: 'Twilio webhook received', timestamp: new Date().toISOString() }));
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
