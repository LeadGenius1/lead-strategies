// LeadSite.AI Backend - Main Entry Point
// Unified API for 5 platforms: LeadSite.AI, LeadSite.IO, ClientContact.IO, VideoSite.AI, UltraLead.AI

// Polyfill for undici/fetch compatibility (Node < 20 or undici webidl expects File)
if (typeof globalThis.File === 'undefined') {
  globalThis.File = class File {
    constructor(bits, name, options = {}) {
      this._bits = bits;
      this.name = name;
      this.type = options.type || '';
      this.lastModified = options.lastModified || Date.now();
    }
  };
}
if (typeof globalThis.Blob === 'undefined') {
  globalThis.Blob = class Blob {
    constructor(parts = [], options = {}) {
      this._parts = parts;
      this.type = options.type || '';
    }
  };
}

require('dotenv').config();

// Railway Postgres fix: use public URL when internal (*.railway.internal) unreachable
if (process.env.DATABASE_PUBLIC_URL && process.env.DATABASE_URL?.includes('railway.internal')) {
  console.log('Using DATABASE_PUBLIC_URL (Railway public connection - internal host unreachable)');
  process.env.DATABASE_URL = process.env.DATABASE_PUBLIC_URL;
}
// Startup log: DB host for sanity check (no credentials)
try {
  const dbHost = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : 'not set';
  console.log('Database host:', dbHost);
} catch (_) { /* ignore malformed URL */ }

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const campaignRoutes = require('./routes/campaigns');
const leadRoutes = require('./routes/leads');
const analyticsRoutes = require('./routes/analytics');
const stripeRoutes = require('./routes/stripe');
const webhookRoutes = require('./routes/webhooks');
const websiteRoutesModule = require('./routes/websites');
const websiteRoutes = websiteRoutesModule.default || websiteRoutesModule;
const websitePublicRoutes = websiteRoutesModule.publicRouter;
const formRoutes = require('./routes/forms');
const conversationRoutes = require('./routes/conversations');
const channelRoutes = require('./routes/channels');
const oauthChannelsRoutes = require('./routes/oauth-channels');
const cannedResponseRoutes = require('./routes/cannedResponses');
const autoResponseRoutes = require('./routes/autoResponses');
const conversationNoteRoutes = require('./routes/conversationNotes');
const emailRoutes = require('./routes/emails');

// UltraLead.AI Routes (Tier 5)
const clientcontactCrmRoutes = require('./routes/ultralead');

// New Platform Routes
const copilotRoutes = require('./routes/copilot');
const templateRoutes = require('./routes/templates');
const crmRoutes = require('./routes/crm');
const agentRoutes = require('./routes/agents');
const videositeRoutes = require('./routes/videosite');
const videoRoutes = require('./routes/videos');
const advertiserRoutes = require('./routes/advertiser');
const adsRoutes = require('./routes/ads');
const payoutsRoutes = require('./routes/payouts');
const aiAgentRoutes = require('./routes/ai-agents');
const clipsRoutes = require('./routes/clips');
const publishRoutes = require('./routes/publish');
const productRoutes = require('./routes/products');
const emailSentinelRoutes = require('./routes/emailSentinel');
const masterValidationRoutes = require('./routes/master-validation');
const statusRoutes = require('./routes/status');
const usersRoutes = require('./routes/users');

// Admin Routes (Internal only)
const adminRoutes = require('./routes/adminRoutes');

const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');
const { initializeRedis, getRedisStore, checkRedisHealth } = require('./config/redis');

// Self-Healing System (Monitors all 5 platforms)
const { startAgents, getSystem } = require('./system-agents');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy when behind Railway/load balancer (fixes X-Forwarded-For / express-rate-limit)
app.set('trust proxy', 1);

// ===========================================
// MIDDLEWARE
// ===========================================

// Security headers
app.use(helmet());

// CORS configuration - all platform domains (Scenario A: single app serving multiple domains)
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://aileadstrategies.com',
  'https://www.aileadstrategies.com',
  'https://leadsite.ai',
  'https://www.leadsite.ai',
  'https://app.leadsite.ai',
  'https://leadsite.io',
  'https://clientcontact.io',
  'https://www.clientcontact.io',
  'https://videosite.io',
  'https://videosite.ai',
  'https://www.videosite.ai',
  'https://ultralead.ai',
  'https://www.ultralead.ai',
];
const envOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS rejected origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Webhooks need raw body (before JSON parsing)
app.use('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }));

// Cookie parser (before routes)
app.use(cookieParser());

// JSON body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Per-endpoint rate limiting (tiered by operation type)
const { authLimiter, signupLimiter, aiLimiter, writeLimiter } = require('./middleware/rateLimiter');

// Global fallback rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '500', 10),
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (req.path.includes('/webhooks/') && req.method === 'POST') return true;
    if (req.path === '/health' || req.path === '/api/health' || req.path === '/api/v1/health') return true;
    return false;
  },
});
app.use('/api/', globalLimiter);

// Targeted rate limits (applied before route handlers)
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/signup', signupLimiter);
app.use('/api/v1/auth/register', signupLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', signupLimiter);
app.use('/api/v1/copilot', aiLimiter);
app.use('/api/v1/websites/generate', aiLimiter);
app.use('/admin/login', authLimiter);

// ===========================================
// ROUTES (always registered, regardless of Redis)
// ===========================================

// Health check
app.get('/health', (req, res) => {
  // Get self-healing system status if available
  const selfHealingSystem = getSystem();
  const systemHealth = selfHealingSystem?.running
    ? selfHealingSystem.getHealthSummary()
    : { status: 'disabled' };

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'leadsite-backend',
    platforms: ['leadsite.ai', 'leadsite.io', 'clientcontact.io', 'videosite.ai', 'ultralead.ai'],
    selfHealing: {
      enabled: selfHealingSystem?.running || false,
      agents: selfHealingSystem?.running ? Object.keys(selfHealingSystem.getAgentStatus()).length : 0
    }
  });
});

app.get('/api/v1/health', async (req, res) => {
  const redisHealth = await checkRedisHealth();
  const selfHealingSystem = getSystem();
  const systemHealth = selfHealingSystem?.running
    ? selfHealingSystem.getHealthSummary()
    : null;

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    redis: redisHealth,
    selfHealing: systemHealth
  });
});

// Comprehensive /api/health - full system checks (database, redis, stripe, r2, memory, cpu)
app.get('/api/health', async (req, res) => {
  const criticalIssues = [];
  const checks = {};

  // Database
  try {
    if (process.env.DATABASE_URL) {
      const { checkDatabaseHealth } = require('./config/database');
      const dbHealth = await checkDatabaseHealth();
      if (dbHealth.status !== 'healthy') throw new Error(dbHealth.error || 'DB check failed');

      checks.database = { status: 'healthy', message: 'Connected' };
    } else {
      checks.database = { status: 'not_configured', message: 'DATABASE_URL not set' };
    }
  } catch (err) {
    checks.database = { status: 'unhealthy', error: err.message };
    criticalIssues.push(`database: ${err.message}`);
  }

  // Redis
  try {
    const redis = await checkRedisHealth();
    checks.redis = redis.available
      ? { status: 'healthy', message: 'Connected' }
      : { status: redis.status || 'unhealthy', message: redis.error || 'Disconnected' };
    if (!redis.available) criticalIssues.push('redis: not available');
  } catch (err) {
    checks.redis = { status: 'unhealthy', error: err.message };
    criticalIssues.push(`redis: ${err.message}`);
  }

  // Stripe (configured = healthy; no API ping to avoid rate limits)
  checks.stripe = process.env.STRIPE_SECRET_KEY
    ? { status: 'healthy', message: 'Configured' }
    : { status: 'not_configured', message: 'STRIPE_SECRET_KEY not set' };

  // R2 Storage (Cloudflare R2)
  const r2Configured = process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_R2_ACCESS_KEY && process.env.CLOUDFLARE_R2_SECRET_KEY;
  if (r2Configured) {
    try {
      const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
      const client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY
        }
      });
      await client.send(new HeadBucketCommand({ Bucket: process.env.CLOUDFLARE_R2_BUCKET || 'videosite-videos' }));
      checks.r2Storage = { status: 'healthy', message: 'Connected' };
    } catch (err) {
      checks.r2Storage = { status: 'unhealthy', error: err.message };
      criticalIssues.push(`r2Storage: ${err.message}`);
    }
  } else {
    checks.r2Storage = { status: 'not_configured', message: 'R2 credentials not set' };
  }

  // Anthropic (Lead Hunter / Copilot AI)
  checks.anthropic = (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY)
    ? { status: 'configured', message: 'ANTHROPIC_API_KEY set' }
    : { status: 'not_configured', message: 'ANTHROPIC_API_KEY required for Lead Hunter AI' };

  // Memory
  const mem = process.memoryUsage();
  const heapMB = Math.round(mem.heapUsed / 1024 / 1024);
  checks.memory = heapMB < 450
    ? { status: 'healthy', heapUsedMB: heapMB }
    : { status: 'degraded', heapUsedMB: heapMB, message: 'High memory usage' };

  // CPU (informational)
  const cpu = process.cpuUsage();
  checks.cpu = { status: 'healthy', user: cpu.user, system: cpu.system };

  // Circuit breaker status
  try {
    const { getAllBreakerStatus } = require('./config/circuitBreaker');
    checks.circuitBreakers = getAllBreakerStatus();
  } catch (_) {}

  const overallStatus = criticalIssues.length === 0 ? 'healthy' : 'degraded';
  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    critical_issues: criticalIssues,
    checks
  });
});

// API Routes (v1)
app.use('/api/v1/status', statusRoutes);   // Integration status (public)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/emails', emailRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/stripe', stripeRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
if (websitePublicRoutes) {
  app.use('/api/v1/websites', websitePublicRoutes); // Public subdomain route (no auth)
}
app.use('/api/v1/websites', websiteRoutes);
app.use('/api/v1/forms', formRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/canned-responses', cannedResponseRoutes);
app.use('/api/v1/auto-responses', autoResponseRoutes);
app.use('/api/v1/conversation-notes', conversationNoteRoutes);

// UltraLead.AI Routes (Tier 5)
app.use('/api/v1/clientcontact', clientcontactCrmRoutes);

// New Platform Routes (Multi-Agent Build)
app.use('/api/v1/copilot', copilotRoutes);         // LeadSite.AI AI Email Generation
app.use('/api/v1/templates', templateRoutes);       // LeadSite.IO 60 Templates
app.use('/api/v1/crm', crmRoutes);                  // UltraLead CRM (Contacts, Companies, Deals)
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/ai', aiAgentRoutes);             // UltraLead 7 AI Agents Control
app.use('/api/v1/videosite', videositeRoutes);      // VideoSite.AI Monetization
app.use('/api/v1/advertiser', advertiserRoutes);   // VideoSite.AI Advertiser Platform
app.use('/api/v1/ads', adsRoutes);                 // VideoSite.AI Ad Serving (public)
app.use('/api/v1/channels', channelRoutes);
app.use('/api/v1/oauth/channels', oauthChannelsRoutes);         // ClientContact.IO Channels
app.use('/api/v1/email-sentinel', emailSentinelRoutes);  // Email Sentinel (Redis backend only)

// Admin Routes (Internal AI Lead Strategies staff only)
app.use('/admin', adminRoutes);
app.use('/api/admin', adminRoutes);  // Also at /api/admin for frontend fetch('/api/admin/login')

// Master Orchestrator Routes (Agent 6)
app.use('/api/master', masterValidationRoutes);

// Also support /api/ routes for backward compatibility
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/oauth/channels', oauthChannelsRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/canned-responses', cannedResponseRoutes);
app.use('/api/auto-responses', autoResponseRoutes);
app.use('/api/conversation-notes', conversationNoteRoutes);
app.use('/api/v1/payouts', payoutsRoutes);  // VideoSite earnings payouts
app.use('/api/status', statusRoutes);       // Backward compat
app.use('/api/v1/clips', clipsRoutes);      // Video clips management
app.use('/api/v1/publish', publishRoutes);  // Social media publishing
app.use('/api/v1/products', productRoutes); // VideoSite.AI Product Promotions

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use(errorHandler);

// ===========================================
// SERVER START
// ===========================================

// Initialize Redis asynchronously (non-blocking)
// Routes are already registered, Redis will upgrade rate limiting if available
initializeRedis().then((redisConfig) => {
  if (redisConfig.available && redisConfig.store) {
    console.log('✅ Redis connected - rate limiting upgraded to Redis-backed');
    // Note: Rate limiting store can't be changed after initialization
    // For production, consider restarting or using Redis from the start
  } else {
    console.log('⚠️  Redis not available - using in-memory rate limiting');
  }
}).catch((error) => {
  console.warn('⚠️  Redis initialization failed - using in-memory rate limiting:', error.message);
});

// Start server immediately (routes are already registered)
// Bind to 0.0.0.0 to accept connections from all network interfaces (required for Railway/Docker)
app._server = app.listen(PORT, '0.0.0.0', async () => {
  // API Keys Status - log which services are configured (values masked)
  const apiKeysStatus = {
    anthropic: !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY),
    apollo: !!process.env.APOLLO_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    stripe: !!process.env.STRIPE_SECRET_KEY,
    mailgun: !!process.env.MAILGUN_API_KEY,
  };
  console.log('API Keys Status:', apiKeysStatus);

  // Test Anthropic connection on startup (non-blocking)
  if (apiKeysStatus.anthropic) {
    const key = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY;
    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const anthropic = new Anthropic({ apiKey: key });
      const testResp = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Say "API Connected" in 2 words only.' }],
      });
      console.log('✅ Anthropic API connected:', testResp.content[0]?.text?.trim() || 'OK');
    } catch (err) {
      console.error('❌ Anthropic API FAILED:', err.message);
    }
  } else {
    console.warn('⚠️  ANTHROPIC_API_KEY not set - Lead Hunter will return 503 until configured');
  }

  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 AI Lead Strategies Unified Backend           ║
║                                                   ║
║   Server running on port ${PORT}                    ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
║                                                   ║
║   Platforms Served:                               ║
║   • LeadSite.AI (Tier 1)                          ║
║   • LeadSite.IO (Tier 2)                          ║
║   • ClientContact.IO (Tier 3)                     ║
║   • VideoSite.AI (Tier 4)                         ║
║   • UltraLead.AI (Tier 5)                        ║
║                                                   ║
║   Health: http://localhost:${PORT}/health            ║
║   API:    http://localhost:${PORT}/api/v1            ║
║   Admin:  http://localhost:${PORT}/admin             ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);

  // ===========================================
  // SELF-HEALING SYSTEM STARTUP
  // ===========================================
  // Monitors all 5 platforms from single system
  if (process.env.ENABLE_SELF_HEALING === 'true') {
    try {
      console.log('\n🔧 Starting Self-Healing System...');
      console.log('   Monitoring all 5 platforms: LeadSite.AI, LeadSite.IO, ClientContact.IO, VideoSite.AI, UltraLead.AI\n');

      // Start all 7 agents
      await startAgents({
        db: null,    // Will use Prisma from agents if needed
        redis: null  // Will initialize Redis if REDIS_URL is set
      });

      console.log('\n✅ Self-Healing System active - 7 agents monitoring all platforms');
      console.log('   Access monitoring dashboard at: /admin/system/dashboard\n');
    } catch (error) {
      console.error('⚠️  Self-Healing System failed to start:', error.message);
      console.log('   Server continues without self-healing monitoring\n');
    }
  } else {
    console.log('\n💡 Self-Healing System disabled');
    console.log('   Enable with ENABLE_SELF_HEALING=true environment variable\n');
  }

  // Email Sentinel - backend only (Redis). Frontend never connects to Redis.
  try {
    const { startEmailSentinel } = require('./emailSentinel');
    await startEmailSentinel();
  } catch (err) {
    console.warn('[Email Sentinel] Skip:', err.message);
  }
});

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================
let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  const server = app._server;
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }

  // Drain database connections
  try {
    const { disconnectDatabase } = require('./config/database');
    await disconnectDatabase();
    console.log('Database connections closed');
  } catch (err) {
    console.error('Error closing database:', err.message);
  }

  // Close Redis
  try {
    const { shutdownRedis } = require('./config/redis');
    if (typeof shutdownRedis === 'function') {
      await shutdownRedis();
      console.log('Redis connections closed');
    }
  } catch (err) {
    // shutdownRedis may not exist yet
  }

  console.log('Graceful shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled errors (don't crash silently)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

module.exports = app;
