// NEXUS Function Registry
// Central registry of all 13 NEXUS functions
// Each function is lazy-loaded to avoid circular dependencies

const NEXUS_FUNCTIONS = [
  {
    id: 1,
    name: 'web_research',
    description: 'Real-time web research via Perplexity AI',
    agent: 'perplexity',
    parameters: { query: 'string', options: 'object' },
    getHandler: () => {
      const { research } = require('../services/perplexity-agent');
      return (params) => research(params.query, params.options);
    }
  },
  {
    id: 2,
    name: 'scrape_website',
    description: 'Scrape and extract data from websites via Firecrawl',
    agent: 'firecrawl',
    parameters: { url: 'string', options: 'object' },
    getHandler: () => {
      const { scrapePage } = require('../services/firecrawl-agent');
      return (params) => scrapePage(params.url, params.options);
    }
  },
  {
    id: 3,
    name: 'market_analysis',
    description: 'AI-powered market analysis and intelligence',
    agent: 'perplexity',
    parameters: { topic: 'string', timeframe: 'string' },
    getHandler: () => {
      const { getMarketIntelligence } = require('../services/perplexity-agent');
      return (params) => getMarketIntelligence(params.topic, params.timeframe);
    }
  },
  {
    id: 4,
    name: 'competitor_analysis',
    description: 'Analyze competitor strategy, pricing, and positioning',
    agent: 'perplexity',
    parameters: { name: 'string', aspects: 'string[]' },
    getHandler: () => {
      const { analyzeCompetitor } = require('../services/perplexity-agent');
      return (params) => analyzeCompetitor(params.name, params.aspects);
    }
  },
  {
    id: 5,
    name: 'generate_email',
    description: 'Generate personalized email content via ChatGPT',
    agent: 'chatgpt',
    parameters: { recipient: 'object', context: 'object', options: 'object' },
    getHandler: () => {
      const { generateEmail } = require('../services/chatgpt-agent');
      return (params) => generateEmail(params.recipient, params.context, params.options);
    }
  },
  {
    id: 6,
    name: 'get_campaigns',
    description: 'List email campaigns from Instantly.ai',
    agent: 'instantly',
    parameters: { limit: 'number', status: 'string' },
    getHandler: () => {
      const instantlyService = require('../services/instantly');
      return (params) => instantlyService.getCampaigns(params);
    }
  },
  {
    id: 7,
    name: 'add_leads_to_campaign',
    description: 'Add leads to an Instantly.ai campaign',
    agent: 'instantly',
    parameters: { campaignId: 'string', leads: 'object[]' },
    getHandler: () => {
      const instantlyService = require('../services/instantly');
      return (params) => instantlyService.addLeadsBatch(params.campaignId, params.leads);
    }
  },
  {
    id: 8,
    name: 'launch_campaign',
    description: 'Launch an Instantly.ai email campaign',
    agent: 'instantly',
    parameters: { campaignId: 'string' },
    getHandler: () => {
      const instantlyService = require('../services/instantly');
      return (params) => instantlyService.launchCampaign(params.campaignId);
    }
  },
  {
    id: 9,
    name: 'compliance_check',
    description: 'Validate email compliance for CAN-SPAM, GDPR, and domain reputation',
    agent: 'compliance-guardian',
    parameters: { action: 'string', payload: 'object' },
    getHandler: () => {
      const { complianceCheck } = require('./functions/compliance-guardian');
      return complianceCheck;
    }
  },
  {
    id: 10,
    name: 'system_health_check',
    description: 'Monitor system health across database, Redis, APIs, and storage',
    agent: 'healing-sentinel',
    parameters: { action: 'string' },
    getHandler: () => {
      const { systemHealthCheck } = require('./functions/healing-sentinel');
      return systemHealthCheck;
    }
  },
  {
    id: 11,
    name: 'warmup_status',
    description: 'Monitor and manage email account warmup health via Instantly.ai',
    agent: 'warmup-conductor',
    parameters: { action: 'string', emailAccount: 'string', dailyTarget: 'number' },
    getHandler: () => {
      const { warmupStatus } = require('./functions/warmup-conductor');
      return warmupStatus;
    }
  },
  {
    id: 12,
    name: 'hunt_leads',
    description: 'Search Apollo.io for leads matching ICP and save to database',
    agent: 'lead-hunter',
    parameters: { jobTitles: 'string[]', industries: 'string[]', employeeRange: 'number[]', locations: 'string[]', limit: 'number' },
    getHandler: () => {
      const { huntLeads } = require('./functions/lead-hunter');
      return huntLeads;
    }
  },
  {
    id: 13,
    name: 'sms_control',
    description: 'Programmatic SMS campaign management via Twilio',
    agent: 'sms-controller',
    parameters: { action: 'string', to: 'string', recipients: 'string[]', message: 'string', campaignId: 'string', name: 'string' },
    getHandler: () => {
      const { smsControl } = require('./functions/sms-controller');
      return smsControl;
    }
  }
];

/**
 * Get a function definition by name
 */
function getFunction(name) {
  return NEXUS_FUNCTIONS.find(f => f.name === name) || null;
}

/**
 * Get a function handler by name (lazy-loaded)
 */
function getFunctionHandler(name) {
  const fn = getFunction(name);
  if (!fn) return null;

  try {
    return fn.getHandler();
  } catch (error) {
    console.error(`[NEXUS Registry] Failed to load handler for ${name}:`, error.message);
    return null;
  }
}

/**
 * Execute a NEXUS function by name
 */
async function executeFunction(name, params) {
  const handler = getFunctionHandler(name);
  if (!handler) {
    return { success: false, error: `Unknown NEXUS function: ${name}` };
  }

  try {
    return await handler(params);
  } catch (error) {
    console.error(`[NEXUS Registry] Error executing ${name}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * List all registered functions (without handlers for serialization)
 */
function listFunctions() {
  return NEXUS_FUNCTIONS.map(({ getHandler, ...rest }) => rest);
}

module.exports = {
  NEXUS_FUNCTIONS,
  getFunction,
  getFunctionHandler,
  executeFunction,
  listFunctions
};
