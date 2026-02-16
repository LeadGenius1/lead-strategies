/**
 * MANUAL EMAIL ACCOUNT SETUP
 * Bypasses OAuth - uses Mailgun SMTP (already configured via env)
 * Run: cd backend && node scripts/add-email-account.js
 *
 * Required env: DATABASE_URL, MAILGUN_DOMAIN, MAILGUN_SMTP_PASSWORD (or MAILGUN_API_KEY)
 * Optional: ADMIN_EMAIL (default: admin@aileadstrategies.com)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aileadstrategies.com';

// Match lib/email-oauth/token-manager encryption for compatibility
function encryptToken(plainToken) {
  const ENCRYPTION_KEY =
    process.env.EMAIL_TOKEN_ENCRYPTION_KEY ||
    process.env.EMAIL_ENCRYPTION_KEY ||
    process.env.ENCRYPTION_KEY ||
    'default-dev-key-change-in-production-32ch';

  function getKey() {
    if (ENCRYPTION_KEY.length === 64 && /^[0-9a-fA-F]+$/.test(ENCRYPTION_KEY)) {
      return Buffer.from(ENCRYPTION_KEY, 'hex');
    }
    return crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  }

  const iv = crypto.randomBytes(16);
  const key = getKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainToken, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

async function addEmailAccount() {
  console.log('📧 Setting up email account...\n');

  try {
    const adminUser = await prisma.user.findFirst({
      where: { email: ADMIN_EMAIL },
    });

    if (!adminUser) {
      throw new Error(`Admin user not found: ${ADMIN_EMAIL}. Create the user first or set ADMIN_EMAIL.`);
    }

    console.log(`✅ Found admin: ${adminUser.email}\n`);

    const existing = await prisma.userEmailAccount.findFirst({
      where: {
        userId: adminUser.id,
        email: ADMIN_EMAIL,
      },
    });

    if (existing) {
      console.log('⚠️  Email account already exists!\n');
      return;
    }

    const domain = process.env.MAILGUN_DOMAIN || process.env.MAILGUN_DOMAIN_NAME;
    const smtpPassword = process.env.MAILGUN_SMTP_PASSWORD || process.env.MAILGUN_API_KEY;

    if (!domain || !smtpPassword) {
      throw new Error(
        'MAILGUN_DOMAIN and MAILGUN_SMTP_PASSWORD (or MAILGUN_API_KEY) must be set. ' +
          'Get SMTP password from Mailgun Dashboard → Sending → Domain settings.'
      );
    }

    const smtpUsername = `postmaster@${domain}`;
    const region = (process.env.MAILGUN_REGION || 'us').toLowerCase() === 'eu' ? 'eu' : 'us';
    const smtpHost = process.env.MAILGUN_SMTP_HOST || `smtp.${region === 'eu' ? 'eu.' : ''}mailgun.org`;
    const smtpPort = 587;

    const emailAccount = await prisma.userEmailAccount.create({
      data: {
        userId: adminUser.id,
        email: ADMIN_EMAIL,
        displayName: 'AI Lead Strategies',
        provider: 'SMTP',
        status: 'ACTIVE',
        tier: 'FREE',
        dailyLimit: 100,
        smtpHost,
        smtpPort,
        smtpUsername,
        smtpPassword: encryptToken(smtpPassword),
        warmupStartedAt: new Date(),
      },
    });

    console.log('✅ Email account created!\n');
    console.log(`   Email: ${emailAccount.email}`);
    console.log(`   Provider: SMTP (Mailgun)`);
    console.log(`   Host: ${smtpHost}:${smtpPort}`);
    console.log(`   Status: active\n`);
    console.log('🎉 Email features now enabled!\n');
  } catch (error) {
    console.error('❌ ERROR:', error.message);

    if (
      error.message.includes('Unknown arg') ||
      error.message.includes('does not exist') ||
      error.code === 'P2002'
    ) {
      console.log('\n⚠️  Check backend/prisma/schema.prisma has UserEmailAccount model.');
      console.log('   Run: cd backend && npx prisma generate && npx prisma db push (if needed)\n');
    }

    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addEmailAccount()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
