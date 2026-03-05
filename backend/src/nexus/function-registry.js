// NEXUS Function Registry
// Central registry of all 28 NEXUS functions
// Each function is lazy-loaded to avoid circular dependencies

const NEXUS_FUNCTIONS = [
  // ==================== CORE INTELLIGENCE (#1-#4) ====================
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

  // ==================== EMAIL (#5-#8) ====================
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

  // ==================== COMPLIANCE (#9) ====================
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

  // ==================== INFRASTRUCTURE (#10-#11) ====================
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

  // ==================== LEAD GENERATION (#12) ====================
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

  // ==================== SMS (#13) ====================
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
  },

  // ==================== PLATFORM: LeadSite.IO (#14-#16) ====================
  {
    id: 14,
    name: 'get_websites',
    description: 'List all websites for a user (LeadSite.IO)',
    agent: 'platform',
    parameters: { userId: 'string' },
    getHandler: () => {
      const { getWebsites } = require('./functions/platform-functions');
      return getWebsites;
    }
  },
  {
    id: 15,
    name: 'create_website',
    description: 'Create a new website (LeadSite.IO)',
    agent: 'platform',
    parameters: { name: 'string', template: 'string', userId: 'string' },
    getHandler: () => {
      const { createWebsite } = require('./functions/platform-functions');
      return createWebsite;
    }
  },
  {
    id: 16,
    name: 'update_website',
    description: 'Update a website properties (LeadSite.IO)',
    agent: 'platform',
    parameters: { websiteId: 'string', changes: 'object' },
    getHandler: () => {
      const { updateWebsite } = require('./functions/platform-functions');
      return updateWebsite;
    }
  },

  // ==================== PLATFORM: ClientContact.IO (#17-#19) ====================
  {
    id: 17,
    name: 'get_inbox_messages',
    description: 'Get conversations from unified inbox (ClientContact.IO)',
    agent: 'platform',
    parameters: { userId: 'string', limit: 'number' },
    getHandler: () => {
      const { getInboxMessages } = require('./functions/platform-functions');
      return getInboxMessages;
    }
  },
  {
    id: 18,
    name: 'send_sms',
    description: 'Send an SMS message via Twilio (ClientContact.IO)',
    agent: 'platform',
    parameters: { to: 'string', message: 'string' },
    getHandler: () => {
      const { sendSmsWrapper } = require('./functions/platform-functions');
      return sendSmsWrapper;
    }
  },
  {
    id: 19,
    name: 'get_contacts',
    description: 'Get CRM contacts with optional filters (ClientContact.IO)',
    agent: 'platform',
    parameters: { userId: 'string', filter: 'object' },
    getHandler: () => {
      const { getContacts } = require('./functions/platform-functions');
      return getContacts;
    }
  },

  // ==================== PLATFORM: VideoSite.AI (#20-#22) ====================
  {
    id: 20,
    name: 'get_videos',
    description: 'Get all videos for a user (VideoSite.AI)',
    agent: 'platform',
    parameters: { userId: 'string' },
    getHandler: () => {
      const { getVideos } = require('./functions/platform-functions');
      return getVideos;
    }
  },
  {
    id: 21,
    name: 'get_video_analytics',
    description: 'Get analytics for a specific video (VideoSite.AI)',
    agent: 'platform',
    parameters: { videoId: 'string' },
    getHandler: () => {
      const { getVideoAnalytics } = require('./functions/platform-functions');
      return getVideoAnalytics;
    }
  },
  {
    id: 22,
    name: 'upload_video_url',
    description: 'Create a video entry from URL (VideoSite.AI)',
    agent: 'platform',
    parameters: { title: 'string', url: 'string', userId: 'string' },
    getHandler: () => {
      const { uploadVideoUrl } = require('./functions/platform-functions');
      return uploadVideoUrl;
    }
  },

  // ==================== PLATFORM: UltraLead.AI (#23-#25) ====================
  {
    id: 23,
    name: 'get_pipeline',
    description: 'Get sales pipeline deals grouped by stage (UltraLead.AI)',
    agent: 'platform',
    parameters: { userId: 'string' },
    getHandler: () => {
      const { getPipeline } = require('./functions/platform-functions');
      return getPipeline;
    }
  },
  {
    id: 24,
    name: 'create_deal',
    description: 'Create a new deal in the sales pipeline (UltraLead.AI)',
    agent: 'platform',
    parameters: { name: 'string', value: 'number', stage: 'string', contactId: 'string', userId: 'string' },
    getHandler: () => {
      const { createDeal } = require('./functions/platform-functions');
      return createDeal;
    }
  },
  {
    id: 25,
    name: 'get_transcriptions',
    description: 'Get call transcriptions with AI analysis (UltraLead.AI)',
    agent: 'platform',
    parameters: { userId: 'string', limit: 'number' },
    getHandler: () => {
      const { getTranscriptions } = require('./functions/platform-functions');
      return getTranscriptions;
    }
  },

  // ==================== ADVANCED AGENTS (#26-#28) ====================
  {
    id: 26,
    name: 'sentiment_analysis',
    description: 'Classify email reply sentiment and suggest next action via Claude AI',
    agent: 'engagement-analyzer',
    parameters: { replyText: 'string' },
    getHandler: () => {
      const { sentimentAnalysis } = require('./functions/advanced-agents');
      return sentimentAnalysis;
    }
  },
  {
    id: 27,
    name: 'revenue_forecast',
    description: 'Project revenue from pipeline data with best/worst/expected scenarios',
    agent: 'analytics-brain',
    parameters: { leadsInPipeline: 'number', avgDealValue: 'number', conversionRate: 'number', timeframeDays: 'number' },
    getHandler: () => {
      const { revenueForecast } = require('./functions/advanced-agents');
      return revenueForecast;
    }
  },
  {
    id: 28,
    name: 'auto_heal',
    description: 'Analyze failed email sends, classify errors, and retry transient failures',
    agent: 'healing-sentinel',
    parameters: { failedSendLog: 'object[]' },
    getHandler: () => {
      const { autoHeal } = require('./functions/advanced-agents');
      return autoHeal;
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

/**
 * Get live system status from database
 */
async function getSystemStatus() {
  try {
    const { prisma } = require('../config/database');
    const [users, leads, campaigns, websites] = await Promise.all([
      prisma.user.count(),
      prisma.lead.count(),
      prisma.campaign.count(),
      prisma.website.count()
    ]);
    return { users, leads, campaigns, websites };
  } catch (error) {
    return { users: 0, leads: 0, campaigns: 0, websites: 0, error: error.message };
  }
}

const NEXUS_REGISTRY_SUMMARY = {
  totalFunctions: 28,
  lastUpdated: '2026-03-05',
  categories: {
    intelligence: [1, 2, 3, 4],
    email: [5, 6, 7, 8],
    compliance: [9],
    infrastructure: [10, 11],
    leadGeneration: [12],
    sms: [13],
    platformLeadSiteIO: [14, 15, 16],
    platformClientContact: [17, 18, 19],
    platformVideoSite: [20, 21, 22],
    platformUltraLead: [23, 24, 25],
    advancedAgents: [26, 27, 28]
  }
};

module.exports = {
  NEXUS_FUNCTIONS,
  NEXUS_REGISTRY_SUMMARY,
  getFunction,
  getFunctionHandler,
  executeFunction,
  listFunctions,
  getSystemStatus
};
