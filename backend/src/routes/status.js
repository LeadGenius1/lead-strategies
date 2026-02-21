// Integration status - reports which features are configured
const express = require('express');
const router = express.Router();
const { checkRedisHealth } = require('../config/redis');
const { authenticate } = require('../middleware/auth');

// GET /api/v1/status/api-keys - Test all Railway API keys with actual connectivity
// PROTECTED: Requires authentication + admin role (exposes service configuration)
router.get('/api-keys', authenticate, (req, res, next) => {
  if (!req.user || (req.user.role !== 'super_admin' && req.user.role !== 'admin' && !req.user.is_admin)) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}, async (req, res) => {
  const results = {};
  const run = async (name, fn) => {
    try {
      const r = await fn();
      results[name] = r;
      return r;
    } catch (err) {
      results[name] = { ok: false, error: err.message };
      return results[name];
    }
  };

  // 1. Anthropic (Lead Hunter)
  await run('anthropic', async () => {
    const key = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY;
    if (!key) return { ok: false, error: 'ANTHROPIC_API_KEY not set' };
    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: key });
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Say "OK" only.' }],
      });
      return { ok: true, message: (msg.content[0]?.text || '').trim() };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  // 2. OpenAI
  await run('openai', async () => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return { ok: false, error: 'OPENAI_API_KEY not set' };
    try {
      const OpenAI = require('openai').default;
      const client = new OpenAI({ apiKey: key });
      const list = await client.models.list();
      return { ok: true, message: `Models available: ${list.data?.length ?? 0}` };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  // 3. Apollo (lead discovery) - minimal search to verify key
  await run('apollo', async () => {
    const key = process.env.APOLLO_API_KEY;
    if (!key) return { ok: false, error: 'APOLLO_API_KEY not set' };
    try {
      const axios = require('axios');
      const r = await axios.post(
        'https://api.apollo.io/v1/mixed_people/search',
        { q_keywords: 'test', per_page: 1, page: 1 },
        { headers: { 'X-Api-Key': key, 'Content-Type': 'application/json' }, timeout: 8000 }
      );
      const total = r.data?.pagination?.total_entries ?? '?';
      return { ok: true, message: `Search OK (${total} total entries)` };
    } catch (e) {
      return { ok: false, error: e.response?.data?.error || e.message };
    }
  });

  // 4. Stripe (read-only balance check)
  await run('stripe', async () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return { ok: false, error: 'STRIPE_SECRET_KEY not set' };
    try {
      const Stripe = require('stripe');
      const stripe = new Stripe(key);
      await stripe.balance.retrieve();
      return { ok: true, message: 'Balance API OK' };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  // 5. Mailgun (domain list)
  await run('mailgun', async () => {
    const key = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN || process.env.MAILGUN_DOMAIN_NAME;
    if (!key) return { ok: false, error: 'MAILGUN_API_KEY not set' };
    try {
      const axios = require('axios');
      const region = (process.env.MAILGUN_REGION || 'us').toLowerCase() === 'eu' ? 'eu' : 'us';
      const base = `https://api.${region === 'eu' ? 'eu.' : ''}mailgun.net/v3`;
      const r = await axios.get(`${base}/domains`, {
        auth: { username: 'api', password: key },
        timeout: 5000,
      });
      const count = r.data?.items?.length ?? 0;
      return { ok: true, message: domain ? `Domain ${domain} configured, ${count} total` : `${count} domains` };
    } catch (e) {
      return { ok: false, error: e.response?.data?.message || e.message };
    }
  });

  // 6. Database
  await run('database', async () => {
    if (!process.env.DATABASE_URL) return { ok: false, error: 'DATABASE_URL not set' };
    try {
      const { PrismaClient } = require('@prisma/client');
      const { prisma } = require('../config/database');
      await prisma.$queryRaw`SELECT 1`;

      return { ok: true, message: 'Connected' };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  // 7. Redis
  await run('redis', async () => {
    const redis = await checkRedisHealth();
    if (!redis.available) return { ok: false, error: redis.error || 'Not connected' };
    return { ok: true, message: 'Connected' };
  });

  // 8. R2 (Cloudflare)
  await run('r2', async () => {
    const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY, CLOUDFLARE_R2_BUCKET } = process.env;
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_R2_ACCESS_KEY || !CLOUDFLARE_R2_SECRET_KEY) {
      return { ok: false, error: 'CLOUDFLARE_* R2 vars not set' };
    }
    try {
      const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
      const client = new S3Client({
        region: 'auto',
        endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: CLOUDFLARE_R2_ACCESS_KEY,
          secretAccessKey: CLOUDFLARE_R2_SECRET_KEY,
        },
      });
      await client.send(new HeadBucketCommand({ Bucket: CLOUDFLARE_R2_BUCKET || 'videosite-videos' }));
      return { ok: true, message: 'Bucket OK' };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  const passed = Object.values(results).filter((r) => r?.ok).length;
  const total = Object.keys(results).length;
  res.json({
    success: true,
    summary: { passed, total, allOk: passed === total },
    results,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/v1/status/integrations - Feature readiness (public, no secrets)
router.get('/integrations', (req, res) => {
  res.json({
    success: true,
    data: {
      email: {
        mailgun: !!process.env.MAILGUN_API_KEY,
        configured: !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN)
      },
      ai: {
        openai: !!process.env.OPENAI_API_KEY,
        configured: !!process.env.OPENAI_API_KEY
      },
      social: {
        facebook: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
        twitter: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET)
      },
      payments: {
        stripe: !!process.env.STRIPE_SECRET_KEY,
        stripeConnect: !!process.env.STRIPE_SECRET_KEY
      },
      monitoring: {
        sentry: !!process.env.SENTRY_DSN
      }
    }
  });
});

module.exports = router;
