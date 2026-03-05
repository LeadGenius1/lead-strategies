// NEXUS Function #10: Healing Sentinel — System Health Check
// Monitors database, Redis, Instantly, Mailgun, and R2 health
const { prisma, checkDatabaseHealth } = require('../../config/database');
const { checkRedisHealth } = require('../../config/redis');

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || process.env.MAILGUN_DOMAIN_NAME || 'leadsite.ai';

/**
 * Check database health with latency measurement
 */
async function checkDatabase() {
  const start = Date.now();
  try {
    const result = await checkDatabaseHealth();
    const latency = Date.now() - start;
    return {
      status: result.status === 'healthy' ? 'healthy' : 'unhealthy',
      latency,
      error: result.error || null
    };
  } catch (error) {
    return { status: 'unhealthy', latency: Date.now() - start, error: error.message };
  }
}

/**
 * Check Redis health with latency measurement
 */
async function checkRedis() {
  const start = Date.now();
  try {
    const result = await checkRedisHealth();
    const latency = Date.now() - start;
    return {
      status: result.available ? 'healthy' : 'degraded',
      latency,
      error: result.error || null
    };
  } catch (error) {
    return { status: 'unhealthy', latency: Date.now() - start, error: error.message };
  }
}

/**
 * Check Instantly API health
 */
async function checkInstantlyAPI() {
  const start = Date.now();
  const apiKey = process.env.INSTANTLY_API_KEY;

  if (!apiKey) {
    return { status: 'degraded', latency: 0, error: 'INSTANTLY_API_KEY not configured' };
  }

  try {
    const res = await fetch('https://api.instantly.ai/api/v2/campaigns?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
    const latency = Date.now() - start;
    return {
      status: res.ok ? 'healthy' : 'degraded',
      latency,
      error: res.ok ? null : `HTTP ${res.status}`
    };
  } catch (error) {
    return { status: 'unhealthy', latency: Date.now() - start, error: error.message };
  }
}

/**
 * Check Mailgun API health
 */
async function checkMailgunAPI() {
  const start = Date.now();

  if (!MAILGUN_API_KEY) {
    return { status: 'degraded', latency: 0, error: 'MAILGUN_API_KEY not configured' };
  }

  try {
    const auth = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');
    const res = await fetch(`https://api.mailgun.net/v3/domains/${MAILGUN_DOMAIN}`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` },
      signal: AbortSignal.timeout(10000)
    });
    const latency = Date.now() - start;
    return {
      status: res.ok ? 'healthy' : 'degraded',
      latency,
      error: res.ok ? null : `HTTP ${res.status}`
    };
  } catch (error) {
    return { status: 'unhealthy', latency: Date.now() - start, error: error.message };
  }
}

/**
 * Check Cloudflare R2 connectivity
 */
async function checkR2Storage() {
  const start = Date.now();
  const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return { status: 'degraded', latency: 0, error: 'R2 credentials not configured' };
  }

  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
    await s3.send(new ListBucketsCommand({}));
    const latency = Date.now() - start;
    return { status: 'healthy', latency, error: null };
  } catch (error) {
    return { status: 'unhealthy', latency: Date.now() - start, error: error.message };
  }
}

/**
 * Run full health check across all services
 */
async function runFullHealthCheck() {
  const [database, redis, instantly, mailgun, r2] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkInstantlyAPI(),
    checkMailgunAPI(),
    checkR2Storage()
  ]);

  const services = { database, redis, instantly, mailgun, r2 };

  // Determine overall status
  const statuses = Object.values(services).map(s => s.status);
  let overall = 'healthy';
  if (statuses.includes('unhealthy')) {
    // Critical if database is down or 2+ services unhealthy
    const unhealthyCount = statuses.filter(s => s === 'unhealthy').length;
    overall = (database.status === 'unhealthy' || unhealthyCount >= 2) ? 'critical' : 'degraded';
  } else if (statuses.includes('degraded')) {
    overall = 'degraded';
  }

  return {
    timestamp: new Date().toISOString(),
    overall,
    services
  };
}

/**
 * NEXUS function handler — dispatches system_health_check actions
 */
async function systemHealthCheck(params) {
  const { action } = params || {};

  switch (action) {
    case 'check_database':
      return await checkDatabase();
    case 'check_redis':
      return await checkRedis();
    case 'check_instantly':
      return await checkInstantlyAPI();
    case 'check_mailgun':
      return await checkMailgunAPI();
    case 'check_r2':
      return await checkR2Storage();
    case 'full_check':
    default:
      return await runFullHealthCheck();
  }
}

/**
 * Log a health check result to the database (called by cron)
 */
async function logHealthCheck(result) {
  try {
    await prisma.healthCheckLog.create({
      data: {
        overall: result.overall,
        servicesJson: result.services,
        timestamp: new Date(result.timestamp)
      }
    });

    // If critical, create a system alert
    if (result.overall === 'critical') {
      console.error('[HEALING_SENTINEL_ALERT] System health is CRITICAL:', JSON.stringify(result.services));
      await prisma.systemAlert.create({
        data: {
          alertType: 'HEALING_SENTINEL_ALERT',
          component: 'system',
          message: `System health is CRITICAL. Unhealthy services: ${Object.entries(result.services).filter(([, v]) => v.status === 'unhealthy').map(([k]) => k).join(', ')}`,
          severity: 'critical'
        }
      });
    }
  } catch (error) {
    console.error('[HEALING_SENTINEL] Failed to log health check:', error.message);
  }
}

/**
 * Start the 15-minute health check cron job
 */
let cronJob = null;

function startHealthCheckCron() {
  if (cronJob) return; // Already running

  const cron = require('node-cron');

  // Run every 15 minutes
  cronJob = cron.schedule('*/15 * * * *', async () => {
    try {
      const result = await runFullHealthCheck();
      await logHealthCheck(result);
      console.log(`[HEALING_SENTINEL] Health check: ${result.overall}`);
    } catch (error) {
      console.error('[HEALING_SENTINEL] Cron error:', error.message);
    }
  });

  console.log('[HEALING_SENTINEL] Health check cron started (every 15 minutes)');
}

module.exports = {
  checkDatabase,
  checkRedis,
  checkInstantlyAPI,
  checkMailgunAPI,
  checkR2Storage,
  runFullHealthCheck,
  systemHealthCheck,
  logHealthCheck,
  startHealthCheckCron
};
