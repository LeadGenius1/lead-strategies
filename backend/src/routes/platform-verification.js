const express = require('express');
const router = express.Router();
const platformTester = require('../services/platform-tester');
const { ENABLE_PLATFORM_VERIFICATION } = require('../config/feature-flags');

router.post('/verify-platform', async (req, res) => {
  if (!ENABLE_PLATFORM_VERIFICATION) {
    return res.status(503).json({
      success: false,
      error: 'Platform verification is disabled'
    });
  }

  try {
    const { platform } = req.body;

    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform parameter is required'
      });
    }

    console.log(`[Platform Verification API] Testing platform: ${platform}`);
    const results = await platformTester.testPlatform(platform);

    res.json({
      success: true,
      platform,
      ...results
    });
  } catch (error) {
    console.error('[Platform Verification API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/verify-all', async (req, res) => {
  if (!ENABLE_PLATFORM_VERIFICATION) {
    return res.status(503).json({
      success: false,
      error: 'Platform verification is disabled'
    });
  }

  try {
    console.log('[Platform Verification API] Testing all platforms...');
    const results = await platformTester.testAllPlatforms();

    let totalFeatures = 0;
    let totalTested = 0;
    let totalWorking = 0;
    let totalBroken = 0;

    Object.values(results).forEach(platform => {
      totalFeatures += platform.total;
      totalTested += platform.tested;
      totalWorking += platform.working;
      totalBroken += platform.broken;
    });

    const percentage = Math.round((totalWorking / totalFeatures) * 100);

    res.json({
      success: true,
      results,
      summary: {
        totalFeatures,
        totalTested,
        totalWorking,
        totalBroken,
        percentage
      }
    });
  } catch (error) {
    console.error('[Platform Verification API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/verification-status', async (req, res) => {
  if (!ENABLE_PLATFORM_VERIFICATION) {
    return res.status(503).json({
      success: false,
      error: 'Platform verification is disabled'
    });
  }

  try {
    res.json({
      success: true,
      status: 'ready',
      platforms: {
        'leadsite-io': { total: 5, tested: 0, working: 0, broken: 0 },
        'leadsite-ai': { total: 5, tested: 0, working: 0, broken: 0 },
        'clientcontact-io': { total: 3, tested: 0, working: 0, broken: 0 },
        'videosite-ai': { total: 3, tested: 0, working: 0, broken: 0 },
        'ultralead': { total: 7, tested: 0, working: 0, broken: 0 }
      }
    });
  } catch (error) {
    console.error('[Platform Verification API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
