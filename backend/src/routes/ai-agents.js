// UltraLead AI Agent Endpoints
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { callAI } = require('../services/ai');

const router = express.Router();

let prisma = null;
function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

router.use(authenticate);

router.use((req, res, next) => {
  req.userId = req.user?.id ?? req.user?.sub ?? req.user?.userId;
  next();
});

// POST /api/v1/ai/score-lead
router.post('/score-lead', async (req, res) => {
  try {
    const { leadId } = req.body;
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not available', data: null });

    const lead = await db.lead.findFirst({
      where: { id: leadId, userId: req.userId }
    });
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found', data: null });

    const result = await callAI(
      'You are a lead scoring expert. Return JSON: { "score": 0-100, "reasons": ["reason1","reason2"] }',
      `Score this lead: Email=${lead.email} Name=${lead.name || 'Unknown'} Company=${lead.company || 'Unknown'} Source=${lead.source || 'Unknown'}`
    );

    await db.lead.update({ where: { id: leadId }, data: { score: result.score } });
    res.json({ success: true, data: { leadId, ...result } });
  } catch (error) {
    console.error('Score lead error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to score lead', data: null });
  }
});

// POST /api/v1/ai/write-email
router.post('/write-email', async (req, res) => {
  try {
    const { context, tone = 'professional', purpose, recipientInfo } = req.body;

    const result = await callAI(
      'You are an expert email copywriter. Return JSON: { "subject": "subject line", "body": "email body" }',
      `Write a ${tone} email. Purpose: ${purpose || 'general outreach'}. Context: ${context || 'none'}. Recipient: ${recipientInfo?.name || 'there'} at ${recipientInfo?.company || 'their company'}`
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Write email error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate email', data: null });
  }
});

// POST /api/v1/ai/suggest-response
router.post('/suggest-response', async (req, res) => {
  try {
    const { conversationId, lastMessage } = req.body;
    let context = lastMessage || '';

    const db = getPrisma();
    if (conversationId && db?.conversation) {
      const conv = await db.conversation.findFirst({
        where: { id: conversationId, userId: req.userId },
        include: { messages: { take: 5, orderBy: { createdAt: 'desc' } } }
      });
      if (conv?.messages?.length) {
        context = conv.messages.map(m => `${m.direction === 'inbound' ? 'Them' : 'You'}: ${m.content}`).reverse().join('\n');
      }
    }

    const result = await callAI(
      'Return JSON: { "suggestions": [{ "label": "Brief", "text": "..." }, { "label": "Detailed", "text": "..." }, { "label": "Question", "text": "..." }] }',
      `Suggest 3 responses to: ${context}`
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Suggest response error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate suggestions', data: null });
  }
});

// POST /api/v1/ai/optimize-campaign
router.post('/optimize-campaign', async (req, res) => {
  try {
    const { campaignId } = req.body;
    const db = getPrisma();
    if (!db) return res.status(503).json({ success: false, error: 'Database not available', data: null });

    const campaign = await db.campaign.findFirst({
      where: { id: campaignId, userId: req.userId }
    });
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found', data: null });

    const result = await callAI(
      'Return JSON: { "suggestions": ["s1","s2","s3"], "predictedImprovement": "Expected X% improvement" }',
      `Analyze campaign: ${campaign.name} Subject: ${campaign.subject || 'N/A'}. Suggest improvements.`
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Optimize campaign error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to analyze campaign', data: null });
  }
});

module.exports = router;
