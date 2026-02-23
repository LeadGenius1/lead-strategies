// Website Builder Routes (LeadSite.IO)
const express = require('express');
const { authenticate, requireFeature, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Lazy-load Prisma only when DATABASE_URL is available
let prisma = null;

function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {

    prisma = require('../config/database').prisma;
  }
  return prisma;
}

// Mock data for development without database
const mockWebsites = [
  { id: '1', name: 'My Business Site', slug: 'mybusiness', url: 'https://mybusiness.leadsite.io', status: 'published', isPublished: true, company_name: 'My Business LLC', prospects_count: 24, campaigns_count: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Product Launch', slug: 'launch2024', url: 'https://launch2024.leadsite.io', status: 'draft', isPublished: false, company_name: 'Launch Corp', prospects_count: 0, campaigns_count: 0, createdAt: new Date(), updatedAt: new Date() },
];

// All routes require authentication and website_builder feature (Tier 2+)
router.use(authenticate);
router.use(requireFeature('website_builder'));

// Get all websites
router.get('/', async (req, res) => {
  try {
    const db = getPrisma();

    if (!db) {
      return res.json({
        success: true,
        data: { websites: mockWebsites }
      });
    }

    const websites = await db.website.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: { websites }
    });
  } catch (error) {
    console.error('Get websites error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get single website
router.get('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      const website = mockWebsites.find(w => w.id === req.params.id);
      if (!website) return res.status(404).json({ error: 'Website not found' });
      return res.json({ success: true, data: website });
    }
    const website = await db.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    res.json({
      success: true,
      data: website
    });
  } catch (error) {
    console.error('Get website error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Build pages from chat answers (template-based, compatible with sites renderer)
// chatAnswers order from WebsiteBuilderChat: goal, audience, valueProp, features, cta, template
function buildPagesFromChatAnswers(chatAnswers, templateId) {
  const a = (chatAnswers || []).map(x => (x && x.answer) ? String(x.answer).trim() : '');
  const goal = a[0] || 'Generate leads and grow your business';
  const valueProp = a[2] || 'We deliver exceptional results';
  const featuresStr = a[3] || 'Quality, Trust, Results';
  const cta = a[4] || 'Get Started';
  const features = featuresStr.split(/[,;]| and /).map(s => s.trim()).filter(Boolean).slice(0, 5);
  const featureItems = features.length ? features.map((title) => ({ title, description: `Delivering on ${title.toLowerCase()}` })) : [
    { title: 'Quality', description: 'Premium solutions for your needs' },
    { title: 'Trust', description: 'Built on reliability' },
    { title: 'Results', description: 'Proven outcomes' }
  ];
  const name = (valueProp || goal).split(/[.!?]/)[0].trim().substring(0, 80) || 'My Website';
  return [{
    id: 'home',
    name: 'Home',
    slug: 'home',
    sections: [
      { type: 'hero', items: { headline: name, subheadline: valueProp || goal, ctaText: cta } },
      { type: 'about', items: { title: 'About', description: valueProp || goal } },
      { type: 'features', items: featureItems },
      { type: 'cta', items: { headline: `Ready to ${cta}?`, subheadline: valueProp, buttonText: cta } },
      { type: 'contact', items: { title: 'Get In Touch', description: 'We\'d love to hear from you.' } }
    ]
  }];
}

// POST /generate - AI-style website generation from chat answers
router.post('/generate', async (req, res) => {
  try {
    const db = getPrisma();
    const { chatAnswers, templateId } = req.body;

    if (!chatAnswers || !Array.isArray(chatAnswers)) {
      return res.status(400).json({ error: 'chatAnswers array is required' });
    }

    const pages = buildPagesFromChatAnswers(chatAnswers, templateId);
    const firstSection = pages[0]?.sections?.[0];
    const name = firstSection?.items?.headline || 'My Website';
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);

    if (!db) {
      const newWebsite = {
        id: Date.now().toString(),
        name,
        slug: baseSlug,
        content: { pages, settings: { primaryColor: '#6366f1', secondaryColor: '#ffffff' } },
        template: templateId || 'aether',
        isPublished: false,
        createdAt: new Date()
      };
      return res.status(201).json({ success: true, data: { website: newWebsite } });
    }

    let finalSlug = baseSlug;
    let counter = 1;
    let slugExists = true;
    while (slugExists) {
      const checkSlug = counter === 1 ? finalSlug : `${finalSlug}-${counter}`;
      const existing = await db.website.findFirst({ where: { slug: checkSlug } });
      if (!existing) {
        finalSlug = checkSlug;
        slugExists = false;
      } else {
        counter++;
      }
    }

    const website = await db.website.create({
      data: {
        userId: req.user.id,
        name,
        slug: finalSlug,
        content: { pages, settings: { primaryColor: '#6366f1', secondaryColor: '#ffffff' } },
        template: templateId || 'aether',
        isPublished: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Website generated successfully',
      data: { website }
    });
  } catch (error) {
    console.error('Generate website error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Create website
router.post('/', async (req, res) => {
  try {
    const db = getPrisma();
    const { name, slug, subdomain, content, template, theme } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Website name is required' });
    }

    if (!db) {
      const newWebsite = { id: Date.now().toString(), name, slug: slug || subdomain || name.toLowerCase().replace(/[^a-z0-9]/g, '-'), status: 'draft', createdAt: new Date() };
      return res.status(201).json({ success: true, data: newWebsite });
    }

    // Generate slug if not provided (accepts legacy subdomain param)
    let finalSlug = slug || subdomain;
    if (!finalSlug) {
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
      let counter = 1;
      let exists = true;
      while (exists) {
        const checkSlug = counter === 1 ? baseSlug : `${baseSlug}-${counter}`;
        const existing = await db.website.findFirst({
          where: { slug: checkSlug }
        });
        if (!existing) {
          finalSlug = checkSlug;
          exists = false;
        } else {
          counter++;
        }
      }
    } else {
      // Check if slug is available
      const existing = await db.website.findFirst({
        where: { slug: finalSlug }
      });
      if (existing) {
        return res.status(400).json({ error: 'Slug already taken' });
      }
    }

    const website = await db.website.create({
      data: {
        userId: req.user.id,
        name,
        slug: finalSlug,
        content: content || {},
        template: template || theme || 'aether',
        isPublished: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Website created successfully',
      data: {
        website
      }
    });
  } catch (error) {
    console.error('Create website error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Update website
router.put('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const website = await db.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const {
      name,
      slug,
      subdomain, // legacy alias for slug
      content,
      htmlContent,
      template,
      theme, // legacy alias for template
      status,
      isPublished
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    // slug (or legacy subdomain)
    const newSlug = slug || subdomain;
    if (newSlug !== undefined) {
      if (newSlug !== website.slug) {
        const existing = await db.website.findFirst({
          where: { slug: newSlug }
        });
        if (existing) {
          return res.status(400).json({ error: 'Slug already taken' });
        }
        updateData.slug = newSlug;
      }
    }
    if (content !== undefined) updateData.content = content;
    if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
    // template (or legacy theme)
    const newTemplate = template || theme;
    if (newTemplate !== undefined) updateData.template = newTemplate;
    if (status !== undefined) updateData.status = status;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const updatedWebsite = await db.website.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Website updated successfully',
      data: updatedWebsite
    });
  } catch (error) {
    console.error('Update website error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Delete website
router.delete('/:id', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const website = await db.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    await db.website.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Website deleted successfully'
    });
  } catch (error) {
    console.error('Delete website error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Publish website
router.post('/:id/publish', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }
    const website = await db.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!website) {
      return res.status(404).json({ success: false, error: 'Website not found' });
    }

    // Generate slug if not set
    let slug = website.slug;
    if (!slug || !slug.trim()) {
      slug = `${req.user.id.slice(0, 8)}-${req.params.id.slice(0, 8)}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
      // Ensure uniqueness
      const existing = await db.website.findFirst({ where: { slug } });
      if (existing && existing.id !== req.params.id) {
        slug = `${slug}-${Date.now().toString(36).slice(-6)}`;
      }
    }

    const updatedWebsite = await db.website.update({
      where: { id: req.params.id },
      data: {
        isPublished: true,
        status: 'published',
        slug,
        publishedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Website published successfully',
      data: {
        website: updatedWebsite,
        url: `https://${updatedWebsite.slug}.leadsite.io`
      }
    });
  } catch (error) {
    console.error('Publish website error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Unpublish website
router.post('/:id/unpublish', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const website = await db.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const updatedWebsite = await db.website.update({
      where: { id: req.params.id },
      data: { isPublished: false }
    });

    res.json({
      success: true,
      message: 'Website unpublished successfully',
      data: updatedWebsite
    });
  } catch (error) {
    console.error('Unpublish website error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/websites/:id/domain - Setup custom domain
router.post('/:id/domain', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const website = await db.website.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const { domain } = req.body;

    if (!domain || !domain.trim()) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // Validate domain format
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({ error: 'Invalid domain format' });
    }

    // Custom domain feature not yet supported — no domain column in DB.
    // Return a helpful message for now.
    res.status(501).json({
      success: false,
      error: 'Custom domain configuration is not yet available. Use slug-based URLs for now.',
      data: {
        currentUrl: website.slug ? `https://${website.slug}.leadsite.io` : null
      }
    });
  } catch (error) {
    console.error('Setup domain error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Public router: GET /subdomain/:slug (no auth - for sites renderer. Draft preview for owner.)
const publicRouter = express.Router();
publicRouter.get('/subdomain/:slug', optionalAuth, async (req, res) => {
  try {
    const db = getPrisma();
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' });
    }
    if (!db) {
      const mock = mockWebsites.find(w => w.slug === slug);
      if (!mock) return res.status(404).json({ error: 'Website not found' });
      return res.json({ success: true, data: mock });
    }
    const website = await db.website.findFirst({
      where: { slug }
    });
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    const isOwner = req.user && website.userId === req.user.id;
    if (!website.isPublished && !isOwner) {
      return res.status(404).json({ error: 'Website not found' });
    }
    res.json({ success: true, data: website });
  } catch (error) {
    console.error('Get website by slug error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
module.exports.publicRouter = publicRouter;