// Integration status - reports which features are configured (no auth required)
const express = require('express');
const router = express.Router();

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
