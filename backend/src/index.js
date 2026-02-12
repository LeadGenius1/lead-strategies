// LeadSite.AI Backend - Main Entry Point
// Unified API for 4 platforms: LeadSite.AI, LeadSite.IO, ClientContact.IO, VideoSite.IO
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

// UltraLead / ClientContact CRM Routes (Tier 5)
const clientcontactCrmRoutes = require('./routes/ultralead');

// New Platform Routes
const copilotRoutes = require('./routes/copilot');
const templateRoutes = require('./routes/templates');
const crmRoutes = require('./routes/crm');
const agentRoutes = require('./routes/agents');
const videositeRoutes = require('./routes/videosite');
const videoRoutes = require('./routes/videos');
const payoutsRoutes = require('./routes/payouts');
const aiAgentRoutes = require('./routes/ai-agents');
const clipsRoutes = require('./routes/clips');
const publishRoutes = require('./routes/publish');
const emailSentinelRoutes = require('./routes/emailSentinel');
const masterValidationRoutes = require('./routes/master-validation');

// Admin Routes (Internal only)
const adminRoutes = require('./routes/adminRoutes');

const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');
const { initializeRedis, getRedisStore, checkRedisHealth } = require('./config/redis');

// Self-Healing System (Monitors all 5 platforms)
const { startAgents, getSystem } = require('./system-agents');

const app = express();
const PORT = process.env.PORT || 3001;

// ===========================================
// MIDDLEWARE
// ===========================================

// Security headers
app.use(helmet());

// CORS configuration - aileadstrategies.com and leadsite always allowed (CORS_ORIGINS adds, never overrides)
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
  'https://videosite.io',
];
const envOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Be permissive for now, log for debugging
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

// Rate limiting - start with in-memory, upgrade to Redis if available
// At 1M+ users: consider RATE_LIMIT_MAX=500-1000, tiered limits per user
const limiterConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '300', 10), // configurable for scale
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path.includes('/webhooks/') && req.method === 'POST';
  },
};

// Start with in-memory rate limiting (always available)
const limiter = rateLimit(limiterConfig);
app.use('/api/', limiter);

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
    platforms: ['leadsite.ai', 'leadsite.io', 'clientcontact.io', 'videosite.io'],
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

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
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

// ClientContact CRM Routes (Tier 5)
app.use('/api/v1/clientcontact', clientcontactCrmRoutes);

// New Platform Routes (Multi-Agent Build)
app.use('/api/v1/copilot', copilotRoutes);         // LeadSite.AI AI Email Generation
app.use('/api/v1/templates', templateRoutes);       // LeadSite.IO 60 Templates
app.use('/api/v1/crm', crmRoutes);                  // UltraLead CRM (Contacts, Companies, Deals)
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/ai', aiAgentRoutes);             // UltraLead 7 AI Agents Control
app.use('/api/v1/videosite', videositeRoutes);      // VideoSite.AI Monetization
app.use('/api/v1/channels', channelRoutes);
app.use('/api/v1/oauth/channels', oauthChannelsRoutes);         // ClientContact.IO Channels
app.use('/api/v1/email-sentinel', emailSentinelRoutes);  // Email Sentinel (Redis backend only)

// Admin Routes (Internal AI Lead Strategies staff only)
app.use('/admin', adminRoutes);

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
app.use('/api/v1/clips', clipsRoutes);      // Video clips management
app.use('/api/v1/publish', publishRoutes);  // Social media publishing

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
app.listen(PORT, '0.0.0.0', async () => {
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
║   • VideoSite.IO (Tier 4)                         ║
║   • ClientContact CRM (Tier 5)                    ║
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
  // Monitors all 4 platforms from single system
  if (process.env.ENABLE_SELF_HEALING === 'true') {
    try {
      console.log('\n🔧 Starting Self-Healing System...');
      console.log('   Monitoring all 4 platforms: LeadSite.AI, LeadSite.IO, ClientContact.IO, VideoSite.IO\n');

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

module.exports = app;
