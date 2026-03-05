// Market Strategy Pipeline — Frontend Constants
// Must match backend/src/services/marketStrategy/constants.js exactly.
// Do NOT rename agent IDs or stage keys — they are persisted in Redis.

export const NEXUS_AGENTS = [
  { id: "nexus-research",      name: "Lead Hunter — Research", icon: "\uD83D\uDD0D", stage: 0 },
  { id: "competitor-teardown",  name: "Competitor Teardown",  icon: "\uD83D\uDD2C", stage: 0 },
  { id: "positioning",          name: "Positioning",          icon: "\uD83C\uDFAF", stage: 1 },
  { id: "channel-plan",         name: "Channel Plan",         icon: "\uD83D\uDCE1", stage: 1 },
  { id: "platform-structure",   name: "Platform Structure",   icon: "\uD83C\uDFD7\uFE0F", stage: 2 },
  { id: "offer-funnel",         name: "Offer & Funnel",       icon: "\uD83D\uDCB0", stage: 2 },
  { id: "exec-summary",         name: "Executive Summary",    icon: "\uD83D\uDCCB", stage: 3 },
];

export const STAGES = {
  0: { name: "gather",     label: "Gathering Intelligence",       agents: ["nexus-research", "competitor-teardown"] },
  1: { name: "analyze",    label: "Analyzing & Positioning",      agents: ["positioning", "channel-plan"] },
  2: { name: "build",      label: "Building Strategy",            agents: ["platform-structure", "offer-funnel"] },
  3: { name: "synthesize", label: "Synthesizing Recommendations", agents: ["exec-summary"] },
};

export const SSE_EVENTS = [
  "job_start",
  "stage_start",
  "agent_start",
  "agent_progress",
  "agent_complete",
  "agent_failed",
  "job_complete",
];

export const AGENT_MAP = Object.fromEntries(NEXUS_AGENTS.map(a => [a.id, a]));
export const ALL_AGENT_IDS = NEXUS_AGENTS.map(a => a.id);
export const STAGE_COUNT = Object.keys(STAGES).length;

export const AGENT_STATUS = {
  PENDING:   "pending",
  RUNNING:   "running",
  COMPLETED: "completed",
  FAILED:    "failed",
};

export const JOB_STATUS = {
  QUEUED:    "queued",
  RUNNING:   "running",
  COMPLETED: "completed",
  PARTIAL:   "partial",
  FAILED:    "failed",
  CANCELLED: "cancelled",
};

// Agent accent colors for AETHER UI cards
export const AGENT_COLORS = {
  "nexus-research":     "indigo",
  "competitor-teardown": "purple",
  "positioning":         "indigo",
  "channel-plan":        "amber",
  "platform-structure":  "emerald",
  "offer-funnel":        "rose",
  "exec-summary":        "indigo",
};

// Budget range options
export const BUDGET_OPTIONS = [
  { value: "$1k-$2k",   label: "$1,000 - $2,000 / mo" },
  { value: "$2k-$5k",   label: "$2,000 - $5,000 / mo" },
  { value: "$5k-$10k",  label: "$5,000 - $10,000 / mo" },
  { value: "$10k-$25k", label: "$10,000 - $25,000 / mo" },
  { value: "$25k+",     label: "$25,000+ / mo" },
];

// Platform options for form checkboxes
export const PLATFORM_OPTIONS = [
  { id: "leadsite-ai",      label: "LeadSite.AI" },
  { id: "ultralead",         label: "UltraLead" },
  { id: "clientcontact-io",  label: "ClientContact.IO" },
  { id: "videosite-ai",      label: "VideoSite.AI" },
  { id: "leadsite-io",       label: "LeadSite.IO" },
];
