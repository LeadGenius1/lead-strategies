#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const invalidPaths = [
  'C:\\Users\\ailea\\Documents\\lead-strategies',
  'C:\\Users\\ailea\\lead-strategies-build'
];
console.log('Checking for duplicate codebases...');
invalidPaths.forEach(p => {
  if (fs.existsSync(p)) {
    console.log('  Found:', p, '(consider archiving/deleting)');
  } else {
    console.log('  Not found:', p);
  }
});
console.log('Run with --execute to archive (not implemented - manual step)');