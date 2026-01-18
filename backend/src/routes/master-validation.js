// Master Orchestrator Validation Endpoint
// Agent 6 - E2E Testing & Validation

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const MasterOrchestrator = require('../services/masterOrchestrator');

// POST /api/master/validate - Run complete E2E validation
router.post('/validate', authenticate, async (req, res) => {
  try {
    const orchestrator = new MasterOrchestrator();
    const report = await orchestrator.validateAllPlatforms(req.user.id);

    res.json({
      success: true,
      message: 'E2E validation completed',
      data: report
    });
  } catch (error) {
    console.error('Master validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Validation failed',
      message: error.message
    });
  }
});

// GET /api/master/status - Get current completion status
router.get('/status', authenticate, async (req, res) => {
  try {
    const orchestrator = new MasterOrchestrator();
    const report = await orchestrator.validateAllPlatforms(req.user.id);

    res.json({
      success: true,
      data: {
        overall: report.overall,
        platforms: report.platforms,
        timestamp: report.timestamp
      }
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Status check failed',
      message: error.message
    });
  }
});

module.exports = router;
