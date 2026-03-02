// ═══════════════════════════════════════════════════════════════
// MARKET STRATEGY PIPELINE — CONSTANTS
// Stable IDs shared across backend pipeline, SSE events, and frontend UI.
// Do NOT rename agent IDs or stage keys — they are persisted in Redis.
// ═══════════════════════════════════════════════════════════════

// --- Agent Definitions ---

const NEXUS_AGENTS = [
  {
    id: "nexus-research",
    name: "Nexus Research",
    icon: "🔍",
    stage: 0,
    description: "Scrapes competitor sites, researches market landscape, collects raw intelligence",
    providers: ["firecrawl", "perplexity"],
  },
  {
    id: "competitor-teardown",
    name: "Competitor Teardown",
    icon: "🔬",
    stage: 0,
    description: "Technical audit of competitor sites + your 5 platforms — SEO structure, schemas, performance",
    providers: ["firecrawl"],
  },
  {
    id: "positioning",
    name: "Positioning",
    icon: "🎯",
    stage: 1,
    description: "Synthesizes research into market position — gaps, opportunities, differentiation angles",
    providers: ["chatgpt", "perplexity"],
  },
  {
    id: "channel-plan",
    name: "Channel Plan",
    icon: "📡",
    stage: 1,
    description: "Recommends channels, content types, sequence, and budget allocation per platform",
    providers: ["chatgpt", "perplexity"],
  },
  {
    id: "platform-structure",
    name: "Platform Structure",
    icon: "🏗️",
    stage: 2,
    description: "Page architecture, JSON-LD schemas, sitemaps, programmatic templates, integration pages",
    providers: ["chatgpt"],
  },
  {
    id: "offer-funnel",
    name: "Offer & Funnel",
    icon: "💰",
    stage: 2,
    description: "Conversion copy, AEO-optimized content, outreach templates, funnel architecture",
    providers: ["chatgpt", "perplexity"],
  },
  {
    id: "exec-summary",
    name: "Executive Summary",
    icon: "📋",
    stage: 3,
    description: "Final synthesis — strategy deck, KPIs, timeline, budget, action items",
    providers: ["chatgpt"],
  },
];

// --- Stage Definitions ---

const STAGES = {
  0: { name: "gather",     label: "Gathering Intelligence",       agents: ["nexus-research", "competitor-teardown"] },
  1: { name: "analyze",    label: "Analyzing & Positioning",      agents: ["positioning", "channel-plan"] },
  2: { name: "build",      label: "Building Strategy",            agents: ["platform-structure", "offer-funnel"] },
  3: { name: "synthesize", label: "Synthesizing Recommendations", agents: ["exec-summary"] },
};

// --- Lookup Helpers ---

const AGENT_MAP = Object.fromEntries(NEXUS_AGENTS.map(a => [a.id, a]));
const STAGE_COUNT = Object.keys(STAGES).length;
const ALL_AGENT_IDS = NEXUS_AGENTS.map(a => a.id);

// --- SSE Event Types ---

const SSE_EVENTS = [
  "job_start",
  "stage_start",
  "agent_start",
  "agent_progress",
  "agent_complete",
  "agent_failed",
  "job_complete",
];

// --- Job Statuses ---

const JOB_STATUS = {
  QUEUED:    "queued",
  RUNNING:   "running",
  COMPLETED: "completed",
  PARTIAL:   "partial",
  FAILED:    "failed",
  CANCELLED: "cancelled",
};

// --- Agent Statuses ---

const AGENT_STATUS = {
  PENDING:   "pending",
  RUNNING:   "running",
  COMPLETED: "completed",
  FAILED:    "failed",
  SKIPPED:   "skipped",
};

// --- Redis Key Prefixes ---

const REDIS_KEYS = {
  job:         (jobId) => `mkt:job:${jobId}`,
  agentState:  (jobId, agentId) => `mkt:job:${jobId}:agent:${agentId}`,
  events:      (jobId) => `mkt:job:${jobId}:events`,
  context:     (jobId) => `mkt:job:${jobId}:context`,
  userJobs:    (userId) => `mkt:user:${userId}:jobs`,
  dailyCosts:  (date) => `mkt:costs:daily:${date}`,
  liveChannel: (jobId) => `mkt:job:${jobId}:live`,
  cache: {
    firecrawl:  (hash) => `mkt:cache:firecrawl:${hash}`,
    perplexity: (hash) => `mkt:cache:perplexity:${hash}`,
    chatgpt:    (hash) => `mkt:cache:chatgpt:${hash}`,
  },
  circuit:     (provider) => `mkt:circuit:${provider}`,
};

// --- Cache TTLs (seconds) ---

const CACHE_TTL = {
  firecrawl:  6 * 60 * 60,   // 6 hours
  perplexity: 1 * 60 * 60,   // 1 hour
  chatgpt:    24 * 60 * 60,  // 24 hours
};

// --- Circuit Breaker Defaults ---

const CIRCUIT_BREAKER = {
  failureThreshold: 5,
  resetTimeoutMs: 60_000,  // 1 minute
  halfOpenMaxAttempts: 2,
};

// --- Output Limits ---

const MAX_AGENT_OUTPUT_BYTES = 50_000;  // 50KB per agent output

// --- Heartbeat Interval ---

const HEARTBEAT_INTERVAL_MS = 30_000;  // 30 seconds

// --- Job ID Prefix ---

const JOB_ID_PREFIX = "mkt_";

module.exports = {
  NEXUS_AGENTS,
  STAGES,
  AGENT_MAP,
  STAGE_COUNT,
  ALL_AGENT_IDS,
  SSE_EVENTS,
  JOB_STATUS,
  AGENT_STATUS,
  REDIS_KEYS,
  CACHE_TTL,
  CIRCUIT_BREAKER,
  MAX_AGENT_OUTPUT_BYTES,
  HEARTBEAT_INTERVAL_MS,
  JOB_ID_PREFIX,
};
