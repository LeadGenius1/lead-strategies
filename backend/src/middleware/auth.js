// Authentication Middleware
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('WARNING: JWT_SECRET environment variable is not set. Using unsafe fallback. Set JWT_SECRET in production!');
}

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    next();
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

// Feature access by tier - Website Builder available on ALL tiers (tier difference = email volume only)
const TIER_FEATURES = {
  1: ['leads', 'campaigns', 'email', 'website_builder', 'forms'],        // LeadSite.AI / Free
  2: ['leads', 'campaigns', 'email', 'website_builder', 'forms'],        // LeadSite.IO
  3: ['leads', 'campaigns', 'email', 'website_builder', 'forms', 'inbox', 'channels', 'auto_responder'], // ClientContact.IO
  4: ['leads', 'campaigns', 'email', 'website_builder', 'forms', 'inbox', 'channels', 'auto_responder', 'video'], // VideoSite.AI
  5: ['leads', 'campaigns', 'email', 'website_builder', 'forms', 'inbox', 'channels', 'auto_responder', 'video', 'crm', 'api', 'teams'] // UltraLead
};

// Map subscription_tier / plan_tier strings to numeric tiers
const PLAN_TIER_MAP = {
  'free': 1,
  'leadsite-ai': 1,
  'leadsite-io': 2,
  'clientcontact-io': 3,
  'videosite-ai': 4,
  'ultralead': 5,
  'ultralead-ai': 5,
};

function resolveTier(user) {
  // Use numeric tier if valid
  if (user.tier >= 1 && user.tier <= 5) return user.tier;
  // Fall back to subscription_tier or plan_tier string
  const planStr = (user.subscription_tier || user.plan_tier || '').toLowerCase();
  if (planStr.includes('ultralead')) return 5;
  if (planStr.includes('videosite')) return 4;
  if (planStr.includes('clientcontact')) return 3;
  if (planStr.includes('leadsite-io')) return 2;
  if (planStr.includes('leadsite-ai')) return 1;
  return PLAN_TIER_MAP[planStr] || 1;
}

const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {

      const { prisma } = require('../config/database');

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { tier: true, subscription_tier: true, plan_tier: true }
      });

      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }

      const effectiveTier = resolveTier(user);
      const allowedFeatures = TIER_FEATURES[effectiveTier] || TIER_FEATURES[1];

      if (!allowedFeatures.includes(feature)) {
        return res.status(403).json({
          success: false,
          error: 'Feature not available',
          message: `This feature requires a higher tier plan. Upgrade to access ${feature}.`
        });
      }

      next();
    } catch (error) {
      console.error('Require feature error:', error);
      return res.status(500).json({ success: false, error: 'Feature check failed' });
    }
  };
};

// Lead limits by tier
const LEAD_LIMITS = {
  1: 50,    // LeadSite.AI
  2: 100,   // LeadSite.IO
  3: 500,   // ClientContact.IO
  4: 1000,  // VideoSite.AI
  5: 10000  // UltraLead
};

const checkLeadLimit = async (req, res, next) => {
  try {

    const { prisma } = require('../config/database');

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { tier: true, subscription_tier: true, plan_tier: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const limit = LEAD_LIMITS[resolveTier(user)] || LEAD_LIMITS[1];
    const currentCount = await prisma.lead.count({
      where: { userId: req.user.id }
    });

    if (currentCount >= limit) {
      return res.status(403).json({
        success: false,
        error: 'Lead limit reached',
        message: `Your plan allows ${limit} leads. Upgrade to add more.`,
        currentCount,
        limit
      });
    }

    req.leadLimit = limit;
    req.currentLeadCount = currentCount;
    next();
  } catch (error) {
    console.error('Check lead limit error:', error);
    return res.status(500).json({ success: false, error: 'Lead limit check failed' });
  }
};

module.exports = { authenticate, optionalAuth, requireAdmin, requireFeature, checkLeadLimit, JWT_SECRET };
