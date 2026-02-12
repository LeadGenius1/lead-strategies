// OAuth callback routes for social channels (NO AUTH - user redirected from provider)
const express = require('express');
const router = express.Router();
const pkceStore = require('../lib/pkce-store');

let prisma = null;
function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
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

    let userId;
    try {
      userId = Buffer.from(state, 'base64').toString();
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
      return res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=token_failed`);
    }

    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`
    );
    const pagesData = await pagesRes.json();
    const pages = pagesData.data || [];

    if (pages.length > 0) {
      const page = pages[0];
      await db.channel.create({
        data: {
          userId,
          type: 'facebook',
          name: page.name || 'Facebook Page',
          credentials: { pageId: page.id, pageAccessToken: page.access_token },
          settings: { enabled: true },
          status: 'connected',
          lastSyncAt: new Date()
        }
      });
    }

    res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?connected=facebook`);
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

    const stored = pkceStore.get(state);
    if (!stored) return res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=invalid_state`);
    const { codeVerifier, userId } = stored;

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
      return res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=token_failed`);
    }

    const userRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    const username = userData.data?.username || 'Twitter';

    await db.channel.create({
      data: {
        userId,
        type: 'twitter',
        name: `@${username}`,
        credentials: { accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token, twitterUserId: userData.data?.id },
        settings: { enabled: true },
        status: 'connected',
        lastSyncAt: new Date()
      }
    });

    res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?connected=twitter`);
  } catch (error) {
    console.error('Twitter callback error:', error);
    res.redirect(`${FRONTEND_URL}/dashboard/inbox/settings/channels?error=callback_failed`);
  }
});

module.exports = router;
