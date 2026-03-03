// ═══════════════════════════════════════════════════════════════
// EXECUTOR — VIDEOSITE (Video Creation)
// Graceful stub: creates a Video record with 'processing' status.
// Actual rendering pipeline (FFmpeg/n8n) is not yet implemented.
// ═══════════════════════════════════════════════════════════════

const prisma = require('../../../../config/database');

/**
 * Queue a video for creation.
 *
 * @param {object} payload
 * @param {string} payload.userId - Owner user ID
 * @param {string} payload.title - Video title
 * @param {string} [payload.script] - AI-generated script
 * @param {string} [payload.style] - Video style (e.g. 'explainer', 'promo')
 * @returns {Promise<object>}
 */
async function queueVideo({ userId, title, script, style }) {
  if (!userId || !title) {
    return { status: 'failed', error: 'userId and title are required' };
  }

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
      status: 'queued',
      videoId: video.id,
      message: 'Video queued for creation. Rendering pipeline coming soon.',
    };
  } catch (err) {
    return { status: 'failed', error: `Video queue failed: ${err.message}` };
  }
}

module.exports = { queueVideo };
