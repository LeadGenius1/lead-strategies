// Auth Routes
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validateBody, schemas } = require('../middleware/validate');

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';

// Lazy-load Prisma
let prisma = null;
function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {

    prisma = require('../config/database').prisma;
  }
  return prisma;
}

// POST /api/auth/oauth/callback - Exchange OAuth code for JWT (Google, etc.)
router.post('/oauth/callback', async (req, res) => {
  try {
    const { provider, code, redirectUri, tier } = req.body || {};

    if (!code || !redirectUri) {
      return res.status(400).json({ success: false, error: 'Missing code or redirectUri' });
    }

    const prov = (provider || 'google').toLowerCase();
    if (prov !== 'google') {
      return res.status(400).json({ success: false, error: 'Only Google OAuth is supported' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return res.status(503).json({ success: false, error: 'Google OAuth is not configured' });
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Google token exchange failed:', errText);
      return res.status(400).json({ success: false, error: 'Invalid or expired authorization code' });
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;
    if (!accessToken) {
      return res.status(400).json({ success: false, error: 'No access token received from Google' });
    }

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return res.status(400).json({ success: false, error: 'Failed to fetch user info from Google' });
    }

    const googleUser = await userRes.json();
    const email = googleUser.email;
    const googleId = googleUser.id;
    const name = googleUser.name || googleUser.given_name || email?.split('@')[0] || 'User';
    const picture = googleUser.picture;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email not provided by Google' });
    }

    const db = getPrisma();
    const tierStr = (tier || 'leadsite-ai').toString().toLowerCase().replace(/_/g, '-');
    const subscriptionTier = tierStr || 'leadsite-ai';

    if (!db) {
      // No DB: return JWT with mock user (dev fallback)
      const id = 'oauth_' + (googleId || crypto.randomBytes(12).toString('hex'));
      const token = jwt.sign(
        { id, email, name, role: 'user', tier: subscriptionTier },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        token,
        user: { id, email, name, subscription_tier: subscriptionTier, avatar_url: picture },
      });
    }

    // Find or create user
    let user = await db.user.findFirst({
      where: {
        OR: [
          { google_id: googleId },
          { email },
        ],
      },
    });

    const oauthPasswordHash = crypto.createHash('sha256').update(`oauth:${googleId}:${JWT_SECRET}`).digest('hex');

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          passwordHash: oauthPasswordHash,
          name,
          google_id: googleId,
          auth_provider: 'google',
          profile_picture: picture,
          email_verified: true,
          subscription_tier: subscriptionTier,
          plan_tier: subscriptionTier,
        },
      });
    } else {
      // Update existing user with Google link if needed
      await db.user.update({
        where: { id: user.id },
        data: {
          google_id: googleId,
          auth_provider: user.auth_provider || 'google',
          name: user.name || name,
          profile_picture: user.profile_picture || picture,
          email_verified: true,
          lastLoginAt: new Date(),
          ...(tierStr && { subscription_tier: subscriptionTier, plan_tier: subscriptionTier }),
        },
      });
      user = await db.user.findUnique({ where: { id: user.id } });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'user', tier: user.subscription_tier || subscriptionTier },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription_tier: user.subscription_tier || subscriptionTier,
        avatar_url: user.profile_picture || picture,
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ success: false, error: error.message || 'Authentication failed' });
  }
});

// Signup handler (shared by /signup and /register)
async function handleSignup(req, res) {
  const { email, password, name, company, tier, businessInfo } = req.body || {};
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
  }
  const tierStr = (tier || 'leadsite-ai').toString().toLowerCase().replace(/_/g, '-');
  const subscriptionTier = tierStr || 'leadsite-ai';
  // Map tier string to numeric (1-5) for User.tier
  let tierNum = 1;
  if (subscriptionTier.includes('leadsite-ai')) tierNum = 1;
  else if (subscriptionTier.includes('leadsite-io')) tierNum = 2;
  else if (subscriptionTier.includes('clientcontact')) tierNum = 3;
  else if (subscriptionTier.includes('videosite')) tierNum = 4;
  else if (subscriptionTier.includes('ultralead')) tierNum = 5;
  const db = getPrisma();
  if (!db) {
    const id = 'user_' + crypto.randomBytes(12).toString('hex');
    const token = jwt.sign(
      { id, email, name: name || email.split('@')[0], role: 'user', tier: subscriptionTier },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.status(201).json({
      success: true,
      token,
      data: { user: { id, email, name: name || email.split('@')[0], subscription_tier: subscriptionTier } },
    });
  }
  const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    return res.status(400).json({ success: false, error: 'An account with this email already exists' });
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  const storedHash = `${salt}:${passwordHash}`;
  let metadataVal = null;
  if (businessInfo && typeof businessInfo === 'object') {
    try {
      metadataVal = JSON.parse(JSON.stringify({ businessInfo }));
    } catch (_) {
      metadataVal = null;
    }
  }
  const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const user = await db.user.create({
    data: {
      email: email.toLowerCase().trim(),
      passwordHash: storedHash,
      name: (name && typeof name === 'string') ? name.trim() : email.split('@')[0],
      company: (company && typeof company === 'string') ? company.trim() || null : null,
      auth_provider: 'email',
      tier: tierNum,
      subscription_tier: subscriptionTier,
      plan_tier: subscriptionTier,
      metadata: metadataVal,
      trialEndsAt: trialEndDate,
      trial_start_date: new Date(),
      trial_end_date: trialEndDate,
      subscriptionStatus: 'trial',
    },
  });
  const token = jwt.sign(
    { id: user.id, email: user.email, role: 'user', tier: user.subscription_tier || subscriptionTier },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.status(201).json({
    success: true,
    token,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription_tier: user.subscription_tier || subscriptionTier,
        company: user.company,
      },
    },
  });
}

// POST /api/v1/auth/signup - Primary registration endpoint (frontend calls this)
router.post('/signup', validateBody(schemas.signup), async (req, res) => {
  try {
    await handleSignup(req, res);
  } catch (error) {
    console.error('Signup error:', error?.code || error?.name, error?.message);
    // Prisma P2002 = unique constraint (email exists) - return 400, not 500
    if (error?.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }
    // Prisma P2003 = foreign key - schema/data issue
    if (error?.code === 'P2003' || error?.code === 'P2011') {
      return res.status(400).json({ success: false, error: 'Invalid data. Please check your form and try again.' });
    }
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

// POST /api/v1/auth/register - Alias for /signup
router.post('/register', validateBody(schemas.signup), async (req, res) => {
  try {
    await handleSignup(req, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: error.message || 'Registration failed' });
  }
});

// Helper: verify pbkdf2 password
function verifyPassword(plainPassword, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, hash] = storedHash.split(':');
  const derived = crypto.pbkdf2Sync(plainPassword, salt, 100000, 64, 'sha512').toString('hex');
  return derived === hash;
}

// POST /api/v1/auth/login
router.post('/login', validateBody(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const db = getPrisma();
    if (!db) {
      const token = jwt.sign(
        { id: 'user_1', email, role: 'user' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ success: true, token, data: { user: { id: 'user_1', email } } });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    if (user.auth_provider === 'google') {
      return res.status(400).json({ success: false, error: 'Please sign in with Google' });
    }
    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'user', tier: user.subscription_tier || 'leadsite-ai' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      token,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription_tier: user.subscription_tier || 'leadsite-ai',
          company: user.company,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/auth/register - Alias for /signup
router.post('/register', (req, res, next) => {
  const signupRoute = router.stack.find(r => r.route?.path === '/signup' && r.route?.methods?.post);
  if (signupRoute) signupRoute.route.stack[0].handle(req, res, next);
  else next();
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

// GET /api/auth/me or /api/v1/auth/me - Get current authenticated user from JWT
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ||
      req.cookies?.token ||
      (req.body && req.body.token);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        data: { user: null }
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    const db = getPrisma();
    if (!db) {
      return res.json({
        success: true,
        data: {
          user: {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            subscription_tier: decoded.tier || 'leadsite-ai',
            avatar_url: decoded.picture
          }
        }
      });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profile_picture: true,
        avatar_url: true,
        subscription_tier: true,
        plan_tier: true,
        tier: true,
        company: true,
        trialEndsAt: true,
        subscriptionStatus: true,
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        data: { user: null }
      });
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      subscription_tier: user.subscription_tier || user.plan_tier || 'leadsite-ai',
      plan_tier: user.plan_tier || user.subscription_tier || 'leadsite-ai',
      avatar_url: user.avatar_url || user.profile_picture,
      company: user.company,
      tier: user.tier,
      trialEndsAt: user.trialEndsAt,
      subscriptionStatus: user.subscriptionStatus,
    };

    res.json({
      success: true,
      data: { user: userData }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        data: { user: null }
      });
    }
    console.error('Auth /me error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication check failed',
      data: { user: null }
    });
  }
});

module.exports = router;
