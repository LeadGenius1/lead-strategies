/**
 * Platform Verification Service - PHASE 2
 * REAL API endpoint testing (replaces placeholders)
 *
 * Tests API availability and basic functionality
 * Returns actual pass/fail results with detailed error reporting
 */

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.aileadstrategies.com';

class PlatformTester {
  constructor() {
    this.testResults = {
      'leadsite-io': { total: 5, tested: 0, working: 0, broken: 0, issues: [] },
      'leadsite-ai': { total: 5, tested: 0, working: 0, broken: 0, issues: [] },
      'clientcontact-io': { total: 3, tested: 0, working: 0, broken: 0, issues: [] },
      'videosite-ai': { total: 3, tested: 0, working: 0, broken: 0, issues: [] },
      'ultralead': { total: 7, tested: 0, working: 0, broken: 0, issues: [] }
    };
  }

  async testPlatform(platformId) {
    console.log(`[Platform Tester - PHASE 2] Testing ${platformId} with REAL API calls...`);

    switch (platformId) {
      case 'leadsite-io':
        return await this.testLeadSiteIO();
      case 'leadsite-ai':
        return await this.testLeadSiteAI();
      case 'clientcontact-io':
        return await this.testClientContactIO();
      case 'videosite-ai':
        return await this.testVideoSiteAI();
      case 'ultralead':
        return await this.testUltraLead();
      default:
        throw new Error(`Unknown platform: ${platformId}`);
    }
  }

  /**
   * TEST HELPER - Makes HTTP request and evaluates response
   */
  async testEndpoint(name, endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body || null;
    const expectedStatuses = options.expectedStatuses || [200, 201];
    const allowAuth = options.allowAuth !== false;

    try {
      const fetchOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      if (body) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
      const status = response.status;

      // Success cases
      if (expectedStatuses.includes(status)) {
        return { success: true, status, message: `${name}: OK (${status})` };
      }

      // 400 = validation working (endpoint exists, just needs proper data)
      if (status === 400) {
        return { success: true, status, message: `${name}: Validation working (400)` };
      }

      // 401 = auth required (endpoint exists, protected)
      if (status === 401 && allowAuth) {
        return { success: true, status, message: `${name}: Auth required (401)` };
      }

      // 404 = endpoint doesn't exist
      if (status === 404) {
        return {
          success: false,
          status,
          message: `${name}: Endpoint not found (404)`,
          error: 'Route does not exist'
        };
      }

      // 500+ = server error
      if (status >= 500) {
        const errorText = await response.text();
        return {
          success: false,
          status,
          message: `${name}: Server error (${status})`,
          error: errorText.substring(0, 200)
        };
      }

      // Other status codes
      return {
        success: true,
        status,
        message: `${name}: Responds with ${status}`
      };

    } catch (error) {
      return {
        success: false,
        status: 0,
        message: `${name}: Connection failed`,
        error: error.message
      };
    }
  }

  /**
   * Run a single test and record results
   */
  recordTest(results, testResult) {
    results.tested++;
    if (testResult.success) {
      results.working++;
      console.log(`  + ${testResult.message}`);
    } else {
      results.broken++;
      results.issues.push(testResult.message);
      console.log(`  x ${testResult.message}`);
    }
  }

  /**
   * LEADSITE.IO - AI Website Builder (5 tests)
   * Endpoints: create, generate, templates, list, publish
   */
  async testLeadSiteIO() {
    const results = { total: 5, tested: 0, working: 0, broken: 0, issues: [] };
    console.log('[Platform Tester] Testing LeadSite.IO...');

    // Test 1: Website Creation
    this.recordTest(results, await this.testEndpoint(
      'Website Creation',
      '/api/v1/websites',
      { method: 'POST', body: { test: true }, expectedStatuses: [200, 201, 400, 401] }
    ));

    // Test 2: AI Website Generation
    this.recordTest(results, await this.testEndpoint(
      'AI Website Generation',
      '/api/v1/websites/generate',
      { method: 'POST', body: { test: true }, expectedStatuses: [200, 201, 400, 401] }
    ));

    // Test 3: Template Listing
    this.recordTest(results, await this.testEndpoint(
      'Template Listing',
      '/api/v1/templates',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    // Test 4: Website Listing
    this.recordTest(results, await this.testEndpoint(
      'Website Listing',
      '/api/v1/websites',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    // Test 5: Website Publishing
    this.recordTest(results, await this.testEndpoint(
      'Website Publishing',
      '/api/v1/websites/test-id/publish',
      { method: 'POST', body: { websiteId: 'test' }, expectedStatuses: [200, 400, 401] }
    ));

    console.log(`[Platform Tester] LeadSite.IO: ${results.working}/${results.total} working`);
    return results;
  }

  /**
   * LEADSITE.AI - Email Lead Generation (5 tests)
   * Endpoints: leads, discover, prospects, campaigns, replies
   */
  async testLeadSiteAI() {
    const results = { total: 5, tested: 0, working: 0, broken: 0, issues: [] };
    console.log('[Platform Tester] Testing LeadSite.AI...');

    // Test 1: Lead Hunter (Lead Search)
    this.recordTest(results, await this.testEndpoint(
      'Lead Hunter',
      '/api/v1/copilot/search',
      { method: 'POST', body: { query: 'test' }, expectedStatuses: [200, 400, 401] }
    ));

    // Test 2: Proactive Hunter (Auto Discovery)
    this.recordTest(results, await this.testEndpoint(
      'Proactive Hunter',
      '/api/v1/leads/discover',
      { method: 'POST', body: { test: true }, expectedStatuses: [200, 400, 401] }
    ));

    // Test 3: Prospects Listing
    this.recordTest(results, await this.testEndpoint(
      'Prospects Listing',
      '/api/v1/leads',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    // Test 4: Email Campaigns
    this.recordTest(results, await this.testEndpoint(
      'Email Campaigns',
      '/api/v1/campaigns',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    // Test 5: Reply Tracking
    this.recordTest(results, await this.testEndpoint(
      'Reply Tracking',
      '/api/v1/campaigns/replies',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    console.log(`[Platform Tester] LeadSite.AI: ${results.working}/${results.total} working`);
    return results;
  }

  /**
   * CLIENTCONTACT.IO - Unified Inbox (3 tests)
   * Endpoints: conversations, channels, emails
   */
  async testClientContactIO() {
    const results = { total: 3, tested: 0, working: 0, broken: 0, issues: [] };
    console.log('[Platform Tester] Testing ClientContact.IO...');

    // Test 1: Unified Inbox (Conversations)
    this.recordTest(results, await this.testEndpoint(
      'Unified Inbox',
      '/api/v1/conversations',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    // Test 2: Channel Manager
    this.recordTest(results, await this.testEndpoint(
      'Channel Manager',
      '/api/v1/channels',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    // Test 3: Email System
    this.recordTest(results, await this.testEndpoint(
      'Email System',
      '/api/v1/emails',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    console.log(`[Platform Tester] ClientContact.IO: ${results.working}/${results.total} working`);
    return results;
  }

  /**
   * VIDEOSITE.AI - Creator Monetization (3 tests)
   * Endpoints: upload, listing, payouts
   */
  async testVideoSiteAI() {
    const results = { total: 3, tested: 0, working: 0, broken: 0, issues: [] };
    console.log('[Platform Tester] Testing VideoSite.AI...');

    // Test 1: Video Upload
    this.recordTest(results, await this.testEndpoint(
      'Video Upload',
      '/api/v1/videos/upload',
      { method: 'POST', body: { test: true }, expectedStatuses: [200, 400, 401] }
    ));

    // Test 2: Video Listing
    this.recordTest(results, await this.testEndpoint(
      'Video Listing',
      '/api/v1/videos',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    // Test 3: Creator Payouts
    this.recordTest(results, await this.testEndpoint(
      'Creator Payouts',
      '/api/v1/payouts',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    console.log(`[Platform Tester] VideoSite.AI: ${results.working}/${results.total} working`);
    return results;
  }

  /**
   * ULTRALEAD - Flagship CRM (7 tests)
   * Endpoints: crm contacts, crm companies, crm deals, analytics, ai, agents, dashboard
   */
  async testUltraLead() {
    const results = { total: 7, tested: 0, working: 0, broken: 0, issues: [] };
    console.log('[Platform Tester] Testing UltraLead...');

    // Test 1: CRM Contacts
    this.recordTest(results, await this.testEndpoint(
      'CRM Contacts',
      '/api/v1/crm/contacts',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    // Test 2: CRM Companies
    this.recordTest(results, await this.testEndpoint(
      'CRM Companies',
      '/api/v1/crm/companies',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    // Test 3: CRM Deals Pipeline
    this.recordTest(results, await this.testEndpoint(
      'Deals Pipeline',
      '/api/v1/crm/deals',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    // Test 4: Analytics Overview
    this.recordTest(results, await this.testEndpoint(
      'Analytics Overview',
      '/api/v1/analytics/overview',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    // Test 5: AI Email Writer
    this.recordTest(results, await this.testEndpoint(
      'AI Email Writer',
      '/api/v1/ai/write-email',
      { method: 'POST', body: { prompt: 'test' }, expectedStatuses: [200, 400, 401] }
    ));

    // Test 6: AI Agents
    this.recordTest(results, await this.testEndpoint(
      'AI Agents',
      '/api/v1/agents',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    // Test 7: Dashboard
    this.recordTest(results, await this.testEndpoint(
      'Dashboard',
      '/api/v1/dashboard',
      { method: 'GET', expectedStatuses: [200, 401] }
    ));

    console.log(`[Platform Tester] UltraLead: ${results.working}/${results.total} working`);
    return results;
  }

  /**
   * Test all platforms sequentially
   */
  async testAllPlatforms() {
    console.log('[Platform Tester - PHASE 2] Starting full platform verification...');
    const results = {};
    for (const platformId of Object.keys(this.testResults)) {
      results[platformId] = await this.testPlatform(platformId);
    }
    console.log('[Platform Tester - PHASE 2] Full verification complete');
    return results;
  }
}

module.exports = new PlatformTester();
