// ═══════════════════════════════════════════════════════════════
// EXECUTOR — VIDEOSITE (Video Creation)
// Queues a video creation job via BullMQ worker.
// ═══════════════════════════════════════════════════════════════

const { prisma } = require('../../../../config/database');
const { addVideoJob } = require('../../video/worker');

/**
 * Queue a video for creation.
 *
 * @param {object} payload
 * @param {string} payload.userId - Owner user ID
 * @param {string} payload.title - Video title
 * @param {string} [payload.script] - AI-generated script
 * @param {string} [payload.style] - Video style / tone
 * @param {string} [payload.tier] - 'auto' or 'personalized'
 * @param {string} [payload.templateId] - Tier 2 template ID
 * @param {string[]} [payload.photos] - Tier 2 photo URLs
 * @param {string[]} [payload.channels] - Distribution channels
 * @returns {Promise<object>}
 */
async function queueVideo({ userId, title, script, style, tier, templateId, photos, channels }) {
  if (!userId || !title) {
    return { status: 'failed', error: 'userId and title are required' };
  }

  try {
    const result = await addVideoJob({
      userId,
      tier: tier || 'auto',
      script: script || '',
      projectName: title,
      tone: style || 'professional',
      industry: 'general',
      format: 'vertical',
      templateId: templateId || null,
      photos: photos || [],
      channels: channels || [],
    });

    return {
      status: 'queued',
      jobId: result.jobId,
      message: 'Video queued for creation via rendering pipeline.',
    };
  } catch (err) {
    // Fallback: create a DB record if queue is unavailable
    try {
      const video = await prisma.video.create({
        data: {
          userId,
          title,
          description: script || '',
          status: 'processing',
        },
      });
      return {
        status: 'queued-fallback',
        videoId: video.id,
        message: 'Video record created (queue unavailable, will process when available).',
      };
    } catch (dbErr) {
      return { status: 'failed', error: `Video queue failed: ${err.message}` };
    }
  }
}

module.exports = { queueVideo };
