// Singleton PrismaClient - ONE instance for the entire backend
// Prevents connection pool exhaustion (was 62 separate instances = 310+ connections)
const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  // In development, reuse across hot reloads
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

// Connection health check
async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', message: 'Connected' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

// Graceful disconnect (called during shutdown)
async function disconnectDatabase() {
  await prisma.$disconnect();
}

module.exports = { prisma, checkDatabaseHealth, disconnectDatabase };
