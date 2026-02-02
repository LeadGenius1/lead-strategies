// Payouts Routes (VideoSite.AI Earnings)
const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Mock data for development
const mockBalance = {
  available: 214.00,
  pending: 45.50,
  lifetime: 1250.00
};

const mockPayouts = [
  { id: '1', amount: 150.00, status: 'completed', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: '2', amount: 200.00, status: 'completed', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) },
  { id: '3', amount: 75.00, status: 'pending', createdAt: new Date(), completedAt: null },
];

router.use(authenticate);

// GET /api/v1/payouts/balance - Get current balance
router.get('/balance', async (req, res) => {
  res.json({
    success: true,
    data: mockBalance
  });
});

// GET /api/v1/payouts/history - Get payout history
router.get('/history', async (req, res) => {
  res.json({
    success: true,
    data: { payouts: mockPayouts }
  });
});

// GET /api/v1/payouts/connect - Check Stripe Connect status
router.get('/connect', async (req, res) => {
  res.json({
    success: true,
    data: {
      connected: false,
      onboardingUrl: null
    }
  });
});

// POST /api/v1/payouts/request - Request a payout
router.post('/request', async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid amount' });
  }

  if (amount > mockBalance.available) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' });
  }

  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      amount,
      status: 'pending',
      createdAt: new Date()
    }
  });
});

module.exports = router;
