#!/usr/bin/env node
/**
 * Start Next.js standalone server (correct for output: 'standalone').
 * Fixes: "next start" does not work with "output: standalone"
 */
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(60));
console.log('🚀 AI LEAD STRATEGIES - STARTING APPLICATION');
console.log('='.repeat(60));

console.log('\n📊 Environment:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'production');
console.log('  PORT:', process.env.PORT || '3000');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '○ Not set');
console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com');
console.log('  NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '○ Not set');
console.log('  NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'not set');
console.log('  STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '○ Optional (payments)');

const path = require('path');
const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');

try {
  require('fs').accessSync(serverPath);
} catch {
  console.error('❌ Standalone server not found. Run: npm run build');
  process.exit(1);
}

console.log('\n⏳ Starting standalone server...\n');

process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

// Standalone server must run from its directory (Next.js requirement)
const standaloneDir = path.join(__dirname, '.next', 'standalone');
process.chdir(standaloneDir);
require(path.join(standaloneDir, 'server.js'));
