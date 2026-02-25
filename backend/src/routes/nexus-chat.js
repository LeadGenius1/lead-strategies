const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const { FirecrawlAgent } = require('../services/firecrawl-agent');
const { PerplexityAgent } = require('../services/perplexity-agent');
const { ChatGPTAgent } = require('../services/chatgpt-agent');
const instantlyService = require('../services/instantly');
const { sendEmail: mailgunSendEmail } = require('../services/mailgun');

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

## ANALYTICS BRAIN REFERENCE: SMB TARGETING PLAYBOOK

### AUDIENCE MATH
- Quantify reachable market: Pull SMB counts by NAICS/category from Google Maps + directories (Yelp, Angi, Thumbtack, HomeAdvisor)
- Target 50% reach: 40% email, 20% SMS/phone, 20% GBP/search, 20% retargeting

### LIST BUILDING FORMULA
Tier 1: Ad spenders, high review count, franchises (highest priority)
Tier 2: Active but not ad spenders
Tier 3: Sparse presence (cheaper channels only)

Sources: Google Business Profiles, Yelp/Angi/HomeAdvisor, franchise directories, industry association member lists

Data points to capture: business name, owner name, website, email, phone, GBP URL, category, city, review count, rating, ad flags

### COMPETITOR TRAFFIC CAPTURE
1. Keyword hijack: Google Ads on "near me" + competitor brand keywords
   Landing page angle: "Before you lock into another long-term contract, see how AI Lead Strategies compares"
2. Audience hijack: Target visitors to competitor comparison pages + people searching competitor pricing/demo/reviews
3. Listing piggyback: "[Competitor] vs AI Lead Strategies" content for SEO + paid search. Use VideoSite.AI for video versions

### THREE OUTBOUND LOOPS

LOOP 1 - Outbound at Scale (LeadSite.AI + UltraLead + ClientContact):
- Build sequences per segment:
  * "Cleaning company, has GMB, 10-100 reviews"
  * "Franchise owner, multiple locations"
  * "Solo operator, weak website, no booking system"
- 5-7 touch email sequences per segment:
  * Touch 1: Relevance + fast win
  * Touch 2-3: Proof + simple explanation
  * Touch 4-5: Objection handling
  * Touch 6-7: Deadline/limited slot offer
- Add SMS steps via ClientContact.IO for contacts with mobile numbers
- UltraLead manages pipeline: Curious→Interested→Demo→Trial→Customer

LOOP 2 - Inbound (GBP + Directory):
- Rank for "AI lead generation for [industry]" queries
- CTA: "Get a free AI outreach map for your Google listing in 24hrs"
- Partner with directories for white-label widgets
- VideoSite.AI short videos: "How to turn 30% more quotes into contracts using AI follow-up"

LOOP 3 - Retargeting:
- Pixel: main site, all product pages, blog, comparison pages
- Pain-specific ads by segment:
  * Cleaning: "Stop losing jobs because you respond 2 hours late"
  * Franchises: "One AI system across all locations"
  * Solo operators: "Turn your Google listing into a 24/7 sales rep"
- Weekly micro case study emails by industry via LeadSite.AI

### 90-DAY EXECUTION CADENCE
Week 1-2: Build/clean master list + define 3-5 segment offers
Week 3-4: Launch email sequences + competitor keyword campaigns
Week 5-8: Kill low performers, double winners, expand to 5-7 segments
Week 9-12: Catch-all campaign to non-openers with bold time-bound offer. Cross-pollinate segments. Audit TAM coverage gaps.

### KEY METRICS TO TRACK
- Unique businesses touched (not impressions)
- Demo booking rate per segment
- CAC by channel
- Open rate target: 35-45%
- Click rate target: 3-7%
- Reply rate target: 2-5%
- Meeting booking rate: 0.5-1.5%

### HERO STAT FOR SALES
LeadSite.AI at $49/month vs typical SDR at $60K/year = 100x cost advantage with 24/7 autonomous operation

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
  },
  {
    name: 'send_email',
    description: 'Send an email via Mailgun (from noreply@leadsite.ai)',
    input_schema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'HTML email body' },
        text: { type: 'string', description: 'Plain text fallback (optional)' }
      },
      required: ['to', 'subject', 'body']
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
      case 'send_email':
        return await mailgunSendEmail({
          to: toolInput.to,
          subject: toolInput.subject,
          body: toolInput.body,
          text: toolInput.text
        });
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    return { error: `Tool execution failed: ${error.message}` };
  }
}

/**
 * GET /api/v1/nexus/context
 * Live platform data for agent injection — no auth required
 */
router.get('/context', async (req, res) => {
  try {
    const [
      userCount,
      leadCount,
      websiteCount,
      videoCount,
      campaignCount,
      recentLeads,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.lead.count().catch(() => 0),
      prisma.website.count().catch(() => 0),
      prisma.video.count().catch(() => 0),
      prisma.campaign.count().catch(() => 0),
      prisma.lead.findMany({ take: 5, orderBy: { createdAt: 'desc' } }).catch(() => []),
      prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { email: true, createdAt: true, plan: true } }).catch(() => [])
    ]);

    res.json({
      success: true,
      fetchedAt: new Date().toISOString(),
      platform: {
        users: userCount,
        leads: leadCount,
        websites: websiteCount,
        videos: videoCount,
        campaigns: campaignCount
      },
      recent: {
        leads: recentLeads,
        users: recentUsers
      },
      features: {
        sms: !!process.env.TWILIO_MESSAGING_SERVICE_SID,
        a2p_campaign: process.env.TWILIO_MESSAGING_SERVICE_SID || null,
        nexus: !!process.env.ANTHROPIC_API_KEY,
        email: !!process.env.INSTANTLY_API_KEY,
        perplexity: !!process.env.PERPLEXITY_API_KEY,
        firecrawl: !!process.env.FIRECRAWL_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        storage: !!process.env.CLOUDFLARE_R2_BUCKET
      },
      infrastructure: {
        backend: 'api.aileadstrategies.com',
        database: 'switchyard.proxy.rlwy.net:32069',
        frontend: 'aileadstrategies.com'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/nexus/chat
 * Process NEXUS conversation message via Claude AI
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const userId = (req.user && (req.user.userId || req.user.id)) || 'nexus-command-center';

    // Build dynamic system prompt from injected frontend context + server-side fallback
    const injected = req.body.context || {};
    let ctx;
    if (injected.platform) {
      // Frontend injected live context — use it directly
      ctx = injected;
    } else {
      // No frontend context — fall back to server-side fetch
      const serverCtx = await getSystemContext();
      ctx = {
        fetchedAt: serverCtx.liveStatus?.timestamp || new Date().toISOString(),
        platform: serverCtx.metrics || {},
        features: {
          sms: !!process.env.TWILIO_MESSAGING_SERVICE_SID,
          a2p_campaign: process.env.TWILIO_MESSAGING_SERVICE_SID || null,
          nexus: !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY),
          email: !!process.env.INSTANTLY_API_KEY,
          perplexity: !!process.env.PERPLEXITY_API_KEY,
          firecrawl: !!process.env.FIRECRAWL_API_KEY,
          openai: !!process.env.OPENAI_API_KEY,
          storage: !!process.env.CLOUDFLARE_R2_BUCKET,
        },
        infrastructure: {
          backend: 'api.aileadstrategies.com',
          database: 'switchyard.proxy.rlwy.net:32069',
          frontend: 'aileadstrategies.com',
        },
      };
    }

    const systemPrompt = `You are NEXUS, the Master AI Agent for AI Lead Strategies LLC.
You report directly to Michael (the owner). Be data-driven, proactive, and action-oriented.

LIVE PLATFORM DATA (fetched at ${ctx.fetchedAt || new Date().toISOString()}):
- Total Users: ${ctx.platform?.users ?? 'unknown'}
- Total Leads: ${ctx.platform?.leads ?? 'unknown'}
- Websites Built: ${ctx.platform?.websites ?? 'unknown'}
- Videos Uploaded: ${ctx.platform?.videos ?? 'unknown'}
- Active Campaigns: ${ctx.platform?.campaigns ?? 'unknown'}

ACTIVE CAPABILITIES:
- SMS Marketing: ${ctx.features?.sms ? 'LIVE — A2P Campaign ' + (ctx.features?.a2p_campaign || '') : 'OFFLINE'}
- Email Outreach: ${ctx.features?.email ? 'LIVE' : 'OFFLINE'}
- NEXUS Orchestrator: ${ctx.features?.nexus ? 'LIVE (Claude + Perplexity + Firecrawl + GPT-4o)' : 'OFFLINE'}
- Storage (R2): ${ctx.features?.storage ? 'LIVE' : 'OFFLINE'}

INFRASTRUCTURE:
- Backend: ${ctx.infrastructure?.backend || 'api.aileadstrategies.com'}
- Database: ${ctx.infrastructure?.database || 'switchyard.proxy.rlwy.net:32069'}
- Frontend: ${ctx.infrastructure?.frontend || 'aileadstrategies.com'}

THE 5 PLATFORMS:
1. LeadSite.AI (leadsiteai.com) — Email lead generation — $49/$149/$349/mo
2. LeadSite.IO (leadsiteio.com) — AI website builder — $49/$149/$349/mo
3. ClientContact.IO (clientcontactio.com) — Unified inbox, 22+ channels — $99/$149/$399/mo
4. VideoSite.AI (videositeai.com) — Video monetization — FREE
5. UltraLead.AI (ultraleadai.com) — All-in-One CRM + all platforms — $499/mo

7 AI AGENTS:
1. Lead Hunter — Apollo.io 275M+ database, ICP-matched prospecting
2. Copy Writer — Claude AI per-lead personalized emails
3. Compliance Guardian — CAN-SPAM/GDPR/CASL enforcement
4. Warmup Conductor — Domain reputation via Instantly.ai
5. Engagement Analyzer — Opens/clicks/reply sentiment analysis
6. Analytics Brain — Revenue forecasting, pipeline health
7. Healing Sentinel — Auto-fix failed sends, API health monitoring

RULES: You follow CLAUDE.md and STANDARD_EXECUTION_POLICY.md — 11 rules, no exceptions.
You have access to live Instantly MCP, all 5 platforms, and 7 AI agents.
ALWAYS reference the live numbers above. NEVER use stale assumptions.
Every response must be grounded in current platform data.
Lead with data and current state. Provide numbered recommendations with specific actions.
End with a clear RECOMMENDED NEXT ACTION when appropriate.`;

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

    // Anthropic overloaded — return 200 so Command Center stays LIVE
    if (error.status === 529 || (error.error && error.error.type === 'overloaded_error') || (error.message && error.message.includes('overloaded'))) {
      return res.status(200).json({
        success: true,
        response: "I'm experiencing high demand right now. Please try again in a moment.",
        status: 'degraded',
        retryAfter: 10,
      });
    }

    return res.status(500).json({ error: error.message || 'NEXUS chat failed' });
  }
});

/**
 * GET /api/v1/nexus/chat?sessionId=xxx
 * Get conversation history
 */
router.get('/chat', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = (req.user && (req.user.userId || req.user.id)) || 'nexus-command-center';

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
router.get('/sessions', async (req, res) => {
  try {
    const userId = (req.user && (req.user.userId || req.user.id)) || 'nexus-command-center';

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
