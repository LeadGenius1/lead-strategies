// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — SCHEDULER CONSTANTS & TASK DEFINITIONS
// Defines every autonomous task, schedule presets, Redis keys,
// and SSE event types for the scheduler engine.
// ═══════════════════════════════════════════════════════════════

// ── AUTONOMOUS TASK DEFINITIONS ──────────────────────────────

const TASKS = {
  // ── DAILY TASKS ──────────────────────────
  'sender-health': {
    id: 'sender-health',
    name: 'Sender Health Check',
    icon: '\uD83D\uDCE7',
    schedule: 'daily',
    cronPattern: '0 7 * * *',        // 7 AM UTC daily (first — before other tasks)
    description: 'Check Instantly sender account warmup, deliverability, daily limits',
    providers: ['instantly'],
    estimatedMinutes: 1,
    requiresFields: [],               // no profile fields needed
  },

  'competitor-watch': {
    id: 'competitor-watch',
    name: 'Competitor Watch',
    icon: '\uD83D\uDD0D',
    schedule: 'daily',
    cronPattern: '0 8 * * *',        // 8 AM UTC daily
    description: 'Scan competitor sites for new content, pricing changes, feature launches',
    providers: ['firecrawl'],
    estimatedMinutes: 3,
    requiresFields: ['competitors'],
  },

  'content-generator': {
    id: 'content-generator',
    name: 'Content Generator',
    icon: '\u270D\uFE0F',
    schedule: 'daily',               // adjusted per contentFreq setting
    cronPattern: '0 9 * * *',        // 9 AM UTC daily
    description: 'Generate social media posts, email drafts, blog ideas based on content themes',
    providers: ['chatgpt', 'perplexity'],
    estimatedMinutes: 5,
    requiresFields: ['contentThemes', 'activeChannels', 'toneOfVoice'],
  },

  'prospect-finder': {
    id: 'prospect-finder',
    name: 'Prospect Finder',
    icon: '\uD83C\uDFAF',
    schedule: 'daily',
    cronPattern: '0 10 * * *',       // 10 AM UTC daily
    description: 'Find new prospects matching ICP using market data and competitor audiences',
    providers: ['perplexity', 'chatgpt'],
    estimatedMinutes: 4,
    requiresFields: ['icp', 'targetMarket', 'industry'],
  },

  // ── WEEKLY TASKS ─────────────────────────
  'strategy-refresh': {
    id: 'strategy-refresh',
    name: 'Strategy Refresh',
    icon: '\uD83D\uDD04',
    schedule: 'weekly',
    cronPattern: '0 6 * * 1',        // Monday 6 AM UTC
    description: 'Run full 7-agent market strategy pipeline with latest profile data',
    providers: ['firecrawl', 'perplexity', 'chatgpt'],
    estimatedMinutes: 15,
    requiresFields: ['targetMarket', 'icp', 'competitors', 'offer'],
  },

  'performance-report': {
    id: 'performance-report',
    name: 'Performance Report',
    icon: '\uD83D\uDCCA',
    schedule: 'weekly',
    cronPattern: '0 8 * * 1',        // Monday 8 AM UTC (after strategy refresh)
    description: 'Generate weekly performance report: leads, engagement, costs, recommendations',
    providers: ['chatgpt'],
    estimatedMinutes: 3,
    requiresFields: [],
  },

  'market-intel-refresh': {
    id: 'market-intel-refresh',
    name: 'Market Intel Refresh',
    icon: '\uD83D\uDCE1',
    schedule: 'weekly',
    cronPattern: '0 6 * * 4',        // Thursday 6 AM UTC
    description: 'Refresh market trends, news, and competitive landscape via Perplexity',
    providers: ['perplexity'],
    estimatedMinutes: 3,
    requiresFields: ['industry', 'targetMarket'],
  },
};

// ── SCHEDULE PRESETS ──────────────────────
// Maps contentFreq preference to actual cron patterns

const FREQUENCY_MAP = {
  'daily':    { contentCron: '0 9 * * *',     prospectCron: '0 10 * * *' },
  '3x/week':  { contentCron: '0 9 * * 1,3,5', prospectCron: '0 10 * * 2,4' },
  'weekly':   { contentCron: '0 9 * * 1',     prospectCron: '0 10 * * 3' },
};

// ── REDIS KEYS ───────────────────────────
// Prefix: sched: (separate from mkt: market strategy keys)

const SCHED_KEYS = {
  userSchedule:  (userId) => `sched:user:${userId}:schedule`,
  taskRun:       (userId, taskId, date) => `sched:run:${userId}:${taskId}:${date}`,
  taskOutput:    (userId, taskId, runId) => `sched:output:${userId}:${taskId}:${runId}`,
  feedEvents:    (userId) => `sched:feed:${userId}:events`,
  feedChannel:   (userId) => `sched:feed:${userId}:live`,
  dailyCosts:    (date) => `sched:costs:${date}`,
};

// ── SSE EVENT TYPES ──────────────────────

const SCHED_EVENTS = {
  TASK_QUEUED:     'task_queued',
  TASK_START:      'task_start',
  TASK_PROGRESS:   'task_progress',
  TASK_COMPLETE:   'task_complete',
  TASK_FAILED:     'task_failed',
  TASK_OUTPUT:     'task_output',
  SCHEDULE_UPDATE: 'schedule_update',
  DAILY_SUMMARY:   'daily_summary',
};

// ── ALL TASK IDS ─────────────────────────

const ALL_TASK_IDS = Object.keys(TASKS);
const DAILY_TASK_IDS = ALL_TASK_IDS.filter(id => TASKS[id].schedule === 'daily');
const WEEKLY_TASK_IDS = ALL_TASK_IDS.filter(id => TASKS[id].schedule === 'weekly');

module.exports = {
  TASKS,
  FREQUENCY_MAP,
  SCHED_KEYS,
  SCHED_EVENTS,
  ALL_TASK_IDS,
  DAILY_TASK_IDS,
  WEEKLY_TASK_IDS,
};
