// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — BUSINESS PROFILE API
// 5 endpoints: get, create, update, discover, status
// All routes require authentication.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { prisma } = require('../config/database');
const IORedis = require('ioredis');
const { Queue } = require('bullmq');

// All routes require authentication
router.use(authenticate);

// --- BullMQ queue for discovery jobs ---
const QUEUE_NAME = 'nexus-discovery';
let discoveryQueue = null;
let redisConnection = null;

function getRedisConnection() {
  if (!redisConnection && process.env.REDIS_URL) {
    redisConnection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return redisConnection;
}

function getDiscoveryQueue() {
  if (!discoveryQueue) {
    const conn = getRedisConnection();
    if (!conn) return null;
    discoveryQueue = new Queue(QUEUE_NAME, {
      connection: conn,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 50,
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
      },
    });
  }
  return discoveryQueue;
}

// ═══ GET / — Get current user's business profile ═══
// If no BusinessProfile exists, returns suggested values from user.metadata
// so the frontend can pre-fill the onboarding form.
router.get('/', async (req, res) => {
  try {
    const profile = await prisma.businessProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (profile) {
      return res.json({ success: true, status: 'profile_exists', profile });
    }

    // No BusinessProfile yet — pull suggested values from user.metadata
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { name: true, email: true, company: true, metadata: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const meta = (user.metadata && typeof user.metadata === 'object') ? user.metadata : {};

    // Map existing user.metadata fields to BusinessProfile field names
    const suggested = {
      businessName: user.company || meta.companyName || '',
      website: meta.companyWebsite || '',
      industry: meta.industry || '',
      toneOfVoice: meta.preferredTone || '',
      // Fields that exist in metadata but map to different BusinessProfile concepts
      _hints: {
        productsServices: meta.productsServices || '',
        uniqueValueProposition: meta.uniqueValueProposition || '',
        targetAudience: meta.targetAudience || '',
        idealCustomerProfile: meta.idealCustomerProfile || '',
        painPointsSolved: meta.painPointsSolved || '',
        competitorDifferentiation: meta.competitorDifferentiation || '',
        companySize: meta.companySize || '',
        location: meta.location || '',
      },
    };

    res.json({ success: true, status: 'profile_not_created', suggested });
  } catch (err) {
    console.error('[BusinessProfile] GET error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══ POST / — Create business profile (onboarding) ═══
// Required: businessName, industry, businessType, targetMarket, icp, offer,
//           competitors, budgetRange, platforms, activeChannels
// Optional: website, yearFounded, teamSize, uniqueValue, socialProfiles,
//           toneOfVoice, contentFreq, approvalMode
router.post('/', async (req, res) => {
  try {
    // Check if profile already exists
    const existing = await prisma.businessProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Business profile already exists. Use PUT to update.',
      });
    }

    const {
      businessName, website, industry, businessType, yearFounded, teamSize,
      targetMarket, icp, offer, uniqueValue, competitors,
      budgetRange, platforms, activeChannels,
      socialProfiles, toneOfVoice, contentFreq, approvalMode,
    } = req.body;

    // Validate required fields
    const missing = [];
    if (!businessName) missing.push('businessName');
    if (!industry) missing.push('industry');
    if (!businessType) missing.push('businessType');
    if (!targetMarket) missing.push('targetMarket');
    if (!icp) missing.push('icp');
    if (!offer) missing.push('offer');
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0) missing.push('competitors');
    if (!budgetRange) missing.push('budgetRange');
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) missing.push('platforms');
    if (!activeChannels || !Array.isArray(activeChannels) || activeChannels.length === 0) missing.push('activeChannels');

    if (missing.length > 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields', missing });
    }

    // Validate businessType
    const validBusinessTypes = ['B2B', 'B2C', 'B2B2C'];
    if (!validBusinessTypes.includes(businessType)) {
      return res.status(400).json({
        success: false,
        error: `businessType must be one of: ${validBusinessTypes.join(', ')}`,
      });
    }

    // Create the profile
    const profile = await prisma.businessProfile.create({
      data: {
        userId: req.user.id,
        businessName,
        website: website || null,
        industry,
        businessType,
        yearFounded: yearFounded ? parseInt(yearFounded, 10) : null,
        teamSize: teamSize || null,
        targetMarket,
        icp,
        offer,
        uniqueValue: uniqueValue || null,
        competitors,
        budgetRange,
        platforms,
        activeChannels,
        socialProfiles: socialProfiles || null,
        toneOfVoice: toneOfVoice || null,
        contentFreq: contentFreq || null,
        approvalMode: approvalMode || 'review',
        profileComplete: true,
      },
    });

    // Queue Discovery Agent job via BullMQ; fall back to inline if queue unavailable
    let discoveryJobId = null;
    try {
      const q = getDiscoveryQueue();
      if (q) {
        const jobRef = `discovery-${profile.id}-${Date.now()}`;
        await q.add('run-discovery', {
          profileId: profile.id,
          userId: req.user.id,
          tasks: ['website-scrape', 'social-discovery', 'competitor-scrape', 'market-research', 'ai-synthesis'],
        }, { jobId: jobRef });
        discoveryJobId = jobRef;
        console.log(`[BusinessProfile] Discovery job queued: ${jobRef}`);
      } else {
        // Fallback: run discovery inline when Redis/BullMQ unavailable
        console.warn('[BusinessProfile] Queue unavailable — running discovery inline');
        const { getRedisClient } = require('../config/redis');
        const { runDiscovery } = require('../services/nexus2/discoveryAgent');
        const redis = getRedisClient();
        const inlineJobId = `discovery-inline-${profile.id}-${Date.now()}`;
        // Fire-and-forget so the response isn't blocked
        runDiscovery(profile.id, req.user.id,
          ['website-scrape', 'social-discovery', 'competitor-scrape', 'market-research', 'ai-synthesis'],
          redis, inlineJobId
        ).then(() => {
          console.log(`[BusinessProfile] Inline discovery completed: ${inlineJobId}`);
        }).catch((err) => {
          console.error(`[BusinessProfile] Inline discovery failed: ${err.message}`);
        });
        discoveryJobId = inlineJobId;
      }
    } catch (queueErr) {
      console.error('[BusinessProfile] Failed to queue discovery job:', queueErr.message);
    }

    res.status(201).json({
      success: true,
      data: profile,
      discoveryJobId,
      message: discoveryJobId
        ? 'Business profile created. AI discovery started.'
        : 'Business profile created. AI discovery will run when queue is available.',
    });
  } catch (err) {
    console.error('[BusinessProfile] POST error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══ PUT / — Update business profile (adjust strategy) ═══
// Accepts partial updates. Re-triggers discovery when key fields change.
router.put('/', async (req, res) => {
  try {
    const existing = await prisma.businessProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'No business profile found. Use POST to create one first.',
      });
    }

    const {
      businessName, website, industry, businessType, yearFounded, teamSize,
      targetMarket, icp, offer, uniqueValue, competitors,
      budgetRange, platforms, activeChannels,
      socialProfiles, toneOfVoice, contentFreq, approvalMode,
    } = req.body;

    // Build update data — only include fields that were provided
    const data = {};
    if (businessName !== undefined) data.businessName = businessName;
    if (website !== undefined) data.website = website || null;
    if (industry !== undefined) data.industry = industry;
    if (businessType !== undefined) {
      const validBusinessTypes = ['B2B', 'B2C', 'B2B2C'];
      if (!validBusinessTypes.includes(businessType)) {
        return res.status(400).json({
          success: false,
          error: `businessType must be one of: ${validBusinessTypes.join(', ')}`,
        });
      }
      data.businessType = businessType;
    }
    if (yearFounded !== undefined) data.yearFounded = yearFounded ? parseInt(yearFounded, 10) : null;
    if (teamSize !== undefined) data.teamSize = teamSize || null;
    if (targetMarket !== undefined) data.targetMarket = targetMarket;
    if (icp !== undefined) data.icp = icp;
    if (offer !== undefined) data.offer = offer;
    if (uniqueValue !== undefined) data.uniqueValue = uniqueValue || null;
    if (competitors !== undefined) {
      if (!Array.isArray(competitors) || competitors.length === 0) {
        return res.status(400).json({ success: false, error: 'competitors must be a non-empty array' });
      }
      data.competitors = competitors;
    }
    if (budgetRange !== undefined) data.budgetRange = budgetRange;
    if (platforms !== undefined) {
      if (!Array.isArray(platforms) || platforms.length === 0) {
        return res.status(400).json({ success: false, error: 'platforms must be a non-empty array' });
      }
      data.platforms = platforms;
    }
    if (activeChannels !== undefined) {
      if (!Array.isArray(activeChannels) || activeChannels.length === 0) {
        return res.status(400).json({ success: false, error: 'activeChannels must be a non-empty array' });
      }
      data.activeChannels = activeChannels;
    }
    if (socialProfiles !== undefined) data.socialProfiles = socialProfiles;
    if (toneOfVoice !== undefined) data.toneOfVoice = toneOfVoice || null;
    if (contentFreq !== undefined) data.contentFreq = contentFreq || null;
    if (approvalMode !== undefined) data.approvalMode = approvalMode;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    const profile = await prisma.businessProfile.update({
      where: { userId: req.user.id },
      data,
    });

    // Check if key strategy fields changed — re-trigger discovery if so
    const keyFields = ['targetMarket', 'icp', 'competitors', 'offer', 'budgetRange', 'website'];
    const keyFieldChanged = keyFields.some(f => data[f] !== undefined);

    let discoveryJobId = null;
    if (keyFieldChanged) {
      try {
        const q = getDiscoveryQueue();
        if (q) {
          const jobRef = `discovery-${profile.id}-${Date.now()}`;
          // Only re-run tasks relevant to what changed
          const tasks = [];
          if (data.website !== undefined) tasks.push('website-scrape');
          if (data.competitors !== undefined) tasks.push('competitor-scrape');
          if (data.targetMarket !== undefined || data.icp !== undefined) tasks.push('market-research');
          // Always re-synthesize when key fields change
          tasks.push('ai-synthesis');

          await q.add('run-discovery', {
            profileId: profile.id,
            userId: req.user.id,
            tasks,
            isUpdate: true,
          }, { jobId: jobRef });
          discoveryJobId = jobRef;
          console.log(`[BusinessProfile] Re-discovery queued (key fields changed): ${jobRef}`);
        }
      } catch (queueErr) {
        console.error('[BusinessProfile] Failed to queue re-discovery:', queueErr.message);
      }
    }

    // Update scheduler if schedule-relevant fields changed
    const scheduleFields = ['contentFreq', 'competitors', 'contentThemes', 'activeChannels', 'toneOfVoice', 'icp', 'targetMarket', 'industry'];
    const changedFields = scheduleFields.filter(f => data[f] !== undefined);
    if (changedFields.length > 0) {
      try {
        const scheduler = require('../services/nexus2/scheduler/engine');
        await scheduler.updateSchedule(req.user.id, changedFields);
      } catch (schedErr) {
        console.error('[BusinessProfile] Scheduler update failed (non-fatal):', schedErr.message);
      }
    }

    res.json({
      success: true,
      data: profile,
      discoveryJobId,
      message: discoveryJobId
        ? 'Profile updated. AI re-discovery triggered for changed fields.'
        : 'Profile updated.',
    });
  } catch (err) {
    console.error('[BusinessProfile] PUT error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══ POST /discover — Manual re-discovery trigger ═══
// Queues a fresh AI enrichment run for the user's profile.
router.post('/discover', async (req, res) => {
  try {
    const profile = await prisma.businessProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'No business profile found. Create one first.',
      });
    }

    // Cooldown: prevent re-discovery within 5 minutes
    if (profile.lastDiscovery) {
      const elapsed = Date.now() - new Date(profile.lastDiscovery).getTime();
      const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
      if (elapsed < COOLDOWN_MS) {
        const retryAfter = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        return res.status(429).json({
          success: false,
          error: `Discovery ran recently. Please wait ${retryAfter} seconds before re-triggering.`,
          retryAfter,
        });
      }
    }

    const q = getDiscoveryQueue();
    if (!q) {
      return res.status(503).json({
        success: false,
        error: 'Discovery queue not available (no REDIS_URL)',
      });
    }

    const jobRef = `discovery-${profile.id}-${Date.now()}`;
    await q.add('run-discovery', {
      profileId: profile.id,
      userId: req.user.id,
      tasks: ['website-scrape', 'social-discovery', 'competitor-scrape', 'market-research', 'ai-synthesis'],
      isManual: true,
    }, { jobId: jobRef });

    console.log(`[BusinessProfile] Manual discovery queued: ${jobRef}`);

    res.json({
      success: true,
      discoveryJobId: jobRef,
      message: 'AI discovery started. Check /status for progress.',
    });
  } catch (err) {
    console.error('[BusinessProfile] POST /discover error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══ GET /status — Discovery status + enrichment progress ═══
// Returns profile completion state and what AI data has been populated.
router.get('/status', async (req, res) => {
  try {
    const profile = await prisma.businessProfile.findUnique({
      where: { userId: req.user.id },
      select: {
        id: true,
        profileComplete: true,
        discoveryRun: true,
        lastDiscovery: true,
        discoveredData: true,
        marketIntel: true,
        competitorIntel: true,
        contentThemes: true,
        audienceInsight: true,
        socialProfiles: true,
      },
    });

    if (!profile) {
      return res.json({
        success: true,
        status: 'no_profile',
        profileComplete: false,
        discoveryRun: false,
        enrichment: {},
      });
    }

    // Build enrichment progress — which AI fields have been populated
    const enrichment = {
      discoveredData: profile.discoveredData !== null,
      marketIntel: profile.marketIntel !== null,
      competitorIntel: profile.competitorIntel !== null,
      contentThemes: profile.contentThemes !== null,
      audienceInsight: profile.audienceInsight !== null,
      socialProfiles: profile.socialProfiles !== null,
    };
    const enrichedCount = Object.values(enrichment).filter(Boolean).length;
    const totalFields = Object.keys(enrichment).length;

    res.json({
      success: true,
      status: profile.discoveryRun ? 'discovery_complete' : (profile.profileComplete ? 'awaiting_discovery' : 'incomplete'),
      profileComplete: profile.profileComplete,
      discoveryRun: profile.discoveryRun,
      lastDiscovery: profile.lastDiscovery,
      enrichment,
      enrichmentProgress: `${enrichedCount}/${totalFields}`,
    });
  } catch (err) {
    console.error('[BusinessProfile] GET /status error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
