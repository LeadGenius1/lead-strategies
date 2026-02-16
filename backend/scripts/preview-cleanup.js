/**
 * Preview Database Cleanup - DRY RUN (no deletions)
 * Shows what would be deleted by cleanup-database.js
 * Run: node scripts/preview-cleanup.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const oneEightyDaysAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

async function preview() {
  console.log('\n📋 PREVIEW: What cleanup-database.js would delete\n');
  console.log('═'.repeat(50));

  const counts = {};

  try {
    // EmailEvent (keep 90 days)
    counts.emailEvents = await prisma.emailEvent.count({
      where: { createdAt: { lt: ninetyDaysAgo } },
    });
    console.log(`  EmailEvent (older than 90 days):     ${counts.emailEvents}`);

    // SystemHealthMetric (keep 30 days)
    counts.systemHealthMetric = await prisma.systemHealthMetric.count({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });
    console.log(`  SystemHealthMetric (older than 30d): ${counts.systemHealthMetric}`);

    // DiagnosticReport (keep 90 days)
    counts.diagnosticReport = await prisma.diagnosticReport.count({
      where: { createdAt: { lt: ninetyDaysAgo } },
    });
    console.log(`  DiagnosticReport (older than 90d):   ${counts.diagnosticReport}`);

    // AdminAuditLog (keep 180 days)
    counts.adminAuditLog = await prisma.adminAuditLog.count({
      where: { createdAt: { lt: oneEightyDaysAgo } },
    });
    console.log(`  AdminAuditLog (older than 180d):     ${counts.adminAuditLog}`);

    // email_verification_tokens (expired, used)
    const expCount = await prisma.email_verification_tokens.count({
      where: { expires_at: { lt: new Date() } },
    });
    counts.emailVerificationTokens = expCount;
    console.log(`  email_verification_tokens (expired):  ${counts.emailVerificationTokens}`);

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    console.log('\n' + '═'.repeat(50));
    console.log(`  TOTAL records that would be deleted: ${total}`);
    console.log('\n  This is a PREVIEW. No data was deleted.');
    console.log('  Run: node scripts/cleanup-database.js to perform cleanup.\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2021') {
      console.log('  (Model may not exist in schema - cleanup will skip it)\n');
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

preview().catch(() => process.exit(1));
