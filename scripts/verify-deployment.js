#!/usr/bin/env node
const https = require('https');
const backend = 'https://api.aileadstrategies.com/health';
https.get(backend, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const j = JSON.parse(data);
      if (j.status === 'ok') {
        console.log('Backend HEALTHY:', backend);
      } else {
        console.log('Backend responded:', JSON.stringify(j));
      }
    } catch (e) {
      console.log('Could not parse response');
    }
  });
}).on('error', (e) => console.error('Backend unreachable:', e.message));