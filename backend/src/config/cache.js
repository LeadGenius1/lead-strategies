// Redis-backed API response cache with in-memory fallback
// Reduces database load by caching frequent read queries

const { getRedisClient } = require('./redis');

// In-memory fallback cache (bounded LRU-like with TTL)
const memCache = new Map();
const MEM_CACHE_MAX = 500;

function cleanMemCache() {
  const now = Date.now();
  for (const [key, entry] of memCache) {
    if (entry.expiresAt < now) memCache.delete(key);
  }
  // Evict oldest if over limit
  if (memCache.size > MEM_CACHE_MAX) {
    const keys = [...memCache.keys()];
    for (let i = 0; i < keys.length - MEM_CACHE_MAX; i++) {
      memCache.delete(keys[i]);
    }
  }
}

/**
 * Get a cached value
 * @param {string} key - Cache key
 * @returns {any|null} Parsed value or null
 */
async function cacheGet(key) {
  const redis = getRedisClient();
  if (redis) {
    try {
      const val = await redis.get(`cache:${key}`);
      if (val) return JSON.parse(val);
    } catch (_) {}
  }
  // Fallback to memory
  const entry = memCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.value;
  if (entry) memCache.delete(key);
  return null;
}

/**
 * Set a cached value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON serialized)
 * @param {number} ttlSeconds - Time to live in seconds
 */
async function cacheSet(key, value, ttlSeconds = 60) {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(`cache:${key}`, JSON.stringify(value), { EX: ttlSeconds });
    } catch (_) {}
  }
  // Also set in memory (fast local reads)
  memCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  if (memCache.size > MEM_CACHE_MAX + 50) cleanMemCache();
}

/**
 * Delete a cached value (or pattern)
 * @param {string} key - Cache key
 */
async function cacheDel(key) {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.del(`cache:${key}`);
    } catch (_) {}
  }
  memCache.delete(key);
}

/**
 * Invalidate all cache entries for a user
 * @param {string} userId
 */
async function cacheInvalidateUser(userId) {
  const redis = getRedisClient();
  if (redis) {
    try {
      // Scan and delete user-specific keys
      const keys = [];
      for await (const key of redis.scanIterator({ MATCH: `cache:user:${userId}:*`, COUNT: 100 })) {
        keys.push(key);
      }
      if (keys.length) await redis.del(keys);
    } catch (_) {}
  }
  // Clear from memory
  for (const key of memCache.keys()) {
    if (key.startsWith(`user:${userId}:`)) memCache.delete(key);
  }
}

/**
 * Express middleware: cache GET responses
 * @param {number} ttlSeconds - Cache TTL
 * @param {function} keyFn - Optional key generator (req) => string
 */
function cacheMiddleware(ttlSeconds = 60, keyFn) {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = keyFn
      ? keyFn(req)
      : `user:${req.user?.id || 'anon'}:${req.originalUrl}`;

    const cached = await cacheGet(key);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Monkey-patch res.json to intercept and cache
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheSet(key, body, ttlSeconds).catch(() => {});
      }
      res.set('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

module.exports = {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheInvalidateUser,
  cacheMiddleware,
};
