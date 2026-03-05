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
      return postToInstagram(credentials, content);
    case 'linkedin':
      return postToLinkedIn(credentials, content);
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

/**
 * Post to Instagram via Graph API (2-step container creation).
 */
async function postToInstagram(credentials, content) {
  const { instagramAccountId, pageAccessToken } = credentials;

  if (!instagramAccountId || !pageAccessToken) {
    return { status: 'failed', error: 'Instagram credentials missing. Re-connect in Settings.' };
  }

  try {
    // Step 1: Create media container (text-only / carousel not supported without image)
    const createRes = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: content,
          media_type: 'TEXT',
          access_token: pageAccessToken,
        }),
      }
    );

    const createData = await createRes.json();

    if (!createRes.ok || createData.error) {
      return { status: 'failed', error: createData.error?.message || 'Instagram container creation failed' };
    }

    // Step 2: Publish the container
    const publishRes = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: createData.id,
          access_token: pageAccessToken,
        }),
      }
    );

    const publishData = await publishRes.json();

    if (!publishRes.ok || publishData.error) {
      return { status: 'failed', error: publishData.error?.message || 'Instagram publish failed' };
    }

    return { status: 'completed', postId: publishData.id, platform: 'instagram' };
  } catch (err) {
    return { status: 'failed', error: `Instagram post failed: ${err.message}` };
  }
}

/**
 * Post to LinkedIn via UGC Posts API.
 */
async function postToLinkedIn(credentials, content) {
  const { accessToken, personId } = credentials;

  if (!accessToken || !personId) {
    return { status: 'failed', error: 'LinkedIn credentials missing. Re-connect in Settings.' };
  }

  try {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { status: 'failed', error: data.message || 'LinkedIn API error' };
    }

    return { status: 'completed', postId: data.id, platform: 'linkedin' };
  } catch (err) {
    return { status: 'failed', error: `LinkedIn post failed: ${err.message}` };
  }
}

module.exports = { postToChannel };
