/**
 * Frontend Verification Script
 * Run this to verify the frontend setup is correct
 * 
 * Usage: node scripts/verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Frontend Setup...\n');

const checks = [];
let passed = 0;
let failed = 0;

// Check 1: NextAuth setup
console.log('1. Checking NextAuth setup...');
const nextAuthFiles = [
  'app/api/auth/[...nextauth]/route.ts',
  'app/api/backend-token/route.ts',
];

nextAuthFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
    passed++;
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    failed++;
  }
});

// Check 2: API client
console.log('\n2. Checking API client...');
const apiFiles = [
  'lib/api-client.ts',
];

apiFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
    passed++;
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    failed++;
  }
});

// Check 3: Footer component
console.log('\n3. Checking Footer component...');
const footerPath = path.join(__dirname, '..', 'components/Footer.js');
if (fs.existsSync(footerPath)) {
  const footerContent = fs.readFileSync(footerPath, 'utf8');
  if (footerContent.includes('GDPR Compliance') && footerContent.includes('CCPA Compliance')) {
    console.log('   ✅ Footer.js - Updated with compliance links');
    passed++;
  } else {
    console.log('   ⚠️  Footer.js - Exists but may need compliance links');
    failed++;
  }
} else {
  console.log('   ❌ Footer.js - MISSING');
  failed++;
}

// Check 4: Landing pages
console.log('\n4. Checking landing pages...');
const landingPages = [
  'app/leadsite-ai/page.js',
  'app/leadsite-io/page.js',
  'app/clientcontact-io/page.js',
  'app/tackle-io/page.js', // legacy redirect to clientcontact-io
];

landingPages.forEach(page => {
  const filePath = path.join(__dirname, '..', page);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${page}`);
    passed++;
  } else {
    console.log(`   ❌ ${page} - MISSING`);
    failed++;
  }
});

// Check 5: Deployment files
console.log('\n5. Checking deployment files...');
const deployFiles = [
  '.github/workflows/railway-deploy.yml',
  'package.json',
];

deployFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
    passed++;
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    failed++;
  }
});

// Check 6: Package.json dependencies
console.log('\n6. Checking dependencies...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = ['next-auth', '@next-auth/prisma-adapter', 'jsonwebtoken'];
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  requiredDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`   ✅ ${dep} - Installed`);
      passed++;
    } else {
      console.log(`   ❌ ${dep} - NOT INSTALLED (run: npm install)`);
      failed++;
    }
  });
} else {
  console.log('   ❌ package.json - MISSING');
  failed++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('\n🎉 All checks passed! Frontend setup is complete.');
  console.log('\nNext steps:');
  console.log('1. Run: npm install (to install new dependencies)');
  console.log('2. Set environment variables in Railway');
  console.log('3. Deploy to Railway');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please review and fix.');
  process.exit(1);
}
