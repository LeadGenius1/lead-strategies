// ═══════════════════════════════════════════════════════════════
// MARKET STRATEGY PIPELINE — UTILITIES
// Shared helpers used by provider wrappers, pipeline executor, and routes.
// ═══════════════════════════════════════════════════════════════

const crypto = require("crypto");
const { MAX_AGENT_OUTPUT_BYTES, JOB_ID_PREFIX } = require("./constants");

// --- SHA-256 Hash (for cache keys) ---

/**
 * Returns a hex SHA-256 hash of the input string.
 * Used to build Redis cache keys for provider responses.
 *
 * @param {string} input
 * @returns {string} 64-char hex hash
 */
function sha256(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

// --- Perplexity Query Normalization ---

/**
 * Normalizes a Perplexity search query for consistent cache keys.
 * Steps: lowercase → trim → collapse whitespace → strip punctuation (keep - and /)
 *
 * @param {string} query
 * @returns {string} normalized query
 */
function normalizeQuery(query) {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\-\/]/g, "");
}

// --- Agent Output Truncation ---

/**
 * Truncates agent output to MAX_AGENT_OUTPUT_BYTES while preserving
 * valid JSON structure. If the stringified output exceeds the limit,
 * returns a wrapper object with the truncated string and a flag.
 *
 * @param {*} output - Agent output (any JSON-serializable value)
 * @returns {*} Original output if within limit, or truncation wrapper
 */
function truncateOutput(output) {
  const str = JSON.stringify(output);
  if (str.length <= MAX_AGENT_OUTPUT_BYTES) {
    return output;
  }
  return {
    _truncated: true,
    _originalBytes: str.length,
    data: str.substring(0, MAX_AGENT_OUTPUT_BYTES),
  };
}

// --- Job ID Generator ---

/**
 * Generates a unique job ID with the mkt_ prefix.
 * Format: mkt_ + 12 hex chars from crypto.randomBytes.
 *
 * @returns {string} e.g. "mkt_a1b2c3d4e5f6"
 */
function generateJobId() {
  return JOB_ID_PREFIX + crypto.randomBytes(6).toString("hex");
}

// --- ISO Timestamp ---

/**
 * Returns the current time as an ISO 8601 string.
 * Convenience for consistent timestamp formatting across the pipeline.
 *
 * @returns {string} e.g. "2026-03-02T14:10:00.000Z"
 */
function nowISO() {
  return new Date().toISOString();
}

module.exports = {
  sha256,
  normalizeQuery,
  truncateOutput,
  generateJobId,
  nowISO,
};
