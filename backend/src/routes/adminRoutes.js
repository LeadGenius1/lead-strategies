// Admin Routes - FULL admin access for live execution and monitoring
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET } = require('../middleware/auth');

// Admin credentials from environment variables (NEVER hardcode)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

function getPrisma() { return require('../config/database').prisma; }

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Verify password against stored hash (salt:hash format)
function verifyPassword(plain, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, hash] = storedHash.split(':');
  const testHash = crypto.pbkdf2Sync(plain, salt, 100000, 64, 'sha512').toString('hex');
  const hashBuffer = Buffer.from(hash, 'hex');
  const testBuffer = Buffer.from(testHash, 'hex');
  if (hashBuffer.length !== testBuffer.length) return false;
  try {
    return crypto.timingSafeEqual(hashBuffer, testBuffer);
  } catch (e) {
    return false;
  }
}

// POST /admin/login or /api/admin/login - Admin authentication
// Returns real JWT so admin can execute all /api/v1/* features (Lead Hunter, Campaigns, CRM, etc.)
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Validate admin credentials from environment
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
    console.error('Admin login attempted but ADMIN_EMAIL/ADMIN_PASSWORD_HASH env vars not set');
    return res.status(503).json({
      success: false,
      message: 'Admin login not configured',
    });
  }

  if (email !== ADMIN_EMAIL || !verifyPassword(password, ADMIN_PASSWORD_HASH)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  const adminPayload = {
    id: 'admin-1',
    email: ADMIN_EMAIL,
    role: 'admin',
    name: 'Admin User',
  };

  const db = getPrisma();
  if (!db) {
    // No DB: return JWT with synthetic admin user id (works for mock mode)
    const token = jwt.sign(
      { id: 'admin-1', email: ADMIN_EMAIL, role: 'admin', tier: 5 },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({
      success: true,
      admin: adminPayload,
      token,
    });
  }

  try {
    // Find or create admin User for full /api/v1/* access (leads, campaigns, CRM, etc.)
    let user = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!user) {
      user = await db.user.create({
        data: {
          email: ADMIN_EMAIL,
          passwordHash: ADMIN_PASSWORD_HASH,
          name: 'Admin User',
          auth_provider: 'email',
          tier: 5,
          subscription_tier: 'ultralead',
          plan_tier: 'ultralead',
          is_admin: true,
        },
      });
    } else {
      // Ensure admin user has tier 5 and is_admin
      await db.user.update({
        where: { id: user.id },
        data: { tier: 5, is_admin: true, lastLoginAt: new Date() },
      });
      user = await db.user.findUnique({ where: { id: user.id } });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'admin', tier: 5 },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      admin: {
        id: user.id,
        email: user.email,
        role: 'admin',
        name: user.name || 'Admin User',
      },
      token,
    });
  } catch (err) {
    console.error('Admin login DB error:', err);
    return res.status(500).json({
      success: false,
      message: 'Admin setup failed. Check database connection.',
    });
  }
});

// GET /admin/health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', admin: true });
});

// GET /admin/stats
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 150,
      activeUsers: 85,
      totalRevenue: 12500,
      platforms: {
        leadsiteAI: { users: 45, revenue: 2205 },
        leadsiteIO: { users: 35, revenue: 1715 },
        clientcontact: { users: 28, revenue: 2212 },
        ultralead: { users: 22, revenue: 2178 },
        videosite: { users: 20, revenue: 0 }
      }
    }
  });
});

// GET /admin/users
router.get('/users', (req, res) => {
  res.json({
    success: true,
    data: { users: [], total: 0 }
  });
});

module.exports = router;
