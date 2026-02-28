const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { fetchWebsite } = require('../services/scraper');
const apolloService = require('../services/apollo');
const { prisma } = require('../config/database');
const Anthropic = require('@anthropic-ai/sdk');

router.use(authenticate);

// GET /status
router.get('/status', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { metadata: true }
    });
    const meta = user?.metadata || {};
    const ph = meta.proactiveHunter || {};
    res.json({
      hasICP: !!ph.businessName,
      icp: {
        businessName: ph.businessName || '',
        isActive: ph.isActive || false,
      },
      recentRuns: ph.recentRuns || [],
      weeklyStats: ph.weeklyStats || {
        totalLeads: 0, totalEmails: 0, totalReplies: 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /scan-website
router.post('/scan-website', async (req, res) => {
  try {
    const { websiteUrl } = req.body;
    if (!websiteUrl) return res.status(400).json({ error: 'websiteUrl required' });

    // Scrape website
    const siteData = await fetchWebsite(websiteUrl);

    // Use Anthropic to extract ICP
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const aiRes = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Extract business profile from this website content.
Return ONLY valid JSON with these fields:
{
  "businessName": "",
  "industry": "",
  "productsServices": "",
  "targetAudience": "",
  "idealCustomerProfile": "",
  "uniqueValueProposition": "",
  "companyWebsite": "${websiteUrl}"
}

Website content:
Title: ${siteData.title}
Description: ${siteData.description}
Content: ${siteData.content?.substring(0, 1000)}`
      }]
    });

    let icp = {};
    try {
      const text = aiRes.content[0].text.replace(/```json|```/g, '').trim();
      icp = JSON.parse(text);
    } catch(e) {
      icp = { businessName: siteData.title, companyWebsite: websiteUrl };
    }

    // Save to user metadata
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { metadata: true }
    });
    const existingMeta = user?.metadata || {};
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        metadata: {
          ...existingMeta,
          ...icp,
          proactiveHunter: {
            ...(existingMeta.proactiveHunter || {}),
            businessName: icp.businessName,
            isActive: false,
            scannedAt: new Date().toISOString(),
          }
        }
      }
    });

    res.json({ success: true, icp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /trigger-run
router.post('/trigger-run', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { metadata: true }
    });
    const meta = user?.metadata || {};
    const icp = meta.proactiveHunter || {};

    // Search for leads using Apollo
    const searchParams = {
      titles: ['Purchasing Manager', 'Facilities Manager', 'Property Manager'],
      industry: meta.industry || icp.industry || '',
      perPage: 10
    };
    const apolloResult = await apolloService.searchPeople(searchParams).catch(() => ({ people: [] }));
    const leads = apolloResult.people || apolloResult || [];
    const leadsFound = Array.isArray(leads) ? leads.length : 0;

    // Save discovered leads to Lead model
    for (const lead of leads.slice(0, 10)) {
      if (!lead.email || !lead.email.includes('@')) continue;
      await prisma.lead.upsert({
        where: { userId_email: { userId: req.user.id, email: lead.email } },
        update: {},
        create: {
          email: lead.email,
          name: lead.name || '',
          company: lead.organization?.name || '',
          title: lead.title || '',
          source: 'proactive_hunter',
          status: 'new',
          userId: req.user.id,
        }
      }).catch(() => {});
    }

    // Update run history in metadata
    const runRecord = {
      date: new Date().toISOString(),
      leadsDiscovered: leadsFound,
      emailsSent: 0,
      status: 'completed'
    };
    const recentRuns = [runRecord, ...(icp.recentRuns || [])].slice(0, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        metadata: {
          ...meta,
          proactiveHunter: { ...icp, recentRuns, lastRunAt: new Date().toISOString() }
        }
      }
    });

    res.json({
      success: true,
      discovery: { leadsDiscovered: leadsFound },
      outreach: { emailsSent: 0 }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /icp
router.put('/icp', async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { metadata: true }
    });
    const meta = user?.metadata || {};
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        metadata: {
          ...meta,
          proactiveHunter: {
            ...(meta.proactiveHunter || {}),
            isActive: !!isActive,
            updatedAt: new Date().toISOString()
          }
        }
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
