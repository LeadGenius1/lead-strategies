// Lead Form Builder Routes (LeadSite.IO)
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireFeature } = require('../middleware/auth');

const router = express.Router();
const { prisma } = require('../config/database');

// All routes require authentication and website_builder feature (Tier 2+)
router.use(authenticate);
router.use(requireFeature('website_builder'));

// Get all forms
router.get('/', async (req, res) => {
  try {
    const forms = await prisma.form.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        forms
      }
    });
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get single form
router.get('/:id', async (req, res) => {
  try {
    const form = await prisma.form.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Create form
router.post('/', async (req, res) => {
  try {
    const { name, fields, websiteId, settings } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Form name is required' });
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ error: 'Form fields are required' });
    }

    const form = await prisma.form.create({
      data: {
        userId: req.user.id,
        name,
        fields: fields || [],
        websiteId: websiteId || null,
        settings: settings || {
          redirectUrl: null,
          successMessage: 'Thank you! We\'ll be in touch soon.',
          emailNotifications: true,
        },
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      data: {
        form
      }
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Update form
router.put('/:id', async (req, res) => {
  try {
    const form = await prisma.form.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const {
      name,
      fields,
      settings,
      isActive
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (fields !== undefined) updateData.fields = fields;
    if (settings !== undefined) updateData.settings = settings;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedForm = await prisma.form.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Form updated successfully',
      data: updatedForm
    });
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Delete form
router.delete('/:id', async (req, res) => {
  try {
    const form = await prisma.form.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    await prisma.form.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/forms/:id/submit - Handle form submission
router.post('/:id/submit', async (req, res) => {
  try {
    const form = await prisma.form.findFirst({
      where: {
        id: req.params.id,
        isActive: true
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found or inactive' });
    }

    const { data: submissionData } = req.body;

    if (!submissionData) {
      return res.status(400).json({ error: 'Submission data is required' });
    }

    // Validate required fields
    const requiredFields = form.fields.filter((f) => f.required);
    for (const field of requiredFields) {
      if (!submissionData[field.name]) {
        return res.status(400).json({ error: `Field ${field.name} is required` });
      }
    }

    // Create form submission
    const submission = await prisma.formSubmission.create({
      data: {
        formId: form.id,
        data: submissionData,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      }
    });

    // Create lead if email is provided
    if (submissionData.email) {
      try {
        // Check if lead already exists
        const existingLead = await prisma.lead.findUnique({
          where: {
            userId_email: {
              userId: form.userId,
              email: submissionData.email
            }
          }
        });

        if (!existingLead) {
          await prisma.lead.create({
            data: {
              userId: form.userId,
              email: submissionData.email,
              name: submissionData.name || submissionData.firstName || null,
              company: submissionData.company || null,
              phone: submissionData.phone || null,
              source: 'website_form',
              status: 'new',
              score: 0,
              customFields: {
                formId: form.id,
                formName: form.name,
                submissionId: submission.id
              }
            }
          });
        }
      } catch (leadError) {
        console.error('Create lead from form error:', leadError);
        // Don't fail the submission if lead creation fails
      }
    }

    // Send email notification if enabled
    if (form.settings?.emailNotifications) {
      // In production, send email notification to form owner
      // await sendFormNotificationEmail(form.userId, form, submission);
    }

    res.json({
      success: true,
      message: form.settings?.successMessage || 'Thank you! We\'ll be in touch soon.',
      data: {
        submissionId: submission.id,
        redirectUrl: form.settings?.redirectUrl || null
      }
    });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get form submissions
router.get('/:id/submissions', async (req, res) => {
  try {
    const form = await prisma.form.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const submissions = await prisma.formSubmission.findMany({
      where: { formId: form.id },
      orderBy: { createdAt: 'desc' },
      take: parseInt(req.query.limit) || 100,
      skip: parseInt(req.query.offset) || 0
    });

    res.json({
      success: true,
      data: {
        submissions,
        total: submissions.length
      }
    });
  } catch (error) {
    console.error('Get form submissions error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
