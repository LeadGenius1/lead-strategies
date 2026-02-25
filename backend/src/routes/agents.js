// AI Agents Control Routes - UltraLead
// Manage and monitor all 7 AI agents

const express = require('express');

const { authenticate } = require('../middleware/auth');
const agents = require('../services/ultraleadAgents');

const router = express.Router();
const { prisma } = require('../config/database');

// Agent definitions
const agentDefinitions = [
  {
    id: 'lead-hunter',
    name: 'Lead Hunter',
    icon: '🎯',
    description: 'Auto-discover prospects from Apollo.io',
    trigger: 'Daily cron + manual',
    capabilities: ['search_apollo', 'enrich_leads', 'score_prospects']
  },
  {
    id: 'copy-writer',
    name: 'Copy Writer',
    icon: '✍️',
    description: 'Generate personalized emails with AI',
    trigger: 'On campaign create',
    capabilities: ['generate_emails', 'create_sequences', 'optimize_subject']
  },
  {
    id: 'compliance-guardian',
    name: 'Compliance Guardian',
    icon: '⚖️',
    description: 'CAN-SPAM/GDPR compliance checks',
    trigger: 'Before email send',
    capabilities: ['check_compliance', 'validate_unsubscribe', 'audit_content']
  },
  {
    id: 'warmup-conductor',
    name: 'Warmup Conductor',
    icon: '🔥',
    description: 'Manage email domain reputation',
    trigger: 'Continuous',
    capabilities: ['monitor_reputation', 'schedule_warmup', 'track_deliverability']
  },
  {
    id: 'engagement-analyzer',
    name: 'Engagement Analyzer',
    icon: '📊',
    description: 'Track opens, clicks, replies',
    trigger: 'On webhook',
    capabilities: ['track_opens', 'analyze_engagement', 'predict_response']
  },
  {
    id: 'analytics-brain',
    name: 'Analytics Brain',
    icon: '🧠',
    description: 'Revenue forecasting & insights',
    trigger: 'On request',
    capabilities: ['forecast_revenue', 'analyze_pipeline', 'generate_insights']
  },
  {
    id: 'healing-sentinel',
    name: 'Healing Sentinel',
    icon: '🛡️',
    description: 'Self-healing automation',
    trigger: 'On error',
    capabilities: ['detect_errors', 'auto_retry', 'alert_issues']
  }
];

// In-memory agent status (in production, use Redis)
const agentStatuses = {};
const agentLogs = {};

// Initialize statuses
agentDefinitions.forEach(agent => {
  agentStatuses[agent.id] = {
    status: 'idle',
    lastRun: null,
    lastError: null,
    runsToday: 0
  };
  agentLogs[agent.id] = [];
});

// All routes require authentication
router.use(authenticate);

// GET /api/v1/agents - List all agents
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: agentDefinitions.map(agent => ({
      ...agent,
      ...agentStatuses[agent.id]
    }))
  });
});

// GET /api/v1/agents/status - Get all agent statuses
router.get('/status', (req, res) => {
  const statuses = agentDefinitions.map(agent => ({
    id: agent.id,
    name: agent.name,
    icon: agent.icon,
    ...agentStatuses[agent.id]
  }));

  res.json({ success: true, data: statuses });
});

// GET /api/v1/agents/:name - Get single agent details
router.get('/:name', (req, res) => {
  const agent = agentDefinitions.find(a => a.id === req.params.name);

  if (!agent) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }

  res.json({
    success: true,
    data: {
      ...agent,
      ...agentStatuses[agent.id],
      recentLogs: agentLogs[agent.id].slice(-20)
    }
  });
});

// POST /api/v1/agents/:name/run - Trigger agent manually
router.post('/:name/run', async (req, res) => {
  const agentDef = agentDefinitions.find(a => a.id === req.params.name);

  if (!agentDef) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }

  const agentId = req.params.name;

  // Check if already running
  if (agentStatuses[agentId].status === 'running') {
    return res.status(400).json({ success: false, error: 'Agent is already running' });
  }

  // Update status
  agentStatuses[agentId].status = 'running';
  agentStatuses[agentId].lastRun = new Date();

  // Add log entry
  addLog(agentId, 'info', `Agent started manually by user ${req.user.id}`);

  // Run agent async
  runAgent(agentId, req.user.id, req.body).catch(error => {
    agentStatuses[agentId].status = 'error';
    agentStatuses[agentId].lastError = error.message;
    addLog(agentId, 'error', `Agent failed: ${error.message}`);
  });

  res.json({
    success: true,
    message: `${agentDef.name} started`,
    data: { status: 'running' }
  });
});

// POST /api/v1/agents/:name/stop - Stop running agent
router.post('/:name/stop', async (req, res) => {
  const agentDef = agentDefinitions.find(a => a.id === req.params.name);

  if (!agentDef) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }

  const agentId = req.params.name;

  if (agentStatuses[agentId].status !== 'running') {
    return res.status(400).json({ success: false, error: 'Agent is not running' });
  }

  // Update status
  agentStatuses[agentId].status = 'stopped';
  addLog(agentId, 'info', `Agent stopped by user ${req.user.id}`);

  res.json({
    success: true,
    message: `${agentDef.name} stopped`,
    data: { status: 'stopped' }
  });
});

// GET /api/v1/agents/:name/logs - Get agent logs
router.get('/:name/logs', (req, res) => {
  const agentDef = agentDefinitions.find(a => a.id === req.params.name);

  if (!agentDef) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }

  const limit = parseInt(req.query.limit) || 100;
  const logs = agentLogs[req.params.name].slice(-limit);

  res.json({ success: true, data: logs });
});

// Helper: Add log entry
function addLog(agentId, level, message) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message
  };

  agentLogs[agentId].push(log);

  // Keep only last 1000 logs per agent
  if (agentLogs[agentId].length > 1000) {
    agentLogs[agentId] = agentLogs[agentId].slice(-1000);
  }
}

// Helper: Run agent
async function runAgent(agentId, userId, params = {}) {
  addLog(agentId, 'info', 'Starting agent execution...');

  try {
    let result;

    switch (agentId) {
      case 'lead-hunter':
        // Use Apollo service to find leads
        const apolloService = require('../services/apollo');
        result = await apolloService.searchPeople(params.query || '', params.filters || {});
        addLog(agentId, 'info', `Found ${result.people?.length || 0} prospects`);
        break;

      case 'copy-writer':
        // Generate email copy
        if (agents.CampaignAI) {
          result = await agents.CampaignAI.optimizeCampaign(params.campaignId, userId);
        }
        addLog(agentId, 'info', 'Email content generated');
        break;

      case 'compliance-guardian': {
        addLog(agentId, 'info', 'Checking compliance...');
        const emailBody = (params.emailBody || '').toLowerCase();
        const subject = params.subject || '';
        const issues = [];

        if (emailBody && !emailBody.includes('unsubscribe')) {
          issues.push('Missing unsubscribe link (CAN-SPAM required)');
        }
        if (emailBody && !/\d{5}/.test(emailBody)) {
          issues.push('Missing physical address with zip code (CAN-SPAM required)');
        }
        const spamWords = ['free', 'guaranteed', 'no risk', 'act now', 'limited time'];
        const foundSpam = spamWords.filter(w => emailBody.includes(w));
        if (foundSpam.length > 0) {
          issues.push(`Spam trigger words detected: ${foundSpam.join(', ')}`);
        }
        if (subject.length > 60) {
          issues.push(`Subject line too long (${subject.length} chars, max 60)`);
        }

        const score = Math.max(0, 100 - (issues.length * 25));
        result = { checked: true, score, issues };
        addLog(agentId, 'info', `Compliance check completed: score=${score}, issues=${issues.length}`);
        break;
      }

      case 'warmup-conductor':
        // Check warmup status
        const instantlyService = require('../services/instantly');
        result = await instantlyService.getWarmupStatus(params.email);
        addLog(agentId, 'info', `Warmup status: ${result.warmup?.status || 'unknown'}`);
        break;

      case 'engagement-analyzer':
        // Analyze engagement
        if (agents.AnalyticsAI) {
          result = await agents.AnalyticsAI.generateInsights(userId);
        }
        addLog(agentId, 'info', 'Engagement analysis complete');
        break;

      case 'analytics-brain':
        // Generate forecast
        if (agents.AnalyticsAI) {
          result = await agents.AnalyticsAI.generateInsights(userId);
        }
        addLog(agentId, 'info', 'Analytics generated');
        break;

      case 'healing-sentinel': {
        addLog(agentId, 'info', 'Running system health checks...');
        const issues = [];
        const autoFixed = [];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const staleLeads = await prisma.lead.count({
          where: { updatedAt: { lt: sevenDaysAgo } }
        });
        if (staleLeads > 0) {
          issues.push(`${staleLeads} stale leads with no activity in 7+ days`);
        }

        const bouncedEmails = await prisma.emailEvent.count({
          where: { eventType: 'bounced', createdAt: { gt: twentyFourHoursAgo } }
        });
        if (bouncedEmails > 0) {
          issues.push(`${bouncedEmails} bounced emails in last 24 hours`);
        }

        const errorAgents = Object.entries(agentStatuses)
          .filter(([, s]) => s.status === 'error')
          .map(([id]) => id);
        if (errorAgents.length > 0) {
          issues.push(`Agents in error state: ${errorAgents.join(', ')}`);
        }

        const healthy = issues.length === 0;
        result = { healthy, issues, autoFixed };
        addLog(agentId, 'info', `Health check completed: healthy=${healthy}, issues=${issues.length}`);
        break;
      }

      default:
        addLog(agentId, 'warn', 'Unknown agent type');
    }

    // Update status
    agentStatuses[agentId].status = 'completed';
    agentStatuses[agentId].runsToday++;
    addLog(agentId, 'info', 'Agent execution completed successfully');

    return result;
  } catch (error) {
    addLog(agentId, 'error', `Execution failed: ${error.message}`);
    throw error;
  }
}

module.exports = router;
