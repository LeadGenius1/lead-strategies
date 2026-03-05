// ═══════════════════════════════════════════════════════════════
// MARKET STRATEGY PIPELINE — FIRECRAWL PROVIDER WRAPPER
// Pattern: cache check → circuit breaker → API call with retry → cache → track cost
// Used by: nexus-research (competitor scraping), competitor-teardown (site audits)
// ═══════════════════════════════════════════════════════════════

const FirecrawlApp = require("@mendable/firecrawl-js").default || require("@mendable/firecrawl-js");
const { REDIS_KEYS, CACHE_TTL } = require("../constants");
const { sha256, nowISO } = require("../utils");
const circuitBreaker = require("./circuitBreaker");

const PROVIDER = "firecrawl";
const RETRY_ATTEMPTS = 3;
const RETRY_BACKOFF = [1000, 4000, 16000]; // 1s → 4s → 16s

let client = null;

function getClient() {
  if (!client) {
    const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
    // Firecrawl SDK v4: scrapeUrl/crawlUrl live on .v1 accessor
    client = app.v1 || app;
  }
  return client;
}

/**
 * Sleep helper for retry backoff.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Scrape a single URL with caching, circuit breaker, and retry.
 *
 * @param {string} url - URL to scrape
 * @param {import("redis").RedisClientType} redis
 * @param {object} [options]
 * @param {boolean} [options.mainContentOnly=true]
 * @returns {Promise<{ content: string, title: string, metadata: object, url: string, cached: boolean, costUsd: number|null }>}
 */
async function scrape(url, redis, options = {}) {
  const cacheKey = REDIS_KEYS.cache.firecrawl(sha256(url));

  // 1. Cache check
  const cached = await redis.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    return { ...parsed, cached: true, costUsd: 0 };
  }

  // 2. Circuit breaker check
  await circuitBreaker.canCall(redis, PROVIDER);

  // 3. API call with retry
  let lastError;
  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    try {
      const result = await getClient().scrapeUrl(url, {
        formats: ["markdown"],
        onlyMainContent: options.mainContentOnly !== false,
        excludeTags: ["nav", "footer", "script"],
      });

      const payload = {
        url,
        title: result.metadata?.title || "Unknown",
        content: result.markdown || "",
        metadata: result.metadata || {},
      };

      // 4. Cache response
      await redis.set(cacheKey, JSON.stringify(payload), { EX: CACHE_TTL.firecrawl });

      // 5. Circuit breaker success
      await circuitBreaker.onSuccess(redis, PROVIDER);

      // 6. Cost — Firecrawl charges per scrape
      const costUsd = 0.002;

      return { ...payload, cached: false, costUsd };
    } catch (err) {
      lastError = err;
      await circuitBreaker.onFailure(redis, PROVIDER);

      if (attempt < RETRY_ATTEMPTS - 1) {
        await sleep(RETRY_BACKOFF[attempt]);
      }
    }
  }

  // All retries exhausted
  const err = new Error(`Firecrawl scrape failed after ${RETRY_ATTEMPTS} attempts: ${lastError.message}`);
  err.retryable = true;
  throw err;
}

/**
 * Crawl a site (multiple pages) with caching, circuit breaker, and retry.
 *
 * @param {string} url - Base URL to crawl
 * @param {import("redis").RedisClientType} redis
 * @param {object} [options]
 * @param {number} [options.maxPages=10]
 * @returns {Promise<{ pages: Array, url: string, cached: boolean, costUsd: number|null }>}
 */
async function crawl(url, redis, options = {}) {
  const maxPages = options.maxPages || 10;
  const cacheKey = REDIS_KEYS.cache.firecrawl(sha256(`crawl:${url}:${maxPages}`));

  // 1. Cache check
  const cached = await redis.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    return { ...parsed, cached: true, costUsd: 0 };
  }

  // 2. Circuit breaker check
  await circuitBreaker.canCall(redis, PROVIDER);

  // 3. API call with retry
  let lastError;
  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    try {
      const result = await getClient().crawlUrl(url, {
        limit: maxPages,
        scrapeOptions: { formats: ["markdown"] },
      });

      const pages = (result.data || []).map((page) => ({
        url: page.metadata?.sourceURL || page.url || url,
        title: page.metadata?.title || "Unknown",
        content: page.markdown || "",
        metadata: page.metadata || {},
      }));

      const payload = { url, pages, totalPages: pages.length };

      // 4. Cache response
      await redis.set(cacheKey, JSON.stringify(payload), { EX: CACHE_TTL.firecrawl });

      // 5. Circuit breaker success
      await circuitBreaker.onSuccess(redis, PROVIDER);

      // 6. Cost — per crawled page
      const costUsd = pages.length * 0.001;

      return { ...payload, cached: false, costUsd };
    } catch (err) {
      lastError = err;
      await circuitBreaker.onFailure(redis, PROVIDER);

      if (attempt < RETRY_ATTEMPTS - 1) {
        await sleep(RETRY_BACKOFF[attempt]);
      }
    }
  }

  const err = new Error(`Firecrawl crawl failed after ${RETRY_ATTEMPTS} attempts: ${lastError.message}`);
  err.retryable = true;
  throw err;
}

module.exports = { scrape, crawl };
