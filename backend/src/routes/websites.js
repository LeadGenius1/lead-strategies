// Website Builder Routes (LeadSite.IO)
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
const mockWebsites = [
  { id: '1', name: 'My Business Site', subdomain: 'mybusiness', url: 'https://mybusiness.leadsite.io', status: 'published', isPublished: true, company_name: 'My Business LLC', prospects_count: 24, campaigns_count: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Product Launch', subdomain: 'launch2024', url: 'https://launch2024.leadsite.io', status: 'draft', isPublished: false, company_name: 'Launch Corp', prospects_count: 0, campaigns_count: 0, createdAt: new Date(), updatedAt: new Date() },
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

// Create website
router.post('/', async (req, res) => {
  try {
    const db = getPrisma();
    const { name, domain, subdomain, pages, settings, theme } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Website name is required' });
    }

    if (!db) {
      const newWebsite = { id: Date.now().toString(), name, subdomain: subdomain || name.toLowerCase().replace(/[^a-z0-9]/g, '-'), status: 'draft', createdAt: new Date() };
      return res.status(201).json({ success: true, data: newWebsite });
    }

    // Generate subdomain if not provided
    let finalSubdomain = subdomain;
    if (!finalSubdomain) {
      const baseSubdomain = name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
      let counter = 1;
      let exists = true;
      while (exists) {
        const checkSubdomain = counter === 1 ? baseSubdomain : `${baseSubdomain}-${counter}`;
        const existing = await db.website.findUnique({
          where: { subdomain: checkSubdomain }
        });
        if (!existing) {
          finalSubdomain = checkSubdomain;
          exists = false;
        } else {
          counter++;
        }
      }
    } else {
      // Check if subdomain is available
      const existing = await db.website.findUnique({
        where: { subdomain: finalSubdomain }
      });
      if (existing) {
        return res.status(400).json({ error: 'Subdomain already taken' });
      }
    }

    const website = await db.website.create({
      data: {
        userId: req.user.id,
        name,
        domain,
        subdomain: finalSubdomain,
        pages: pages || [],
        settings: settings || {},
        theme: theme || 'default',
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
      domain,
      subdomain,
      pages,
      settings,
      theme,
      isPublished
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (domain !== undefined) updateData.domain = domain;
    if (subdomain !== undefined) {
      // Check if new subdomain is available
      if (subdomain !== website.subdomain) {
        const existing = await db.website.findUnique({
          where: { subdomain }
        });
        if (existing) {
          return res.status(400).json({ error: 'Subdomain already taken' });
        }
        updateData.subdomain = subdomain;
      }
    }
    if (pages !== undefined) updateData.pages = pages;
    if (settings !== undefined) updateData.settings = settings;
    if (theme !== undefined) updateData.theme = theme;
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
      data: { isPublished: true }
    });

    res.json({
      success: true,
      message: 'Website published successfully',
      data: {
        website: updatedWebsite,
        url: `https://${updatedWebsite.subdomain}.leadsite.io`
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

    // In production, this would:
    // 1. Verify domain ownership (DNS TXT record)
    // 2. Provision SSL certificate (Let's Encrypt)
    // 3. Configure CDN routing
    // For now, just update the domain field

    const updatedWebsite = await db.website.update({
      where: { id: req.params.id },
      data: { domain: domain.trim().toLowerCase() }
    });

    res.json({
      success: true,
      message: 'Custom domain configured successfully',
      data: {
        website: updatedWebsite,
        instructions: {
          step1: `Add a CNAME record pointing ${domain} to ${website.subdomain}.leadsite.io`,
          step2: 'Wait for DNS propagation (usually 5-30 minutes)',
          step3: 'SSL certificate will be automatically provisioned',
        }
      }
    });
  } catch (error) {
    console.error('Setup domain error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
