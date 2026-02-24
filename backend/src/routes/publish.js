// Publish Routes (Social Media Publishing)
const express = require('express');
const { authenticate } = require('../middleware/auth');
const prisma = require('../config/database');

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

// POST /api/v1/publish - Publish content to platforms
router.post('/', async (req, res) => {
  const { videoId, platforms, content, scheduledFor } = req.body;

  if (!platforms || platforms.length === 0) {
    return res.status(400).json({ success: false, error: 'platforms array is required' });
  }

  const results = [];

  for (const p of platforms) {
    if (p === 'facebook') {
      // Real Facebook Graph API publish
      try {
        const channel = await prisma.channel.findFirst({
          where: { userId: req.user.id, type: 'facebook', status: 'connected' },
        });

        if (!channel) {
          results.push({ platform: 'facebook', success: false, error: 'Facebook not connected' });
          continue;
        }

        const creds = channel.credentials || {};
        if (!creds.pageAccessToken || !creds.pageId) {
          results.push({ platform: 'facebook', success: false, error: 'Facebook token invalid' });
          continue;
        }

        const graphRes = await fetch(
          `https://graph.facebook.com/v18.0/${creds.pageId}/feed`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: content || '',
              access_token: creds.pageAccessToken,
            }),
          }
        );

        const graphData = await graphRes.json();

        if (!graphRes.ok || graphData.error) {
          results.push({
            platform: 'facebook',
            success: false,
            error: graphData.error?.message || 'Facebook API error',
          });
          continue;
        }

        results.push({
          platform: 'facebook',
          success: true,
          postId: graphData.id,
          status: 'published',
          publishedAt: new Date(),
        });
      } catch (err) {
        console.error('Facebook publish error:', err);
        results.push({ platform: 'facebook', success: false, error: 'Failed to publish to Facebook' });
      }
    } else if (p === 'twitter' || p === 'x') {
      // Real Twitter v2 API publish
      try {
        const channel = await prisma.channel.findFirst({
          where: { userId: req.user.id, type: 'twitter', status: 'connected' },
        });

        if (!channel) {
          results.push({ platform: 'twitter', success: false, error: 'Twitter not connected' });
          continue;
        }

        const creds = channel.credentials || {};
        if (!creds.accessToken) {
          results.push({ platform: 'twitter', success: false, error: 'Twitter token invalid' });
          continue;
        }

        const twitterRes = await fetch(
          'https://api.twitter.com/2/tweets',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${creds.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: content || '' }),
          }
        );

        const twitterData = await twitterRes.json();

        if (!twitterRes.ok || twitterData.errors) {
          results.push({
            platform: 'twitter',
            success: false,
            error: twitterData.detail || twitterData.errors?.[0]?.message || 'Twitter API error',
          });
          continue;
        }

        results.push({
          platform: 'twitter',
          success: true,
          postId: twitterData.data?.id,
          status: 'published',
          publishedAt: new Date(),
        });
      } catch (err) {
        console.error('Twitter publish error:', err);
        results.push({ platform: 'twitter', success: false, error: 'Failed to publish to Twitter' });
      }
    } else {
      // Mock for all other platforms
      results.push({
        platform: p,
        status: scheduledFor ? 'scheduled' : 'published',
        scheduledFor: scheduledFor || null,
        publishedAt: scheduledFor ? null : new Date(),
      });
    }
  }

  res.json({
    success: true,
    data: { results },
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
