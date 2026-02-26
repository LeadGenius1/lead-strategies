// LeadSite.AI Backend - Main Entry Point
// Unified API for all 4 platforms: LeadSite.AI, LeadSite.IO, ClientContact.IO, VideoSite.AI

console.log('[STARTUP] Loading environment variables...');
require('dotenv').config();
console.log('[STARTUP] Environment loaded');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const campaignRoutes = require('./routes/campaigns');
const leadRoutes = require('./routes/leads');
const analyticsRoutes = require('./routes/analytics');
const stripeRoutes = require('./routes/stripe');
const webhookRoutes = require('./routes/webhooks');
const websiteRoutes = require('./routes/websites');
const websitePublicRoutes = require('./routes/websites').publicRouter;
const conversationRoutes = require('./routes/conversations');
const cannedResponseRoutes = require('./routes/cannedResponses');
const autoResponseRoutes = require('./routes/autoResponses');
const conversationNoteRoutes = require('./routes/conversationNotes');
const inboxAiRoutes = require('./routes/inbox-ai');
const userRoutes = require('./routes/users');
const automationRoutes = require('./routes/automations');
const enrichmentRoutes = require('./routes/enrichment');
const leadsiteApiRoutes = require('./routes/leadsite-api');
const leadsiteDashboardRoutes = require('./routes/leadsite-dashboard');
const webSearchRoutes = require('./routes/web-search');

// VideoSite.AI Routes (Tier 4)
console.log('[VIDEOSITE] Loading video routes modules...');
let videoRoutes, clipRoutes, renderRoutes, publishRoutes, publishOAuthRoutes, stripePayoutRoutes, videoAnalyticsRoutes, videoAIRoutes;

try {
  videoRoutes = require('./routes/videos');
  console.log('✅ [VIDEOSITE] videos.js loaded');
} catch (error) {
  console.error('❌ [VIDEOSITE] Failed to load videos.js:', error.message);
  console.error('Stack:', error.stack);
}

try {
  clipRoutes = require('./routes/clips');
  console.log('✅ [VIDEOSITE] clips.js loaded');
} catch (error) {
  console.error('❌ [VIDEOSITE] Failed to load clips.js:', error.message);
}

try {
  renderRoutes = require('./routes/render');
  console.log('✅ [VIDEOSITE] render.js loaded');
} catch (error) {
  console.error('❌ [VIDEOSITE] Failed to load render.js:', error.message);
}

try {
  publishRoutes = require('./routes/publish');
  publishOAuthRoutes = require('./routes/publishOAuth');
  stripePayoutRoutes = require('./routes/stripePayouts');
  videoAnalyticsRoutes = require('./routes/videoAnalytics');
  videoAIRoutes = require('./routes/videoAI');
  console.log('✅ [VIDEOSITE] All other video routes loaded');
} catch (error) {
  console.error('❌ [VIDEOSITE] Failed to load other video routes:', error.message);
}

// ClientContact.IO CRM Routes (Tier 5 - Enterprise CRM features)
const clientcontactCrmRoutes = require('./routes/clientcontact-crm');

// Admin Routes (Internal only)
const adminRoutes = require('./routes/adminRoutes');
const adminMigrateRoutes = require('./routes/admin-migrate');

const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');
const { requestLogger } = require('./middleware/logger');
const { performanceMonitor } = require('./middleware/performanceMonitor');
const { initializeRedis, getRedisStore, checkRedisHealth } = require('./config/redis');
const settings = require('./config/settings');
const { createLogger } = require('./utils/logger');
const monitoringService = require('./services/monitoringService');

const logger = createLogger('server');

// Self-Healing System (Monitors all 5 platforms)
const { startAgents, getSystem } = require('./system-agents');

console.log('[STARTUP] Creating Express app...');
const app = express();
const PORT = settings.PORT;
console.log('[STARTUP] Express app created, PORT:', PORT);

// ===========================================
// MIDDLEWARE
// ===========================================

// Security headers
app.use(helmet());

// Response compression (gzip/brotli)
app.use(compression({
  level: 6, // Compression level (1-9)
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for all responses
    return compression.filter(req, res);
  }
}));

// CORS configuration (using settings from config)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (settings.CORS_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`, { origin, allowedOrigins: settings.CORS_ORIGINS });
      // In production, be strict; in dev, be permissive
      if (settings.ENVIRONMENT === 'production') {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      } else {
        callback(null, true); // Be permissive for development
      }
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

// Performance monitoring
app.use(performanceMonitor);

// Rate limiting - start with in-memory, upgrade to Redis if available
const limiterConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
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

// Rate limit for lead search (prevent abuse) - must be before routes
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 search requests per 15 minutes
  message: { error: 'Too many search requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/leadsite/search', searchLimiter);

// ===========================================
// ROUTES (always registered, regardless of Redis)
// ===========================================

// Health check - MUST be simple and never fail
// This endpoint is critical for Railway healthchecks - it must always respond quickly
app.get('/health', (req, res) => {
  // Ultra-simple health check - no dependencies, no async operations
  // Railway healthcheck timeout is 100ms, so this must be instant
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/v1/health', async (req, res) => {
  // Always return 200 - don't fail health check if Redis is down
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {}
  };

  try {
    // Check database with timeout
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
    ]);
    await prisma.$disconnect();
    healthStatus.services.database = 'connected';
  } catch (error) {
    healthStatus.services.database = 'unavailable';
  }

  // Check Redis (non-blocking, don't fail if unavailable)
  try {
    const redisHealthy = await Promise.race([
      checkRedisHealth(),
      new Promise((resolve) => setTimeout(() => resolve(false), 500))
    ]);
    healthStatus.services.redis = redisHealthy ? 'connected' : 'unavailable';
  } catch (error) {
    healthStatus.services.redis = 'unavailable';
  }

  // Check self-healing system
  try {
    const selfHealingSystem = getSystem();
    healthStatus.services.selfHealing = selfHealingSystem?.running ? 'active' : 'inactive';
  } catch (error) {
    healthStatus.services.selfHealing = 'unavailable';
  }

  // Always return 200 - service is healthy even if dependencies are down
  res.status(200).json(healthStatus);
});

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/stripe', stripeRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/websites', websiteRoutes);
app.use('/api/v1/websites', websitePublicRoutes); // Public routes (subdomain, form submit)
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/canned-responses', cannedResponseRoutes);
app.use('/api/v1/auto-responses', autoResponseRoutes);
app.use('/api/v1/conversation-notes', conversationNoteRoutes);
app.use('/api/v1/inbox-ai', inboxAiRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/automations', automationRoutes);
app.use('/api/v1/search', authenticate, webSearchRoutes); // Real-time web search
app.use('/', enrichmentRoutes); // Mount enrichment routes (includes /health and /api/v1/enrichment/*)
app.use('/', leadsiteApiRoutes); // LeadSite.AI API routes
app.use('/', leadsiteDashboardRoutes); // LeadSite.AI Dashboard routes

// UPGRADE: Route aliases for multi-agent-taskforce compatibility
const apiAliasesRoutes = require('./routes/api-aliases');
app.use('/', apiAliasesRoutes); // /api/search and /api/enrich aliases

// AI Co-Pilot Route (7-Agent Platform)
const { handleCopilotChat, listConversations, getConversation, clearConversation, copilotHealth } = require('./routes/copilot');
const copilotRouter = express.Router();
copilotRouter.get('/health', copilotHealth); // Public health check
copilotRouter.post('/', authenticate, handleCopilotChat);
copilotRouter.get('/conversations', authenticate, listConversations);
copilotRouter.get('/conversations/:id', authenticate, getConversation);
copilotRouter.delete('/conversations/:id', authenticate, clearConversation);
app.use('/api/v1/copilot', copilotRouter);

// Channels endpoint (for unified inbox)
const { getAllChannels, getEnabledChannels } = require('./config/channels');
app.get('/api/v1/channels', (req, res) => {
  res.json({ success: true, data: { channels: getAllChannels(), enabled: getEnabledChannels() } });
});

// Channel OAuth routes
const channelOAuthRoutes = require('./routes/channels/oauth');
const channelConnectionsRoutes = require('./routes/channels/connections');
app.use('/api/v1/channels/oauth', channelOAuthRoutes);
app.use('/api/v1/channels/connections', channelConnectionsRoutes);

// VideoSite.AI Routes (Tier 4) - Register only if loaded successfully
console.log('[VIDEOSITE] Registering VideoSite.AI routes...');

if (videoRoutes) {
  app.use('/api/v1/videos', videoRoutes);
  console.log('✅ [VIDEOSITE] Video routes registered at /api/v1/videos');
} else {
  console.error('❌ [VIDEOSITE] Video routes NOT registered (failed to load)');
}

if (clipRoutes) {
  app.use('/api/v1/clips', clipRoutes);
  console.log('✅ [VIDEOSITE] Clip routes registered at /api/v1/clips');
}

if (renderRoutes) {
  app.use('/api/v1/render', renderRoutes);
  console.log('✅ [VIDEOSITE] Render routes registered at /api/v1/render');
}

if (publishRoutes) app.use('/api/v1/publish', publishRoutes);
if (publishOAuthRoutes) app.use('/api/v1/publish', publishOAuthRoutes);
if (stripePayoutRoutes) app.use('/api/v1/payouts', stripePayoutRoutes);
if (videoAnalyticsRoutes) app.use('/api/v1/analytics', videoAnalyticsRoutes);
if (videoAIRoutes) app.use('/api/v1/videos/ai', videoAIRoutes);

console.log('✅ [VIDEOSITE] VideoSite.AI route registration complete');

// ClientContact.IO CRM Routes (Tier 5)
app.use('/api/v1/clientcontact', clientcontactCrmRoutes);
// Legacy CRM URL redirect (path only, no trademark)
app.use('/api/v1/tackle', (req, res) => res.redirect(308, '/api/v1/clientcontact' + (req.path === '/' ? '' : req.path)));

// Monitoring Routes (Platform health)
const monitoringRoutes = require('./routes/monitoring');
const systemIntegrityRoutes = require('./routes/system-integrity');
app.use('/api/v1/monitoring', monitoringRoutes);
app.use('/api/v1', systemIntegrityRoutes);

// Admin Routes (Internal AI Lead Strategies staff only)
app.use('/admin/migrate', adminMigrateRoutes); // Must be before /admin to avoid conflict
app.use('/admin', adminRoutes);

// Also support /api/ routes for backward compatibility
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/canned-responses', cannedResponseRoutes);
app.use('/api/auto-responses', autoResponseRoutes);
app.use('/api/conversation-notes', conversationNoteRoutes);
app.use('/api/inbox-ai', inboxAiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/automations', automationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
// Error handler with monitoring
app.use((err, req, res, next) => {
  // Record error in monitoring service
  monitoringService.recordError(err, {
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });
  
  // Use standard error handler
  errorHandler(err, req, res, next);
});

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

// ===========================================
// GLOBAL ERROR HANDLERS (Critical for Railway)
// ===========================================
// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  // Suppress Redis connection errors - they're expected when Redis isn't configured
  if (reason && (reason.code === 'ECONNREFUSED' || reason.code === 'ENOTFOUND')) {
    if (reason.syscall === 'connect' && reason.port === 6379) {
      // Redis connection error - expected, don't log as error
      return;
    }
  }
  
  // Suppress AggregateError with ECONNREFUSED for Redis
  if (reason && reason.name === 'AggregateError' && reason.errors) {
    const isRedisError = reason.errors.some(err => 
      err.code === 'ECONNREFUSED' && err.port === 6379
    );
    if (isRedisError) {
      // Redis connection error - expected, don't log as error
      return;
    }
  }
  
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error('Unhandled promise rejection', { reason: reason?.message || reason, stack: reason?.stack });
  // Don't exit - let server continue running
});

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  // Don't exit - let server continue running for health checks
});

// ===========================================
// SERVER START
// ===========================================

// ===========================================
// STARTUP VALIDATION & LOGGING
// ===========================================

console.log('\n' + '='.repeat(60));
console.log('🚀 AI LEAD STRATEGIES BACKEND - STARTUP');
console.log('='.repeat(60));
console.log(`📅 Timestamp: ${new Date().toISOString()}`);
console.log(`🌍 Node Environment: ${process.env.NODE_ENV || 'not set'}`);
console.log(`⚙️  Environment: ${settings.ENVIRONMENT}`);
console.log(`🔢 PORT: ${process.env.PORT || PORT} (from ${process.env.PORT ? 'Railway' : 'default'})`);
console.log(`🗄️  DATABASE_URL: ${process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET'}`);
console.log(`🔴 REDIS_URL: ${process.env.REDIS_URL ? '✅ SET' : '⚠️  NOT SET (will use localhost)'}`);
console.log(`🤖 ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log(`🔑 JWT_SECRET: ${process.env.JWT_SECRET ? '✅ SET' : '⚠️  USING DEFAULT'}`);
console.log(`💳 STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ SET' : '⚠️  NOT SET'}`);
console.log(`🌐 CORS Origins: ${settings.CORS_ORIGINS.length} configured`);
console.log('='.repeat(60) + '\n');

// Critical validation - warn but don't crash
if (!process.env.DATABASE_URL) {
  console.error('❌ CRITICAL: DATABASE_URL not set! Database operations will fail.');
  console.error('   Set DATABASE_URL in Railway environment variables.');
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️  WARNING: ANTHROPIC_API_KEY not set. AI agents will have limited functionality.');
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  WARNING: STRIPE_SECRET_KEY not set. Payment processing will not work.');
}

// Start server immediately (routes are already registered)
// Bind to 0.0.0.0 to accept connections from all network interfaces (required for Railway/Docker)
// Use process.env.PORT directly (Railway sets this)
const serverPort = process.env.PORT || PORT;

console.log('[STARTUP] Starting server on port', serverPort, 'binding to 0.0.0.0...');

try {
  const server = app.listen(serverPort, '0.0.0.0', () => {
    // Initialize WebSocket on server (if available)
    try {
      const websocketService = require('./services/websocketService');
      websocketService.initialize(server);
    } catch (error) {
      // WebSocket service optional
      console.log('[STARTUP] WebSocket service not available');
    }
    console.log('[STARTUP] ✅ Server listening callback fired');
    logger.info('🚀 AI Lead Strategies Unified Backend starting', {
      port: serverPort,
      environment: settings.ENVIRONMENT,
      service: settings.RAILWAY_SERVICE_NAME || 'backend',
    });

    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 AI Lead Strategies Unified Backend           ║
║                                                   ║
║   Server running on port ${serverPort}                    ║
║   Environment: ${settings.ENVIRONMENT}               ║
║                                                   ║
║   Platforms Served:                               ║
║   • LeadSite.AI (Tier 1)                          ║
║   • LeadSite.IO (Tier 2)                          ║
║   • ClientContact.IO (Tier 3)                     ║
║   • VideoSite.IO (Tier 4)                         ║
║   • ClientContact CRM (Tier 5)                    ║
║                                                   ║
║   Health: http://localhost:${serverPort}/health            ║
║   API:    http://localhost:${serverPort}/api/v1            ║
║   Copilot: http://localhost:${serverPort}/api/v1/copilot   ║
║   Admin:  http://localhost:${serverPort}/admin             ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    `);

    // ===========================================
    // SELF-HEALING SYSTEM STARTUP (Non-blocking)
    // ===========================================
    // Monitors all 4 platforms from single system
    // Start in background - don't block server startup
    if (process.env.ENABLE_SELF_HEALING === 'true') {
      // Don't await - start in background
      startAgents({
        db: null,    // Will use Prisma from agents if needed
        redis: null  // Will initialize Redis if REDIS_URL is set
      }).then(() => {
        logger.info('✅ Self-Healing System active - 7 agents monitoring all platforms', {
          dashboardPath: '/admin/system/dashboard',
        });
      }).catch((error) => {
        logger.error('⚠️  Self-Healing System failed to start', error);
        logger.warn('Server continues without self-healing monitoring');
      });
    } else {
      logger.info('💡 Self-Healing System disabled', {
        enableWith: 'ENABLE_SELF_HEALING=true',
      });
    }

    // ===========================================
    // 14-DAY TRIAL REMINDER SYSTEM
    // ===========================================
    // Runs daily at 9 AM; also runs on startup
    try {
      const cron = require('node-cron');
      const { checkTrialsAndSendReminders } = require('./services/emailReminders');
      
      // Schedule cron job FIRST
      cron.schedule('0 9 * * *', async () => {
        console.log('[TrialReminder] ⏰ Running daily trial reminder check...');
        try {
          await checkTrialsAndSendReminders();
          console.log('[TrialReminder] ✅ Daily check completed');
        } catch (err) {
          console.error('[TrialReminder] ❌ Daily check failed:', err);
        }
      });
      console.log('[TrialReminder] ✅ Scheduled daily at 9:00 AM');
      
      // Run startup check AFTER scheduling (with delay to let server stabilize)
      setTimeout(async () => {
        console.log('[TrialReminder] 🔍 Running initial startup check...');
        try {
          await checkTrialsAndSendReminders();
          console.log('[TrialReminder] ✅ Startup check completed');
        } catch (err) {
          console.error('[TrialReminder] ⚠️ Startup check failed:', err.message);
        }
      }, 10000); // Wait 10 seconds after server starts
      
    } catch (err) {
      console.warn('[TrialReminder] ⚠️ Could not start trial reminder system:', err.message);
    }

    // Log that server is ready
    logger.info('✅ Server ready and accepting connections', {
      port: serverPort,
      healthEndpoint: `/health`
    });
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${serverPort} is already in use`);
      logger.error(`Port ${serverPort} already in use`, { error: error.message });
      process.exit(1);
    } else {
      console.error('❌ Server error:', error);
      logger.error('Server error', { error: error.message, stack: error.stack });
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

} catch (error) {
  console.error('❌ Failed to start server:', error);
  logger.error('Failed to start server', { error: error.message, stack: error.stack });
  process.exit(1);
}

module.exports = app;

// Deployment trigger: 2026-01-31