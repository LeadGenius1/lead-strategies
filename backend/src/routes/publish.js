// Publish Routes (Social Media Publishing)
const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Mock data for development
const mockPlatforms = [
  { id: 'youtube', name: 'YouTube', connected: true, username: '@mybusiness' },
  { id: 'tiktok', name: 'TikTok', connected: false, username: null },
  { id: 'instagram', name: 'Instagram', connected: true, username: '@mybusiness' },
  { id: 'x', name: 'X (Twitter)', connected: false, username: null },
  { id: 'linkedin', name: 'LinkedIn', connected: true, username: 'My Business LLC' },
  { id: 'facebook', name: 'Facebook', connected: false, username: null },
];

const mockPublishHistory = [
  { id: '1', videoId: '1', platform: 'youtube', status: 'published', publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { id: '2', videoId: '1', platform: 'instagram', status: 'published', publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { id: '3', videoId: '2', platform: 'linkedin', status: 'scheduled', scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000) },
];

router.use(authenticate);

// GET /api/v1/publish/platforms - Get connected platforms
router.get('/platforms', async (req, res) => {
  res.json({
    success: true,
    data: { platforms: mockPlatforms }
  });
});

// POST /api/v1/publish/connect/:platform - Connect a platform
router.post('/connect/:platform', async (req, res) => {
  const { platform } = req.params;
  res.json({
    success: true,
    data: {
      platform,
      authUrl: `https://example.com/oauth/${platform}?redirect=http://localhost:3000/dashboard/publish`
    }
  });
});

// POST /api/v1/publish - Publish video to platforms
router.post('/', async (req, res) => {
  const { videoId, platforms, scheduledFor } = req.body;

  if (!videoId || !platforms || platforms.length === 0) {
    return res.status(400).json({ success: false, error: 'videoId and platforms are required' });
  }

  const results = platforms.map(p => ({
    platform: p,
    status: scheduledFor ? 'scheduled' : 'published',
    scheduledFor: scheduledFor || null,
    publishedAt: scheduledFor ? null : new Date()
  }));

  res.json({
    success: true,
    data: { results }
  });
});

// GET /api/v1/publish/history - Get publish history
router.get('/history', async (req, res) => {
  res.json({
    success: true,
    data: { history: mockPublishHistory }
  });
});

module.exports = router;
