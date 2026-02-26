const express = require('express');
const router = express.Router();

router.get('/system/integrity', async (req, res) => {
  try {
    const { HealingSentinelAgent } = require('../agents/healing_sentinel');
    const sentinel = new HealingSentinelAgent();

    const [dbResult, aiResult] = await Promise.allSettled([
      sentinel.checkDatabase(),
      sentinel.checkAIModelIntegrity()
    ]);

    const db = dbResult.status === 'fulfilled' ? dbResult.value : { status: 'error' };
    const ai = aiResult.status === 'fulfilled' ? aiResult.value : { status: 'error' };

    const alerts = [];
    if (!db.healthy) alerts.push('Database connectivity issue');
    if (!ai.healthy) alerts.push(`AI Model: ${ai.status} - ${ai.error || ''}`);

    res.json({
      status: alerts.length === 0 ? 'ok' : 'ALERT',
      ai_model: ai.status,
      model_id: 'claude-haiku-4-5-20251001',
      database: db.status || 'ok',
      last_checked: new Date().toISOString(),
      alerts
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

module.exports = router;
