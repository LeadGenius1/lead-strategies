/**
 * End-to-End Test Script
 * Run this script to test all features of the platform
 * 
 * Usage: node scripts/e2e-test.js <base-url>
 * Example: node scripts/e2e-test.js https://aileadstrategies.com
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

let authToken = null;
let userId = null;
let leadId = null;
let campaignId = null;

async function test(name, fn) {
  process.stdout.write(`Testing ${name}... `);
  try {
    await fn();
    console.log(`${colors.green}✓${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset}`);
    console.error(`  Error: ${error.message}`);
    return false;
  }
}

async function request(method, path, body = null, useAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (useAuth && authToken) {
    headers['Cookie'] = `auth-token=${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
  }
  
  const data = await response.json();
  
  // Handle different response formats
  if (!response.ok) {
    const errorMsg = data.error || data.message || data.status || `HTTP ${response.status}`;
    throw new Error(errorMsg);
  }

  return { response, data };
}

async function runTests() {
  console.log(`${colors.cyan}Starting End-to-End Tests${colors.reset}`);
  console.log(`Base URL: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  const healthTest = await test('Health Check', async () => {
    const { data } = await request('GET', '/api/health', null, false);
    if (data.status !== 'ok') throw new Error('Health check failed');
  });
  healthTest ? passed++ : failed++;

  // Test 2: Signup
  const signupTest = await test('User Signup', async () => {
    const email = `test-${Date.now()}@example.com`;
    const { data } = await request('POST', '/api/auth/signup', {
      firstName: 'Test',
      lastName: 'User',
      email,
      password: 'Test1234!',
      companyName: 'Test Company',
      tier: 'leadsite-io',
    }, false);
    
    // Handle both success:true and status:ok formats
    if (data.success === false || (data.status && data.status !== 'ok')) {
      throw new Error(data.error || data.message || 'Signup failed');
    }
    userId = data.data?.id || data.user?.id || data.id;
  });
  signupTest ? passed++ : failed++;

  // Test 3: Login
  const loginTest = await test('User Login', async () => {
    const email = `test-${Date.now() - 1000}@example.com`;
    // First signup
    await request('POST', '/api/auth/signup', {
      firstName: 'Test',
      lastName: 'User',
      email,
      password: 'Test1234!',
      companyName: 'Test Company',
      tier: 'leadsite-io',
    }, false);
    
    // Then login
    const { response, data } = await request('POST', '/api/auth/login', {
      email,
      password: 'Test1234!',
    }, false);
    
    // Handle both success:true and status:ok formats
    if (data.success === false || (data.status && data.status !== 'ok')) {
      throw new Error(data.error || data.message || 'Login failed');
    }
    
    // Extract token from Set-Cookie header
    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      const match = cookies.match(/auth-token=([^;]+)/);
      if (match) authToken = match[1];
    }
  });
  loginTest ? passed++ : failed++;

  // Test 4: Get Current User
  const meTest = await test('Get Current User', async () => {
    const { data } = await request('GET', '/api/auth/me');
    if (!data.success || !data.data) throw new Error('Failed to get user');
    userId = data.data.id;
  });
  meTest ? passed++ : failed++;

  // Test 5: Create Lead
  const createLeadTest = await test('Create Lead', async () => {
    const { data } = await request('POST', '/api/leads', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Example Corp',
      status: 'new',
    });
    if (!data.success) throw new Error('Failed to create lead');
    leadId = data.data?.id;
  });
  createLeadTest ? passed++ : failed++;

  // Test 6: Get Leads
  const getLeadsTest = await test('Get Leads List', async () => {
    const { data } = await request('GET', '/api/leads');
    if (!data.success) throw new Error('Failed to get leads');
  });
  getLeadsTest ? passed++ : failed++;

  // Test 7: Update Lead
  const updateLeadTest = await test('Update Lead', async () => {
    if (!leadId) throw new Error('No lead ID available');
    const { data } = await request('PUT', `/api/leads/${leadId}`, {
      status: 'contacted',
    });
    if (!data.success) throw new Error('Failed to update lead');
  });
  updateLeadTest ? passed++ : failed++;

  // Test 8: Create Campaign
  const createCampaignTest = await test('Create Campaign', async () => {
    const { data } = await request('POST', '/api/campaigns', {
      name: 'Test Campaign',
      subject: 'Test Subject',
      template: 'Test email body',
      status: 'draft',
      leadIds: leadId ? [leadId] : [],
      recipientCount: 1,
    });
    if (!data.success) throw new Error('Failed to create campaign');
    campaignId = data.data?.id;
  });
  createCampaignTest ? passed++ : failed++;

  // Test 9: Get Campaigns
  const getCampaignsTest = await test('Get Campaigns List', async () => {
    const { data } = await request('GET', '/api/campaigns');
    if (!data.success) throw new Error('Failed to get campaigns');
  });
  getCampaignsTest ? passed++ : failed++;

  // Test 10: Update Profile
  const updateProfileTest = await test('Update Profile', async () => {
    const { data } = await request('PUT', '/api/user/profile', {
      firstName: 'Updated',
      lastName: 'Name',
    });
    if (!data.success) throw new Error('Failed to update profile');
  });
  updateProfileTest ? passed++ : failed++;

  // Test 11: Get Analytics
  const analyticsTest = await test('Get Analytics', async () => {
    const { data } = await request('GET', '/api/analytics');
    if (!data.success) throw new Error('Failed to get analytics');
  });
  analyticsTest ? passed++ : failed++;

  // Test 12: Logout
  const logoutTest = await test('Logout', async () => {
    const { data } = await request('POST', '/api/auth/logout');
    if (!data.success) throw new Error('Logout failed');
    authToken = null;
  });
  logoutTest ? passed++ : failed++;

  // Summary
  console.log(`\n${colors.cyan}Test Summary:${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${passed + failed}`);

  if (failed === 0) {
    console.log(`\n${colors.green}✅ All tests passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}❌ Some tests failed${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
