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
    authType: p.authType || 'apikey',
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

// ═══════════════════════════════════════════════════════════════
// SOCIAL OAuth ENDPOINTS (for settings page)
// These let the Nexus settings page manage social OAuth connections
// without requiring the ClientContact.IO inbox feature tier.
// ═══════════════════════════════════════════════════════════════

const crypto = require('crypto');
const pkceStore = require('../lib/pkce-store');
const { getProvider } = require('../services/nexus2/assistant/mcpRegistry');

let _prisma = null;
function getSocialPrisma() {
  if (!_prisma) _prisma = require('../config/database').prisma;
  return _prisma;
}

// GET /social/connections — list user's connected social channels
router.get('/social/connections', async (req, res) => {
  try {
    const db = getSocialPrisma();
    const socialTypes = ['facebook', 'instagram', 'linkedin', 'twitter'];
    const channels = await db.channel.findMany({
      where: { userId: req.user.id, type: { in: socialTypes } },
      select: { id: true, type: true, name: true, status: true, lastSyncAt: true },
    });
    res.json({ connections: channels });
  } catch (err) {
    console.error('[MCP] GET /social/connections error:', err.message);
    res.json({ connections: [] });
  }
});

// GET /social/authorize/:platform — generate OAuth URL
router.get('/social/authorize/:platform', async (req, res) => {
  const platform = (req.params.platform || '').toLowerCase();
  const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const returnTo = req.query.returnTo || '/nexus/settings';

  if (platform === 'facebook') {
    const META_APP_ID = process.env.META_APP_ID;
    if (!META_APP_ID) return res.status(503).json({ error: 'Facebook app not configured' });
    const state = Buffer.from(JSON.stringify({ userId: req.user.id, returnTo })).toString('base64');
    const scope = 'pages_manage_posts,pages_manage_metadata,pages_read_engagement,pages_show_list';
    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(`${BACKEND_URL}/api/v1/oauth/channels/facebook/callback`)}&scope=${scope}&state=${state}`;
    return res.json({ authUrl: url });
  }

  if (platform === 'instagram') {
    const META_APP_ID = process.env.META_APP_ID;
    if (!META_APP_ID) return res.status(503).json({ error: 'Meta app not configured' });
    const state = Buffer.from(JSON.stringify({ userId: req.user.id, returnTo })).toString('base64');
    const scope = 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement';
    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(`${BACKEND_URL}/api/v1/oauth/channels/instagram/callback`)}&scope=${scope}&state=${state}`;
    return res.json({ authUrl: url });
  }

  if (platform === 'linkedin') {
    const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
    if (!LINKEDIN_CLIENT_ID) return res.status(503).json({ error: 'LinkedIn app not configured' });
    const state = crypto.randomBytes(16).toString('hex');
    await pkceStore.set(state, { userId: req.user.id, returnTo });
    const scope = 'openid profile w_member_social';
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${BACKEND_URL}/api/v1/oauth/channels/linkedin/callback`)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    return res.json({ authUrl: url });
  }

  if (platform === 'twitter') {
    const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
    if (!TWITTER_CLIENT_ID) return res.status(503).json({ error: 'Twitter app not configured' });
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    const state = crypto.randomBytes(16).toString('hex');
    await pkceStore.set(state, { codeVerifier, userId: req.user.id, returnTo });
    const scope = 'dm.read dm.write users.read tweet.read tweet.write offline.access';
    const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${BACKEND_URL}/api/v1/oauth/channels/twitter/callback`)}&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    return res.json({ authUrl: url });
  }

  res.status(400).json({ error: `Unknown social platform: ${platform}` });
});

// DELETE /social/connections/:platform — disconnect a social channel
router.delete('/social/connections/:platform', async (req, res) => {
  try {
    const db = getSocialPrisma();
    const platform = (req.params.platform || '').toLowerCase();
    const channel = await db.channel.findFirst({
      where: { userId: req.user.id, type: platform },
    });
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    await db.channel.delete({ where: { id: channel.id } });
    res.json({ success: true, message: `${platform} disconnected` });
  } catch (err) {
    console.error('[MCP] DELETE /social/connections error:', err.message);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

module.exports = router;
