// System Agents - 7 AI Agents for Lead Generation Platform

// Shared compliance check — single source of truth for rule-based checks
function checkCompliance(emailBody, subject) {
  const body = (emailBody || '').toLowerCase();
  const issues = [];

  if (body && !body.includes('unsubscribe')) {
    issues.push('Missing unsubscribe link (CAN-SPAM required)');
  }
  if (body && !/\d{5}/.test(body)) {
    issues.push('Missing physical address with zip code (CAN-SPAM required)');
  }
  const spamWords = ['free', 'guaranteed', 'no risk', 'act now', 'limited time'];
  const foundSpam = spamWords.filter(w => body.includes(w));
  if (foundSpam.length > 0) {
    issues.push(`Spam trigger words detected: ${foundSpam.join(', ')}`);
  }
  if (subject && subject.length > 60) {
    issues.push(`Subject line too long (${subject.length} chars, max 60)`);
  }

  const score = Math.max(0, 100 - (issues.length * 25));
  return { checked: true, score, issues };
}

class BaseAgent {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.status = 'idle';
    this.lastRun = null;
    this.logs = [];
  }

  log(message) {
    const entry = { timestamp: new Date().toISOString(), message };
    this.logs.push(entry);
    if (this.logs.length > 100) this.logs.shift();
    console.log(`[${this.name}] ${message}`);
  }

  async run() {
    this.status = 'running';
    this.log('Agent started');
    this.lastRun = new Date();
  }

  stop() {
    this.status = 'idle';
    this.log('Agent stopped');
  }

  getStatus() {
    return {
      name: this.name,
      description: this.description,
      status: this.status,
      lastRun: this.lastRun,
      logsCount: this.logs.length
    };
  }
}

// Agent 1: Lead Hunter - Finds and qualifies leads
class LeadHunterAgent extends BaseAgent {
  constructor() {
    super('Lead Hunter', 'Finds and qualifies leads using Apollo.io data');
  }

  async run(params = {}) {
    await super.run();
    try {
      this.log(`Searching for leads with criteria: ${JSON.stringify(params)}`);
      const apolloService = require('./services/apollo');
      const result = await apolloService.searchPeople(params.query || '', params.filters || {});
      this.log(`Lead search completed: found ${result.people?.length || 0} prospects`);
      this.status = 'completed';
      return result;
    } catch (error) {
      this.log(`Lead search failed: ${error.message}`);
      this.status = 'error';
      return { found: 0, qualified: 0, error: error.message };
    }
  }
}

// Agent 2: Copy Writer - Generates email copy
class CopyWriterAgent extends BaseAgent {
  constructor() {
    super('Copy Writer', 'Generates personalized email sequences using AI');
  }

  async run(params = {}) {
    await super.run();
    try {
      this.log(`Generating copy for campaign: ${params.campaignId || 'new'}`);
      const { CampaignAI } = require('./services/ultraleadAgents');
      const result = await CampaignAI.optimizeCampaign(params.campaignId, params.userId);
      this.log('Copy generation completed');
      this.status = 'completed';
      return result || { generated: 0 };
    } catch (error) {
      this.log(`Copy generation failed: ${error.message}`);
      this.status = 'error';
      return { generated: 0, error: error.message };
    }
  }
}

// Agent 3: Compliance Guardian - Ensures email compliance
class ComplianceGuardianAgent extends BaseAgent {
  constructor() {
    super('Compliance Guardian', 'Monitors and ensures email compliance with regulations');
  }

  async run(params = {}) {
    await super.run();
    this.log('Running compliance checks');
    const result = checkCompliance(params.emailBody, params.subject);
    this.log(`Compliance check completed: score=${result.score}, issues=${result.issues.length}`);
    this.status = 'completed';
    return result;
  }
}

// Agent 4: Warmup Conductor - Manages email warmup
class WarmupConductorAgent extends BaseAgent {
  constructor() {
    super('Warmup Conductor', 'Orchestrates email account warmup for deliverability');
  }

  async run(params = {}) {
    await super.run();
    try {
      this.log('Managing email warmup schedules');
      const instantlyService = require('./services/instantly');
      const result = await instantlyService.getWarmupStatus(params.email);
      this.log(`Warmup status: ${result.warmup?.status || 'unknown'}`);
      this.status = 'completed';
      return result;
    } catch (error) {
      this.log(`Warmup check failed: ${error.message}`);
      this.status = 'error';
      return { accounts: 0, emails_sent: 0, error: error.message };
    }
  }
}

// Agent 5: Engagement Analyzer - Analyzes responses
class EngagementAnalyzerAgent extends BaseAgent {
  constructor() {
    super('Engagement Analyzer', 'Analyzes email engagement and categorizes responses');
  }

  async run(params = {}) {
    await super.run();
    try {
      this.log('Analyzing engagement metrics');
      const { AnalyticsAI } = require('./services/ultraleadAgents');
      const result = await AnalyticsAI.generateInsights(params.userId);
      this.log('Engagement analysis completed');
      this.status = 'completed';
      return result || { analyzed: 0, positive: 0, negative: 0 };
    } catch (error) {
      this.log(`Engagement analysis failed: ${error.message}`);
      this.status = 'error';
      return { analyzed: 0, positive: 0, negative: 0, error: error.message };
    }
  }
}

// Agent 6: Analytics Brain - Provides insights
class AnalyticsBrainAgent extends BaseAgent {
  constructor() {
    super('Analytics Brain', 'Generates insights and recommendations from campaign data');
  }

  async run(params = {}) {
    await super.run();
    try {
      this.log('Processing analytics data');
      const { AnalyticsAI } = require('./services/ultraleadAgents');
      const result = await AnalyticsAI.generateInsights(params.userId);
      this.log('Analytics processing completed');
      this.status = 'completed';
      return result || { insights: [], recommendations: [] };
    } catch (error) {
      this.log(`Analytics processing failed: ${error.message}`);
      this.status = 'error';
      return { insights: [], recommendations: [], error: error.message };
    }
  }
}

// Agent 7: Healing Sentinel - Self-healing system
class HealingSentinelAgent extends BaseAgent {
  constructor() {
    super('Healing Sentinel', 'Monitors system health and auto-fixes issues');
  }

  async run(params = {}) {
    await super.run();
    try {
      this.log('Running system health checks');
      const { prisma } = require('./config/database');
      const issues = [];
      const autoFixed = [];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const staleLeads = await prisma.lead.count({ where: { updatedAt: { lt: sevenDaysAgo } } });
      if (staleLeads > 0) issues.push(`${staleLeads} stale leads with no activity in 7+ days`);

      const bouncedEmails = await prisma.emailEvent.count({ where: { eventType: 'bounced', createdAt: { gt: twentyFourHoursAgo } } });
      if (bouncedEmails > 0) issues.push(`${bouncedEmails} bounced emails in last 24 hours`);

      const healthy = issues.length === 0;
      this.log(`Health check completed: healthy=${healthy}, issues=${issues.length}`);
      this.status = 'completed';
      return { healthy, issues, autoFixed };
    } catch (error) {
      this.log(`Health check failed: ${error.message}`);
      this.status = 'error';
      return { healthy: false, issues: [error.message], autoFixed: [] };
    }
  }
}

// Initialize all agents
const agents = {
  leadHunter: new LeadHunterAgent(),
  copyWriter: new CopyWriterAgent(),
  complianceGuardian: new ComplianceGuardianAgent(),
  warmupConductor: new WarmupConductorAgent(),
  engagementAnalyzer: new EngagementAnalyzerAgent(),
  analyticsBrain: new AnalyticsBrainAgent(),
  healingSentinel: new HealingSentinelAgent()
};

// Get all agent statuses
const getAllAgentStatuses = () => {
  return Object.entries(agents).map(([key, agent]) => ({
    id: key,
    ...agent.getStatus()
  }));
};

// Get specific agent
const getAgent = (agentId) => {
  return agents[agentId] || null;
};

// Run specific agent
const runAgent = async (agentId, params = {}) => {
  const agent = agents[agentId];
  if (!agent) throw new Error(`Agent ${agentId} not found`);
  return await agent.run(params);
};

// Stop specific agent
const stopAgent = (agentId) => {
  const agent = agents[agentId];
  if (!agent) throw new Error(`Agent ${agentId} not found`);
  agent.stop();
  return agent.getStatus();
};

// Get agent logs
const getAgentLogs = (agentId, limit = 50) => {
  const agent = agents[agentId];
  if (!agent) throw new Error(`Agent ${agentId} not found`);
  return agent.logs.slice(-limit);
};

// Start all agents
const startAgents = async () => {
  console.log('[System Agents] Starting all agents...');
  for (const [key, agent] of Object.entries(agents)) {
    agent.status = 'idle';
    console.log(`[System Agents] ${agent.name} ready`);
  }
  console.log('[System Agents] All agents initialized');
};

// Get system status
const getSystem = () => {
  return {
    agents: getAllAgentStatuses(),
    healthy: true,
    uptime: process.uptime()
  };
};

module.exports = {
  agents,
  getAllAgentStatuses,
  getAgent,
  runAgent,
  stopAgent,
  getAgentLogs,
  startAgents,
  getSystem,
  checkCompliance
};
