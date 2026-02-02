// AI Copilot Routes - Email Generation and Campaign Optimization
// Used by LeadSite.AI for AI-powered email writing

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Anthropic client
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  } catch (error) {
    console.warn('Failed to initialize Anthropic client:', error.message);
  }
}

// All routes require authentication
router.use(authenticate);

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

    if (!anthropic) {
      // Return mock response if Anthropic not configured
      return res.json({
        success: true,
        data: {
          subject: `Quick question about ${leadInfo.company || 'your business'}`,
          body: `Hi ${leadInfo.name?.split(' ')[0] || 'there'},\n\nI noticed ${leadInfo.company || 'your company'} has been doing great work in ${leadInfo.industry || 'your industry'}. I wanted to reach out because I think we could help you achieve even better results.\n\nWould you be open to a quick 15-minute call this week?\n\nBest,\n[Your Name]`,
          _mock: true
        }
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

    if (!anthropic) {
      // Return mock sequence
      return res.json({
        success: true,
        data: {
          sequence: [
            {
              step: 1,
              delay: 0,
              subject: `Quick question about ${leadInfo.company || 'your business'}`,
              body: `Hi ${leadInfo.name?.split(' ')[0]},\n\nI noticed ${leadInfo.company || 'your company'} in ${leadInfo.industry || 'your industry'}. Would love to chat.\n\nBest`
            },
            {
              step: 2,
              delay: daysBetween,
              subject: `Following up`,
              body: `Hi ${leadInfo.name?.split(' ')[0]},\n\nJust wanted to follow up on my previous email.\n\nBest`
            },
            {
              step: 3,
              delay: daysBetween * 2,
              subject: `Last try`,
              body: `Hi ${leadInfo.name?.split(' ')[0]},\n\nI'll keep this short - is this something you'd be interested in?\n\nBest`
            }
          ],
          _mock: true
        }
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

    if (!anthropic) {
      return res.json({
        success: true,
        data: {
          subject: subject || 'Improved subject',
          body: body,
          suggestions: ['Add personalization', 'Make CTA clearer'],
          _mock: true
        }
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
