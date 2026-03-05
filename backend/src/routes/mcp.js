// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — MCP INTEGRATION ROUTES
// Provider catalog, connection management endpoints.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { listProviders } = require('../services/nexus2/assistant/mcpRegistry');
const mcpManager = require('../services/nexus2/assistant/mcpManager');

// ─── GET /providers — Public provider catalog ──────────

router.get('/providers', (req, res) => {
  const providers = listProviders().map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    icon: p.icon,
    category: p.category,
    requiredConfig: p.requiredConfig,
    tools: p.tools,
  }));

  res.json({ providers });
});

// All remaining routes require auth
router.use(authenticate);

// ─── GET /connections — User's connections ──────────────

router.get('/connections', async (req, res) => {
  try {
    const connections = await mcpManager.getConnections(req.user.id);
    res.json({ connections });
  } catch (err) {
    console.error('[MCP] GET /connections error:', err.message);
    res.status(500).json({ error: 'Failed to list connections' });
  }
});

// ─── POST /connect — Connect a provider ────────────────

router.post('/connect', async (req, res) => {
  try {
    const { providerId, config } = req.body;

    if (!providerId || !config) {
      return res.status(400).json({ error: 'providerId and config are required' });
    }

    const connection = await mcpManager.connectProvider(req.user.id, providerId, config);

    res.json({
      success: true,
      connection: {
        id: connection.id,
        provider: connection.provider,
        name: connection.name,
        status: connection.status,
      },
    });
  } catch (err) {
    console.error('[MCP] POST /connect error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ─── DELETE /connections/:id — Disconnect ───────────────

router.delete('/connections/:id', async (req, res) => {
  try {
    const result = await mcpManager.disconnectProvider(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    console.error('[MCP] DELETE /connections error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
