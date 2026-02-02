// Leads Routes
const express = require('express');
const { authenticate, checkLeadLimit } = require('../middleware/auth');

const router = express.Router();

// Lazy-load Prisma only when DATABASE_URL is available
let prisma = null;
let calculateLeadScore = null;
let scoreLeadsBatch = null;

function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

function getLeadScoring() {
  if (!calculateLeadScore) {
    const scoring = require('../services/leadScoringService');
    calculateLeadScore = scoring.calculateLeadScore;
    scoreLeadsBatch = scoring.scoreLeadsBatch;
  }
  return { calculateLeadScore, scoreLeadsBatch };
}

// Mock data for development without database
const mockLeads = [
  { id: '1', email: 'sarah.chen@cloudscale.com', name: 'Sarah Chen', company: 'CloudScale', title: 'CTO', status: 'new', score: 85, source: 'ai-discovery', createdAt: new Date() },
  { id: '2', email: 'michael.torres@techcorp.com', name: 'Michael Torres', company: 'TechCorp', title: 'VP Sales', status: 'contacted', score: 72, source: 'linkedin', createdAt: new Date() },
  { id: '3', email: 'jennifer.park@innovate.io', name: 'Jennifer Park', company: 'Innovate.io', title: 'CEO', status: 'replied', score: 91, source: 'referral', createdAt: new Date() },
  { id: '4', email: 'david.kim@startupxyz.com', name: 'David Kim', company: 'StartupXYZ', title: 'Founder', status: 'new', score: 68, source: 'website', createdAt: new Date() },
  { id: '5', email: 'amanda.wilson@enterprise.co', name: 'Amanda Wilson', company: 'Enterprise Co', title: 'Director', status: 'qualified', score: 78, source: 'ai-discovery', createdAt: new Date() },
];

// All routes require authentication
router.use(authenticate);

// Get all leads
router.get('/', async (req, res) => {
  try {
    const { status, source, search, limit = 100, offset = 0 } = req.query;
    const db = getPrisma();

    // Return mock data if no database
    if (!db) {
      let filteredLeads = [...mockLeads];
      if (status) filteredLeads = filteredLeads.filter(l => l.status === status);
      if (source) filteredLeads = filteredLeads.filter(l => l.source === source);
      if (search) {
        const s = search.toLowerCase();
        filteredLeads = filteredLeads.filter(l =>
          l.email.toLowerCase().includes(s) ||
          l.name.toLowerCase().includes(s) ||
          l.company.toLowerCase().includes(s)
        );
      }
      return res.json({
        success: true,
        data: {
          leads: filteredLeads.map(l => ({
            ...l,
            firstName: l.name?.split(' ')[0] || '',
            lastName: l.name?.split(' ').slice(1).join(' ') || ''
          })),
          total: filteredLeads.length,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    }

    const where = { userId: req.user.id };

    if (status) where.status = status;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' }
      }),
      db.lead.count({ where })
    ]);

    // Format leads for frontend
    const formattedLeads = leads.map(lead => ({
      id: lead.id,
      email: lead.email,
      firstName: lead.name?.split(' ')[0] || '',
      lastName: lead.name?.split(' ').slice(1).join(' ') || '',
      name: lead.name,
      company: lead.company,
      phone: lead.phone,
      title: lead.title,
      website: lead.website,
      linkedinUrl: lead.linkedinUrl,
      source: lead.source,
      status: lead.status,
      score: lead.score,
      notes: lead.notes,
      tags: lead.tags,
      customFields: lead.customFields,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      lastContactedAt: lead.lastContactedAt
    }));

    res.json({
      success: true,
      data: {
        leads: formattedLeads,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      const lead = mockLeads.find(l => l.id === req.params.id);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });
      return res.json({ success: true, data: { ...lead, firstName: lead.name?.split(' ')[0] || '', lastName: lead.name?.split(' ').slice(1).join(' ') || '' } });
    }
    const lead = await db.lead.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({
      success: true,
      data: {
        ...lead,
        firstName: lead.name?.split(' ')[0] || '',
        lastName: lead.name?.split(' ').slice(1).join(' ') || ''
      }
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Create lead
router.post('/', checkLeadLimit, async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.status(201).json({ success: true, message: 'Lead created (mock)', data: { id: Date.now().toString(), ...req.body, status: 'new', createdAt: new Date() } });
    }
    const {
      email,
      firstName,
      lastName,
      name,
      company,
      phone,
      title,
      website,
      linkedinUrl,
      source,
      status = 'new',
      score = 0,
      notes,
      tags = [],
      customFields
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if lead already exists
    const existingLead = await db.lead.findUnique({
      where: {
        userId_email: {
          userId: req.user.id,
          email
        }
      }
    });

    if (existingLead) {
      return res.status(400).json({ error: 'Lead with this email already exists' });
    }

    // Use name if provided, otherwise combine firstName and lastName
    const finalName = name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null);

    const lead = await db.lead.create({
      data: {
        userId: req.user.id,
        email,
        name: finalName,
        company,
        phone,
        title,
        website,
        linkedinUrl,
        source,
        status,
        score: parseInt(score) || 0,
        notes,
        tags: Array.isArray(tags) ? tags : [],
        customFields: customFields || {}
      }
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: {
        ...lead,
        firstName: lead.name?.split(' ')[0] || '',
        lastName: lead.name?.split(' ').slice(1).join(' ') || ''
      }
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Bulk create leads (for CSV import)
router.post('/bulk', checkLeadLimit, async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.status(201).json({ success: true, message: 'Bulk import (mock)', data: { created: req.body.leads?.length || 0, failed: 0 } });
    }
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'Leads array is required' });
    }

    // Check lead limit
    const currentCount = await db.lead.count({
      where: { userId: req.user.id }
    });

    const limit = req.leadLimit;
    if (currentCount + leads.length > limit) {
      return res.status(403).json({
        error: 'Lead limit exceeded',
        message: `Cannot import ${leads.length} leads. You have ${limit - currentCount} slots remaining.`,
        currentCount,
        limit,
        requested: leads.length
      });
    }

    const createdLeads = [];
    const errors = [];

    for (const leadData of leads) {
      try {
        if (!leadData.email) {
          errors.push({ lead: leadData, error: 'Email is required' });
          continue;
        }

        // Check if lead exists
        const existing = await db.lead.findUnique({
          where: {
            userId_email: {
              userId: req.user.id,
              email: leadData.email
            }
          }
        });

        if (existing) {
          errors.push({ lead: leadData, error: 'Lead already exists' });
          continue;
        }

        const name = leadData.name || (leadData.firstName && leadData.lastName ? `${leadData.firstName} ${leadData.lastName}` : leadData.firstName || leadData.lastName || null);

        const lead = await db.lead.create({
          data: {
            userId: req.user.id,
            email: leadData.email,
            name,
            company: leadData.company,
            phone: leadData.phone,
            title: leadData.title,
            website: leadData.website,
            linkedinUrl: leadData.linkedinUrl,
            source: leadData.source || 'import',
            status: leadData.status || 'new',
            score: parseInt(leadData.score) || 0,
            notes: leadData.notes,
            tags: Array.isArray(leadData.tags) ? leadData.tags : [],
            customFields: leadData.customFields || {}
          }
        });

        createdLeads.push(lead);
      } catch (error) {
        errors.push({ lead: leadData, error: error.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Imported ${createdLeads.length} leads`,
      data: {
        created: createdLeads.length,
        failed: errors.length,
        leads: createdLeads,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Bulk create leads error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Update lead
router.put('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({ success: true, message: 'Lead updated (mock)', data: { id: req.params.id, ...req.body } });
    }
    const lead = await db.lead.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const {
      email,
      firstName,
      lastName,
      name,
      company,
      phone,
      title,
      website,
      linkedinUrl,
      source,
      status,
      score,
      notes,
      tags,
      customFields
    } = req.body;

    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) {
      updateData.name = name;
    } else if (firstName !== undefined || lastName !== undefined) {
      const currentName = lead.name || '';
      const currentParts = currentName.split(' ');
      const newFirstName = firstName !== undefined ? firstName : currentParts[0] || '';
      const newLastName = lastName !== undefined ? lastName : currentParts.slice(1).join(' ') || '';
      updateData.name = `${newFirstName} ${newLastName}`.trim() || null;
    }
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;
    if (title !== undefined) updateData.title = title;
    if (website !== undefined) updateData.website = website;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (source !== undefined) updateData.source = source;
    if (status !== undefined) updateData.status = status;
    if (score !== undefined) updateData.score = parseInt(score);
    if (notes !== undefined) updateData.notes = notes;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (customFields !== undefined) updateData.customFields = customFields;
    if (status === 'contacted' || status === 'replied') {
      updateData.lastContactedAt = new Date();
    }

    const updatedLead = await db.lead.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: {
        ...updatedLead,
        firstName: updatedLead.name?.split(' ')[0] || '',
        lastName: updatedLead.name?.split(' ').slice(1).join(' ') || ''
      }
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({ success: true, message: 'Lead deleted (mock)' });
    }
    const lead = await db.lead.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await db.lead.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Export leads as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const db = getPrisma();
    const { status, source } = req.query;

    if (!db) {
      // Return mock CSV
      const csv = 'Email,Name,Company,Phone,Title,Website,Source,Status,Score,Created At\n' +
        mockLeads.map(l => `"${l.email}","${l.name}","${l.company}","","${l.title}","","${l.source}","${l.status}",${l.score},"${l.createdAt.toISOString()}"`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leads-export.csv');
      return res.send(csv);
    }

    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (source) where.source = source;

    const leads = await db.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV
    const headers = ['Email', 'Name', 'Company', 'Phone', 'Title', 'Website', 'Source', 'Status', 'Score', 'Created At'];
    const rows = leads.map(lead => [
      lead.email,
      lead.name || '',
      lead.company || '',
      lead.phone || '',
      lead.title || '',
      lead.website || '',
      lead.source || '',
      lead.status,
      lead.score || 0,
      lead.createdAt.toISOString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=leads-export-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export leads error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/leads/discover - Multi-source AI Prospect Discovery (ClientContact.IO)
router.post('/discover', checkLeadLimit, async (req, res) => {
  try {
    const db = getPrisma();
    const { location, industry, keywords, maxResults = 20, sources, useAggregation = false } = req.body;

    if (!db) {
      // Return mock discovered leads
      const mockDiscovered = [
        { id: Date.now().toString(), email: 'new.lead@discovered.com', name: 'New Lead', company: 'Discovered Corp', title: 'CEO', score: 75, source: 'ai-discovery' }
      ];
      return res.json({ success: true, message: 'Discovered 1 new prospects (mock)', data: { discovered: 1, leads: mockDiscovered } });
    }

    // Get user profile for ICP matching
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: { company: true, customFields: true }
    });

    // Mock prospect discovery - In production, this would integrate with:
    // - Google Maps API for local businesses
    // - Apollo.io API for B2B contacts
    // For now, generate sample prospects based on criteria
    
    const discoveredProspects = [];
    const sampleNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Amanda'];
    const sampleCompanies = ['TechCorp', 'InnovateLabs', 'Digital Solutions', 'Cloud Systems', 'Data Analytics Inc'];
    const sampleTitles = ['CEO', 'CTO', 'VP of Sales', 'Marketing Director', 'Operations Manager'];

    // Generate sample prospects (20-50 as per plan)
    const count = Math.min(maxResults, Math.floor(Math.random() * 30) + 20);
    
    for (let i = 0; i < count; i++) {
      const firstName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const lastName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const company = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
      const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`;

      // Check if lead already exists
      const existing = await db.lead.findUnique({
        where: {
          userId_email: {
            userId: req.user.id,
            email
          }
        }
      });

      if (!existing) {
        discoveredProspects.push({
          email,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          company,
          title,
          source: 'ai-discovery',
          status: 'new',
          website: `https://${company.toLowerCase().replace(/\s+/g, '')}.com`,
          linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
          customFields: {
            discoveredLocation: location || 'Unknown',
            discoveredIndustry: industry || 'Technology',
            discoveredKeywords: keywords || []
          }
        });
      }
    }

    // Verify emails if using aggregation
    if (useAggregation && discoveredProspects.length > 0) {
      const emails = discoveredProspects.map(p => p.email).filter(Boolean);
      if (emails.length > 0) {
        const verificationResults = await verifyEmailsBatch(emails);
        discoveredProspects = discoveredProspects.map((prospect, index) => {
          const verification = verificationResults[index];
          return {
            ...prospect,
            emailVerification: verification,
            // Only include verified emails
            ...(verification && verification.valid ? {} : { email: null })
          };
        }).filter(p => p.email); // Filter out unverified emails
      }
    }

    // Score the discovered prospects
    const scoredProspects = scoreLeadsBatch(discoveredProspects, {
      targetIndustries: industry ? [industry] : [],
      company: user?.company
    });

    // Bulk create leads
    const createdLeads = [];
    const errors = [];

    for (const prospect of scoredProspects) {
      try {
        const lead = await db.lead.create({
          data: {
            userId: req.user.id,
            email: prospect.email,
            name: prospect.name,
            company: prospect.company,
            title: prospect.title,
            website: prospect.website,
            linkedinUrl: prospect.linkedinUrl,
            source: prospect.source,
            status: prospect.status,
            score: prospect.score,
            customFields: prospect.customFields || {}
          }
        });
        createdLeads.push(lead);
      } catch (error) {
        errors.push({ prospect, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Discovered ${createdLeads.length} new prospects`,
      data: {
        discovered: createdLeads.length,
        total: createdLeads.length,
        leads: createdLeads,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Discover prospects error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/leads/:id/score - Calculate and update lead score
router.post('/:id/score', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      const lead = mockLeads.find(l => l.id === req.params.id);
      return res.json({ success: true, message: 'Lead scored (mock)', data: { ...lead, score: 85, scoreBreakdown: { profile: 30, engagement: 25, fit: 30 } } });
    }
    const lead = await db.lead.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Get user profile for ICP matching
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: { company: true, customFields: true }
    });

    // Calculate score
    const scoringResult = calculateLeadScore(lead, {
      targetIndustries: user?.customFields?.targetIndustries || [],
      company: user?.company
    });

    // Update lead with new score
    const updatedLead = await db.lead.update({
      where: { id: lead.id },
      data: {
        score: scoringResult.score,
        customFields: {
          ...lead.customFields,
          scoreBreakdown: scoringResult.breakdown,
          lastScoredAt: new Date().toISOString()
        }
      }
    });

    res.json({
      success: true,
      message: 'Lead scored successfully',
      data: {
        ...updatedLead,
        scoreBreakdown: scoringResult.breakdown,
        firstName: updatedLead.name?.split(' ')[0] || '',
        lastName: updatedLead.name?.split(' ').slice(1).join(' ') || ''
      }
    });
  } catch (error) {
    console.error('Score lead error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/leads/batch/score - Score multiple leads
router.post('/batch/score', async (req, res) => {
  try {
    const db = getPrisma();
    const { leadIds } = req.body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: 'leadIds array is required' });
    }

    if (!db) {
      const scoredLeads = mockLeads.filter(l => leadIds.includes(l.id)).map(l => ({ ...l, score: 80 }));
      return res.json({ success: true, message: `Scored ${scoredLeads.length} leads (mock)`, data: { leads: scoredLeads, count: scoredLeads.length } });
    }

    const leads = await db.lead.findMany({
      where: {
        id: { in: leadIds },
        userId: req.user.id
      }
    });

    if (leads.length === 0) {
      return res.status(404).json({ error: 'No leads found' });
    }

    // Get user profile
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: { company: true, customFields: true }
    });

    const userProfile = {
      targetIndustries: user?.customFields?.targetIndustries || [],
      company: user?.company
    };

    // Score all leads
    const scoredLeads = [];
    for (const lead of leads) {
      const scoringResult = calculateLeadScore(lead, userProfile);
      
      const updatedLead = await db.lead.update({
        where: { id: lead.id },
        data: {
          score: scoringResult.score,
          customFields: {
            ...lead.customFields,
            scoreBreakdown: scoringResult.breakdown,
            lastScoredAt: new Date().toISOString()
          }
        }
      });

      scoredLeads.push({
        ...updatedLead,
        scoreBreakdown: scoringResult.breakdown,
        firstName: updatedLead.name?.split(' ')[0] || '',
        lastName: updatedLead.name?.split(' ').slice(1).join(' ') || ''
      });
    }

    res.json({
      success: true,
      message: `Scored ${scoredLeads.length} leads`,
      data: {
        leads: scoredLeads,
        count: scoredLeads.length
      }
    });
  } catch (error) {
    console.error('Batch score leads error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
