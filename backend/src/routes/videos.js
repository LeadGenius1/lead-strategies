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

    prisma = require('../config/database').prisma;
  }
  return prisma;
}

// Mock data for development without database
const mockVideos = [
  { id: '1', title: 'Product Demo Video', status: 'published', visibility: 'public', viewCount: 1250, totalEarnings: 125.00, duration: 180, thumbnail: null, createdAt: new Date() },
  { id: '2', title: 'Customer Testimonial', status: 'published', visibility: 'public', viewCount: 890, totalEarnings: 89.00, duration: 120, thumbnail: null, createdAt: new Date() },
  { id: '3', title: 'How-To Tutorial', status: 'draft', visibility: 'private', viewCount: 0, totalEarnings: 0, duration: 300, thumbnail: null, createdAt: new Date() },
];

// Convert private R2 URL to public R2.dev URL for browser playback
// Private: https://ACCOUNT.r2.cloudflarestorage.com/BUCKET/key
// Public:   https://pub-XXX.r2.dev/key
// Also handles: relative keys (userId/file.mp4), path-style URLs
function toPublicVideoUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const base = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || 'https://pub-00746658f70a4185a900f207b96d9e3b.r2.dev';
  // Private R2 path-style: https://ACCOUNT.r2.cloudflarestorage.com/BUCKET/objectKey
  const privateMatch = url.match(/https:\/\/[^/]+\.r2\.cloudflarestorage\.com\/[^/]+\/(.+)/);
  if (privateMatch) {
    const key = privateMatch[1].replace(/\/$/, '');
    return `${base}/${key}`;
  }
  // Relative key (e.g. "userId/file.mp4" stored without base URL)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `${base}/${url.replace(/^\//, '')}`;
  }
  return url;
}

// ---- PUBLIC ROUTES (no auth) - for /watch/[id] full-page viewing ----
function toPublicVideo(v, creator = null) {
  if (!v) return null;
  const rawUrl = v.videoUrl;
  const videoUrl = toPublicVideoUrl(rawUrl) || rawUrl;
  const result = {
    id: v.id,
    title: v.title,
    description: v.description,
    videoUrl,
    thumbnailUrl: v.thumbnailUrl || v.thumbnail_url,
    duration: v.duration,
    viewCount: v.view_count ?? 0,
    views: v.view_count ?? 0,
    earnings: v.earnings,
    totalEarnings: v.earnings,
    isMonetized: v.isMonetized ?? v.is_monetized ?? false,
    monetizationEnabled: v.isMonetized ?? v.is_monetized ?? false,
    createdAt: v.createdAt ?? v.created_at,
    created_at: v.createdAt ?? v.created_at,
    visibility: 'public',
    status: v.status
  };
  if (creator) {
    result.creator = {
      name: creator.name || 'Creator',
      avatar: creator.profile_picture || null,
    };
  }
  return result;
}

// GET /api/v1/videos/browse - Public video listing for /watch page (no auth)
// Also aliased as /api/v1/videos/public/all
router.get(['/browse', '/public/all'], async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    // Sort: 'popular' sorts by view_count DESC, default is 'recent' (createdAt DESC)
    const sortBy = req.query.sort === 'popular'
      ? { view_count: 'desc' }
      : req.query.sort === 'oldest'
        ? { createdAt: 'asc' }
        : { createdAt: 'desc' };

    const where = { status: 'ready', videoUrl: { not: null } };

    // Server-side search by title
    const search = req.query.search?.trim();
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    // Category filter
    const category = req.query.category?.trim();
    if (category) {
      where.description = { contains: category, mode: 'insensitive' };
    }

    const [videos, total] = await Promise.all([
      db.video.findMany({
        where,
        include: { user: { select: { name: true, profile_picture: true } } },
        orderBy: sortBy,
        skip,
        take: limit,
      }),
      db.video.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        videos: videos.map(v => toPublicVideo(v, v.user)),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error('Browse videos error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/v1/videos/:id/public - Public video for playback (no auth)
router.get('/:id/public', async (req, res) => {
  try {
    const db = getPrisma();
    const videoId = req.params.id;
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const video = await db.video.findUnique({
      where: { id: videoId },
      include: { user: { select: { name: true, profile_picture: true } } }
    });
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const viewable = ['ready', 'processing'].includes(video.status) && video.videoUrl;
    if (!viewable) return res.status(404).json({ error: 'Video not found or not yet available' });

    res.json({ success: true, data: toPublicVideo(video, video.user) });
  } catch (error) {
    console.error('Get public video error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/v1/videos/:id/track-view - Track view (no auth)
router.post('/:id/track-view', async (req, res) => {
  try {
    const db = getPrisma();
    const videoId = req.params.id;
    const { watchDuration = 0 } = req.body;
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const video = await db.video.findUnique({ where: { id: videoId } });
    if (!video) return res.status(404).json({ error: 'Video not found' });

    await db.video.update({
      where: { id: videoId },
      data: { view_count: { increment: 1 } }
    });

    const watchSeconds = typeof watchDuration === 'number' ? watchDuration : parseInt(watchDuration, 10) || 0;
    res.json({ success: true, data: { tracked: true, watchSeconds } });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/v1/videos/:id/related - Related videos from same creator (no auth)
router.get('/:id/related', async (req, res) => {
  try {
    const db = getPrisma();
    const videoId = req.params.id;
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const video = await db.video.findUnique({
      where: { id: videoId },
      select: { userId: true }
    });
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const related = await db.video.findMany({
      where: {
        userId: video.userId,
        id: { not: videoId },
        status: 'ready',
        videoUrl: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    });

    res.json({ success: true, data: related.map(v => toPublicVideo(v)) });
  } catch (error) {
    console.error('Get related videos error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ---- AUTH REQUIRED ----
// All other routes require authentication and video feature (Tier 4+)
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

// GET /api/videos/earnings - Get overall video earnings stats
router.get('/earnings', async (req, res) => {
  res.json({
    success: true,
    data: {
      totalEarnings: 214.00,
      thisMonth: 89.50,
      lastMonth: 124.50,
      totalViews: 2140,
      avgEarningsPerView: 0.10,
      topPerformingCategory: 'demos'
    }
  });
});

// GET /api/videos/:id/analytics - Get video analytics
router.get('/:id/analytics', async (req, res) => {
  const videoId = req.params.id;
  const video = mockVideos.find(v => v.id === videoId);

  res.json({
    success: true,
    data: {
      videoId,
      title: video?.title || 'Unknown Video',
      totalViews: video?.viewCount || 0,
      totalEarnings: video?.totalEarnings || 0,
      avgWatchTime: 125,
      completionRate: 68,
      viewsByDay: [
        { date: '2026-01-27', views: 150 },
        { date: '2026-01-28', views: 180 },
        { date: '2026-01-29', views: 220 },
        { date: '2026-01-30', views: 195 },
        { date: '2026-01-31', views: 240 },
        { date: '2026-02-01', views: 265 },
        { date: '2026-02-02', views: 0 }
      ],
      demographics: {
        desktop: 45,
        mobile: 40,
        tablet: 15
      },
      topCountries: [
        { country: 'United States', views: 850 },
        { country: 'Canada', views: 200 },
        { country: 'United Kingdom', views: 150 }
      ]
    }
  });
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
