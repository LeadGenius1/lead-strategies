const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Panel definitions (mirrors frontend lib/nexusFeatures.js)
const NEXUS_PANELS = [
  { id: 'feed',      name: 'Feed',      minTier: 0 },
  { id: 'strategy',  name: 'Strategy',  minTier: 0 },
  { id: 'outreach',  name: 'Outreach',  minTier: 0 },
  { id: 'prospects', name: 'Prospects', minTier: 1 },
  { id: 'websites',  name: 'Websites',  minTier: 2 },
  { id: 'videos',    name: 'Videos',    minTier: 4 },
  { id: 'settings',  name: 'Settings',  minTier: 0 },
];

const TIER_PLAN_NAMES = {
  1: 'LeadSite.AI',
  2: 'LeadSite.IO',
  3: 'ClientContact',
  4: 'VideoSite.AI',
  5: 'UltraLead',
};

/**
 * GET /api/v1/nexus/features
 * Returns the user's tier, plan name, and which panels are available/locked.
 */
router.get('/features', authenticate, (req, res) => {
  const tier = Number(req.user?.tier) || 0;
  const planName = TIER_PLAN_NAMES[tier] || 'Free';

  const panels = NEXUS_PANELS.map((p) => ({
    ...p,
    available: tier >= p.minTier,
    locked: tier < p.minTier,
  }));

  res.json({
    tier,
    planName,
    panels,
    upgradeMessage: tier < 5 ? 'Upgrade to UltraLead ($499/mo) to unlock all features' : null,
  });
});

module.exports = router;
