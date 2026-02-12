// Redis Configuration for Railway Deployment
// Handles both local development and Railway Redis service

const redis = require('redis');

let redisClient = null;
let redisStore = null;
let isConnected = false;

/**
 * Initialize Redis connection
 * Uses REDIS_URL from Railway or falls back to in-memory
 */
async function initializeRedis() {
  try {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      console.log('⚠️  No REDIS_URL found - using in-memory rate limiting');
      return {
        available: false,
        client: null,
        store: null
      };
    }

    // Create Redis client with Railway URL
    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    // Error handling
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('🔄 Redis connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis connected and ready');
      isConnected = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
      isConnected = false;
    });

    // Connect to Redis
    await redisClient.connect();

    // Create Redis store for rate limiting (rate-limit-redis v4+ uses named export and sendCommand API)
    const { RedisStore } = require('rate-limit-redis');
    redisStore = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: 'rl:', // Rate limit prefix
    });

    console.log('✅ Redis initialized successfully');
    
    return {
      available: true,
      client: redisClient,
      store: redisStore
    };

  } catch (error) {
    console.error('❌ Redis initialization failed:', error.message);
    console.log('⚠️  Falling back to in-memory rate limiting');
    
    return {
      available: false,
      client: null,
      store: null
    };
  }
}

/**
 * Get Redis client
 */
function getRedisClient() {
  return redisClient;
}

/**
 * Get Redis store for rate limiting
 */
function getRedisStore() {
  return redisStore;
}

/**
 * Check Redis health
 */
async function checkRedisHealth() {
  if (!redisClient || !isConnected) {
    return {
      status: 'disconnected',
      available: false
    };
  }

  try {
    await redisClient.ping();
    return {
      status: 'connected',
      available: true
    };
  } catch (error) {
    return {
      status: 'error',
      available: false,
      error: error.message
    };
  }
}

/**
 * Close Redis connection
 */
async function closeRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('✅ Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis:', error.message);
    }
  }
}

module.exports = {
  initializeRedis,
  getRedisClient,
  getRedisStore,
  checkRedisHealth,
  closeRedis
};
