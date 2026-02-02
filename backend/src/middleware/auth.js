// Authentication Middleware
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';

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

// Feature access by tier
const TIER_FEATURES = {
  1: ['leads', 'campaigns', 'email'],                                    // LeadSite.AI
  2: ['leads', 'campaigns', 'email', 'website_builder', 'forms'],        // LeadSite.IO
  3: ['leads', 'campaigns', 'email', 'website_builder', 'forms', 'inbox', 'channels', 'auto_responder'], // ClientContact.IO
  4: ['leads', 'campaigns', 'email', 'website_builder', 'forms', 'inbox', 'channels', 'auto_responder', 'video'], // VideoSite.IO
  5: ['leads', 'campaigns', 'email', 'website_builder', 'forms', 'inbox', 'channels', 'auto_responder', 'video', 'crm', 'api', 'teams'] // UltraLead
};

const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { tier: true }
      });

      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }

      const allowedFeatures = TIER_FEATURES[user.tier] || TIER_FEATURES[1];

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
      next();
    }
  };
};

// Lead limits by tier
const LEAD_LIMITS = {
  1: 50,    // LeadSite.AI
  2: 100,   // LeadSite.IO
  3: 500,   // ClientContact.IO
  4: 1000,  // VideoSite.IO
  5: 10000  // UltraLead
};

const checkLeadLimit = async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { tier: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const limit = LEAD_LIMITS[user.tier] || LEAD_LIMITS[1];
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
    next();
  }
};

module.exports = { authenticate, optionalAuth, requireAdmin, requireFeature, checkLeadLimit, JWT_SECRET };
