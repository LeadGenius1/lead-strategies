// VideoSite.AI Routes - Creator Monetization Platform
// $1 per qualified view, Cloudflare R2 storage, Stripe Connect payouts

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const router = express.Router();
const prisma = new PrismaClient();

// Cloudflare R2 config
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY;
const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_KEY;
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || 'videosite-videos';
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL ||
  (R2_ACCOUNT_ID && R2_BUCKET ? `https://${R2_BUCKET}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : null);

// R2 S3 client (R2 is S3-compatible)
let s3Client = null;
if (R2_ACCOUNT_ID && R2_ACCESS_KEY && R2_SECRET_KEY) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY,
      secretAccessKey: R2_SECRET_KEY
    }
  });
}

// Stripe config
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (STRIPE_SECRET_KEY) {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
}

// Earnings rate: $1.00 per qualified view
const EARNINGS_PER_VIEW = 1.00;
const QUALIFIED_VIEW_SECONDS = 30;
const MIN_PAYOUT_AMOUNT = 10.00;

// All routes require authentication
router.use(authenticate);

// Normalize user ID (JWT may use id, sub, or userId)
router.use((req, res, next) => {
  console.log('[VideoSite Auth Debug]', JSON.stringify(req.user));
  req.userId = req.user?.id ?? req.user?.sub ?? req.user?.userId;
  next();
});

// =====================
// VIDEO MANAGEMENT
// =====================

// GET /api/v1/videosite/videos - List creator's videos
router.get('/videos', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = { userId: req.userId };
    if (status) where.status = status;

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.video.count({ where })
    ]);

    res.json({
      success: true,
      data: { videos, total, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/videosite/videos/:id - Get video details
router.get('/videos/:id', async (req, res) => {
  try {
    const video = await prisma.video.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    res.json({ success: true, data: video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/videosite/upload/presign - Get presigned URL for R2 upload
router.post('/upload/presign', async (req, res) => {
  try {
    const { filename, contentType, fileSize } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    if (!filename) {
      return res.status(400).json({ success: false, error: 'Filename is required' });
    }

    // Max file size: 5GB
    if (fileSize && fileSize > 5 * 1024 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File too large. Max size is 5GB' });
    }

    // Generate unique key
    const key = `${req.userId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${filename}`;

    // Real R2 presigned URL
    if (!s3Client) {
      return res.status(503).json({
        success: false,
        error: 'Storage not configured. Contact support.'
      });
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType || 'video/mp4'
    });
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Construct file_url (full R2 URL for playback, or key if no public URL configured)
    const fileUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : key;

    // Create pending video record (use connect for user relation)
    const video = await prisma.video.create({
      data: {
        user: { connect: { id: req.userId } },
        title: filename.replace(/\.[^/.]+$/, ''),
        filename,
        file_url: fileUrl,
        status: 'uploading',
        fileSize: fileSize || 0
      }
    });

    res.json({
      success: true,
      data: {
        videoId: video.id,
        uploadUrl: presignedUrl,
        key,
        expiresIn: 3600, // 1 hour
        instructions: {
          method: 'PUT',
          headers: {
            'Content-Type': contentType || 'video/mp4'
          }
        }
      }
    });
  } catch (error) {
    console.error('Presign upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/videosite/upload/complete - Mark upload as complete
router.post('/upload/complete', async (req, res) => {
  try {
    const { videoId, title, description, thumbnail } = req.body;

    const video = await prisma.video.findFirst({
      where: { id: videoId, userId: req.userId }
    });

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Update video record
    const updated = await prisma.video.update({
      where: { id: videoId },
      data: {
        title: title || video.title,
        description,
        thumbnailUrl: thumbnail,
        status: 'processing'
      }
    });

    // In production, trigger video processing (transcoding, thumbnail generation)
    // For now, mark as ready after short delay
    setTimeout(async () => {
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'ready' }
      }).catch(() => {});
    }, 2000);

    res.json({
      success: true,
      data: updated,
      message: 'Upload complete. Video is being processed.'
    });
  } catch (error) {
    console.error('Complete upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/videosite/videos/:id - Delete video
router.delete('/videos/:id', async (req, res) => {
  try {
    const video = await prisma.video.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // In production, also delete from R2 storage
    await prisma.video.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================
// VIEW TRACKING
// =====================

// POST /api/v1/videosite/videos/:id/view - Track qualified view
router.post('/videos/:id/view', async (req, res) => {
  try {
    const { watchTime, sessionId, referrer } = req.body;

    const video = await prisma.video.findUnique({
      where: { id: req.params.id }
    });

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Check if view qualifies (30+ seconds)
    const isQualified = watchTime >= QUALIFIED_VIEW_SECONDS;

    // Prevent duplicate views from same session
    const existingView = await prisma.videoView.findFirst({
      where: {
        videoId: req.params.id,
        sessionId: sessionId || req.ip,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }
    });

    if (existingView) {
      // Update existing view
      await prisma.videoView.update({
        where: { id: existingView.id },
        data: {
          watchTime: Math.max(existingView.watchTime, watchTime),
          isQualified: existingView.isQualified || isQualified
        }
      });

      return res.json({
        success: true,
        data: { viewId: existingView.id, isQualified: existingView.isQualified || isQualified, duplicate: true }
      });
    }

    // Create new view record
    const view = await prisma.videoView.create({
      data: {
        videoId: video.id,
        creatorId: video.userId,
        viewerId: req.userId || null,
        sessionId: sessionId || req.ip,
        watchTime: watchTime || 0,
        isQualified,
        referrer,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    // If qualified, credit creator earnings
    if (isQualified) {
      await prisma.creatorEarning.create({
        data: {
          userId: video.userId,
          videoId: video.id,
          viewId: view.id,
          amount: EARNINGS_PER_VIEW,
          status: 'pending'
        }
      });

      // Update video stats
      await prisma.video.update({
        where: { id: video.id },
        data: {
          view_count: { increment: 1 },
          earnings: { increment: EARNINGS_PER_VIEW }
        }
      });
    }

    res.json({
      success: true,
      data: { viewId: view.id, isQualified, earnings: isQualified ? EARNINGS_PER_VIEW : 0 }
    });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================
// EARNINGS
// =====================

// GET /api/v1/videosite/earnings - Get earnings summary
router.get('/earnings', async (req, res) => {
  try {
    const [totalEarnings, pendingEarnings, paidEarnings, videos] = await Promise.all([
      prisma.creatorEarning.aggregate({
        where: { userId: req.userId },
        _sum: { amount: true }
      }),
      prisma.creatorEarning.aggregate({
        where: { userId: req.userId, status: 'pending' },
        _sum: { amount: true }
      }),
      prisma.creatorEarning.aggregate({
        where: { userId: req.userId, status: 'paid' },
        _sum: { amount: true }
      }),
      prisma.video.aggregate({
        where: { userId: req.userId },
        _sum: { view_count: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalEarnings: totalEarnings._sum.amount || 0,
        pendingEarnings: pendingEarnings._sum.amount || 0,
        paidEarnings: paidEarnings._sum.amount || 0,
        totalQualifiedViews: videos._sum.view_count || 0,
        earningsPerView: EARNINGS_PER_VIEW,
        minPayout: MIN_PAYOUT_AMOUNT
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/videosite/earnings/history - Get earnings history
router.get('/earnings/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const [earnings, total] = await Promise.all([
      prisma.creatorEarning.findMany({
        where: { userId: req.userId },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
        include: { video: { select: { title: true } } }
      }),
      prisma.creatorEarning.count({ where: { userId: req.userId } })
    ]);

    res.json({
      success: true,
      data: { earnings, total, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get earnings history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================
// STRIPE CONNECT
// =====================

// POST /api/v1/videosite/stripe/connect - Start Stripe Connect onboarding
router.post('/stripe/connect', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Stripe not configured. Set STRIPE_SECRET_KEY environment variable.'
      });
    }

    // Check if user already has Stripe account
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { stripeAccountId: true }
    });

    let accountId = user?.stripeAccountId;

    if (!accountId) {
      // Create new Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: req.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        }
      });

      accountId = account.id;

      // Save account ID
      await prisma.user.update({
        where: { id: req.userId },
        data: { stripeAccountId: accountId }
      });
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/dashboard/videosite/payouts?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/dashboard/videosite/payouts?success=true`,
      type: 'account_onboarding'
    });

    res.json({
      success: true,
      data: {
        url: accountLink.url,
        accountId
      }
    });
  } catch (error) {
    console.error('Stripe connect error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/videosite/stripe/status - Get Stripe account status
router.get('/stripe/status', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { stripeAccountId: true }
    });

    if (!user?.stripeAccountId) {
      return res.json({
        success: true,
        data: { connected: false, status: 'not_connected' }
      });
    }

    if (!stripe) {
      return res.json({
        success: true,
        data: { connected: false, status: 'stripe_not_configured' }
      });
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    res.json({
      success: true,
      data: {
        connected: true,
        status: account.details_submitted ? 'active' : 'pending',
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        accountId: user.stripeAccountId
      }
    });
  } catch (error) {
    console.error('Get Stripe status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================
// PAYOUTS
// =====================

// GET /api/v1/videosite/payouts - Get payout info
router.get('/payouts', async (req, res) => {
  try {
    const pendingEarnings = await prisma.creatorEarning.aggregate({
      where: { userId: req.userId, status: 'pending' },
      _sum: { amount: true }
    });

    const payouts = await prisma.payout.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      data: {
        pendingBalance: pendingEarnings._sum.amount || 0,
        minPayout: MIN_PAYOUT_AMOUNT,
        recentPayouts: payouts
      }
    });
  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/videosite/payouts/request - Request payout
router.post('/payouts/request', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { stripeAccountId: true }
    });

    if (!user?.stripeAccountId) {
      return res.status(400).json({
        success: false,
        error: 'Please connect your Stripe account first'
      });
    }

    const pendingEarnings = await prisma.creatorEarning.aggregate({
      where: { userId: req.userId, status: 'pending' },
      _sum: { amount: true }
    });

    const amount = pendingEarnings._sum.amount || 0;

    if (amount < MIN_PAYOUT_AMOUNT) {
      return res.status(400).json({
        success: false,
        error: `Minimum payout amount is $${MIN_PAYOUT_AMOUNT}. Current balance: $${amount.toFixed(2)}`
      });
    }

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        userId: req.userId,
        amount,
        status: 'pending',
        stripeAccountId: user.stripeAccountId
      }
    });

    // In production, trigger actual Stripe transfer
    if (stripe) {
      try {
        const transfer = await stripe.transfers.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          destination: user.stripeAccountId
        });

        await prisma.payout.update({
          where: { id: payout.id },
          data: {
            status: 'processing',
            stripeTransferId: transfer.id
          }
        });

        // Mark earnings as paid
        await prisma.creatorEarning.updateMany({
          where: { userId: req.userId, status: 'pending' },
          data: { status: 'paid', payoutId: payout.id }
        });
      } catch (stripeError) {
        await prisma.payout.update({
          where: { id: payout.id },
          data: { status: 'failed', error: stripeError.message }
        });

        return res.status(500).json({
          success: false,
          error: 'Payout failed. Please try again later.'
        });
      }
    }

    res.json({
      success: true,
      data: payout,
      message: `Payout of $${amount.toFixed(2)} requested successfully`
    });
  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/videosite/payouts/history - Get payout history
router.get('/payouts/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where: { userId: req.userId },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payout.count({ where: { userId: req.userId } })
    ]);

    res.json({
      success: true,
      data: { payouts, total, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get payout history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================
// ANALYTICS
// =====================

// GET /api/v1/videosite/analytics - Get creator analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [videos, views, earnings] = await Promise.all([
      prisma.video.findMany({
        where: { userId: req.userId },
        select: {
          id: true,
          title: true,
          view_count: true,
          earnings: true,
          createdAt: true
        }
      }),
      prisma.videoView.groupBy({
        by: ['createdAt'],
        where: {
          creatorId: req.userId,
          createdAt: { gte: startDate }
        },
        _count: true
      }),
      prisma.creatorEarning.aggregate({
        where: {
          userId: req.userId,
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalVideos: videos.length,
        totalViews: videos.reduce((sum, v) => sum + (v.view_count || 0), 0),
        periodEarnings: earnings._sum.amount || 0,
        topVideos: videos
          .sort((a, b) => Number(b.earnings || 0) - Number(a.earnings || 0))
          .slice(0, 5),
        viewsOverTime: views
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
