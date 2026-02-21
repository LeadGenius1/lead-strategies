// User profile routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

let prisma = null;
function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = require('../config/database').prisma;
  }
  return prisma;
}

router.use(authenticate);

// GET /api/v1/users/profile
router.get('/profile', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({
        success: true,
        data: {
          name: req.user?.name,
          email: req.user?.email,
          company: req.user?.company,
        },
      });
    }
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        metadata: true,
        subscription_tier: true,
        plan_tier: true,
        profile_picture: true,
        avatar_url: true,
      },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const meta = (user.metadata && typeof user.metadata === 'object') ? user.metadata : {};
    res.json({
      success: true,
      data: {
        ...meta,
        name: user.name,
        email: user.email,
        company: user.company,
        companyName: user.company ?? meta.companyName,
        subscription_tier: user.subscription_tier,
        plan_tier: user.plan_tier,
        avatar_url: user.avatar_url || user.profile_picture,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/users/profile
router.put('/profile', async (req, res) => {
  try {
    const db = getPrisma();
    const body = req.body || {};
    if (!db) {
      return res.json({ success: true, message: 'Profile updated (no DB)', data: body });
    }
    const {
      name, email, phone, jobTitle, companyName, companyWebsite, companySize, industry, location,
      productsServices, uniqueValueProposition, targetAudience, idealCustomerProfile, keyBenefits,
      painPointsSolved, competitorDifferentiation, tagline, yearsExperience, clientsServed,
      preferredTone, callToAction, testimonialHighlight,
    } = body;
    const metadataFields = {
      phone, jobTitle, companyWebsite, companySize, industry, location,
      productsServices, uniqueValueProposition, targetAudience, idealCustomerProfile, keyBenefits,
      painPointsSolved, competitorDifferentiation, tagline, yearsExperience, clientsServed,
      preferredTone, callToAction, testimonialHighlight,
    };
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: { metadata: true },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const existingMeta = (user.metadata && typeof user.metadata === 'object') ? user.metadata : {};
    const updatedMeta = { ...existingMeta };
    for (const [k, v] of Object.entries(metadataFields)) {
      if (v !== undefined) updatedMeta[k] = v;
    }
    await db.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(companyName !== undefined && { company }),
        ...(Object.keys(updatedMeta).length > 0 && { metadata: updatedMeta }),
      },
    });
    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
