/**
 * Agent Registry
 * Central registry of all NEXUS agents with capabilities
 */

const AGENT_CAPABILITIES = {
  // Research & Intelligence
  'firecrawl': {
    id: 'firecrawl',
    name: 'Firecrawl Agent',
    tier: 'GREEN',
    capabilities: [
      'scrape_website',
      'extract_structured_data',
      'monitor_competitor_pricing',
      'research_company_info',
    ],
  },
  'perplexity': {
    id: 'perplexity',
    name: 'Perplexity Agent',
    tier: 'GREEN',
    capabilities: [
      'real_time_research',
      'market_intelligence',
      'competitor_analysis',
      'industry_trends',
    ],
  },
  'chatgpt': {
    id: 'chatgpt',
    name: 'ChatGPT Agent',
    tier: 'GREEN',
    capabilities: [
      'bulk_email_generation',
      'ab_test_variants',
      'content_summarization',
      'simple_classification',
    ],
  },

  // System Operations
  'lead-hunter': {
    id: 'lead-hunter',
    name: 'Lead Hunter',
    tier: 'GREEN',
    capabilities: [
      'monitor_lead_flow',
      'optimize_campaigns',
      'analyze_conversion_rates',
    ],
  },
  'copy-writer': {
    id: 'copy-writer',
    name: 'Copy Writer',
    tier: 'GREEN',
    capabilities: [
      'generate_emails',
      'personalization_scoring',
      'internal_reports',
    ],
  },
  'compliance-guardian': {
    id: 'compliance-guardian',
    name: 'Compliance Guardian',
    tier: 'GREEN',
    capabilities: [
      'validate_can_spam',
      'check_unsubscribe_links',
      'monitor_platform_compliance',
    ],
  },
  'warmup-conductor': {
    id: 'warmup-conductor',
    name: 'Warmup Conductor',
    tier: 'YELLOW',
    capabilities: [
      'monitor_warmup_status',
      'select_best_sender',
      'adjust_send_limits',
    ],
  },
  'engagement-analyzer': {
    id: 'engagement-analyzer',
    name: 'Engagement Analyzer',
    tier: 'GREEN',
    capabilities: [
      'track_email_engagement',
      'analyze_sentiment',
      'identify_buying_signals',
    ],
  },
  'analytics-brain': {
    id: 'analytics-brain',
    name: 'Analytics Brain',
    tier: 'GREEN',
    capabilities: [
      'revenue_forecasting',
      'pipeline_analysis',
      'business_intelligence',
    ],
  },
  'healing-sentinel': {
    id: 'healing-sentinel',
    name: 'Healing Sentinel',
    tier: 'YELLOW',
    capabilities: [
      'auto_fix_issues',
      'monitor_api_health',
      'database_optimization',
    ],
  },
};

/**
 * Find agent by capability
 */
function findAgentByCapability(capability) {
  for (const [id, agent] of Object.entries(AGENT_CAPABILITIES)) {
    if (agent.capabilities.includes(capability)) {
      return agent;
    }
  }
  return null;
}

/**
 * Check if agent can auto-execute
 */
function canAutoExecute(agentId) {
  const agent = AGENT_CAPABILITIES[agentId];
  if (!agent) return false;

  const autoTiers = (process.env.NEXUS_AUTO_EXECUTE_TIERS || 'GREEN,YELLOW').split(',');
  return autoTiers.includes(agent.tier);
}

/**
 * Get all agents by tier
 */
function getAgentsByTier(tier) {
  return Object.values(AGENT_CAPABILITIES).filter(a => a.tier === tier);
}

module.exports = {
  AGENT_CAPABILITIES,
  findAgentByCapability,
  canAutoExecute,
  getAgentsByTier,
};
