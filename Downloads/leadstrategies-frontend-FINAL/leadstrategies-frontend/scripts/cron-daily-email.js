/**
 * Railway Cron Script: Daily AI Agent Email Process
 * This script can be run via Railway Cron service or external cron service
 * Schedule: Daily at 2:00 AM UTC (or adjust timezone as needed)
 * 
 * To use with Railway Cron:
 * 1. Create a new Cron service in Railway
 * 2. Set schedule: "0 2 * * *" (daily at 2 AM UTC)
 * 3. Set command: "node scripts/cron-daily-email.js"
 * 
 * To use with external cron service (cron-job.org, EasyCron, etc.):
 * Call: POST https://your-railway-app.up.railway.app/api/ai-agent/daily-email
 * With header: x-cron-secret: YOUR_CRON_SECRET
 */

const https = require('https');
const http = require('http');

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.RAILWAY_PUBLIC_DOMAIN 
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : 'http://localhost:3000';

const CRON_SECRET = process.env.CRON_SECRET;

async function triggerDailyEmail() {
  const url = new URL(`${API_URL}/api/ai-agent/daily-email`);
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cron-secret': CRON_SECRET || '',
    },
  };

  return new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Daily email process triggered successfully');
          console.log('Response:', data);
          resolve(JSON.parse(data));
        } else {
          console.error('❌ Error triggering daily email:', res.statusCode);
          console.error('Response:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });
    
    req.write(JSON.stringify({ cronSecret: CRON_SECRET }));
    req.end();
  });
}

// Run the cron job
console.log('🕐 Starting daily email cron job...');
console.log('API URL:', API_URL);
console.log('Time:', new Date().toISOString());

triggerDailyEmail()
  .then((result) => {
    console.log('✅ Cron job completed successfully');
    console.log('Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cron job failed:', error);
    process.exit(1);
  });
