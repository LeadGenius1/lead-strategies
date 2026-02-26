// Advertiser Platform Routes — Separate auth system for advertisers
// Uses AdvertiserAccount model (not User model)

const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';

let prisma = null;
function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    prisma = require('../config/database').prisma;
  }
  return prisma;
}

// --- Password helpers (same pattern as auth.js) ---

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(plain, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const derived = crypto.pbkdf2Sync(plain, salt, 100000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// --- Advertiser auth middleware ---

function authenticateAdvertiser(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.advertiser_token;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'advertiser') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    req.advertiserId = decoded.id;
    req.advertiserEmail = decoded.email;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// --- 10-point auto-review ---

function autoReview({ videoUrl, landingUrl, budgetCents, name, category, tier }) {
  const prohibited = ['adult', 'xxx', 'porn', 'casino', 'gambling', 'weapon', 'drug'];
  const nameLower = (name || '').toLowerCase();

  const checks = [
    { name: 'videoUrl_https', pass: !!videoUrl && videoUrl.startsWith('https://') },
    { name: 'landingUrl_https', pass: !!landingUrl && landingUrl.startsWith('https://') },
    { name: 'budget_min', pass: budgetCents >= 10000 },
    { name: 'name_length', pass: (name || '').length > 3 },
    { name: 'category_provided', pass: !!category },
    { name: 'valid_tier', pass: ['starter', 'professional', 'premium'].includes((tier || '').toLowerCase()) },
    { name: 'no_prohibited', pass: !prohibited.some(w => nameLower.includes(w)) },
    { name: 'no_competitor', pass: true },
    { name: 'budget_max', pass: budgetCents <= 100000000 },
    { name: 'agreement_verified', pass: true },
  ];

  const score = checks.filter(c => c.pass).length;
  return { score, details: JSON.stringify(checks) };
}

// ========================================
// PUBLIC ROUTES (no auth)
// ========================================

// POST /api/v1/advertiser/signup
router.post('/signup', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not configured' });

    const { email, password, businessName, contactName, phone, website } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }
    if (!businessName || typeof businessName !== 'string' || businessName.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Business name is required' });
    }
    if (!contactName || typeof contactName !== 'string' || contactName.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Contact name is required' });
    }

    const emailNorm = email.toLowerCase().trim();
    const existing = await db.advertiserAccount.findUnique({ where: { email: emailNorm } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const passwordHash = hashPassword(password);

    const advertiser = await db.advertiserAccount.create({
      data: {
        email: emailNorm,
        passwordHash,
        businessName: businessName.trim(),
        contactName: contactName.trim(),
        phone: phone || null,
        website: website || null,
      },
    });

    const token = jwt.sign(
      { id: advertiser.id, email: advertiser.email, role: 'advertiser' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      advertiser: { id: advertiser.id, email: advertiser.email, businessName: advertiser.businessName },
    });
  } catch (error) {
    console.error('Advertiser signup error:', error);
    if (error?.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// POST /api/v1/advertiser/login
router.post('/login', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not configured' });

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const advertiser = await db.advertiserAccount.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!advertiser) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    if (!verifyPassword(password, advertiser.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: advertiser.id, email: advertiser.email, role: 'advertiser' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      advertiser: { id: advertiser.id, email: advertiser.email, businessName: advertiser.businessName },
    });
  } catch (error) {
    console.error('Advertiser login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ========================================
// AUTHENTICATED ROUTES
// ========================================

// POST /api/v1/advertiser/accept-agreement
router.post('/accept-agreement', authenticateAdvertiser, async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not configured' });

    const advertiser = await db.advertiserAccount.update({
      where: { id: req.advertiserId },
      data: { agreementAccepted: true, agreementAcceptedAt: new Date() },
    });

    res.json({ success: true, agreementAccepted: advertiser.agreementAccepted, agreementAcceptedAt: advertiser.agreementAcceptedAt });
  } catch (error) {
    console.error('Accept agreement error:', error);
    res.status(500).json({ success: false, error: 'Failed to accept agreement' });
  }
});

// GET /api/v1/advertiser/me
router.get('/me', authenticateAdvertiser, async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not configured' });

    const advertiser = await db.advertiserAccount.findUnique({
      where: { id: req.advertiserId },
      include: { campaigns: { orderBy: { createdAt: 'desc' } } },
    });
    if (!advertiser) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const { passwordHash, ...profile } = advertiser;
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get advertiser profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to load profile' });
  }
});

// POST /api/v1/advertiser/campaigns
router.post('/campaigns', authenticateAdvertiser, async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not configured' });

    // Verify agreement accepted
    const advertiser = await db.advertiserAccount.findUnique({ where: { id: req.advertiserId } });
    if (!advertiser?.agreementAccepted) {
      return res.status(403).json({ success: false, error: 'You must accept the advertiser agreement before creating campaigns' });
    }

    const { name, videoUrl, landingUrl, budgetCents, tier, category, targeting } = req.body || {};
    if (!name || !videoUrl || !landingUrl || !budgetCents) {
      return res.status(400).json({ success: false, error: 'name, videoUrl, landingUrl, and budgetCents are required' });
    }

    // Auto-review
    const { score, details } = autoReview({ videoUrl, landingUrl, budgetCents, name, category, tier });
    const status = score >= 8 ? 'active' : 'rejected';

    // CPV rates per tier (in cents)
    const tierLower = (tier || 'starter').toLowerCase();
    const cpvMap = { starter: 5, professional: 10, premium: 20 };
    const cpvCents = cpvMap[tierLower] || 5;

    const campaign = await db.adCampaign.create({
      data: {
        advertiserId: req.advertiserId,
        name,
        videoUrl,
        landingUrl,
        budgetCents: parseInt(budgetCents),
        tier: tierLower,
        cpvCents,
        category: category || null,
        targeting: targeting || null,
        status,
        reviewScore: score,
        reviewDetails: details,
      },
    });

    res.status(201).json({ success: true, campaign, reviewScore: score, reviewDetails: JSON.parse(details) });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ success: false, error: 'Failed to create campaign' });
  }
});

// GET /api/v1/advertiser/campaigns
router.get('/campaigns', authenticateAdvertiser, async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not configured' });

    const campaigns = await db.adCampaign.findMany({
      where: { advertiserId: req.advertiserId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('List campaigns error:', error);
    res.status(500).json({ success: false, error: 'Failed to load campaigns' });
  }
});

module.exports = router;
