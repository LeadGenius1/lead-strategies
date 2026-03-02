// ═══════════════════════════════════════════════════════════════
// MARKET STRATEGY PIPELINE — PERPLEXITY PROVIDER WRAPPER
// Pattern: normalize query → cache check → circuit breaker → API call with retry → cache → track cost
// Used by: nexus-research, positioning, channel-plan, offer-funnel
// ═══════════════════════════════════════════════════════════════

const OpenAI = require("openai");
const { REDIS_KEYS, CACHE_TTL } = require("../constants");
const { sha256, normalizeQuery, nowISO } = require("../utils");
const circuitBreaker = require("./circuitBreaker");

const PROVIDER = "perplexity";
const RETRY_ATTEMPTS = 3;
const RETRY_BACKOFF = [2000, 8000, 30000]; // 2s → 8s → 30s
const DEFAULT_MODEL = "sonar-pro";

let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.PERPLEXITY_API_KEY,
      baseURL: "https://api.perplexity.ai",
    });
  }
  return client;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Query Perplexity with caching, circuit breaker, and retry.
 *
 * @param {string} query - Research query
 * @param {import("redis").RedisClientType} redis
 * @param {object} [options]
 * @param {string} [options.model="sonar-pro"]
 * @param {number} [options.maxTokens=1000]
 * @param {string} [options.systemPrompt]
 * @returns {Promise<{ answer: string, citations: string[], usage: object|null, cached: boolean, costUsd: number|null }>}
 */
async function research(query, redis, options = {}) {
  // 1. Normalize + cache key
  const normalized = normalizeQuery(query);
  const cacheKey = REDIS_KEYS.cache.perplexity(sha256(normalized));

  // 2. Cache check
  const cached = await redis.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    return { ...parsed, cached: true, costUsd: 0 };
  }

  // 3. Circuit breaker check
  await circuitBreaker.canCall(redis, PROVIDER);

  // 4. API call with retry
  const model = options.model || DEFAULT_MODEL;
  const systemPrompt = options.systemPrompt ||
    "You are a research assistant. Provide accurate, cited information from recent sources.";

  let lastError;
  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await getClient().chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        temperature: 0.2,
        max_tokens: options.maxTokens || 1000,
      });

      const answer = response.choices[0].message.content;
      const citations = extractCitations(answer);
      const usage = response.usage || null;

      const payload = { answer, citations, usage };

      // 5. Cache response
      await redis.set(cacheKey, JSON.stringify(payload), { EX: CACHE_TTL.perplexity });

      // 6. Circuit breaker success
      await circuitBreaker.onSuccess(redis, PROVIDER);

      // 7. Cost — per query flat rate (usage fields may be missing)
      const costUsd = 0.005;

      return { ...payload, cached: false, costUsd };
    } catch (err) {
      lastError = err;
      await circuitBreaker.onFailure(redis, PROVIDER);

      if (attempt < RETRY_ATTEMPTS - 1) {
        await sleep(RETRY_BACKOFF[attempt]);
      }
    }
  }

  const err = new Error(`Perplexity query failed after ${RETRY_ATTEMPTS} attempts: ${lastError.message}`);
  err.retryable = true;
  throw err;
}

/**
 * Extract citation markers [1], [2], etc. from response text.
 */
function extractCitations(text) {
  const matches = text.match(/\[(\d+)\]/g) || [];
  return Array.from(new Set(matches));
}

module.exports = { research };
