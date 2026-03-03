// ═══════════════════════════════════════════════════════════════
// VIDEO CREATION — API ROUTES
// POST /create, POST /create/upload, GET /create/:jobId,
// GET /templates, GET /templates/:id
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { addVideoJob, getVideoQueue } = require('../services/nexus2/video/worker');
const { VIDEO_TIERS, VIDEO_TEMPLATES, VIDEO_FORMATS } = require('../services/nexus2/video/constants');
const { uploadToR2 } = require('../services/nexus2/video/r2Upload');
const crypto = require('crypto');

// All routes require authentication
router.use(authenticate);

// POST /create — Queue a video creation job
router.post('/create', async (req, res) => {
  try {
    const { tier, script, projectName, tone, industry, format, templateId, photos, channels } = req.body;

    if (!script || !projectName) {
      return res.status(400).json({ error: 'script and projectName are required' });
    }

    const validTier = Object.values(VIDEO_TIERS).includes(tier) ? tier : VIDEO_TIERS.AUTO;

    if (validTier === VIDEO_TIERS.PERSONALIZED && !templateId) {
      return res.status(400).json({ error: 'templateId is required for personalized tier' });
    }

    if (format && !VIDEO_FORMATS[format]) {
      return res.status(400).json({ error: `Invalid format. Choose: ${Object.keys(VIDEO_FORMATS).join(', ')}` });
    }

    const result = await addVideoJob({
      userId: req.user.id,
      tier: validTier,
      script,
      projectName,
      tone: tone || 'professional',
      industry: industry || 'general',
      format: format || 'vertical',
      templateId: templateId || null,
      photos: photos || [],
      channels: channels || [],
    });

    res.status(202).json(result);
  } catch (err) {
    console.error('[VideoCreate] Queue error:', err.message);
    res.status(500).json({ error: 'Failed to queue video creation' });
  }
});

// POST /create/upload — Upload photo for Tier 2 personalized videos
router.post('/create/upload', async (req, res) => {
  try {
    // Accept base64 or raw buffer from multipart
    const { filename, data, contentType } = req.body;

    if (!data || !filename) {
      return res.status(400).json({ error: 'filename and data (base64) are required' });
    }

    const buffer = Buffer.from(data, 'base64');
    const ext = filename.split('.').pop() || 'jpg';
    const key = `photos/${req.user.id}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const url = await uploadToR2(key, buffer, contentType || `image/${ext}`);

    res.json({ url, key });
  } catch (err) {
    console.error('[VideoCreate] Upload error:', err.message);
    res.status(500).json({ error: 'Photo upload failed' });
  }
});

// GET /create/:jobId — Check job status
router.get('/create/:jobId', async (req, res) => {
  try {
    const queue = getVideoQueue();
    if (!queue) {
      return res.status(503).json({ error: 'Video queue not available' });
    }

    const job = await queue.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress || 0;

    res.json({
      jobId: job.id,
      status: state,
      progress,
      data: {
        projectName: job.data.projectName,
        tier: job.data.tier,
      },
      result: state === 'completed' ? job.returnvalue : null,
      failedReason: state === 'failed' ? job.failedReason : null,
    });
  } catch (err) {
    console.error('[VideoCreate] Status check error:', err.message);
    res.status(500).json({ error: 'Failed to check job status' });
  }
});

// GET /templates — List available Tier 2 templates
router.get('/templates', (req, res) => {
  const templates = VIDEO_TEMPLATES.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    photoSlots: t.photoSlots,
    industries: t.industries,
  }));
  res.json({ templates });
});

// GET /templates/:id — Get template details
router.get('/templates/:id', (req, res) => {
  const template = VIDEO_TEMPLATES.find(t => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json({ template });
});

module.exports = router;
