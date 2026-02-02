// UltraLead CRM Routes - Contacts, Companies, Deals, Pipeline
// Full CRM functionality for the flagship platform

const express = require('express');
const { authenticate, requireFeature } = require('../middleware/auth');

const router = express.Router();

// Lazy-load Prisma only when DATABASE_URL is available
let prisma = null;

function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

// Mock data for development without database
const mockContacts = [
  { id: '1', firstName: 'John', lastName: 'Smith', email: 'john@acme.com', phone: '555-0101', title: 'CEO', status: 'active', company: { id: '1', name: 'Acme Corp' } },
  { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane@techstart.io', phone: '555-0102', title: 'CTO', status: 'active', company: { id: '2', name: 'TechStart' } },
  { id: '3', firstName: 'Bob', lastName: 'Wilson', email: 'bob@enterprise.co', phone: '555-0103', title: 'VP Sales', status: 'lead', company: { id: '3', name: 'Enterprise Co' } },
];

const mockCompanies = [
  { id: '1', name: 'Acme Corp', industry: 'Technology', website: 'https://acme.com', size: '50-200', revenue: '$10M-$50M' },
  { id: '2', name: 'TechStart', industry: 'SaaS', website: 'https://techstart.io', size: '10-50', revenue: '$1M-$10M' },
  { id: '3', name: 'Enterprise Co', industry: 'Enterprise', website: 'https://enterprise.co', size: '500+', revenue: '$100M+' },
];

const mockDeals = [
  { id: '1', name: 'Acme Enterprise Deal', value: 50000, stage: 'proposal', probability: 60, company: mockCompanies[0] },
  { id: '2', name: 'TechStart Pilot', value: 15000, stage: 'negotiation', probability: 80, company: mockCompanies[1] },
  { id: '3', name: 'Enterprise Expansion', value: 120000, stage: 'discovery', probability: 30, company: mockCompanies[2] },
];

// All routes require authentication
router.use(authenticate);

// =====================
// CONTACTS
// =====================

// GET /api/v1/crm/contacts - List contacts
router.get('/contacts', async (req, res) => {
  try {
    const db = getPrisma();
    const { search, company, status, limit = 50, offset = 0 } = req.query;

    // Return mock data if no database
    if (!db) {
      let filtered = [...mockContacts];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(c =>
          c.firstName.toLowerCase().includes(s) ||
          c.lastName.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s)
        );
      }
      return res.json({
        success: true,
        data: { contacts: filtered, total: filtered.length, limit: parseInt(limit), offset: parseInt(offset) }
      });
    }

    const where = { userId: req.user.id };
    if (company) where.companyId = company;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [contacts, total] = await Promise.all([
      db.contact.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
        include: { company: true }
      }),
      db.contact.count({ where })
    ]);

    res.json({
      success: true,
      data: { contacts, total, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/crm/contacts - Create contact
router.post('/contacts', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, title, companyId, status = 'active', customFields } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const contact = await db.contact.create({
      data: {
        userId: req.user.id,
        firstName,
        lastName,
        email,
        phone,
        title,
        companyId,
        status,
        customFields: customFields || {}
      },
      include: { company: true }
    });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/crm/contacts/:id - Update contact
router.put('/contacts/:id', async (req, res) => {
  try {
    const contact = await db.contact.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    const updated = await db.contact.update({
      where: { id: req.params.id },
      data: req.body,
      include: { company: true }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/crm/contacts/:id - Delete contact
router.delete('/contacts/:id', async (req, res) => {
  try {
    const contact = await db.contact.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    await db.contact.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================
// COMPANIES
// =====================

// GET /api/v1/crm/companies - List companies
router.get('/companies', async (req, res) => {
  try {
    const db = getPrisma();
    const { search, industry, limit = 50, offset = 0 } = req.query;

    if (!db) {
      return res.json({
        success: true,
        data: { companies: mockCompanies, total: mockCompanies.length, limit: parseInt(limit), offset: parseInt(offset) }
      });
    }

    const where = { userId: req.user.id };
    if (industry) where.industry = industry;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [companies, total] = await Promise.all([
      db.company.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { contacts: true, deals: true } } }
      }),
      db.company.count({ where })
    ]);

    res.json({
      success: true,
      data: { companies, total, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/crm/companies - Create company
router.post('/companies', async (req, res) => {
  try {
    const { name, domain, industry, size, description, customFields } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Company name is required' });
    }

    const company = await db.company.create({
      data: {
        userId: req.user.id,
        name,
        domain,
        industry,
        size,
        description,
        customFields: customFields || {}
      }
    });

    res.status(201).json({ success: true, data: company });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/crm/companies/:id - Update company
router.put('/companies/:id', async (req, res) => {
  try {
    const company = await db.company.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    const updated = await db.company.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/crm/companies/:id - Delete company
router.delete('/companies/:id', async (req, res) => {
  try {
    const company = await db.company.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    await db.company.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Company deleted' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================
// DEALS
// =====================

const pipelineStages = [
  { id: 'lead', name: 'Lead', order: 1, color: '#3b82f6' },
  { id: 'qualified', name: 'Qualified', order: 2, color: '#8b5cf6' },
  { id: 'proposal', name: 'Proposal', order: 3, color: '#f59e0b' },
  { id: 'negotiation', name: 'Negotiation', order: 4, color: '#f97316' },
  { id: 'won', name: 'Won', order: 5, color: '#22c55e' },
  { id: 'lost', name: 'Lost', order: 6, color: '#ef4444' }
];

// GET /api/v1/crm/deals - List deals
router.get('/deals', async (req, res) => {
  try {
    const db = getPrisma();
    const { stage, company, contact, limit = 50, offset = 0 } = req.query;

    if (!db) {
      return res.json({
        success: true,
        data: { deals: mockDeals, total: mockDeals.length, limit: parseInt(limit), offset: parseInt(offset) }
      });
    }

    const where = { userId: req.user.id };
    if (stage) where.stage = stage;
    if (company) where.companyId = company;
    if (contact) where.contactId = contact;

    const [deals, total] = await Promise.all([
      db.deal.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { updatedAt: 'desc' },
        include: { company: true, contact: true }
      }),
      db.deal.count({ where })
    ]);

    res.json({
      success: true,
      data: { deals, total, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/crm/deals - Create deal
router.post('/deals', async (req, res) => {
  try {
    const { name, value, stage = 'lead', probability, companyId, contactId, expectedCloseDate, customFields } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Deal name is required' });
    }

    const deal = await db.deal.create({
      data: {
        userId: req.user.id,
        name,
        value: parseFloat(value) || 0,
        stage,
        probability: parseInt(probability) || 50,
        companyId,
        contactId,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        customFields: customFields || {}
      },
      include: { company: true, contact: true }
    });

    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/crm/deals/:id - Update deal
router.put('/deals/:id', async (req, res) => {
  try {
    const deal = await db.deal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!deal) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    const updateData = { ...req.body };
    if (updateData.value) updateData.value = parseFloat(updateData.value);
    if (updateData.probability) updateData.probability = parseInt(updateData.probability);
    if (updateData.expectedCloseDate) updateData.expectedCloseDate = new Date(updateData.expectedCloseDate);

    const updated = await db.deal.update({
      where: { id: req.params.id },
      data: updateData,
      include: { company: true, contact: true }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/crm/deals/:id/stage - Move deal to new stage (drag-drop)
router.put('/deals/:id/stage', async (req, res) => {
  try {
    const { stage } = req.body;

    const deal = await db.deal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!deal) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    // Update probability based on stage
    const stageInfo = pipelineStages.find(s => s.id === stage);
    const probability = stage === 'won' ? 100 : stage === 'lost' ? 0 : (stageInfo?.order || 1) * 20;

    const updated = await db.deal.update({
      where: { id: req.params.id },
      data: {
        stage,
        probability,
        closedAt: ['won', 'lost'].includes(stage) ? new Date() : null
      },
      include: { company: true, contact: true }
    });

    // Log activity
    await db.activity.create({
      data: {
        userId: req.user.id,
        dealId: deal.id,
        type: 'stage_change',
        subject: `Deal moved to ${stage}`,
        description: `${deal.name} moved from ${deal.stage} to ${stage}`
      }
    }).catch(() => {});

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update deal stage error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/crm/deals/:id - Delete deal
router.delete('/deals/:id', async (req, res) => {
  try {
    const deal = await db.deal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!deal) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    await db.deal.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deal deleted' });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================
// PIPELINE VIEW
// =====================

// GET /api/v1/crm/pipeline - Get pipeline view (deals grouped by stage)
router.get('/pipeline', async (req, res) => {
  try {
    const db = getPrisma();

    if (!db) {
      const pipeline = {
        discovery: [mockDeals[2]],
        qualification: [],
        proposal: [mockDeals[0]],
        negotiation: [mockDeals[1]],
        closing: []
      };
      return res.json({
        success: true,
        data: {
          stages: pipelineStages,
          pipeline,
          totals: { count: 3, value: 185000, weightedValue: 75000 }
        }
      });
    }

    const deals = await db.deal.findMany({
      where: {
        userId: req.user.id,
        stage: { notIn: ['won', 'lost'] } // Only active deals
      },
      include: { company: true, contact: true },
      orderBy: { updatedAt: 'desc' }
    });

    // Group by stage
    const pipeline = {};
    pipelineStages.forEach(stage => {
      pipeline[stage.id] = deals.filter(d => d.stage === stage.id);
    });

    // Calculate totals
    const totals = {
      count: deals.length,
      value: deals.reduce((sum, d) => sum + (d.value || 0), 0),
      weightedValue: deals.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0)
    };

    res.json({
      success: true,
      data: {
        stages: pipelineStages,
        pipeline,
        totals
      }
    });
  } catch (error) {
    console.error('Get pipeline error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================
// ACTIVITIES
// =====================

// GET /api/v1/crm/activities - List activities
router.get('/activities', async (req, res) => {
  try {
    const { dealId, contactId, type, limit = 50, offset = 0 } = req.query;

    const where = { userId: req.user.id };
    if (dealId) where.dealId = dealId;
    if (contactId) where.contactId = contactId;
    if (type) where.type = type;

    const [activities, total] = await Promise.all([
      db.activity.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' }
      }),
      db.activity.count({ where })
    ]);

    res.json({
      success: true,
      data: { activities, total, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/crm/activities - Create activity
router.post('/activities', async (req, res) => {
  try {
    const { type, subject, description, dealId, contactId, dueDate, customFields } = req.body;

    const activity = await db.activity.create({
      data: {
        userId: req.user.id,
        type: type || 'note',
        subject,
        description,
        dealId,
        contactId,
        dueDate: dueDate ? new Date(dueDate) : null,
        customFields: customFields || {}
      }
    });

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================
// FORECAST
// =====================

// GET /api/v1/crm/forecast - Revenue forecast
router.get('/forecast', async (req, res) => {
  try {
    const deals = await db.deal.findMany({
      where: {
        userId: req.user.id,
        stage: { notIn: ['lost'] }
      }
    });

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);

    // Calculate forecasts
    const thisMonthDeals = deals.filter(d => {
      const closeDate = d.expectedCloseDate || d.createdAt;
      return closeDate >= thisMonth && closeDate < nextMonth;
    });

    const nextMonthStart = nextMonth;
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    const nextMonthDeals = deals.filter(d => {
      const closeDate = d.expectedCloseDate || d.createdAt;
      return closeDate >= nextMonthStart && closeDate < nextMonthEnd;
    });

    const quarterDeals = deals.filter(d => {
      const closeDate = d.expectedCloseDate || d.createdAt;
      return closeDate <= quarterEnd;
    });

    const calculateForecast = (deals) => {
      return deals.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 50) / 100), 0);
    };

    const wonThisMonth = await db.deal.aggregate({
      where: {
        userId: req.user.id,
        stage: 'won',
        closedAt: { gte: thisMonth, lt: nextMonth }
      },
      _sum: { value: true }
    });

    res.json({
      success: true,
      data: {
        thisMonth: Math.round(calculateForecast(thisMonthDeals)),
        nextMonth: Math.round(calculateForecast(nextMonthDeals)),
        quarter: Math.round(calculateForecast(quarterDeals)),
        wonThisMonth: wonThisMonth._sum.value || 0,
        confidence: 75, // Could be calculated based on historical accuracy
        pipelineValue: deals.reduce((sum, d) => sum + (d.value || 0), 0),
        dealCount: deals.length
      }
    });
  } catch (error) {
    console.error('Get forecast error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================
// STATS
// =====================

// GET /api/v1/crm/stats - CRM overview stats
router.get('/stats', async (req, res) => {
  try {
    const db = getPrisma();

    // Return mock stats if no database
    if (!db) {
      return res.json({
        success: true,
        data: {
          contacts: 3,
          companies: 3,
          deals: 3,
          activeDeals: 3,
          pipelineValue: 185000,
          wonThisMonth: 45000,
          activities: 24,
          winRate: 65
        }
      });
    }

    const [contacts, companies, deals, activities] = await Promise.all([
      db.contact.count({ where: { userId: req.user.id } }),
      db.company.count({ where: { userId: req.user.id } }),
      db.deal.findMany({ where: { userId: req.user.id } }),
      db.activity.count({
        where: {
          userId: req.user.id,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    const pipelineValue = deals
      .filter(d => !['won', 'lost'].includes(d.stage))
      .reduce((sum, d) => sum + (d.value || 0), 0);

    const wonDeals = deals.filter(d => d.stage === 'won');
    const wonThisMonth = wonDeals
      .filter(d => d.closedAt && d.closedAt >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      .reduce((sum, d) => sum + (d.value || 0), 0);

    res.json({
      success: true,
      data: {
        contacts,
        companies,
        deals: deals.length,
        activeDeals: deals.filter(d => !['won', 'lost'].includes(d.stage)).length,
        pipelineValue,
        wonThisMonth,
        activities,
        winRate: deals.length > 0
          ? Math.round((wonDeals.length / deals.filter(d => ['won', 'lost'].includes(d.stage)).length) * 100) || 0
          : 0
      }
    });
  } catch (error) {
    console.error('Get CRM stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
