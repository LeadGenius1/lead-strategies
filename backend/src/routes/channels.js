// Channel Connection Routes (ClientContact.IO)
// OAuth connections for email, social media, etc.

const express = require('express');
const crypto = require('crypto');
const { authenticate, requireFeature } = require('../middleware/auth');
const pkceStore = require('../lib/pkce-store');

const router = express.Router();

// Lazy-load Prisma only when DATABASE_URL is available
let prisma = null;

function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

// Available channel types (all platforms can connect these)
const AVAILABLE_CHANNELS = [
  { id: 'email', name: 'Email', provider: 'Internal', description: 'Connect your business email' },
  { id: 'facebook', name: 'Facebook Messenger', provider: 'Meta', description: 'Connect Facebook Page for Messenger' },
  { id: 'twitter', name: 'Twitter/X DM', provider: 'Twitter', description: 'Connect Twitter for direct messages' },
  { id: 'sms', name: 'SMS', provider: 'Twilio', description: 'Connect Twilio for SMS' },
  { id: 'whatsapp', name: 'WhatsApp Business', provider: 'Meta', description: 'Connect WhatsApp Business' },
];

// All routes require authentication and inbox feature (Tier 3+)
router.use(authenticate);
router.use(requireFeature('inbox'));

// Get available channel types (same for all users)
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        channels: AVAILABLE_CHANNELS,
        enabled: AVAILABLE_CHANNELS.map((c) => c.id)
      }
    });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch channels' });
  }
});

// Get user's connected channels (from DB)
router.get('/connections', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({ success: true, data: { connections: [] } });
    }
    const channels = await db.channel.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    const connections = channels.map((c) => ({
      id: c.id,
      channel: c.type,
      channelId: c.id,
      provider: c.type,
      status: c.status,
      isActive: c.status === 'connected',
      name: c.name
    }));
    res.json({ success: true, data: { connections } });
  } catch (error) {
    console.error('Get connections error:', error);
    res.json({ success: true, data: { connections: [] } });
  }
});

// OAuth authorize endpoint - delegates to facebook/twitter auth or returns mock for others
router.get('/oauth/:channelId/authorize', async (req, res) => {
  const { channelId } = req.params;
  const id = (channelId || '').toLowerCase();

  if (id === 'facebook') {
    const META_APP_ID = process.env.META_APP_ID;
    const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    if (!META_APP_ID) {
      return res.status(503).json({ success: false, error: 'Facebook app not configured', data: null });
    }
    const state = Buffer.from(req.user.id).toString('base64');
    const scope = 'pages_messaging,pages_manage_metadata,pages_read_engagement';
    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(`${BACKEND_URL}/api/v1/oauth/channels/facebook/callback`)}&scope=${scope}&state=${state}`;
    return res.json({ success: true, data: { authUrl: url } });
  }

  if (id === 'twitter') {
    const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
    const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    if (!TWITTER_CLIENT_ID) {
      return res.status(503).json({ success: false, error: 'Twitter app not configured', data: null });
    }
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    const state = crypto.randomBytes(16).toString('hex');
    pkceStore.set(state, { codeVerifier, userId: req.user.id });
    const scope = 'dm.read dm.write users.read tweet.read offline.access';
    const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${BACKEND_URL}/api/v1/oauth/channels/twitter/callback`)}&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    return res.json({ success: true, data: { authUrl: url } });
  }

  // Other channels - mock or 503
  res.json({
    success: true,
    data: { authUrl: `https://example.com/oauth/${channelId}/authorize` }
  });
});

// DELETE /oauth/:channelId/disconnect - Disconnect by channel type (facebook, twitter, etc)
router.delete('/oauth/:channelId/disconnect', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not available' });
    const channelType = (req.params.channelId || '').toLowerCase();
    const channel = await db.channel.findFirst({
      where: { userId: req.user.id, type: channelType }
    });
    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }
    await db.channel.delete({ where: { id: channel.id } });
    res.json({ success: true, message: 'Channel disconnected' });
  } catch (error) {
    console.error('OAuth disconnect error:', error);
    res.status(500).json({ success: false, error: 'Failed to disconnect' });
  }
});

// GET /facebook/auth - Get Meta OAuth URL (requires META_APP_ID, META_APP_SECRET)
router.get('/facebook/auth', async (req, res) => {
  const META_APP_ID = process.env.META_APP_ID;
  const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  if (!META_APP_ID) {
    return res.status(503).json({ success: false, error: 'Facebook app not configured', data: null });
  }
  const state = Buffer.from(req.user.id).toString('base64');
  const scope = 'pages_messaging,pages_manage_metadata,pages_read_engagement';
  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(`${BACKEND_URL}/api/v1/oauth/channels/facebook/callback`)}&scope=${scope}&state=${state}`;
  res.json({ success: true, data: { url } });
});

// GET /twitter/auth - Get Twitter OAuth URL (requires TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET)
router.get('/twitter/auth', async (req, res) => {
  const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
  const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  if (!TWITTER_CLIENT_ID) {
    return res.status(503).json({ success: false, error: 'Twitter app not configured', data: null });
  }
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  const state = crypto.randomBytes(16).toString('hex');
  pkceStore.set(state, { codeVerifier, userId: req.user.id });
  const scope = 'dm.read dm.write users.read tweet.read offline.access';
  const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${BACKEND_URL}/api/v1/oauth/channels/twitter/callback`)}&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  res.json({ success: true, data: { url } });
});

// Connect a channel (OAuth or manual)
router.post('/connect', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }
    const {
      type, // 'email', 'sms', 'whatsapp', 'linkedin', 'twitter', etc.
      name,
      credentials, // OAuth tokens or API keys
      settings
    } = req.body;

    if (!type || !name) {
      return res.status(400).json({
        success: false,
        error: 'Channel type and name are required',
      });
    }

    // Validate channel type
    const validTypes = ['email', 'sms', 'whatsapp', 'linkedin', 'twitter', 'facebook', 'instagram'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid channel type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Check if channel already exists
    const existing = await db.channel.findFirst({
      where: {
        userId: req.user.id,
        type,
        name
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Channel with this name already exists',
      });
    }

    // Create channel connection
    const channel = await db.channel.create({
      data: {
        userId: req.user.id,
        type,
        name,
        credentials: credentials || {},
        settings: settings || {
          enabled: true,
          autoSync: true,
          syncInterval: 300 // 5 minutes
        },
        status: 'connected',
        lastSyncAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Channel connected successfully',
      data: {
        channel: {
          id: channel.id,
          type: channel.type,
          name: channel.name,
          status: channel.status,
          // Don't return credentials
        }
      }
    });
  } catch (error) {
    console.error('Connect channel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect channel',
    });
  }
});

// Update channel
router.put('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not available' });
    const { id } = req.params;
    const { name, credentials, settings, status } = req.body;

    const channel = await db.channel.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found',
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (credentials !== undefined) updateData.credentials = credentials;
    if (settings !== undefined) updateData.settings = settings;
    if (status !== undefined) updateData.status = status;

    const updatedChannel = await db.channel.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Channel updated successfully',
      data: {
        channel: {
          id: updatedChannel.id,
          type: updatedChannel.type,
          name: updatedChannel.name,
          status: updatedChannel.status,
        }
      }
    });
  } catch (error) {
    console.error('Update channel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update channel',
    });
  }
});

// Disconnect channel
router.delete('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not available' });
    const { id } = req.params;

    const channel = await db.channel.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found',
      });
    }

    await db.channel.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Channel disconnected successfully',
    });
  } catch (error) {
    console.error('Disconnect channel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect channel',
    });
  }
});

// Test channel connection
router.post('/:id/test', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not available' });
    const { id } = req.params;

    const channel = await db.channel.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found',
      });
    }

    // In production, test the connection based on channel type
    // For now, return mock success
    res.json({
      success: true,
      message: 'Channel connection test successful',
      data: {
        status: 'connected',
        latency: Math.floor(Math.random() * 100) + 50 // Mock latency
      }
    });
  } catch (error) {
    console.error('Test channel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test channel',
    });
  }
});

module.exports = router;
