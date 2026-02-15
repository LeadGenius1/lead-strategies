#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const expectedDir = path.basename(process.cwd());
if (expectedDir !== 'lead-strategies-repo') {
  console.error('Wrong directory. Run from lead-strategies-repo');
  process.exit(1);
}
const manifest = path.join(process.cwd(), 'PROJECT-MANIFEST.json');
const sot = path.join(process.cwd(), '.source-of-truth.json');
if (!fs.existsSync(manifest) && !fs.existsSync(sot)) {
  console.error('PROJECT-MANIFEST.json or .source-of-truth.json not found');
  process.exit(1);
}
console.log('SOURCE OF TRUTH VERIFIED!');
console.log('SAFE TO PROCEED WITH CHANGES!');