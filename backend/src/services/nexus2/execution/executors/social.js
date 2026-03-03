// ═══════════════════════════════════════════════════════════════
// EXECUTOR — SOCIAL MEDIA POSTING
// Best-effort for Facebook/Twitter (uses stored OAuth tokens).
// Graceful stubs for Instagram, LinkedIn, others.
// ═══════════════════════════════════════════════════════════════

const { prisma } = require('../../../../config/database');

/**
 * Post content to a social media channel.
 *
 * @param {object} payload
 * @param {string} payload.channelType - facebook|twitter|instagram|linkedin|etc
 * @param {string} payload.userId - User ID to look up Channel credentials
 * @param {string} payload.content - Text content to post
 * @returns {Promise<object>}
 */
async function postToChannel({ channelType, userId, content }) {
  if (!channelType || !userId || !content) {
    return { status: 'failed', error: 'channelType, userId, and content are required' };
  }

  // Load channel credentials from DB
  const channel = await prisma.channel.findFirst({
    where: { userId, type: channelType, status: 'connected' },
  });

  if (!channel) {
    return {
      status: 'not_available',
      message: `No connected ${channelType} channel found. Connect it in Channel Manager.`,
    };
  }

  const credentials = typeof channel.credentials === 'string'
    ? JSON.parse(channel.credentials)
    : (channel.credentials || {});

  switch (channelType) {
    case 'facebook':
      return postToFacebook(credentials, content);
    case 'twitter':
      return postToTwitter(credentials, content);
    case 'instagram':
      return { status: 'not_available', message: 'Instagram posting coming soon' };
    case 'linkedin':
      return { status: 'not_available', message: 'LinkedIn posting coming soon' };
    default:
      return { status: 'not_available', message: `${channelType} posting coming soon` };
  }
}

/**
 * Post to Facebook Page via Graph API.
 */
async function postToFacebook(credentials, content) {
  const { pageId, pageAccessToken } = credentials;

  if (!pageId || !pageAccessToken) {
    return { status: 'failed', error: 'Facebook page credentials missing. Re-connect in Channel Manager.' };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        access_token: pageAccessToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { status: 'failed', error: data.error?.message || 'Facebook API error' };
    }

    return { status: 'completed', postId: data.id, platform: 'facebook' };
  } catch (err) {
    return { status: 'failed', error: `Facebook post failed: ${err.message}` };
  }
}

/**
 * Post to Twitter via v2 API.
 */
async function postToTwitter(credentials, content) {
  const { accessToken } = credentials;

  if (!accessToken) {
    return { status: 'failed', error: 'Twitter credentials missing. Re-connect in Channel Manager.' };
  }

  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text: content }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { status: 'failed', error: data.detail || data.title || 'Twitter API error' };
    }

    return { status: 'completed', tweetId: data.data?.id, platform: 'twitter' };
  } catch (err) {
    return { status: 'failed', error: `Twitter post failed: ${err.message}` };
  }
}

module.exports = { postToChannel };
