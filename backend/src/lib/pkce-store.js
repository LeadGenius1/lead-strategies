// PKCE + OAuth state store — Redis-backed with in-memory fallback
const { getRedisClient } = require('../config/redis');

const REDIS_PREFIX = 'pkce:';
const TTL_SECONDS = 600; // 10 minutes

// In-memory fallback for when Redis is unavailable
const memStore = new Map();

async function set(key, value) {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(`${REDIS_PREFIX}${key}`, JSON.stringify(value), { EX: TTL_SECONDS });
      return;
    } catch (err) {
      console.error('[pkce-store] Redis set failed, using memory:', err.message);
    }
  }
  // Fallback to in-memory
  memStore.set(key, value);
  setTimeout(() => memStore.delete(key), TTL_SECONDS * 1000);
}

async function get(key) {
  const redis = getRedisClient();
  if (redis) {
    try {
      const raw = await redis.get(`${REDIS_PREFIX}${key}`);
      if (raw) {
        await redis.del(`${REDIS_PREFIX}${key}`); // One-time use
        return JSON.parse(raw);
      }
      return null;
    } catch (err) {
      console.error('[pkce-store] Redis get failed, using memory:', err.message);
    }
  }
  // Fallback to in-memory
  const v = memStore.get(key);
  memStore.delete(key);
  return v || null;
}

module.exports = { set, get };
