// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — EXECUTION LAYER CONSTANTS
// Types, statuses, Redis keys, and SSE events for platform
// execution triggered by approval flow.
// ═══════════════════════════════════════════════════════════════

// ── EXECUTION TYPES ─────────────────────────────────────────────
// Maps each channel/action to a specific executor

const EXECUTION_TYPES = {
  'email-campaign':      { executor: 'instantly',  label: 'Email Campaign',      icon: '📧' },
  'add-leads-campaign':  { executor: 'instantly',  label: 'Add Leads to Campaign', icon: '📋' },
  'post-facebook':       { executor: 'social',     label: 'Facebook Post',       icon: '📘' },
  'post-twitter':        { executor: 'social',     label: 'Twitter Post',        icon: '🐦' },
  'post-instagram':      { executor: 'social',     label: 'Instagram Post',      icon: '📸' },
  'post-linkedin':       { executor: 'social',     label: 'LinkedIn Post',       icon: '💼' },
  'sms-campaign':        { executor: 'sms',        label: 'SMS Campaign',        icon: '📱' },
  'create-leadsite':     { executor: 'leadsite',   label: 'Landing Page',        icon: '🌐' },
  'create-video':        { executor: 'videosite',  label: 'Video Creation',      icon: '🎬' },
  'post-generic':        { executor: 'social',     label: 'Social Post',         icon: '📣' },
};

// ── EXECUTION STATUS ────────────────────────────────────────────

const EXEC_STATUS = {
  QUEUED:    'queued',
  RUNNING:   'running',
  COMPLETED: 'completed',
  FAILED:    'failed',
};

// ── REDIS KEYS ──────────────────────────────────────────────────

const EXEC_KEYS = {
  execution:    (userId, execId) => `exec:${userId}:${execId}`,
  history:      (userId) => `exec:${userId}:history`,
  feedChannel:  (userId) => `sched:feed:${userId}`,
  feedEvents:   (userId) => `sched:feed:${userId}:events`,
};

// ── SSE EVENT TYPES ─────────────────────────────────────────────

const EXEC_EVENTS = {
  EXEC_QUEUED:    'exec_queued',
  EXEC_START:     'exec_start',
  EXEC_PROGRESS:  'exec_progress',
  EXEC_COMPLETE:  'exec_complete',
  EXEC_FAILED:    'exec_failed',
};

// ── CHANNEL → EXECUTION TYPE MAP ────────────────────────────────
// Used by contentGenerator to tag drafts with executionType

const CHANNEL_EXEC_MAP = {
  facebook:  'post-facebook',
  twitter:   'post-twitter',
  instagram: 'post-instagram',
  linkedin:  'post-linkedin',
  email:     'email-campaign',
  sms:       'sms-campaign',
};

module.exports = {
  EXECUTION_TYPES,
  EXEC_STATUS,
  EXEC_KEYS,
  EXEC_EVENTS,
  CHANNEL_EXEC_MAP,
};
