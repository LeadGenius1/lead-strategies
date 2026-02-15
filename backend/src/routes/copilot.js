// AI Copilot Routes - Email Generation and Campaign Optimization
// Used by LeadSite.AI for AI-powered email writing

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

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

// All routes require authentication
router.use(authenticate);

// POST /api/v1/copilot/chat - Lead Hunter conversational chat (message + context)
router.post('/chat', async (req, res) => {
  try {
    const { message, context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const systemPrompt = `You are Lead Hunter, an AI-powered lead generation assistant for LeadSite.AI. You help users:
- Find qualified prospects (CTOs, VPs, etc. at target companies)
- Create and manage campaigns
- Generate email copy
- Navigate leads, prospects, and analytics

Be concise, helpful, and action-oriented. When users ask to find leads, create campaigns, or generate emails, offer clear next steps. You can suggest: "Find leads", "Create campaign", "Generate email copy", "View saved leads", "Show campaigns".
Include 1-3 follow-up suggestions when appropriate.`;

    const leadContext = context?.lead ? `\nCurrent lead context: ${JSON.stringify(context.lead)}` : '';

    const anthropic = getAnthropicClient();
    if (!anthropic) {
      return res.status(503).json({
        success: false,
        error: 'AI service not configured. Set ANTHROPIC_API_KEY in Railway environment variables.',
        code: 'ANTHROPIC_NOT_CONFIGURED'
      });
    }

    const chatMessage = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: `${message}${leadContext}` }]
    });

    const content = chatMessage.content[0].text;

    res.json({
      success: true,
      data: {
        response: content,
        message: content,
        suggestions: ['Find 100 CTOs at SaaS companies', 'Create a warmup campaign', 'Generate email copy']
      }
    });
  } catch (error) {
    console.error('Copilot chat error:', error);
    res.status(500).json({ success: false, error: error.message });
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
