// start.js - Diagnostic startup script for Railway
// Load environment variables from .env.local for development
require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(60));
console.log('🚀 AI LEAD STRATEGIES - STARTING APPLICATION');
console.log('='.repeat(60));

console.log('\n📊 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'not set');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'not set');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '○ Optional (payments)');

console.log('\n📦 Loading Next.js...');

try {
  const { createServer } = require('http');
  const { parse } = require('url');
  const next = require('next');

  const dev = process.env.NODE_ENV !== 'production';
  const hostname = '0.0.0.0';
  const port = parseInt(process.env.PORT || '3000', 10);

  console.log(`\n🔧 Configuration:`);
  console.log(`   Dev mode: ${dev}`);
  console.log(`   Hostname: ${hostname}`);
  console.log(`   Port: ${port}`);

  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  console.log('\n⏳ Preparing Next.js application...');

  app.prepare().then(() => {
    console.log('✅ Next.js prepared successfully');

    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('❌ Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(port, hostname, (err) => {
      if (err) {
        console.error('❌ Failed to start server:', err);
        throw err;
      }
      console.log('\n' + '='.repeat(60));
      console.log(`✅ SERVER RUNNING ON http://${hostname}:${port}`);
      console.log(`✅ Health check: http://${hostname}:${port}/api/health`);
      console.log(`✅ Ready to accept requests`);
      console.log('='.repeat(60) + '\n');
    });
  }).catch((err) => {
    console.error('❌ Failed to prepare Next.js:', err);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ FATAL ERROR during startup:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('\n⏹️ SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⏹️ SIGINT received, shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});
