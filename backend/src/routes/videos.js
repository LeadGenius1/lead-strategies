// VideoSite.AI Routes
// AI-powered video generation and management

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

// Mock data for development without database
const mockVideos = [
  { id: '1', title: 'Product Demo Video', status: 'published', visibility: 'public', viewCount: 1250, totalEarnings: 125.00, duration: 180, thumbnail: null, createdAt: new Date() },
  { id: '2', title: 'Customer Testimonial', status: 'published', visibility: 'public', viewCount: 890, totalEarnings: 89.00, duration: 120, thumbnail: null, createdAt: new Date() },
  { id: '3', title: 'How-To Tutorial', status: 'draft', visibility: 'private', viewCount: 0, totalEarnings: 0, duration: 300, thumbnail: null, createdAt: new Date() },
];

// All routes require authentication and video feature (Tier 4+)
router.use(authenticate);
router.use(requireFeature('video'));

// Initialize Anthropic for AI video generation
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  } catch (error) {
    console.warn('Failed to initialize Anthropic client:', error.message);
  }
}

// GET /api/videos - List all videos
router.get('/', async (req, res) => {
  try {
    const db = getPrisma();
    const { status, template, page = 1, limit = 50 } = req.query;

    if (!db) {
      let filtered = [...mockVideos];
      if (status) filtered = filtered.filter(v => v.status === status);
      return res.json({
        success: true,
        data: {
          videos: filtered,
          pagination: { page: 1, limit: 50, total: filtered.length, pages: 1 }
        }
      });
    }

    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (template) where.templateId = template;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [videos, total] = await Promise.all([
      db.video.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      db.video.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/videos/:id - Get video details
router.get('/:id', async (req, res) => {
  try {
    const video = await db.video.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/videos/generate - AI video generation
router.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      templateId,
      aspectRatio = '16:9', // 16:9, 9:16, 1:1
      duration = 30, // seconds
      style,
      music
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!anthropic) {
      return res.status(503).json({
        error: 'AI video generation not configured. Set ANTHROPIC_API_KEY environment variable.'
      });
    }

    // Generate video script and structure using AI
    const aiPrompt = `Create a video script and structure for:
Prompt: ${prompt}
Aspect Ratio: ${aspectRatio}
Duration: ${duration} seconds
Style: ${style || 'professional'}

Return JSON with:
{
  "script": "...",
  "scenes": [
    {
      "duration": 5,
      "text": "...",
      "visual": "...",
      "transition": "..."
    }
  ],
  "music": "${music || 'upbeat'}",
  "voiceover": "..."
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: aiPrompt }]
    });

    const content = response.content[0].text;
    let videoData;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      videoData = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch {
      // Fallback structure
      videoData = {
        script: prompt,
        scenes: [{ duration, text: prompt, visual: 'default', transition: 'fade' }],
        music: music || 'upbeat',
        voiceover: prompt
      };
    }

    // Create video record
    const video = await db.video.create({
      data: {
        userId: req.user.id,
        title: prompt.substring(0, 100),
        description: prompt,
        templateId,
        aspectRatio,
        duration,
        status: 'generating',
        script: videoData.script,
        scenes: videoData.scenes,
        settings: {
          style: style || 'professional',
          music: videoData.music,
          voiceover: videoData.voiceover
        },
        // In production, this would trigger actual video generation
        // For now, mark as pending
        videoUrl: null,
        thumbnailUrl: null
      }
    });

    // In production, queue video generation job:
    // - Synthesia API (AI avatars)
    // - Runway ML (video generation)
    // - D-ID (talking head videos)
    // - Or custom video rendering service

    res.status(201).json({
      success: true,
      message: 'Video generation started',
      data: {
        video,
        estimatedTime: '2-5 minutes'
      }
    });
  } catch (error) {
    console.error('Generate video error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// PUT /api/videos/:id - Update video
router.put('/:id', async (req, res) => {
  try {
    const video = await db.video.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const {
      title,
      description,
      script,
      scenes,
      settings,
      aspectRatio
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (script !== undefined) updateData.script = script;
    if (scenes !== undefined) updateData.scenes = scenes;
    if (settings !== undefined) updateData.settings = settings;
    if (aspectRatio !== undefined) updateData.aspectRatio = aspectRatio;

    const updatedVideo = await db.video.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: updatedVideo
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/videos/:id/publish - Publish video to platforms
router.post('/:id/publish', async (req, res) => {
  try {
    const { platforms = ['youtube'], aspectRatios } = req.body;

    const video = await db.video.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (!video.videoUrl) {
      return res.status(400).json({ error: 'Video not ready for publishing' });
    }

    // In production, this would:
    // - Export video in platform-specific formats
    // - Upload to YouTube, Instagram, TikTok, etc.
    // - Return publish status

    const publishResults = platforms.map(platform => ({
      platform,
      status: 'queued',
      url: null,
      message: `Publishing to ${platform}...`
    }));

    res.json({
      success: true,
      message: 'Video publishing started',
      data: {
        videoId: video.id,
        platforms: publishResults
      }
    });
  } catch (error) {
    console.error('Publish video error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/videos/:id/analytics - Get video analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const video = await db.video.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // In production, fetch analytics from CDN/analytics service
    const analytics = {
      views: video.views || 0,
      watchTime: video.watchTime || 0,
      engagement: video.engagement ? Number(video.engagement) : 0,
      clicks: video.clicks || 0,
      shares: video.shares || 0,
      platformViews: video.platformViews || {},
      heatmap: video.heatmap || []
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get video analytics error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// DELETE /api/videos/:id - Delete video
router.delete('/:id', async (req, res) => {
  try {
    const video = await db.video.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await db.video.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
