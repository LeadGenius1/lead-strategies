// Email routes - LeadSite.AI (templates + send)
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { sendEmail } = require('../services/mailgun');

const router = express.Router();

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

// POST /api/v1/emails/send - Send email via Mailgun
router.post('/send', async (req, res) => {
  try {
    const { to, subject, body, from } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, body'
      });
    }

    const result = await sendEmail({ to, subject, body, from });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send email',
        data: null
      });
    }

    res.json({
      success: true,
      data: { messageId: result.messageId }
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ success: false, error: 'Failed to send email', data: null });
  }
});

// GET /api/v1/emails/stats - Email stats (placeholder when EmailLog exists)
router.get('/stats', async (req, res) => {
  try {
    const db = getPrisma();
    if (db && db.emailLog) {
      const stats = await db.emailLog.groupBy({
        by: ['status'],
        where: { userId: req.user.id },
        _count: true
      });
      const sent = stats.find(s => s.status === 'sent')?._count || 0;
      const delivered = stats.find(s => s.status === 'delivered')?._count || 0;
      const bounced = stats.find(s => s.status === 'bounced')?._count || 0;
      return res.json({ success: true, data: { sent, delivered, bounced } });
    }
    res.json({ success: true, data: { sent: 0, delivered: 0, bounced: 0 } });
  } catch (error) {
    res.json({ success: true, data: { sent: 0, delivered: 0, bounced: 0 } });
  }
});

router.get('/database', async (req, res) => {
  try {
    const db = getPrisma();
    if (!db) {
      return res.json({ success: true, data: { emails: [] } });
    }
    const templates = await db.emailTemplate.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        subject: true,
        htmlContent: true,
        textContent: true,
        variables: true,
        createdAt: true
      }
    });
    const emails = templates.map((t) => ({
      id: t.id,
      subject: t.subject || t.name,
      name: t.name,
      body: t.textContent || (t.htmlContent ? t.htmlContent.replace(/<[^>]*>/g, '') : ''),
      htmlContent: t.htmlContent,
      textContent: t.textContent,
      category: t.name,
      tags: t.variables || []
    }));
    res.json({ success: true, data: { emails } });
  } catch (error) {
    console.error('Emails database error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
