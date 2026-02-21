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

    // Verify webhook signature (req.body is a Buffer from express.raw())
    if (endpointSecret) {
      const sig = req.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error('Stripe webhook signature verify failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }
    } else {
      // No secret configured — parse the raw body (dev/testing only)
      event = JSON.parse(req.body.toString());
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
