// LeadSite.AI Backend - Main Entry Point
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const campaignRoutes = require('./routes/campaigns');
const leadRoutes = require('./routes/leads');
const analyticsRoutes = require('./routes/analytics');
const stripeRoutes = require('./routes/stripe');
const webhookRoutes = require('./routes/webhooks');
const websiteRoutes = require('./routes/websites');
const conversationRoutes = require('./routes/conversations');

const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');
const { initializeRedis, getRedisStore, checkRedisHealth } = require('./config/redis');

const app = express();
const PORT = process.env.PORT || 3001;

// ===========================================
// MIDDLEWARE
// ===========================================

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://leadsite.ai',
  'https://www.leadsite.ai',
  'https://leadsite.io',
  'https://clientcontact.io',
  'https://videosite.io',
  'https://tackle.io',
  'https://tackleai.ai'
];

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

// JSON body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Routes will be registered in startServer() after rate limiting is configured

// ===========================================
// SERVER START
// ===========================================

// Initialize Redis and start server
// Initialize Redis and configure rate limiting before starting server
async function startServer() {
  try {
    // Initialize Redis first (async, but we'll wait for it)
    const redisConfig = await initializeRedis();
    
    // Configure rate limiting with Redis store (if available)
    const limiterConfig = {
      store: redisConfig.store, // undefined = in-memory (default)
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
      message: { error: 'Too many requests, please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
      // Skip successful requests for webhook endpoints
      skip: (req) => {
        return req.path.includes('/webhooks/') && req.method === 'POST';
      },
    };
    
    const limiter = rateLimit(limiterConfig);
    // Apply rate limiting middleware (BEFORE routes)
    app.use('/api/', limiter);
    
    console.log(`Rate limiting: ${redisConfig.available ? '✅ Redis-backed' : '⚠️  In-memory (Redis not available)'}`);
    
    // ===========================================
    // ROUTES (registered after rate limiting)
    // ===========================================
    
    // Health check
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'leadsite-backend'
      });
    });

    app.get('/api/v1/health', async (req, res) => {
      const redisHealth = await checkRedisHealth();
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        redis: redisHealth
      });
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
    app.use('/api/v1/conversations', conversationRoutes);

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

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ 
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
      });
    });

    // Error handler
    app.use(errorHandler);
    
    // Start server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 LeadSite.AI Backend API                      ║
║                                                   ║
║   Server running on port ${PORT}                    ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
║   Redis: ${redisConfig.available ? '✅ Connected' : '⚠️  Not configured'}                  ║
║                                                   ║
║   Health: http://localhost:${PORT}/health            ║
║   API:    http://localhost:${PORT}/api/v1            ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    // Fallback: Start with in-memory rate limiting
    console.log('⚠️  Starting with in-memory rate limiting (fallback mode)...');
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { error: 'Too many requests, please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.path.includes('/webhooks/') && req.method === 'POST',
    });
    app.use('/api/', limiter);
    
    // Register routes in fallback mode
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0', service: 'leadsite-backend' });
    });
    app.get('/api/v1/health', async (req, res) => {
      const redisHealth = await checkRedisHealth();
      res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0', redis: redisHealth });
    });
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/dashboard', dashboardRoutes);
    app.use('/api/v1/campaigns', campaignRoutes);
    app.use('/api/v1/leads', leadRoutes);
    app.use('/api/v1/analytics', analyticsRoutes);
    app.use('/api/v1/stripe', stripeRoutes);
    app.use('/api/v1/webhooks', webhookRoutes);
    app.use('/api/v1/websites', websiteRoutes);
    app.use('/api/v1/conversations', conversationRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/campaigns', campaignRoutes);
    app.use('/api/leads', leadRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/stripe', stripeRoutes);
    app.use('/api/webhooks', webhookRoutes);
    app.use('/api/websites', websiteRoutes);
    app.use('/api/conversations', conversationRoutes);
    app.use((req, res) => {
      res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.path} not found` });
    });
    app.use(errorHandler);
    
    app.listen(PORT, () => {
      console.log(`⚠️  Server running on port ${PORT} (fallback mode - Redis unavailable)`);
    });
  }
}

startServer();

module.exports = app;

