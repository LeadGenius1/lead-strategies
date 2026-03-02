// ═══════════════════════════════════════════════════════════════
// MARKET STRATEGY PIPELINE — CIRCUIT BREAKER (Redis-backed)
// Shared by all provider wrappers (firecrawl, perplexity, chatgpt).
// States: closed → open (after 5 failures) → half-open (after 60s) → closed (after 2 successes)
// ═══════════════════════════════════════════════════════════════

const { REDIS_KEYS, CIRCUIT_BREAKER } = require("../constants");
const { nowISO } = require("../utils");

const { failureThreshold, resetTimeoutMs, halfOpenMaxAttempts } = CIRCUIT_BREAKER;

/**
 * Get the current circuit breaker state for a provider.
 *
 * @param {import("redis").RedisClientType} redis
 * @param {string} provider - "firecrawl" | "perplexity" | "chatgpt"
 * @returns {Promise<{ state: string, failures: number, lastFailure: string|null, openUntil: string|null, halfOpenSuccesses: number }>}
 */
async function getState(redis, provider) {
  const key = REDIS_KEYS.circuit(provider);
  const data = await redis.hGetAll(key);

  if (!data || !data.state) {
    return { state: "closed", failures: 0, lastFailure: null, openUntil: null, halfOpenSuccesses: 0 };
  }

  return {
    state: data.state,
    failures: parseInt(data.failures || "0", 10),
    lastFailure: data.lastFailure || null,
    openUntil: data.openUntil || null,
    halfOpenSuccesses: parseInt(data.halfOpenSuccesses || "0", 10),
  };
}

/**
 * Check if a provider call is allowed. Transitions open → half-open if timeout elapsed.
 * Throws if the circuit is open and the timeout hasn't elapsed.
 *
 * @param {import("redis").RedisClientType} redis
 * @param {string} provider
 * @returns {Promise<string>} Current state after transition ("closed" or "half-open")
 */
async function canCall(redis, provider) {
  const cb = await getState(redis, provider);

  if (cb.state === "closed") {
    return "closed";
  }

  if (cb.state === "half-open") {
    if (cb.halfOpenSuccesses >= halfOpenMaxAttempts) {
      // Shouldn't normally reach here — onSuccess should have closed it.
      // But handle it defensively.
      return "half-open";
    }
    return "half-open";
  }

  // state === "open"
  if (cb.openUntil && new Date(cb.openUntil).getTime() <= Date.now()) {
    // Timeout elapsed — transition to half-open
    const key = REDIS_KEYS.circuit(provider);
    await redis.hSet(key, { state: "half-open", halfOpenSuccesses: "0" });
    return "half-open";
  }

  // Still open — fail fast
  const err = new Error(`Circuit breaker OPEN for ${provider} — failing fast (try again after ${cb.openUntil})`);
  err.code = "CIRCUIT_OPEN";
  err.retryable = true;
  throw err;
}

/**
 * Record a successful call. Transitions half-open → closed after enough successes.
 *
 * @param {import("redis").RedisClientType} redis
 * @param {string} provider
 */
async function onSuccess(redis, provider) {
  const key = REDIS_KEYS.circuit(provider);
  const cb = await getState(redis, provider);

  if (cb.state === "half-open") {
    const successes = cb.halfOpenSuccesses + 1;
    if (successes >= halfOpenMaxAttempts) {
      // Enough successes in half-open — close the circuit
      await redis.hSet(key, { state: "closed", failures: "0", halfOpenSuccesses: "0", openUntil: "" });
    } else {
      await redis.hSet(key, { halfOpenSuccesses: String(successes) });
    }
  } else if (cb.state === "closed" && cb.failures > 0) {
    // Reset failure count on success in closed state
    await redis.hSet(key, { failures: "0" });
  }
}

/**
 * Record a failed call. Transitions closed → open after threshold failures.
 * In half-open state, a single failure re-opens the circuit.
 *
 * @param {import("redis").RedisClientType} redis
 * @param {string} provider
 */
async function onFailure(redis, provider) {
  const key = REDIS_KEYS.circuit(provider);
  const cb = await getState(redis, provider);
  const now = nowISO();

  if (cb.state === "half-open") {
    // Any failure in half-open → re-open
    const openUntil = new Date(Date.now() + resetTimeoutMs).toISOString();
    await redis.hSet(key, {
      state: "open",
      failures: String(cb.failures + 1),
      lastFailure: now,
      openUntil,
      halfOpenSuccesses: "0",
    });
    return;
  }

  // closed state
  const failures = cb.failures + 1;
  if (failures >= failureThreshold) {
    // Trip the circuit
    const openUntil = new Date(Date.now() + resetTimeoutMs).toISOString();
    await redis.hSet(key, {
      state: "open",
      failures: String(failures),
      lastFailure: now,
      openUntil,
      halfOpenSuccesses: "0",
    });
  } else {
    await redis.hSet(key, {
      state: "closed",
      failures: String(failures),
      lastFailure: now,
    });
  }
}

/**
 * Reset the circuit breaker for a provider (admin utility).
 *
 * @param {import("redis").RedisClientType} redis
 * @param {string} provider
 */
async function reset(redis, provider) {
  const key = REDIS_KEYS.circuit(provider);
  await redis.del(key);
}

module.exports = {
  getState,
  canCall,
  onSuccess,
  onFailure,
  reset,
};
