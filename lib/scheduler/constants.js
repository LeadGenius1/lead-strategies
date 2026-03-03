// ── Scheduler Cockpit Constants ─────────────────────────────────────
// Mirrors backend/src/services/nexus2/scheduler/constants.js for frontend use

export const TASKS = {
  'sender-health': {
    id: 'sender-health',
    name: 'Sender Health Check',
    icon: '📧',
    schedule: 'daily',
    description: 'Check Instantly sender warmup, deliverability, daily limits',
  },
  'competitor-watch': {
    id: 'competitor-watch',
    name: 'Competitor Watch',
    icon: '🔍',
    schedule: 'daily',
    description: 'Scan competitor sites for content, pricing changes, feature launches',
  },
  'content-generator': {
    id: 'content-generator',
    name: 'Content Generator',
    icon: '✍️',
    schedule: 'daily',
    description: 'Generate social media posts, email drafts, blog ideas',
  },
  'prospect-finder': {
    id: 'prospect-finder',
    name: 'Prospect Finder',
    icon: '🎯',
    schedule: 'daily',
    description: 'Find new prospects matching ICP from market data',
  },
  'strategy-refresh': {
    id: 'strategy-refresh',
    name: 'Strategy Refresh',
    icon: '🔄',
    schedule: 'weekly',
    description: 'Run full market strategy pipeline with latest profile data',
  },
  'performance-report': {
    id: 'performance-report',
    name: 'Performance Report',
    icon: '📊',
    schedule: 'weekly',
    description: 'Weekly performance report: leads, engagement, costs',
  },
  'market-intel-refresh': {
    id: 'market-intel-refresh',
    name: 'Market Intel Refresh',
    icon: '📡',
    schedule: 'weekly',
    description: 'Refresh market trends, news, and competitive landscape',
  },
};

export const ALL_TASK_IDS = Object.keys(TASKS);
export const DAILY_TASK_IDS = ['sender-health', 'competitor-watch', 'content-generator', 'prospect-finder'];
export const WEEKLY_TASK_IDS = ['strategy-refresh', 'performance-report', 'market-intel-refresh'];

// Execution SSE event types
export const EXEC_EVENTS = {
  EXEC_QUEUED:   'exec_queued',
  EXEC_START:    'exec_start',
  EXEC_PROGRESS: 'exec_progress',
  EXEC_COMPLETE: 'exec_complete',
  EXEC_FAILED:   'exec_failed',
};

// SSE named event types emitted by GET /api/v1/scheduler/feed
export const SSE_EVENTS = [
  'task_queued',
  'task_start',
  'task_progress',
  'task_complete',
  'task_failed',
  'task_output',
  'schedule_update',
  'daily_summary',
  'heartbeat',
  // Execution events
  'exec_queued',
  'exec_start',
  'exec_progress',
  'exec_complete',
  'exec_failed',
];

// Task run statuses
export const TASK_STATUS = {
  IDLE: 'idle',
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused',
};

// Feed card types rendered by FeedCard dispatcher
export const CARD_TYPE = {
  STATUS: 'status',
  RESULT: 'result',
  DRAFT: 'draft',
  PROSPECT: 'prospect',
  REPORT: 'report',
  ALERT: 'alert',
  MILESTONE: 'milestone',
};

// Map SSE event → which card type to render
export const EVENT_CARD_MAP = {
  task_queued: CARD_TYPE.STATUS,
  task_start: CARD_TYPE.STATUS,
  task_progress: CARD_TYPE.STATUS,
  task_complete: CARD_TYPE.RESULT,
  task_failed: CARD_TYPE.ALERT,
  daily_summary: CARD_TYPE.MILESTONE,
};

// Map task → output card type (for task_output events)
export const OUTPUT_CARD_MAP = {
  'content-generator': CARD_TYPE.DRAFT,
  'prospect-finder': CARD_TYPE.PROSPECT,
  'performance-report': CARD_TYPE.REPORT,
  'strategy-refresh': CARD_TYPE.REPORT,
  'market-intel-refresh': CARD_TYPE.REPORT,
  'sender-health': CARD_TYPE.RESULT,
  'competitor-watch': CARD_TYPE.RESULT,
};

// Accent colors per task (used for borders, badges, gradients)
export const TASK_COLORS = {
  'sender-health': 'emerald',
  'competitor-watch': 'amber',
  'content-generator': 'indigo',
  'prospect-finder': 'purple',
  'strategy-refresh': 'cyan',
  'performance-report': 'indigo',
  'market-intel-refresh': 'amber',
};

// Tailwind color maps for dynamic class construction
export const COLOR_CLASSES = {
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    gradient: 'from-emerald-500/40',
    pulse: 'bg-emerald-400',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    gradient: 'from-amber-500/40',
    pulse: 'bg-amber-400',
  },
  indigo: {
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    gradient: 'from-indigo-500/40',
    pulse: 'bg-indigo-400',
  },
  purple: {
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    gradient: 'from-purple-500/40',
    pulse: 'bg-purple-400',
  },
  cyan: {
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    gradient: 'from-cyan-500/40',
    pulse: 'bg-cyan-400',
  },
  red: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    gradient: 'from-red-500/40',
    pulse: 'bg-red-400',
  },
};

export const FEED_MAX_ITEMS = 200;
