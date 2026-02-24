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
    } else if (p === 'instagram') {
      // Real Instagram Graph API publish (via Facebook Graph API)
      try {
        const channel = await prisma.channel.findFirst({
          where: { userId: req.user.id, type: 'instagram', status: 'connected' },
        });

        if (!channel) {
          results.push({ platform: 'instagram', success: false, error: 'Instagram not connected' });
          continue;
        }

        const creds = channel.credentials || {};
        if (!creds.pageAccessToken || !creds.instagramAccountId) {
          results.push({ platform: 'instagram', success: false, error: 'Instagram token invalid' });
          continue;
        }

        // Step 1: Create media container
        const createRes = await fetch(
          `https://graph.facebook.com/v18.0/${creds.instagramAccountId}/media`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              caption: content || '',
              media_type: 'TEXT',
              access_token: creds.pageAccessToken,
            }),
          }
        );

        const createData = await createRes.json();

        if (!createRes.ok || createData.error) {
          results.push({
            platform: 'instagram',
            success: false,
            error: createData.error?.message || 'Instagram API error',
          });
          continue;
        }

        // Step 2: Publish the container
        const publishRes = await fetch(
          `https://graph.facebook.com/v18.0/${creds.instagramAccountId}/media_publish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creation_id: createData.id,
              access_token: creds.pageAccessToken,
            }),
          }
        );

        const publishData = await publishRes.json();

        if (!publishRes.ok || publishData.error) {
          results.push({
            platform: 'instagram',
            success: false,
            error: publishData.error?.message || 'Instagram publish error',
          });
          continue;
        }

        results.push({
          platform: 'instagram',
          success: true,
          postId: publishData.id,
          status: 'published',
          publishedAt: new Date(),
        });
      } catch (err) {
        console.error('Instagram publish error:', err);
        results.push({ platform: 'instagram', success: false, error: 'Failed to publish to Instagram' });
      }
    } else if (p === 'youtube') {
      // Real YouTube Data API v3 publish
      try {
        const channel = await prisma.channel.findFirst({
          where: { userId: req.user.id, type: 'youtube', status: 'connected' },
        });

        if (!channel) {
          results.push({ platform: 'youtube', success: false, error: 'YouTube not connected' });
          continue;
        }

        const creds = channel.credentials || {};
        if (!creds.accessToken) {
          results.push({ platform: 'youtube', success: false, error: 'YouTube token invalid' });
          continue;
        }

        const youtubeRes = await fetch(
          'https://www.googleapis.com/youtube/v3/videos?part=snippet,status',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${creds.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              snippet: {
                title: (content || '').substring(0, 100),
                description: content || '',
              },
              status: {
                privacyStatus: 'public',
              },
            }),
          }
        );

        const youtubeData = await youtubeRes.json();

        if (!youtubeRes.ok || youtubeData.error) {
          results.push({
            platform: 'youtube',
            success: false,
            error: youtubeData.error?.message || youtubeData.error?.errors?.[0]?.message || 'YouTube API error',
          });
          continue;
        }

        results.push({
          platform: 'youtube',
          success: true,
          postId: youtubeData.id,
          status: 'published',
          publishedAt: new Date(),
        });
      } catch (err) {
        console.error('YouTube publish error:', err);
        results.push({ platform: 'youtube', success: false, error: 'Failed to publish to YouTube' });
      }
    } else if (p === 'whatsapp') {
      // Real WhatsApp Cloud API publish
      try {
        const channel = await prisma.channel.findFirst({
          where: { userId: req.user.id, type: 'whatsapp', status: 'connected' },
        });

        if (!channel) {
          results.push({ platform: 'whatsapp', success: false, error: 'WhatsApp not connected' });
          continue;
        }

        const creds = channel.credentials || {};
        if (!creds.phoneNumberId || !creds.accessToken) {
          results.push({ platform: 'whatsapp', success: false, error: 'WhatsApp token invalid' });
          continue;
        }

        const whatsappRes = await fetch(
          `https://graph.facebook.com/v18.0/${creds.phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${creds.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              type: 'text',
              to: creds.recipientPhone,
              text: { body: content || '' },
            }),
          }
        );

        const whatsappData = await whatsappRes.json();

        if (!whatsappRes.ok || whatsappData.error) {
          results.push({
            platform: 'whatsapp',
            success: false,
            error: whatsappData.error?.message || 'WhatsApp API error',
          });
          continue;
        }

        results.push({
          platform: 'whatsapp',
          success: true,
          postId: whatsappData.messages?.[0]?.id,
          status: 'published',
          publishedAt: new Date(),
        });
      } catch (err) {
        console.error('WhatsApp publish error:', err);
        results.push({ platform: 'whatsapp', success: false, error: 'Failed to publish to WhatsApp' });
      }
    } else if (p === 'telegram') {
      // Real Telegram Bot API publish
      try {
        const channel = await prisma.channel.findFirst({
          where: { userId: req.user.id, type: 'telegram', status: 'connected' },
        });

        if (!channel) {
          results.push({ platform: 'telegram', success: false, error: 'Telegram not connected' });
          continue;
        }

        const creds = channel.credentials || {};
        if (!creds.botToken || !creds.chatId) {
          results.push({ platform: 'telegram', success: false, error: 'Telegram token invalid' });
          continue;
        }

        const telegramRes = await fetch(
          `https://api.telegram.org/bot${creds.botToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: creds.chatId,
              text: content || '',
            }),
          }
        );

        const telegramData = await telegramRes.json();

        if (!telegramRes.ok || !telegramData.ok) {
          results.push({
            platform: 'telegram',
            success: false,
            error: telegramData.description || 'Telegram API error',
          });
          continue;
        }

        results.push({
          platform: 'telegram',
          success: true,
          postId: String(telegramData.result?.message_id),
          status: 'published',
          publishedAt: new Date(),
        });
      } catch (err) {
        console.error('Telegram publish error:', err);
        results.push({ platform: 'telegram', success: false, error: 'Failed to publish to Telegram' });
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
