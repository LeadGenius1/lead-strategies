// Channel Connection Routes (ClientContact.IO)
// OAuth connections for email, social media, etc.

const express = require('express');
const { authenticate, requireFeature } = require('../middleware/auth');

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

// Mock data for development
const mockChannels = [
  { id: '1', type: 'email', name: 'Business Email', status: 'active', connected: true },
  { id: '2', type: 'sms', name: 'Twilio SMS', status: 'active', connected: true },
  { id: '3', type: 'whatsapp', name: 'WhatsApp Business', status: 'pending', connected: false },
];

const mockConnections = [
  { id: '1', channelId: '1', provider: 'gmail', status: 'connected', email: 'business@example.com' },
  { id: '2', channelId: '2', provider: 'twilio', status: 'connected', phone: '+1555123456' },
];

// All routes require authentication and inbox feature (Tier 3+)
router.use(authenticate);
router.use(requireFeature('inbox'));

// Get all connected channels
router.get('/', async (req, res) => {
  try {
    const db = getPrisma();

    if (!db) {
      return res.json({
        success: true,
        data: {
          channels: mockChannels,
          enabled: ['email', 'sms', 'whatsapp', 'webchat', 'voice']
        }
      });
    }

    const channels = await db.channel.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { channels }
    });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch channels',
    });
  }
});

// Get channel connections
router.get('/connections', async (req, res) => {
  res.json({
    success: true,
    data: { connections: mockConnections }
  });
});

// OAuth authorize endpoint
router.get('/oauth/:channelId/authorize', async (req, res) => {
  const { channelId } = req.params;
  res.json({
    success: true,
    data: {
      authUrl: `https://example.com/oauth/${channelId}/authorize?redirect=http://localhost:3000/dashboard/inbox/settings/channels`
    }
  });
});

// Connect a channel (OAuth or manual)
router.post('/connect', async (req, res) => {
  try {
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
