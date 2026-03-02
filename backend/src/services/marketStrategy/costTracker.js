// ═══════════════════════════════════════════════════════════════
// MARKET STRATEGY PIPELINE — COST TRACKER
// Atomic daily cost rollups per provider in Redis.
// Key: mkt:costs:daily:{YYYY-MM-DD} HASH with fields: firecrawl, chatgpt, perplexity, total
// ═══════════════════════════════════════════════════════════════

const { REDIS_KEYS } = require("./constants");

/**
 * Format a Date as YYYY-MM-DD.
 */
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Track a provider cost — atomically increments the daily hash.
 * Safe to call concurrently from multiple agents.
 *
 * @param {import("redis").RedisClientType} redis - node-redis v4 client
 * @param {string} provider - "firecrawl" | "perplexity" | "chatgpt"
 * @param {number|null} costUsd - Cost in USD. Skipped if null/0.
 */
async function trackCost(redis, provider, costUsd) {
  if (!costUsd || costUsd <= 0) return;

  const key = REDIS_KEYS.dailyCosts(formatDate(new Date()));

  // Atomic increments — safe under concurrency
  await Promise.all([
    redis.hIncrByFloat(key, provider, costUsd),
    redis.hIncrByFloat(key, "total", costUsd),
  ]);

  // Expire daily keys after 90 days to avoid unbounded growth
  await redis.expire(key, 90 * 24 * 60 * 60);
}

/**
 * Get cost rollups for a date range.
 *
 * @param {import("redis").RedisClientType} redis
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<{ days: Array<{ date: string, firecrawl: number, perplexity: number, chatgpt: number, total: number }>, totals: { firecrawl: number, perplexity: number, chatgpt: number, total: number } }>}
 */
async function getCosts(redis, startDate, endDate) {
  const days = [];
  const totals = { firecrawl: 0, perplexity: 0, chatgpt: 0, total: 0 };

  // Iterate each day in range
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  const current = new Date(start);

  while (current <= end) {
    const dateStr = formatDate(current);
    const key = REDIS_KEYS.dailyCosts(dateStr);
    const data = await redis.hGetAll(key);

    const day = {
      date: dateStr,
      firecrawl: parseFloat(data.firecrawl || "0"),
      perplexity: parseFloat(data.perplexity || "0"),
      chatgpt: parseFloat(data.chatgpt || "0"),
      total: parseFloat(data.total || "0"),
    };

    days.push(day);
    totals.firecrawl += day.firecrawl;
    totals.perplexity += day.perplexity;
    totals.chatgpt += day.chatgpt;
    totals.total += day.total;

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return { days, totals };
}

module.exports = { trackCost, getCosts, formatDate };
