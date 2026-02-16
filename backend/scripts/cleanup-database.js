/**
 * Database Cleanup - Removes old records to reduce storage
 * Run: node scripts/cleanup-database.js
 * ⚠️ Create a Railway backup BEFORE running!
 *
 * Run preview first: node scripts/preview-cleanup.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const oneEightyDaysAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

async function cleanup() {
  console.log('\n🧹 Database Cleanup\n');
  console.log('═'.repeat(50));

  const stats = { emailEvents: 0, systemHealthMetric: 0, diagnosticReport: 0, adminAuditLog: 0, emailVerificationTokens: 0 };

  try {
    // 1. EmailEvent (keep 90 days)
    const emailEvents = await prisma.emailEvent.deleteMany({
      where: { createdAt: { lt: ninetyDaysAgo } },
    });
    stats.emailEvents = emailEvents.count;
    console.log(`  ✅ EmailEvent: ${emailEvents.count} deleted`);

    // 2. SystemHealthMetric (keep 30 days)
    const systemMetrics = await prisma.systemHealthMetric.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });
    stats.systemHealthMetric = systemMetrics.count;
    console.log(`  ✅ SystemHealthMetric: ${systemMetrics.count} deleted`);

    // 3. DiagnosticReport (keep 90 days)
    const diagnosticReports = await prisma.diagnosticReport.deleteMany({
      where: { createdAt: { lt: ninetyDaysAgo } },
    });
    stats.diagnosticReport = diagnosticReports.count;
    console.log(`  ✅ DiagnosticReport: ${diagnosticReports.count} deleted`);

    // 4. AdminAuditLog (keep 180 days)
    const adminAuditLogs = await prisma.adminAuditLog.deleteMany({
      where: { createdAt: { lt: oneEightyDaysAgo } },
    });
    stats.adminAuditLog = adminAuditLogs.count;
    console.log(`  ✅ AdminAuditLog: ${adminAuditLogs.count} deleted`);

    // 5. Expired email_verification_tokens
    const expTokens = await prisma.email_verification_tokens.deleteMany({
      where: { expires_at: { lt: new Date() } },
    });
    stats.emailVerificationTokens = expTokens.count;
    console.log(`  ✅ email_verification_tokens (expired): ${expTokens.count} deleted`);

    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    console.log('\n' + '═'.repeat(50));
    console.log(`  TOTAL: ${total} records deleted`);
    console.log('  ✅ Cleanup complete.\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2021') {
      console.log('  (Model does not exist - skipping)\n');
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanup()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
