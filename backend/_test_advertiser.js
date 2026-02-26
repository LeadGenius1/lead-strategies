const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function main() {
  try {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('Test1234!', salt, 100000, 64, 'sha512').toString('hex');
    const storedHash = `${salt}:${hash}`;

    const advertiser = await prisma.advertiserAccount.create({
      data: {
        email: 'directtest@verify.com',
        passwordHash: storedHash,
        businessName: 'Direct Test Co',
        contactName: 'Direct Test',
      },
    });
    console.log('Created:', advertiser.id, advertiser.email);
  } catch (err) {
    console.error('Create error:', err.message);
    console.error('Full error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
