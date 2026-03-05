// OAuth callback routes for social channels (NO AUTH - user redirected from provider)
const express = require('express');
const router = express.Router();
const pkceStore = require('../lib/pkce-store');

let prisma = null;
function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {

    prisma = require('../config/database').prisma;
  }
  return prisma;
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// GET /api/v1/oauth/channels/facebook/callback
router.get('/facebook/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    if (error) return res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=${encodeURIComponent(error)}`);

    const db = getPrisma();
    if (!db || !code || !state) {
      return res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=invalid_callback`);
    }

    let userId, returnTo = '';
    try {
      const decoded = Buffer.from(state, 'base64').toString();
      // Support both old format (plain userId) and new format (JSON)
      try {
        const parsed = JSON.parse(decoded);
        userId = parsed.userId;
        returnTo = parsed.returnTo || '';
      } catch {
        userId = decoded;
      }
    } catch (e) {
      return res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=invalid_state`);
    }

    const META_APP_ID = process.env.META_APP_ID;
    const META_APP_SECRET = process.env.META_APP_SECRET;
    if (!META_APP_ID || !META_APP_SECRET) {
      return res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=meta_not_configured`);
    }

    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&redirect_uri=${encodeURIComponent(`${BACKEND_URL}/api/v1/oauth/channels/facebook/callback`)}&code=${code}`
    );
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      const redir = returnTo || '/dashboard/inbox/settings/channels';
      return res.redirect(`${FRONTEND_URL}${redir}?error=token_failed`);
    }

    // Exchange short-lived token for long-lived token (60 days)
    let longLivedToken = tokenData.access_token;
    try {
      const llRes = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
      );
      const llData = await llRes.json();
      if (llData.access_token) longLivedToken = llData.access_token;
    } catch { /* use short-lived if exchange fails */ }

    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`
    );
    const pagesData = await pagesRes.json();
    const pages = pagesData.data || [];

    if (pages.length > 0) {
      const page = pages[0];
      // Upsert — don't create duplicate if reconnecting
      const existing = await db.channel.findFirst({ where: { userId, type: 'facebook' } });
      if (existing) {
        await db.channel.update({
          where: { id: existing.id },
          data: {
            name: page.name || 'Facebook Page',
            credentials: { pageId: page.id, pageAccessToken: page.access_token, userAccessToken: longLivedToken },
            status: 'connected',
            lastSyncAt: new Date()
          }
        });
      } else {
        await db.channel.create({
          data: {
            userId,
            type: 'facebook',
            name: page.name || 'Facebook Page',
            credentials: { pageId: page.id, pageAccessToken: page.access_token, userAccessToken: longLivedToken },
            settings: { enabled: true },
            status: 'connected',
            lastSyncAt: new Date()
          }
        });
      }
    }

    const redir = returnTo || '/dashboard/inbox/settings/channels';
    res.redirect(`${FRONTEND_URL}${redir}?connected=facebook`);
  } catch (error) {
    console.error('Facebook callback error:', error);
    res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=callback_failed`);
  }
});

// GET /api/v1/oauth/channels/twitter/callback
router.get('/twitter/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    if (error) return res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=${encodeURIComponent(error)}`);

    const db = getPrisma();
    if (!db || !code || !state) {
      return res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=invalid_callback`);
    }

    const stored = await pkceStore.get(state);
    if (!stored) return res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=invalid_state`);
    const { codeVerifier, userId, returnTo } = stored;

    const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
    const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
    if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
      return res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=twitter_not_configured`);
    }

    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${BACKEND_URL}/api/v1/oauth/channels/twitter/callback`,
        code_verifier: codeVerifier
      })
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      const redir = returnTo || '/dashboard/inbox/settings/channels';
      return res.redirect(`${FRONTEND_URL}${redir}?error=token_failed`);
    }

    const userRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    const username = userData.data?.username || 'Twitter';

    // Upsert — don't create duplicate if reconnecting
    const existing = await db.channel.findFirst({ where: { userId, type: 'twitter' } });
    const channelData = {
      name: `@${username}`,
      credentials: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        twitterUserId: userData.data?.id,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
      },
      status: 'connected',
      lastSyncAt: new Date()
    };

    if (existing) {
      await db.channel.update({ where: { id: existing.id }, data: channelData });
    } else {
      await db.channel.create({
        data: { userId, type: 'twitter', settings: { enabled: true }, ...channelData }
      });
    }

    const redir = returnTo || '/dashboard/inbox/settings/channels';
    res.redirect(`${FRONTEND_URL}${redir}?connected=twitter`);
  } catch (error) {
    console.error('Twitter callback error:', error);
    res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=callback_failed`);
  }
});

// GET /api/v1/oauth/channels/instagram/callback
router.get('/instagram/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    if (error) return res.redirect(`${FRONTEND_URL}/nexus/settings?error=${encodeURIComponent(error)}`);

    const db = getPrisma();
    if (!db || !code || !state) {
      return res.redirect(`${FRONTEND_URL}/nexus/settings?error=invalid_callback`);
    }

    let userId, returnTo = '/nexus/settings';
    try {
      const decoded = Buffer.from(state, 'base64').toString();
      try {
        const parsed = JSON.parse(decoded);
        userId = parsed.userId;
        returnTo = parsed.returnTo || '/nexus/settings';
      } catch {
        userId = decoded;
      }
    } catch (e) {
      return res.redirect(`${FRONTEND_URL}/nexus/settings?error=invalid_state`);
    }

    const META_APP_ID = process.env.META_APP_ID;
    const META_APP_SECRET = process.env.META_APP_SECRET;
    if (!META_APP_ID || !META_APP_SECRET) {
      return res.redirect(`${FRONTEND_URL}${returnTo}?error=meta_not_configured`);
    }

    // Exchange code for token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&redirect_uri=${encodeURIComponent(`${BACKEND_URL}/api/v1/oauth/channels/instagram/callback`)}&code=${code}`
    );
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return res.redirect(`${FRONTEND_URL}${returnTo}?error=token_failed`);
    }

    // Exchange for long-lived token
    let longLivedToken = tokenData.access_token;
    try {
      const llRes = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
      );
      const llData = await llRes.json();
      if (llData.access_token) longLivedToken = llData.access_token;
    } catch { /* use short-lived if exchange fails */ }

    // Get user's pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`
    );
    const pagesData = await pagesRes.json();
    const pages = pagesData.data || [];

    if (pages.length === 0) {
      return res.redirect(`${FRONTEND_URL}${returnTo}?error=no_facebook_pages`);
    }

    // Find Instagram Business Account linked to the first page
    let instagramAccountId = null;
    let instagramUsername = null;
    let pageName = pages[0].name;
    let pageAccessToken = pages[0].access_token;

    for (const page of pages) {
      const igRes = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      );
      const igData = await igRes.json();
      if (igData.instagram_business_account?.id) {
        instagramAccountId = igData.instagram_business_account.id;
        pageAccessToken = page.access_token;
        pageName = page.name;

        // Get IG username
        const igProfileRes = await fetch(
          `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=username&access_token=${pageAccessToken}`
        );
        const igProfile = await igProfileRes.json();
        instagramUsername = igProfile.username || null;
        break;
      }
    }

    if (!instagramAccountId) {
      return res.redirect(`${FRONTEND_URL}${returnTo}?error=no_instagram_business`);
    }

    // Upsert Instagram channel
    const existing = await db.channel.findFirst({ where: { userId, type: 'instagram' } });
    const channelData = {
      name: instagramUsername ? `@${instagramUsername}` : `IG (${pageName})`,
      credentials: {
        instagramAccountId,
        pageAccessToken,
        userAccessToken: longLivedToken,
        instagramUsername,
      },
      status: 'connected',
      lastSyncAt: new Date()
    };

    if (existing) {
      await db.channel.update({ where: { id: existing.id }, data: channelData });
    } else {
      await db.channel.create({
        data: { userId, type: 'instagram', settings: { enabled: true }, ...channelData }
      });
    }

    res.redirect(`${FRONTEND_URL}${returnTo}?connected=instagram`);
  } catch (error) {
    console.error('Instagram callback error:', error);
    res.redirect(`${FRONTEND_URL}/nexus/settings?error=callback_failed`);
  }
});

// GET /api/v1/oauth/channels/linkedin/callback
router.get('/linkedin/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    if (error) return res.redirect(`${FRONTEND_URL}/nexus/settings?error=${encodeURIComponent(error)}`);

    const db = getPrisma();
    if (!db || !code || !state) {
      return res.redirect(`${FRONTEND_URL}/nexus/settings?error=invalid_callback`);
    }

    const stored = await pkceStore.get(state);
    if (!stored) return res.redirect(`${FRONTEND_URL}/nexus/settings?error=invalid_state`);
    const { userId, returnTo } = stored;
    const redir = returnTo || '/nexus/settings';

    const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
    const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      return res.redirect(`${FRONTEND_URL}${redir}?error=linkedin_not_configured`);
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${BACKEND_URL}/api/v1/oauth/channels/linkedin/callback`,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      })
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return res.redirect(`${FRONTEND_URL}${redir}?error=token_failed`);
    }

    // Get user profile (using OpenID userinfo endpoint)
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    const profile = await profileRes.json();

    const personId = profile.sub;
    const displayName = profile.name || profile.given_name || 'LinkedIn';

    if (!personId) {
      return res.redirect(`${FRONTEND_URL}${redir}?error=profile_failed`);
    }

    // Upsert LinkedIn channel
    const existing = await db.channel.findFirst({ where: { userId, type: 'linkedin' } });
    const channelData = {
      name: displayName,
      credentials: {
        accessToken: tokenData.access_token,
        personId,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
        refreshToken: tokenData.refresh_token || null,
      },
      status: 'connected',
      lastSyncAt: new Date()
    };

    if (existing) {
      await db.channel.update({ where: { id: existing.id }, data: channelData });
    } else {
      await db.channel.create({
        data: { userId, type: 'linkedin', settings: { enabled: true }, ...channelData }
      });
    }

    res.redirect(`${FRONTEND_URL}${redir}?connected=linkedin`);
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.redirect(`${FRONTEND_URL}/nexus/settings?error=callback_failed`);
  }
});

module.exports = router;
