// Payouts Routes (VideoSite.AI Earnings) - Real Prisma + Stripe Connect
const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

let prisma = null;
function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = require('../config/database').prisma;
  }
  return prisma;
}

const MIN_PAYOUT = 10.0;
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

router.use(authenticate);

// Normalize user ID
router.use((req, res, next) => {
  req.userId = req.user?.id ?? req.user?.sub ?? req.user?.userId;
  next();
});

// GET /api/v1/payouts/balance
router.get('/balance', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({ success: true, data: { available: 0, pending: 0, paid: 0, lifetime: 0 } });
    }

    const [pendingSum, paidSum, totalSum] = await Promise.all([
      db.creatorEarning.aggregate({
        where: { userId: req.userId, status: 'pending' },
        _sum: { amount: true }
      }),
      db.creatorEarning.aggregate({
        where: { userId: req.userId, status: 'paid' },
        _sum: { amount: true }
      }),
      db.creatorEarning.aggregate({
        where: { userId: req.userId },
        _sum: { amount: true }
      })
    ]);

    const pending = Number(pendingSum._sum?.amount || 0);
    const paid = Number(paidSum._sum?.amount || 0);
    const lifetime = Number(totalSum._sum?.amount || 0);

    res.json({
      success: true,
      data: { available: pending, pending, paid, lifetime }
    });
  } catch (error) {
    console.error('Payouts balance error:', error);
    res.status(500).json({ success: false, error: 'Failed to get balance', data: null });
  }
});

// GET /api/v1/payouts/history
router.get('/history', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({ success: true, data: { payouts: [] } });
    }

    const payouts = await db.payout.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        processedAt: true
      }
    });

    res.json({ success: true, data: { payouts } });
  } catch (error) {
    console.error('Payouts history error:', error);
    res.status(500).json({ success: false, error: 'Failed to get history', data: null });
  }
});

// GET /api/v1/payouts/connect - Stripe Connect status
router.get('/connect', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({ success: true, data: { connected: false, onboardingUrl: null } });
    }

    const user = await db.user.findUnique({
      where: { id: req.userId },
      select: { stripeAccountId: true }
    });

    if (!user?.stripeAccountId) {
      return res.json({ success: true, data: { connected: false, onboardingUrl: null } });
    }

    if (!stripe) {
      return res.json({ success: true, data: { connected: true, onboardingUrl: null, stripeNotConfigured: true } });
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    const needsOnboarding = !account.details_submitted;

    res.json({
      success: true,
      data: {
        connected: true,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        onboardingUrl: needsOnboarding ? null : undefined
      }
    });
  } catch (error) {
    res.json({ success: true, data: { connected: false, onboardingUrl: null } });
  }
});

// POST /api/v1/payouts/request
router.post('/request', async (req, res) => {
  try {
    const { amount } = req.body;
    const db = getPrisma();

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount', data: null });
    }

    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available', data: null });
    }

    const user = await db.user.findUnique({
      where: { id: req.userId },
      select: { stripeAccountId: true }
    });

    if (!user?.stripeAccountId) {
      return res.status(400).json({
        success: false,
        error: 'Please connect your Stripe account first (VideoSite > Payouts)',
        data: null
      });
    }

    const pendingSum = await db.creatorEarning.aggregate({
      where: { userId: req.userId, status: 'pending' },
      _sum: { amount: true }
    });
    const available = Number(pendingSum._sum?.amount || 0);

    if (amount > available) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Available: $${available.toFixed(2)}`,
        data: null
      });
    }

    if (amount < MIN_PAYOUT) {
      return res.status(400).json({
        success: false,
        error: `Minimum payout is $${MIN_PAYOUT}`,
        data: null
      });
    }

    // For simplicity: only allow full balance payout (avoid partial earning allocation)
    if (Math.abs(amount - available) > 0.01) {
      return res.status(400).json({
        success: false,
        error: `Please request the full available balance ($${available.toFixed(2)})`,
        data: null
      });
    }

    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Stripe not configured',
        data: null
      });
    }

    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      destination: user.stripeAccountId,
      metadata: { userId: req.userId }
    });

    const payout = await db.payout.create({
      data: {
        userId: req.userId,
        amount,
        status: 'processing',
        stripeAccountId: user.stripeAccountId,
        stripeTransferId: transfer.id
      }
    });

    await db.creatorEarning.updateMany({
      where: { userId: req.userId, status: 'pending' },
      data: { status: 'paid', payoutId: payout.id }
    });

    res.json({
      success: true,
      data: {
        id: payout.id,
        amount,
        status: 'processing',
        createdAt: payout.createdAt
      }
    });
  } catch (error) {
    console.error('Payout request error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to process payout', data: null });
  }
});

module.exports = router;
