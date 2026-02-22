// AI Copilot Routes - Email Generation and Campaign Optimization
// Used by LeadSite.AI for AI-powered email writing

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const { authenticate } = require('../middleware/auth');
const { fetchWebsite } = require('../services/scraper');
const apolloService = require('../services/apollo');
const { breakers } = require('../config/circuitBreaker');

const router = express.Router();
const { prisma } = require('../config/database');

// Lead Hunter system prompt - elite AI lead gen specialist
const LEAD_HUNTER_SYSTEM_PROMPT = `You are Lead Hunter, an elite AI-powered lead generation and outreach specialist for AI Lead Strategies. You are warm, professional, and genuinely helpful - never robotic or salesy.

## YOUR CORE IDENTITY
- You're a trusted business growth partner, not a pushy salesperson
- You write like a helpful colleague, not a corporate machine
- You're data-driven but emotionally intelligent
- You celebrate wins and empathize with challenges

## YOUR CAPABILITIES

### 1. LEAD RESEARCH & DISCOVERY
You can find and analyze potential leads by:
- Searching company databases (Apollo, Hunter.io, Clearbit)
- Analyzing industries, company sizes, technologies used
- Identifying decision-makers (CTOs, CEOs, Marketing Directors, etc.)
- Finding contact information (emails, LinkedIn, phone)
- Scoring leads based on 47 intent signals

When asked to find leads, gather:
- Company name, website, industry
- Employee count, revenue range, funding stage
- Key decision-makers with titles and contact info
- Technologies they use (tech stack)
- Recent news, hiring patterns, growth signals

### 2. WEBSITE & BUSINESS INTELLIGENCE
You can fetch and analyze any website to extract:
- What the business does (products/services)
- Their target market and ideal customers
- Unique value propositions
- Pain points they likely experience
- Recent blog posts, news, or updates
- Team members and leadership
- Company culture and tone of voice

### 3. PERSONALIZED EMAIL COPY GENERATION
You write emails that sound HUMAN - warm, professional, and impossible to ignore.

**EMAIL PRINCIPLES:**
- First line must be hyper-personalized (reference their specific work, recent news, or achievement)
- Never start with "I hope this email finds you well" or "My name is..."
- Keep it short: 50-125 words max
- One clear CTA - make it easy to say yes
- Sound like a helpful peer, not a vendor
- Use their language and tone (mirror their website voice)
- Create genuine curiosity, not pressure

**EMAIL STRUCTURE:**
1. **Hook** (1 sentence): Personalized observation that shows you did research
2. **Value Bridge** (1-2 sentences): Connect their situation to a relevant insight or result
3. **Soft CTA** (1 sentence): Low-commitment next step

**TONE GUIDE:**
- Confident but not arrogant
- Curious but not interrogating
- Helpful but not desperate
- Professional but not stiff
- Brief but not curt

**WORDS TO AVOID:**
- "Touch base", "circle back", "synergy", "leverage"
- "I hope this finds you well"
- "I wanted to reach out"
- "Pick your brain"
- "Quick question" (unless it's actually quick)
- Excessive exclamation points!!!

**WORDS THAT WORK:**
- "Noticed", "Curious", "Quick thought"
- "Would it help if...", "Makes sense?"
- "No worries if not", "Either way"
- Specific numbers and results

### 4. CAMPAIGN CREATION & MANAGEMENT
You can help create multi-step email sequences:
- Initial outreach (the hook)
- Follow-up 1 (add value, different angle)
- Follow-up 2 (social proof or case study)
- Follow-up 3 (breakup email - last chance)

Each email should feel like a natural continuation, not a desperate follow-up.

### 5. EMAIL WARMUP STRATEGY
You understand email deliverability:
- Warmup schedules for new domains
- Sender reputation management
- Optimal sending times and frequency
- Avoiding spam triggers

### 6. COMPLIANCE & BEST PRACTICES
You ensure all outreach is:
- GDPR compliant (EU data protection)
- CAN-SPAM compliant (US requirements)
- CASL compliant (Canadian requirements)
- Respectful of opt-outs and preferences

## RESPONSE STYLE

When users ask you to do something:
1. **Acknowledge** - Show you understand what they need
2. **Execute** - Do the task (fetch data, write copy, find leads)
3. **Explain** - Briefly note what you did and why
4. **Offer Next Steps** - Suggest logical follow-ups

## HANDLING DIFFERENT REQUESTS

**"Find leads in [industry/location]"** → Search databases, return structured lead list with contact info
**"Fetch [website] and write an email"** → Scrape site, analyze business, write hyper-personalized email
**"Write a cold email for [company/person]"** → Research them first, then craft personalized message
**"Create a campaign for [target audience]"** → Build multi-step sequence with varied approaches
**"Help me with [vague request]"** → Ask clarifying questions to understand their goal
**"What can you do?"** → Explain capabilities warmly, offer to demonstrate

## IMPORTANT RULES
1. **Always research before writing** - Never send generic templates
2. **Quality over quantity** - 5 great emails beat 50 mediocre ones
3. **Respect the inbox** - Every email should deserve to be opened
4. **Be honest** - If you can't do something, say so and suggest alternatives
5. **Stay compliant** - Never help with spam or deceptive practices
6. **Sound human** - Read every email aloud - if it sounds robotic, rewrite it

## YOUR TOOLS & INTEGRATIONS
You have access to:
- **Apollo.io** - Lead database, company info, contact details
- **Hunter.io** - Email verification and finding
- **Website Scraper** - Fetch and analyze any URL
- **AI Writing** - Generate and refine copy
- **Campaign Manager** - Schedule and track outreach

When a tool/API fails, tell the user clearly and offer alternatives.

Remember: You're not just generating leads - you're helping businesses build genuine relationships that drive growth. Every interaction should reflect that mission.`;

// Lazy-initialize Anthropic - read env at request time (supports Railway/container env injection)
function getAnthropicKey() {
  return process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY || null;
}

function getAnthropicClient() {
  const key = getAnthropicKey();
  if (!key) return null;
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    return new Anthropic({ apiKey: key });
  } catch (error) {
    console.error('Failed to create Anthropic client:', error.message);
    return null;
  }
}

// Master business context — injected into every NEXUS Command Center chat so Claude knows the full picture
async function getMasterContext() {
  // Live health checks — direct service pings, no HTTP self-call
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
      liveStatus.redis = 'not configured — REDIS_URL not set';
    }
  } catch (err) {
    liveStatus.redis = `DOWN — ${err.message}`;
  }

  // Config-based checks (no network calls needed)
  liveStatus.stripe = process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured';
  liveStatus.r2_storage = (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_R2_ACCESS_KEY) ? 'configured' : 'not configured';
  liveStatus.anthropic = (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY) ? 'configured' : 'not configured';
  liveStatus.mailgun = process.env.MAILGUN_API_KEY ? 'configured' : 'not configured';

  // Memory
  const heapMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  liveStatus.memory = `${heapMB}MB heap used${heapMB > 400 ? ' — HIGH' : ''}`;

  // Load CLAUDE.md rules (source of truth for dev standards)
  let claudeRules = '';
  try {
    claudeRules = await fs.readFile(path.join(__dirname, '../../../CLAUDE.md'), 'utf-8');
  } catch (err) {
    console.warn('CLAUDE.md not found, skipping rules injection:', err.message);
  }

  // Add NEXUS Blueprint context
  let nexusModules = [];
  let pendingRecommendations = [];
  try {
    nexusModules = await prisma.nexusModule.findMany({
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { moduleNumber: 'asc' }
    });

    pendingRecommendations = await prisma.nexusRecommendation.findMany({
      where: { status: 'PENDING' },
      orderBy: { priority: 'desc' },
      take: 10
    });
  } catch (err) {
    console.warn('NEXUS Blueprint queries failed (tables may not exist yet):', err.message);
  }

  return {
    current_system_status: liveStatus,
    rules_loaded: !!claudeRules,
    _claudeRules: claudeRules,  // full text, used in system prompt but excluded from JSON dump
    business: {
      name: 'AI Lead Strategies LLC',
      owner: 'Michael',
      email: 'aileadstrategies@gmail.com',
      location: '600 Eagleview Blvd, Suite 317, Exton, PA 19341',
    },
    platforms: [
      { name: 'LeadSite.AI', domain: 'leadsiteai.com', description: 'Email lead generation — Lead Hunter, Proactive Hunter, Prospects, Campaigns, Replies', pricing: '$49 / $149 / $349 per month' },
      { name: 'LeadSite.IO', domain: 'leadsiteio.com', description: 'AI website builder — 6 questions to a fully generated site', pricing: '$49 / $149 / $349 per month' },
      { name: 'ClientContact.IO', domain: 'clientcontactio.com', description: 'Unified inbox — 22+ channels, SMS outreach, channel manager', pricing: '$99 / $149 / $399 per month' },
      { name: 'VideoSite.AI', domain: 'videositeai.com', description: 'Video monetization — $1 per qualified view, creator payouts via Stripe', pricing: 'FREE for creators' },
      { name: 'UltraLead.AI', domain: 'ultraleadai.com', description: 'All-in-One CRM + all 5 platforms + 7 AI agents + deals + analytics + AI copywriter', pricing: '$499 per month' },
    ],
    email_infrastructure: {
      provider: 'Instantly.ai',
      accounts: [
        'contact@getaileadstrategies.com',
        'contact@meetaileadstrategies.com',
        'contact@trendaileadstrategies.com',
        'contact@onlineaileadstrategies.com',
      ],
      daily_capacity: '120 emails/day (30 per account)',
      warmup_status: '99-100% on all 4 accounts',
      lead_lists: 26,
      campaigns: [
        { name: 'AI Lead Strategies Introduction', status: 'DRAFT' },
        { name: 'LeadSite Master Campaign', status: 'DRAFT', variables: ['personalization', 'custom_pitch'] },
      ],
    },
    ai_agents: [
      'Lead Hunter — Apollo.io 275M+ database, ICP-matched prospecting, daily automated runs',
      'Copy Writer — Claude AI per-lead personalized emails with A/B subject lines',
      'Compliance Guardian — CAN-SPAM / GDPR / CASL pre-send enforcement',
      'Warmup Conductor — Domain reputation management via Instantly.ai (all 4 at 99-100%)',
      'Engagement Analyzer — Opens/clicks/reply sentiment analysis, determines next action',
      'Analytics Brain — Revenue forecasting, pipeline health scoring (85%+ accuracy after 90 days)',
      'Healing Sentinel — Auto-fix failed sends, stale deals, API health monitoring',
    ],
    infrastructure: {
      frontend: 'Next.js 14 on Railway (aileadstrategies.com)',
      backend: 'Express.js on Railway (api.aileadstrategies.com)',
      database: 'PostgreSQL via Prisma ORM',
      storage: 'Cloudflare R2 (bucket: videosite)',
      email: 'Mailgun (SPF/DKIM/DMARC verified)',
      payments: 'Stripe (API keys configured)',
      cache: 'Redis on Railway',
    },
    gtm_status: {
      break_even: '12 customers at $49/mo or 2 customers at $499/mo',
      margin_after_break_even: '97%',
      bundle_pricing: { starter: '$79/mo', professional: '$199/mo', enterprise: '$249/mo', annual_discount: '20% off' },
    },
    nexus: {
      modules: nexusModules,
      summary: {
        total: nexusModules.length,
        completed: nexusModules.filter(m => m.status === 'COMPLETED').length,
        inProgress: nexusModules.filter(m => m.status === 'IN_PROGRESS').length,
        avgProgress: nexusModules.length > 0 ? Math.round(nexusModules.reduce((sum, m) => sum + m.progress, 0) / nexusModules.length) : 0
      },
      pendingRecommendations,
      currentFocus: nexusModules.filter(m =>
        m.status === 'IN_PROGRESS' || m.priority === 'STRATEGIC'
      )
    },
  };
}

// All routes require authentication
router.use(authenticate);

// POST /api/v1/copilot/chat - Lead Hunter AI agent with website fetch + lead search
router.post('/chat', async (req, res) => {
  try {
    const { message, context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Log API keys status (values masked)
    console.log('🔑 API Keys Status:', {
      anthropic: !!getAnthropicKey() ? '✅ Set' : '❌ Missing',
      apollo: !!process.env.APOLLO_API_KEY ? '✅ Set' : '❌ Missing',
      openai: !!process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing',
    });

    const anthropic = getAnthropicClient();
    if (!anthropic) {
      console.error('❌ ANTHROPIC_API_KEY not configured');
      return res.status(503).json({
        success: false,
        error: 'AI service not configured. Set ANTHROPIC_API_KEY in Railway environment variables.',
        code: 'ANTHROPIC_NOT_CONFIGURED'
      });
    }

    let websiteContext = '';
    const urlMatch = message.match(/https?:\/\/[^\s]+/);
    const wantsWebsite = urlMatch && /fetch|analyze|website|scrape/i.test(message);

    if (urlMatch && wantsWebsite) {
      try {
        console.log('🌐 Fetching website:', urlMatch[0]);
        const siteData = await fetchWebsite(urlMatch[0]);
        websiteContext = `\n\n[WEBSITE DATA FETCHED]\nURL: ${siteData.url}\nTitle: ${siteData.title}\nDescription: ${siteData.description}\nH1: ${siteData.h1}\nAbout: ${siteData.aboutText}\nServices: ${siteData.servicesText}\nContent (excerpt): ${siteData.content}\n`;
      } catch (err) {
        console.error('Website fetch failed:', err.message);
        websiteContext = `\n\n[WEBSITE FETCH NOTE: ${err.message}. Proceed with available information.]\n`;
      }
    }

    let leadContext = '';
    const wantsLeads = /find|search|discover/i.test(message) && /lead|compan(y|ies)|contact|prospect/i.test(message);
    if (wantsLeads && typeof apolloService.searchLeads === 'function') {
      try {
        console.log('🔍 Searching for leads...');
        const leads = await apolloService.searchLeads(message, { perPage: 10 });
        if (leads && leads.length > 0) {
          const summary = leads.slice(0, 5).map((p) => ({
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.name,
            title: p.title,
            email: p.email,
            company: p.organization?.name,
            linkedin: p.linkedin_url,
          }));
          leadContext = `\n\n[LEAD DATA FOUND]\n${JSON.stringify(summary, null, 2)}\nTotal: ${leads.length} leads\n`;
        } else {
          leadContext = '\n\n[LEAD SEARCH: No leads found for this query. Provide general guidance.]\n';
        }
      } catch (err) {
        console.error('Lead search failed:', err.message);
        leadContext = `\n\n[LEAD SEARCH NOTE: ${err.message}. Provide general guidance or suggest manual search.]\n`;
      }
    }

    const contextLead = context?.lead ? `\nCurrent lead context: ${JSON.stringify(context.lead)}` : '';
    const fullMessage = `${message}${websiteContext}${leadContext}${contextLead}`;

    // Build system prompt with full business context
    const masterContext = await getMasterContext();
    const systemPrompt = `${LEAD_HUNTER_SYSTEM_PROMPT}

## MASTER BUSINESS CONTEXT (AI Lead Strategies LLC)
You are the AI Chief Strategy Officer for AI Lead Strategies' NEXUS Command Center — not just a chatbot.
You have FULL knowledge of the business. NEVER ask "What's your business?" or "Tell me about your company."
You report directly to Michael (the owner). Be proactive, data-driven, and action-oriented.

STRATEGIC ROLE:
When asked about campaigns, growth, or strategy:
1. Analyze the current state across all 5 platforms and email infrastructure
2. Provide specific, actionable recommendations with clear steps
3. Include realistic timelines and expected outcomes
4. Reference industry best practices for B2B SaaS outbound
5. Suggest which of the 7 AI agents to coordinate for each action
6. Estimate ROI/impact (e.g. "120 emails/day × 2% reply rate = ~2.4 conversations/day")
7. Prioritize by highest leverage — what moves the needle fastest

When asked about platform status or health:
1. Show current live health data (from the LIVE status above)
2. Identify opportunities or risks based on what's working vs not
3. Recommend concrete next steps
4. Be proactive — suggest improvements even when not asked

When asked "What should I do next?" or any open-ended question:
1. Assess where things stand across all platforms, campaigns, and agents
2. Identify the single highest-impact action right now
3. Provide step-by-step instructions to execute it
4. Estimate the outcome and timeline

RESPONSE STYLE:
- Lead with data and current state, not pleasantries
- Provide clear numbered recommendations
- Include specific action items with who/what/when
- Reference actual platform names, pricing, and account details from context
- Coordinate the 7 AI agents when relevant (e.g. "Deploy Lead Hunter to find CTOs, then Copy Writer to personalize emails")
- Use concrete numbers: email capacity, pricing tiers, break-even targets
- End with a clear "RECOMMENDED NEXT ACTION" when appropriate

CURRENT SYSTEM STATUS (LIVE — checked at ${masterContext.current_system_status.timestamp}):
- Backend: running (uptime ${Math.round(masterContext.current_system_status.uptime_seconds / 60)} minutes)
- Database: ${masterContext.current_system_status.database}
- Redis: ${masterContext.current_system_status.redis}
- Stripe: ${masterContext.current_system_status.stripe}
- R2 Storage: ${masterContext.current_system_status.r2_storage}
- Anthropic AI: ${masterContext.current_system_status.anthropic}
- Mailgun: ${masterContext.current_system_status.mailgun}
- Memory: ${masterContext.current_system_status.memory}

When asked about system status, report the LIVE data above with the exact timestamp. Do not guess or use stale information.

DEVELOPMENT RULES (from CLAUDE.md — source of truth):
${masterContext._claudeRules || 'CLAUDE.md not available — advise checking the repo root.'}

When asked about dev rules, coding standards, locked files, deployment process, or how to make changes — reference these rules. They are non-negotiable.

NEXUS BLUEPRINT - STRATEGIC ROADMAP:
You have access to the 8-module NEXUS Blueprint:
${JSON.stringify(masterContext.nexus, null, 2)}

NEXUS CAPABILITIES:
- Monitor progress on all strategic modules
- Recommend next actions based on NEXUS priorities
- Update NEXUS status when work completes
- Generate strategic recommendations
- Coordinate 7 AI agents to execute NEXUS initiatives

AUTONOMOUS NEXUS UPDATES:
You CAN and SHOULD update NEXUS when:
- Strategic initiatives complete
- System state changes
- New data reveals progress
- Blockers discovered or resolved

Use update_nexus_module and create_nexus_recommendation tools.

STRATEGIC FRAMEWORK:
When asked about priorities/strategy/"what next":
1. Analyze NEXUS state
2. Identify highest-priority modules
3. Check dependencies/blockers
4. Recommend specific actions
5. Coordinate relevant agents
6. Update NEXUS with decisions

${JSON.stringify({...masterContext, _claudeRules: undefined, nexus: undefined}, null, 2)}`;

    console.log('🤖 Calling Anthropic API...');
    const chatMessage = await breakers.anthropic.execute(() =>
      anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: fullMessage }],
      })
    );

    const content = chatMessage.content[0].text;
    console.log('✅ Lead Hunter response received');

    res.json({
      success: true,
      data: {
        response: content,
        message: content,
        suggestions: ['Find 100 CTOs at SaaS companies', 'Create a warmup campaign', 'Generate email copy for a specific lead', 'Fetch a website and write an email'],
        usage: chatMessage.usage,
      }
    });
  } catch (error) {
    console.error('❌ Lead Hunter chat error:', error);
    res.status(500).json({
      success: false,
      error: `AI service error: ${error.message}`,
      data: { response: `Sorry, I encountered an error: ${error.message}. Please try again.` }
    });
  }
});

// POST /api/v1/copilot - Generate AI email
router.post('/', async (req, res) => {
  try {
    const { leadInfo, templateType, tone = 'professional', context } = req.body;

    if (!leadInfo || !leadInfo.name) {
      return res.status(400).json({
        success: false,
        error: 'Lead information is required'
      });
    }

    const anthropic = getAnthropicClient();
    if (!anthropic) {
      return res.status(503).json({
        success: false,
        error: 'AI service not configured. Set ANTHROPIC_API_KEY in Railway environment variables.',
        code: 'ANTHROPIC_NOT_CONFIGURED'
      });
    }

    const systemPrompt = `You are an expert cold email copywriter. Write compelling, personalized emails that get responses. Be concise, specific, and include a clear call-to-action. Never use generic phrases like "I hope this email finds you well." Always personalize based on the recipient's company, title, and industry.`;

    const userPrompt = `Generate a ${templateType || 'cold outreach'} email for:
Name: ${leadInfo.name}
Title: ${leadInfo.title || 'Professional'}
Company: ${leadInfo.company || 'Unknown'}
Industry: ${leadInfo.industry || 'Unknown'}
${leadInfo.website ? `Website: ${leadInfo.website}` : ''}
${leadInfo.linkedinUrl ? `LinkedIn: ${leadInfo.linkedinUrl}` : ''}
${context ? `Context: ${context}` : ''}

Tone: ${tone}

Format your response as:
SUBJECT: [subject line - max 60 characters, no spam words]
BODY:
[email body - personalized, concise, with clear CTA]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const content = message.content[0].text;

    // Parse subject and body
    const subjectMatch = content.match(/SUBJECT:\s*(.+?)(?:\n|BODY)/is);
    const bodyMatch = content.match(/BODY:\s*([\s\S]+)/i);

    const subject = subjectMatch ? subjectMatch[1].trim() : `Quick question for ${leadInfo.name}`;
    const body = bodyMatch ? bodyMatch[1].trim() : content;

    // Log generation for analytics
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'ai_generation',
        subject: 'Email generated via Copilot',
        description: `Generated ${templateType || 'cold outreach'} email for ${leadInfo.name}`,
        customFields: {
          templateType,
          tone,
          leadName: leadInfo.name,
          leadCompany: leadInfo.company
        }
      }
    }).catch(err => console.warn('Failed to log activity:', err.message));

    res.json({
      success: true,
      data: {
        subject,
        body
      }
    });
  } catch (error) {
    console.error('Copilot error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/copilot/sequence - Generate email sequence
router.post('/sequence', async (req, res) => {
  try {
    const { leadInfo, sequenceLength = 3, daysBetween = 3, tone = 'professional' } = req.body;

    if (!leadInfo || !leadInfo.name) {
      return res.status(400).json({
        success: false,
        error: 'Lead information is required'
      });
    }

    const anthropic = getAnthropicClient();
    if (!anthropic) {
      return res.status(503).json({
        success: false,
        error: 'AI service not configured. Set ANTHROPIC_API_KEY in Railway environment variables.',
        code: 'ANTHROPIC_NOT_CONFIGURED'
      });
    }

    const prompt = `Create a ${sequenceLength}-email sequence for cold outreach.

Target:
Name: ${leadInfo.name}
Title: ${leadInfo.title || 'Professional'}
Company: ${leadInfo.company || 'Unknown'}
Industry: ${leadInfo.industry || 'Unknown'}

Tone: ${tone}
Days between emails: ${daysBetween}

For each email, provide:
1. Subject line (max 60 chars)
2. Body (personalized, concise)
3. Unique angle/approach

Format as JSON array:
[
  { "step": 1, "delay": 0, "subject": "...", "body": "..." },
  { "step": 2, "delay": ${daysBetween}, "subject": "...", "body": "..." }
]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    let sequence;
    try {
      const jsonMatch = message.content[0].text.match(/\[[\s\S]*\]/);
      sequence = JSON.parse(jsonMatch ? jsonMatch[0] : '[]');
    } catch {
      sequence = [{ step: 1, delay: 0, subject: 'Follow up', body: message.content[0].text }];
    }

    res.json({
      success: true,
      data: { sequence }
    });
  } catch (error) {
    console.error('Copilot sequence error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/copilot/improve - Improve existing email
router.post('/improve', async (req, res) => {
  try {
    const { subject, body, improvements = [] } = req.body;

    if (!body) {
      return res.status(400).json({
        success: false,
        error: 'Email body is required'
      });
    }

    const anthropic = getAnthropicClient();
    if (!anthropic) {
      return res.status(503).json({
        success: false,
        error: 'AI service not configured. Set ANTHROPIC_API_KEY in Railway environment variables.',
        code: 'ANTHROPIC_NOT_CONFIGURED'
      });
    }

    const improvementsList = improvements.length > 0
      ? improvements.join(', ')
      : 'clarity, personalization, CTA strength';

    const prompt = `Improve this email for: ${improvementsList}

Original Subject: ${subject || 'No subject'}
Original Body:
${body}

Provide:
1. Improved subject line
2. Improved body
3. List of specific changes made

Format:
SUBJECT: [improved subject]
BODY:
[improved body]
CHANGES:
- [change 1]
- [change 2]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = message.content[0].text;
    const subjectMatch = content.match(/SUBJECT:\s*(.+?)(?:\n|BODY)/is);
    const bodyMatch = content.match(/BODY:\s*([\s\S]+?)(?:CHANGES:|$)/i);
    const changesMatch = content.match(/CHANGES:\s*([\s\S]+)/i);

    const suggestions = changesMatch
      ? changesMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '').trim())
      : [];

    res.json({
      success: true,
      data: {
        subject: subjectMatch ? subjectMatch[1].trim() : subject,
        body: bodyMatch ? bodyMatch[1].trim() : body,
        suggestions
      }
    });
  } catch (error) {
    console.error('Copilot improve error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/copilot/analyze - Analyze email for deliverability
router.post('/analyze', async (req, res) => {
  try {
    const { subject, body } = req.body;

    if (!body) {
      return res.status(400).json({
        success: false,
        error: 'Email body is required'
      });
    }

    // Spam word detection
    const spamWords = [
      'free', 'guarantee', 'no obligation', 'winner', 'congratulations',
      'act now', 'limited time', 'urgent', 'click here', 'buy now',
      'cash', 'earn money', 'work from home', 'discount', 'save big'
    ];

    const content = `${subject || ''} ${body}`.toLowerCase();
    const foundSpamWords = spamWords.filter(word => content.includes(word));

    // Calculate scores
    const spamScore = Math.max(0, 100 - (foundSpamWords.length * 15));
    const subjectLengthScore = subject && subject.length <= 60 ? 100 : (subject ? 70 : 50);
    const personalizationScore = content.includes('{{') || /\b(you|your)\b/i.test(content) ? 85 : 60;

    const overallScore = Math.round((spamScore + subjectLengthScore + personalizationScore) / 3);

    const issues = [];
    const warnings = [];

    if (foundSpamWords.length > 0) {
      warnings.push(`Contains spam trigger words: ${foundSpamWords.join(', ')}`);
    }
    if (subject && subject.length > 60) {
      warnings.push('Subject line too long (>60 characters)');
    }
    if (!subject) {
      issues.push('Missing subject line');
    }
    if (body.length < 50) {
      warnings.push('Email body is very short');
    }
    if (body.length > 2000) {
      warnings.push('Email body is too long');
    }
    if (!/\?/.test(body)) {
      warnings.push('Consider adding a question to encourage response');
    }

    res.json({
      success: true,
      data: {
        score: overallScore,
        breakdown: {
          spam: spamScore,
          subjectLength: subjectLengthScore,
          personalization: personalizationScore
        },
        issues,
        warnings,
        spamWordsFound: foundSpamWords
      }
    });
  } catch (error) {
    console.error('Copilot analyze error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
