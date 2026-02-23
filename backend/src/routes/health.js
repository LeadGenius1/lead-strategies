const featureFlags = require('../config/feature-flags');

module.exports = async (req, res) => {
  const { prisma, checkDatabaseHealth } = require('../config/database');

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'leadsite-backend',
    checks: {},
    features: featureFlags,
  };

  // 1. Database connectivity
  try {
    const dbHealth = await checkDatabaseHealth();
    health.checks.database = dbHealth.status === 'healthy' ? 'ok' : 'error';
    if (dbHealth.status !== 'healthy') health.status = 'degraded';
  } catch (err) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }

  // 2. Core model: users (required for auth)
  try {
    await prisma.user.count();
    health.checks.prisma_user = 'ok';
  } catch (err) {
    health.checks.prisma_user = 'error';
    health.status = 'degraded';
  }

  // 3. Platform-specific model checks (only if flag enabled)
  if (featureFlags.ENABLE_LEADSITE_IO) {
    try {
      await prisma.website.count();
      health.checks.websites_model = 'ok';
    } catch (err) {
      health.checks.websites_model = 'error';
      health.status = 'degraded';
    }
  }

  if (featureFlags.ENABLE_VIDEOSITE_AI) {
    try {
      await prisma.video.count();
      health.checks.videos_model = 'ok';
    } catch (err) {
      health.checks.videos_model = 'error';
      health.status = 'degraded';
    }
  }

  if (featureFlags.ENABLE_LEADSITE_AI) {
    try {
      await prisma.lead.count();
      health.checks.leads_model = 'ok';
    } catch (err) {
      health.checks.leads_model = 'error';
      health.status = 'degraded';
    }
  }

  if (featureFlags.ENABLE_CLIENT_CONTACT) {
    try {
      await prisma.conversation.count();
      health.checks.conversations_model = 'ok';
    } catch (err) {
      health.checks.conversations_model = 'error';
      health.status = 'degraded';
    }
  }

  if (featureFlags.ENABLE_ULTRALEAD) {
    try {
      await prisma.contact.count();
      health.checks.crm_model = 'ok';
    } catch (err) {
      health.checks.crm_model = 'error';
      health.status = 'degraded';
    }
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
};
