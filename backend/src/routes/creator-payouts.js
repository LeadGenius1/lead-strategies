// Creator Payout Routes — Multi-method payouts (Stripe Connect / PayPal / Platform Credits)
const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

let prisma = null;
function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) prisma = require('../config/database').prisma;
  return prisma;
}

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const MIN_PAYOUT_CENTS = 1000; // $10.00

// Normalize user ID from JWT
function userId(req) {
  return req.user?.id ?? req.user?.sub ?? req.user?.userId;
}

// ──────────────────────────────────────────
// CREATOR ROUTES
// ──────────────────────────────────────────

// GET /api/v1/creator/payout/earnings
router.get('/creator/payout/earnings', authenticate, async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.json({ success: true, data: { totalEarned: 0, totalPaid: 0, pendingPayout: 0, availableBalance: 0, recentEarnings: [] } });

    const uid = userId(req);

    const [unpaidSum, paidSum, pendingPayouts, recent] = await Promise.all([
      db.$queryRaw`SELECT COALESCE(SUM(earned_cents), 0)::int AS total FROM creator_earnings WHERE creator_id = ${uid} AND paid = false`,
      db.$queryRaw`SELECT COALESCE(SUM(earned_cents), 0)::int AS total FROM creator_earnings WHERE creator_id = ${uid} AND paid = true`,
      db.$queryRaw`SELECT COALESCE(SUM(amount_cents), 0)::int AS total FROM creator_payouts WHERE creator_id = ${uid} AND status IN ('pending', 'processing')`,
      db.$queryRaw`
        SELECT ce.id, ce.earned_cents, ce.qualified_at, ce.paid, v.title AS video_title
        FROM creator_earnings ce
        LEFT JOIN videos v ON v.id = ce.video_id
        WHERE ce.creator_id = ${uid}
        ORDER BY ce.qualified_at DESC
        LIMIT 20
      `,
    ]);

    const unpaid = Number(unpaidSum[0]?.total || 0);
    const paid = Number(paidSum[0]?.total || 0);
    const pending = Number(pendingPayouts[0]?.total || 0);

    res.json({
      success: true,
      data: {
        totalEarned: unpaid + paid,
        totalPaid: paid,
        pendingPayout: pending,
        availableBalance: unpaid,
        minPayoutCents: MIN_PAYOUT_CENTS,
        recentEarnings: recent.map(e => ({
          id: e.id,
          earnedCents: e.earned_cents,
          qualifiedAt: e.qualified_at,
          paid: e.paid,
          videoTitle: e.video_title,
        })),
      },
    });
  } catch (error) {
    console.error('Creator earnings error:', error);
    res.status(500).json({ success: false, error: 'Failed to load earnings' });
  }
});

// GET /api/v1/creator/payout/history
router.get('/creator/payout/history', authenticate, async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.json({ success: true, data: { payouts: [] } });

    const uid = userId(req);
    const payouts = await db.$queryRaw`
      SELECT id, amount_cents, method, status, notes, requested_at, processed_at, created_at
      FROM creator_payouts
      WHERE creator_id = ${uid}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    res.json({
      success: true,
      data: {
        payouts: payouts.map(p => ({
          id: p.id,
          amountCents: p.amount_cents,
          method: p.method,
          status: p.status,
          notes: p.notes,
          requestedAt: p.requested_at,
          processedAt: p.processed_at,
        })),
      },
    });
  } catch (error) {
    console.error('Payout history error:', error);
    res.status(500).json({ success: false, error: 'Failed to load payout history' });
  }
});

// POST /api/v1/creator/payout/request
router.post('/creator/payout/request', authenticate, async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not available' });

    const uid = userId(req);
    const { method, paypalEmail } = req.body;

    if (!method || !['stripe_connect', 'paypal', 'platform_credits'].includes(method)) {
      return res.status(400).json({ success: false, error: 'Invalid payout method. Must be stripe_connect, paypal, or platform_credits' });
    }

    if (method === 'paypal' && !paypalEmail) {
      return res.status(400).json({ success: false, error: 'PayPal email is required for PayPal payouts' });
    }

    // Check for existing pending/processing payout
    const existing = await db.$queryRaw`
      SELECT id FROM creator_payouts WHERE creator_id = ${uid} AND status IN ('pending', 'processing') LIMIT 1
    `;
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'You already have a pending payout request' });
    }

    // Calculate available balance
    const balanceResult = await db.$queryRaw`
      SELECT COALESCE(SUM(earned_cents), 0)::int AS total FROM creator_earnings WHERE creator_id = ${uid} AND paid = false
    `;
    const availableCents = Number(balanceResult[0]?.total || 0);

    if (availableCents < MIN_PAYOUT_CENTS) {
      return res.status(400).json({
        success: false,
        error: `Minimum payout is $${(MIN_PAYOUT_CENTS / 100).toFixed(2)}. Your available balance is $${(availableCents / 100).toFixed(2)}.`,
      });
    }

    // Create payout request
    const payoutResult = await db.$queryRaw`
      INSERT INTO creator_payouts (creator_id, amount_cents, method, paypal_email, status, requested_at)
      VALUES (${uid}, ${availableCents}, ${method}, ${paypalEmail || null}, 'pending', NOW())
      RETURNING id, amount_cents, method, status, requested_at
    `;

    const payout = payoutResult[0];

    res.json({
      success: true,
      data: {
        requestId: payout.id,
        amountCents: payout.amount_cents,
        method: payout.method,
        status: payout.status,
      },
    });
  } catch (error) {
    console.error('Payout request error:', error);
    res.status(500).json({ success: false, error: 'Failed to create payout request' });
  }
});

// ──────────────────────────────────────────
// ADMIN ROUTES
// ──────────────────────────────────────────

// GET /api/v1/admin/payouts/pending
router.get('/admin/payouts/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.json({ success: true, data: { payouts: [] } });

    const payouts = await db.$queryRaw`
      SELECT cp.*, u.email AS creator_email, u.name AS creator_name, u.stripe_account_id
      FROM creator_payouts cp
      JOIN users u ON u.id = cp.creator_id
      WHERE cp.status IN ('pending', 'processing')
      ORDER BY cp.requested_at ASC
    `;

    res.json({
      success: true,
      data: {
        payouts: payouts.map(p => ({
          id: p.id,
          creatorId: p.creator_id,
          creatorEmail: p.creator_email,
          creatorName: p.creator_name,
          amountCents: p.amount_cents,
          method: p.method,
          paypalEmail: p.paypal_email,
          status: p.status,
          stripeAccountId: p.stripe_account_id,
          requestedAt: p.requested_at,
          notes: p.notes,
        })),
      },
    });
  } catch (error) {
    console.error('Admin pending payouts error:', error);
    res.status(500).json({ success: false, error: 'Failed to load pending payouts' });
  }
});

// POST /api/v1/admin/payouts/approve
router.post('/admin/payouts/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not available' });

    const { payoutId, notes } = req.body;
    if (!payoutId) return res.status(400).json({ success: false, error: 'payoutId is required' });

    // Get payout
    const payoutResult = await db.$queryRaw`
      SELECT cp.*, u.stripe_account_id
      FROM creator_payouts cp
      JOIN users u ON u.id = cp.creator_id
      WHERE cp.id = ${payoutId} AND cp.status = 'pending'
    `;

    if (payoutResult.length === 0) {
      return res.status(404).json({ success: false, error: 'Payout not found or already processed' });
    }

    const payout = payoutResult[0];
    let updateFields = { status: 'processing', notes: notes || null };

    // Process based on method
    if (payout.method === 'stripe_connect') {
      if (!stripe) return res.status(503).json({ success: false, error: 'Stripe not configured' });
      if (!payout.stripe_account_id) return res.status(400).json({ success: false, error: 'Creator has no Stripe Connect account' });

      const transfer = await stripe.transfers.create({
        amount: payout.amount_cents,
        currency: 'usd',
        destination: payout.stripe_account_id,
        metadata: { payoutId: payout.id, creatorId: payout.creator_id },
      });

      await db.$executeRaw`
        UPDATE creator_payouts
        SET status = 'completed', stripe_transfer_id = ${transfer.id}, notes = ${notes || null}, processed_at = NOW()
        WHERE id = ${payoutId}
      `;
      updateFields.status = 'completed';
    } else if (payout.method === 'paypal') {
      // PayPal: mark as processing for manual transfer
      await db.$executeRaw`
        UPDATE creator_payouts
        SET status = 'processing', notes = ${notes || 'Queued for PayPal transfer'}
        WHERE id = ${payoutId}
      `;
    } else if (payout.method === 'platform_credits') {
      // Apply credits to user balance
      await db.$executeRaw`
        UPDATE users SET balance_available = COALESCE(balance_available, 0) + ${payout.amount_cents / 100.0}
        WHERE id = ${payout.creator_id}
      `;
      await db.$executeRaw`
        UPDATE creator_payouts
        SET status = 'completed', platform_credits_granted = true, notes = ${notes || 'Credits applied'}, processed_at = NOW()
        WHERE id = ${payoutId}
      `;
      updateFields.status = 'completed';
    }

    // Mark earnings as paid
    if (updateFields.status === 'completed') {
      await db.$executeRaw`
        UPDATE creator_earnings SET paid = true, payout_id = ${payoutId}
        WHERE creator_id = ${payout.creator_id} AND paid = false
      `;
    }

    res.json({ success: true, data: { payoutId, status: updateFields.status, method: payout.method } });
  } catch (error) {
    console.error('Admin approve payout error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to approve payout' });
  }
});

// POST /api/v1/admin/payouts/reject
router.post('/admin/payouts/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not available' });

    const { payoutId, notes } = req.body;
    if (!payoutId) return res.status(400).json({ success: false, error: 'payoutId is required' });

    await db.$executeRaw`
      UPDATE creator_payouts SET status = 'rejected', notes = ${notes || 'Rejected by admin'}, processed_at = NOW()
      WHERE id = ${payoutId} AND status IN ('pending', 'processing')
    `;

    res.json({ success: true, data: { payoutId, status: 'rejected' } });
  } catch (error) {
    console.error('Admin reject payout error:', error);
    res.status(500).json({ success: false, error: 'Failed to reject payout' });
  }
});

module.exports = router;
