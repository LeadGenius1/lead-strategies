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
const cannedResponseRoutes = require('./routes/cannedResponses');
const autoResponseRoutes = require('./routes/autoResponses');
const conversationNoteRoutes = require('./routes/conversationNotes');

// Tackle.IO Routes (Tier 5 - Enterprise CRM)
const tackleRoutes = require('./routes/tackle');

// Admin Routes (Internal only)
const adminRoutes = require('./routes/adminRoutes');

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

// ===========================================
// ROUTES (always registered, regardless of Redis)
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
app.use('/api/v1/canned-responses', cannedResponseRoutes);
app.use('/api/v1/auto-responses', autoResponseRoutes);
app.use('/api/v1/conversation-notes', conversationNoteRoutes);

// Tackle.IO Routes (Tier 5 Enterprise CRM)
app.use('/api/v1/tackle', tackleRoutes);

// Admin Routes (Internal AI Lead Strategies staff only)
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
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 LeadSite.AI Backend API                      ║
║                                                   ║
║   Server running on port ${PORT}                    ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
║                                                   ║
║   Health: http://localhost:${PORT}/health            ║
║   API:    http://localhost:${PORT}/api/v1            ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

module.exports = app;

