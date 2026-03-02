// ═══════════════════════════════════════════════════════════════
// MARKET STRATEGY PIPELINE — CHATGPT (OPENAI) PROVIDER WRAPPER
// Pattern: cache check → circuit breaker → API call with retry → cache → track cost
// PROVENANCE GUARDRAIL: system prompt MUST include URL allowlist from stage context.
// Used by: positioning, channel-plan, platform-structure, offer-funnel, exec-summary
// ═══════════════════════════════════════════════════════════════

const OpenAI = require("openai");
const { REDIS_KEYS, CACHE_TTL } = require("../constants");
const { sha256, nowISO } = require("../utils");
const circuitBreaker = require("./circuitBreaker");

const PROVIDER = "chatgpt";
const RETRY_ATTEMPTS = 3;
const RETRY_BACKOFF = [1000, 4000, 16000]; // 1s → 4s → 16s

// Pricing per 1K tokens (spec Section 7)
const PRICING = {
  "gpt-4o":      { inputPer1k: 0.0025, outputPer1k: 0.01 },
  "gpt-4o-mini": { inputPer1k: 0.00015, outputPer1k: 0.0006 },
};

let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build a system prompt with provenance guardrail.
 * Injects the URL allowlist so the model only cites verified sources.
 *
 * @param {string} baseSystemPrompt
 * @param {string[]} [provenanceUrls=[]] - Verified source URLs from stage context
 * @returns {string}
 */
function buildSystemPrompt(baseSystemPrompt, provenanceUrls = []) {
  if (!provenanceUrls.length) {
    return baseSystemPrompt +
      "\n\nIMPORTANT: No verified source URLs are available. " +
      'If you need to cite a source, say "no source available".';
  }

  return baseSystemPrompt +
    "\n\nPROVENANCE GUARDRAIL — You may ONLY cite URLs from this verified list:\n" +
    provenanceUrls.map((u) => `- ${u}`).join("\n") +
    '\n\nIf a claim needs a citation not in this list, say "no source available". ' +
    "Never fabricate or guess URLs.";
}

/**
 * Calculate cost from OpenAI usage response.
 * Returns null if usage fields are missing (spec rule: never guess).
 *
 * @param {object|null} usage - OpenAI usage object
 * @param {string} model
 * @returns {number|null}
 */
function calculateCost(usage, model) {
  if (!usage || !usage.prompt_tokens || !usage.completion_tokens) {
    return null;
  }

  const rates = PRICING[model] || PRICING["gpt-4o-mini"];
  return (
    (usage.prompt_tokens / 1000) * rates.inputPer1k +
    (usage.completion_tokens / 1000) * rates.outputPer1k
  );
}

/**
 * Call ChatGPT with caching, circuit breaker, retry, and provenance guardrail.
 *
 * @param {object} params
 * @param {string} params.systemPrompt - Base system prompt (provenance appended automatically)
 * @param {string} params.userPrompt - User message
 * @param {string[]} [params.provenanceUrls=[]] - Verified URLs from context.sources
 * @param {string} [params.model="gpt-4o"] - Model to use
 * @param {number} [params.maxTokens=2000]
 * @param {number} [params.temperature=0.3]
 * @param {import("redis").RedisClientType} redis
 * @returns {Promise<{ content: string, usage: object|null, cached: boolean, costUsd: number|null }>}
 */
async function chat(params, redis) {
  const {
    systemPrompt,
    userPrompt,
    provenanceUrls = [],
    model = "gpt-4o",
    maxTokens = 2000,
    temperature = 0.3,
  } = params;

  // Build system prompt with provenance guardrail
  const fullSystemPrompt = buildSystemPrompt(systemPrompt, provenanceUrls);

  // 1. Cache key — hash of full system prompt + user prompt
  const cacheKey = REDIS_KEYS.cache.chatgpt(sha256(fullSystemPrompt + userPrompt));

  // 2. Cache check
  const cached = await redis.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    return { ...parsed, cached: true, costUsd: 0 };
  }

  // 3. Circuit breaker check
  await circuitBreaker.canCall(redis, PROVIDER);

  // 4. API call with retry
  let lastError;
  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await getClient().chat.completions.create({
        model,
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      const content = response.choices[0].message.content;
      const usage = response.usage || null;
      const costUsd = calculateCost(usage, model);

      const payload = { content, usage };

      // 5. Cache response
      await redis.set(cacheKey, JSON.stringify(payload), { EX: CACHE_TTL.chatgpt });

      // 6. Circuit breaker success
      await circuitBreaker.onSuccess(redis, PROVIDER);

      return { ...payload, cached: false, costUsd };
    } catch (err) {
      lastError = err;
      await circuitBreaker.onFailure(redis, PROVIDER);

      if (attempt < RETRY_ATTEMPTS - 1) {
        await sleep(RETRY_BACKOFF[attempt]);
      }
    }
  }

  const err = new Error(`ChatGPT call failed after ${RETRY_ATTEMPTS} attempts: ${lastError.message}`);
  err.retryable = true;
  throw err;
}

module.exports = { chat, buildSystemPrompt, calculateCost, PRICING };
