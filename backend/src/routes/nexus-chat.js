const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { prisma } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const { FirecrawlAgent } = require('../services/firecrawl-agent');
const { PerplexityAgent } = require('../services/perplexity-agent');
const { ChatGPTAgent } = require('../services/chatgpt-agent');
const instantlyService = require('../services/instantly');

// Lazy-initialized agent instances
let firecrawlAgent = null;
let perplexityAgent = null;
let chatgptAgent = null;

function getFirecrawlAgent() {
  if (!firecrawlAgent) firecrawlAgent = new FirecrawlAgent();
  return firecrawlAgent;
}
function getPerplexityAgent() {
  if (!perplexityAgent) perplexityAgent = new PerplexityAgent();
  return perplexityAgent;
}
function getChatGPTAgent() {
  if (!chatgptAgent) chatgptAgent = new ChatGPTAgent();
  return chatgptAgent;
}

// Lazy-initialize Anthropic client
function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY;
  if (!key) return null;
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    return new Anthropic({ apiKey: key });
  } catch (error) {
    console.error('Failed to create Anthropic client:', error.message);
    return null;
  }
}

// Gather live system context for the AI
async function getSystemContext() {
  const liveStatus = { timestamp: new Date().toISOString(), uptime_seconds: Math.round(process.uptime()) };

  // Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    liveStatus.database = 'healthy — connected';
  } catch (err) {
    liveStatus.database = `DOWN — ${err.message}`;
  }

  // Redis
  try {
    const Redis = require('ioredis');
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL;
    if (redisUrl) {
      const redis = new Redis(redisUrl, { connectTimeout: 3000, lazyConnect: true });
      await redis.connect();
      await redis.ping();
      liveStatus.redis = 'healthy — connected';
      await redis.quit();
    } else {
      liveStatus.redis = 'not configured';
    }
  } catch (err) {
    liveStatus.redis = `DOWN — ${err.message}`;
  }

  // Config checks
  liveStatus.stripe = process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured';
  liveStatus.r2_storage = (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_R2_ACCESS_KEY) ? 'configured' : 'not configured';
  liveStatus.anthropic = (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY) ? 'configured' : 'not configured';
  liveStatus.mailgun = process.env.MAILGUN_API_KEY ? 'configured' : 'not configured';

  // Memory
  const heapMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  liveStatus.memory = `${heapMB}MB heap used${heapMB > 400 ? ' — HIGH' : ''}`;

  // NEXUS Blueprint modules
  let nexusModules = [];
  let pendingRecommendations = [];
  try {
    nexusModules = await prisma.nexusModule.findMany({
      include: { updates: { orderBy: { createdAt: 'desc' }, take: 3 } },
      orderBy: { moduleNumber: 'asc' }
    });
    pendingRecommendations = await prisma.nexusRecommendation.findMany({
      where: { status: 'PENDING' },
      orderBy: { priority: 'desc' },
      take: 10
    });
  } catch (err) {
    console.warn('NEXUS Blueprint queries failed:', err.message);
  }

  // Platform metrics
  let userCount = 0, websiteCount = 0, campaignCount = 0, leadCount = 0;
  try {
    [userCount, websiteCount, campaignCount, leadCount] = await Promise.all([
      prisma.user.count(),
      prisma.website.count(),
      prisma.campaign.count(),
      prisma.lead.count(),
    ]);
  } catch (err) {
    console.warn('Metrics queries failed:', err.message);
  }

  return {
    liveStatus,
    nexusModules,
    pendingRecommendations,
    nexusSummary: {
      total: nexusModules.length,
      completed: nexusModules.filter(m => m.status === 'COMPLETED').length,
      inProgress: nexusModules.filter(m => m.status === 'IN_PROGRESS').length,
      avgProgress: nexusModules.length > 0 ? Math.round(nexusModules.reduce((s, m) => s + m.progress, 0) / nexusModules.length) : 0,
    },
    metrics: { users: userCount, websites: websiteCount, campaigns: campaignCount, leads: leadCount },
  };
}

// Build the NEXUS system prompt with live data
function buildSystemPrompt(ctx) {
  return `You are NEXUS, the autonomous AI operations assistant for AI Lead Strategies LLC.
You report directly to Michael (the owner). Be data-driven, proactive, and action-oriented.

## YOUR IDENTITY
- You are NEXUS — the central intelligence hub coordinating 7 AI agents
- You have FULL knowledge of the business, all 5 platforms, and all infrastructure
- You NEVER say "I don't have access" — you have live system data below
- When asked about status, report the LIVE data with the exact timestamp

## CURRENT SYSTEM STATUS (LIVE — ${ctx.liveStatus.timestamp})
- Backend: running (uptime ${Math.round(ctx.liveStatus.uptime_seconds / 60)} minutes)
- Database: ${ctx.liveStatus.database}
- Redis: ${ctx.liveStatus.redis}
- Stripe: ${ctx.liveStatus.stripe}
- R2 Storage: ${ctx.liveStatus.r2_storage}
- Anthropic AI: ${ctx.liveStatus.anthropic}
- Mailgun: ${ctx.liveStatus.mailgun}
- Memory: ${ctx.liveStatus.memory}

## PLATFORM METRICS
- Total Users: ${ctx.metrics.users}
- Total Websites: ${ctx.metrics.websites}
- Total Campaigns: ${ctx.metrics.campaigns}
- Total Leads: ${ctx.metrics.leads}

## THE 5 PLATFORMS
1. LeadSite.AI (leadsiteai.com) — Email lead generation — $49/$149/$349/mo
2. LeadSite.IO (leadsiteio.com) — AI website builder — $49/$149/$349/mo
3. ClientContact.IO (clientcontactio.com) — Unified inbox, 22+ channels — $99/$149/$399/mo
4. VideoSite.AI (videositeai.com) — Video monetization — FREE
5. UltraLead.AI (ultraleadai.com) — All-in-One CRM + all platforms — $499/mo

## 7 AI AGENTS
1. Lead Hunter — Apollo.io 275M+ database, ICP-matched prospecting
2. Copy Writer — Claude AI per-lead personalized emails
3. Compliance Guardian — CAN-SPAM/GDPR/CASL enforcement
4. Warmup Conductor — Domain reputation via Instantly.ai
5. Engagement Analyzer — Opens/clicks/reply sentiment analysis
6. Analytics Brain — Revenue forecasting, pipeline health
7. Healing Sentinel — Auto-fix failed sends, API health monitoring

## INFRASTRUCTURE
- Frontend: Next.js 14 on Railway (aileadstrategies.com)
- Backend: Express.js on Railway (api.aileadstrategies.com)
- Database: PostgreSQL via Prisma ORM
- Storage: Cloudflare R2
- Email: Mailgun (SPF/DKIM/DMARC verified) + Instantly.ai (4 accounts, 120 emails/day)
- Payments: Stripe
- Cache: Redis on Railway

## NEXUS BLUEPRINT — STRATEGIC ROADMAP
${JSON.stringify(ctx.nexusModules.map(m => ({
  module: m.moduleNumber,
  title: m.title,
  status: m.status,
  progress: m.progress + '%',
  priority: m.priority,
  currentState: m.currentState,
  targetState: m.targetState,
  recentUpdates: (m.updates || []).map(u => u.content),
})), null, 2)}

Summary: ${ctx.nexusSummary.total} modules, ${ctx.nexusSummary.completed} completed, ${ctx.nexusSummary.inProgress} in progress, avg ${ctx.nexusSummary.avgProgress}% progress
Pending AI Recommendations: ${ctx.pendingRecommendations.length}

## RESPONSE STYLE
- Lead with data and current state
- Provide numbered recommendations with specific actions
- Reference actual platform names, pricing, metrics from context above
- Coordinate AI agents when relevant
- Use concrete numbers from the live data
- End with a clear RECOMMENDED NEXT ACTION when appropriate
- For system status requests: show ALL live service statuses with the timestamp`;
}

// Tools available to NEXUS via Anthropic tool_use
const nexusTools = [
  {
    name: 'web_research',
    description: 'Research a topic using real-time web data with citations',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Research query' }
      },
      required: ['query']
    }
  },
  {
    name: 'scrape_website',
    description: 'Scrape and extract content from a specific URL',
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Full URL to scrape' }
      },
      required: ['url']
    }
  },
  {
    name: 'market_analysis',
    description: 'Get market intelligence and industry analysis on a topic',
    input_schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Market or industry topic' }
      },
      required: ['topic']
    }
  },
  {
    name: 'competitor_analysis',
    description: 'Scrape competitor website for pricing and features',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Competitor name' },
        url: { type: 'string', description: 'Competitor URL' }
      },
      required: ['name', 'url']
    }
  },
  {
    name: 'generate_email',
    description: 'Generate a personalized outreach email using AI',
    input_schema: {
      type: 'object',
      properties: {
        recipient: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            company: { type: 'string' },
            title: { type: 'string' }
          },
          required: ['name', 'company']
        },
        context: {
          type: 'object',
          properties: {
            objective: { type: 'string' },
            keyPoints: { type: 'array', items: { type: 'string' } }
          },
          required: ['objective']
        }
      },
      required: ['recipient', 'context']
    }
  },
  {
    name: 'get_campaigns',
    description: 'Get all Instantly.ai email campaigns and their status',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by status: active, paused, completed' }
      }
    }
  },
  {
    name: 'add_leads_to_campaign',
    description: 'Add leads to an Instantly.ai campaign for email outreach',
    input_schema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string', description: 'Campaign ID' },
        leads: {
          type: 'array',
          description: 'Array of leads to add',
          items: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              company: { type: 'string' }
            },
            required: ['email']
          }
        }
      },
      required: ['campaignId', 'leads']
    }
  },
  {
    name: 'launch_campaign',
    description: 'Launch or pause an Instantly.ai email campaign',
    input_schema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string', description: 'Campaign ID' },
        action: { type: 'string', enum: ['launch', 'pause'], description: 'Action to take' }
      },
      required: ['campaignId', 'action']
    }
  },
  {
    name: 'get_campaign_analytics',
    description: 'Get performance metrics for an email campaign',
    input_schema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string', description: 'Campaign ID' }
      },
      required: ['campaignId']
    }
  }
];

// Execute a tool call from Claude
async function executeTool(toolName, toolInput) {
  try {
    switch (toolName) {
      case 'web_research':
        return await getPerplexityAgent().research(toolInput.query);
      case 'scrape_website':
        return await getFirecrawlAgent().scrapePage(toolInput.url);
      case 'market_analysis':
        return await getPerplexityAgent().getMarketIntelligence(toolInput.topic);
      case 'competitor_analysis':
        return await getFirecrawlAgent().scrapeCompetitorPricing(toolInput.name, toolInput.url);
      case 'generate_email':
        return await getChatGPTAgent().generateEmail(toolInput.recipient, toolInput.context);
      case 'get_campaigns':
        return await instantlyService.getCampaigns({ status: toolInput.status });
      case 'add_leads_to_campaign':
        return await instantlyService.addLeadsBatch(toolInput.campaignId, toolInput.leads);
      case 'launch_campaign':
        if (toolInput.action === 'launch') {
          return await instantlyService.launchCampaign(toolInput.campaignId);
        } else {
          return await instantlyService.pauseCampaign(toolInput.campaignId);
        }
      case 'get_campaign_analytics':
        return await instantlyService.getCampaignAnalytics(toolInput.campaignId);
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    return { error: `Tool execution failed: ${error.message}` };
  }
}

/**
 * POST /api/v1/nexus/chat
 * Process NEXUS conversation message via Claude AI
 */
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const userId = req.user.userId || req.user.id;

    // Get live system context
    const ctx = await getSystemContext();

    // Build system prompt with real data
    const systemPrompt = buildSystemPrompt(ctx);

    // Load conversation history from DB for context
    let conversationHistory = [];
    let currentSessionId = sessionId;
    try {
      if (sessionId) {
        const history = await prisma.conversationHistory.findMany({
          where: { userId: String(userId), sessionId },
          orderBy: { timestamp: 'asc' },
          take: 20,
          select: { role: true, content: true },
        });
        conversationHistory = history
          .filter(h => h.role === 'user' || h.role === 'assistant')
          .map(h => ({ role: h.role, content: h.content }));
      }
      if (!currentSessionId) {
        currentSessionId = require('crypto').randomUUID();
      }
    } catch (err) {
      console.warn('Failed to load conversation history:', err.message);
      if (!currentSessionId) currentSessionId = require('crypto').randomUUID();
    }

    // Add current message
    conversationHistory.push({ role: 'user', content: message });

    // Call Anthropic
    const anthropic = getAnthropicClient();
    if (!anthropic) {
      return res.status(503).json({ error: 'AI service not configured (ANTHROPIC_API_KEY missing)' });
    }

    console.log(`🤖 NEXUS chat: calling Claude for user ${userId}...`);
    let chatMessage = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: conversationHistory,
      tools: nexusTools,
    });

    // Tool-use loop: if Claude wants to call tools, execute them and continue
    const MAX_TOOL_ROUNDS = 5;
    let toolRound = 0;
    while (chatMessage.stop_reason === 'tool_use' && toolRound < MAX_TOOL_ROUNDS) {
      toolRound++;
      console.log(`🔧 NEXUS tool round ${toolRound}: Claude requested tool calls`);

      // Collect all tool_use blocks from the response
      const toolUseBlocks = chatMessage.content.filter(b => b.type === 'tool_use');
      const toolResults = [];

      for (const toolBlock of toolUseBlocks) {
        console.log(`  → Executing tool: ${toolBlock.name}`, JSON.stringify(toolBlock.input).substring(0, 200));
        const result = await executeTool(toolBlock.name, toolBlock.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolBlock.id,
          content: JSON.stringify(result).substring(0, 10000), // Cap tool result size
        });
      }

      // Add assistant response + tool results to conversation, then call Claude again
      conversationHistory.push({ role: 'assistant', content: chatMessage.content });
      conversationHistory.push({ role: 'user', content: toolResults });

      chatMessage = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: conversationHistory,
        tools: nexusTools,
      });
    }

    // Extract final text response
    const textBlock = chatMessage.content.find(b => b.type === 'text');
    const responseText = textBlock ? textBlock.text : 'No response generated.';
    console.log(`✅ NEXUS response received (${toolRound} tool round${toolRound !== 1 ? 's' : ''})`);

    // Save conversation to DB
    try {
      await prisma.conversationHistory.createMany({
        data: [
          {
            userId: String(userId),
            sessionId: currentSessionId,
            role: 'user',
            content: message,
            agentName: 'NEXUS',
          },
          {
            userId: String(userId),
            sessionId: currentSessionId,
            role: 'assistant',
            content: responseText,
            agentName: 'NEXUS',
          },
        ],
      });
    } catch (err) {
      console.warn('Failed to save conversation history:', err.message);
    }

    return res.json({
      success: true,
      response: responseText,
      history: conversationHistory,
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error('NEXUS chat error:', error);
    return res.status(500).json({ error: error.message || 'NEXUS chat failed' });
  }
});

/**
 * GET /api/v1/nexus/chat?sessionId=xxx
 * Get conversation history
 */
router.get('/chat', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user.userId || req.user.id;

    if (!sessionId) {
      return res.json({ success: true, history: [], sessionId: null });
    }

    const history = await prisma.conversationHistory.findMany({
      where: { userId: String(userId), sessionId },
      orderBy: { timestamp: 'asc' },
      select: { role: true, content: true, timestamp: true, agentName: true },
    });

    return res.json({
      success: true,
      history,
      sessionId,
    });
  } catch (error) {
    console.error('NEXUS history error:', error);
    return res.status(500).json({ error: error.message || 'Failed to load history' });
  }
});

/**
 * GET /api/v1/nexus/sessions
 * Get recent conversation sessions
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const sessions = await prisma.conversationHistory.findMany({
      where: { userId: String(userId), agentName: 'NEXUS' },
      distinct: ['sessionId'],
      orderBy: { timestamp: 'desc' },
      take: 20,
      select: { sessionId: true, content: true, timestamp: true },
    });

    return res.json({
      success: true,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        preview: s.content.substring(0, 100),
        lastActivity: s.timestamp,
      })),
    });
  } catch (error) {
    console.error('NEXUS sessions error:', error);
    return res.status(500).json({ error: error.message || 'Failed to load sessions' });
  }
});

module.exports = router;
