// Admin Routes
const express = require('express');
const router = express.Router();

// POST /admin/login or /api/admin/login - Admin authentication
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }
  // Default admin fallback (change password after first login)
  if (email === 'admin@aileadstrategies.com' && password === 'YourSecurePassword123!') {
    return res.json({
      success: true,
      admin: {
        id: 'admin-1',
        email: 'admin@aileadstrategies.com',
        role: 'super_admin',
        name: 'Admin User',
      },
      token: 'admin-token-placeholder-' + Date.now(),
    });
  }
  return res.status(401).json({
    success: false,
    message: 'Invalid email or password',
  });
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
