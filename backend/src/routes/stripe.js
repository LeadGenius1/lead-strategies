// Stripe Routes
const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (STRIPE_SECRET_KEY) {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
}

// Lazy-load Prisma only when DATABASE_URL is available
let prisma = null;
function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

// POST /api/v1/stripe/create-checkout
router.post('/create-checkout', authenticate, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, error: 'Stripe not configured' });
    }

    const db = getPrisma();
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { priceId, successUrl, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ success: false, error: 'priceId is required' });
    }

    // Look up user to find or create Stripe customer
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, stripeCustomerId: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let stripeCustomerId = user.stripeCustomerId;

    // Create Stripe customer if one doesn't exist yet
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id }
      });
      stripeCustomerId = customer.id;

      // Persist the Stripe customer ID on the user record
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId }
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${process.env.FRONTEND_URL || 'https://aileadstrategies.com'}/dashboard?checkout=success`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'https://aileadstrategies.com'}/pricing?checkout=canceled`,
      metadata: {
        userId: user.id
      },
      subscription_data: {
        metadata: {
          userId: user.id
        }
      }
    });

    res.json({ success: true, data: { url: session.url, sessionId: session.id } });
  } catch (error) {
    console.error('Stripe create-checkout error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/stripe/create-portal
router.post('/create-portal', authenticate, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, error: 'Stripe not configured' });
    }

    const db = getPrisma();
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    // Look up the logged-in user's Stripe customer ID — never trust the client
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: { stripeCustomerId: true }
    });

    if (!user?.stripeCustomerId) {
      return res.status(400).json({ success: false, error: 'No billing account found. Please subscribe to a plan first.' });
    }

    const { returnUrl } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl || `${process.env.FRONTEND_URL || 'https://aileadstrategies.com'}/dashboard`
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (error) {
    console.error('Stripe create-portal error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
