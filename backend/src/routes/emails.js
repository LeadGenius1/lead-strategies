// Email database routes - saved templates for Lead Hunter
const express = require('express');
const { authenticate } = require('../middleware/auth');

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
