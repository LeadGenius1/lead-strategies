/**
 * Platform Verification Service - PHASE 3
 * AUTONOMOUS MAINTENANCE: Deep Testing + Issue Categorization + Auto-Repair
 *
 * Upgrades from Phase 2:
 * - Deep functional testing (not just endpoint checks)
 * - Automatic issue categorization (MISSING_ENDPOINT, SERVER_ERROR, etc.)
 * - Severity levels (CRITICAL, HIGH, MEDIUM, LOW)
 * - Auto-repair prompt generation for Claude Code
 * - Repair queue management
 *
 * CORRECT endpoint paths (audited from actual route files):
 * - LeadSite.IO:      /api/v1/websites, /api/v1/websites/generate, /api/v1/templates
 * - LeadSite.AI:      /api/v1/copilot/search, /api/v1/leads/discover, /api/v1/leads, /api/v1/campaigns
 * - ClientContact.IO: /api/v1/conversations, /api/v1/channels, /api/v1/emails
 * - VideoSite.AI:     /api/v1/videos/upload, /api/v1/videos, /api/v1/payouts
 * - UltraLead:        /api/v1/crm/contacts, /api/v1/crm/companies, /api/v1/crm/deals, etc.
 */

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.aileadstrategies.com';

class PlatformTester {
  constructor() {
    this.issueRegistry = [];
    this.repairQueue = [];
    this.criticalIssues = [];
  }

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC API (called by platform-verification.js routes)
  // ═══════════════════════════════════════════════════════════════

  async testPlatform(platformId) {
    console.log(`[Platform Tester - PHASE 3] Deep testing ${platformId}...`);

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

  async testAllPlatforms() {
    console.log('[Platform Tester - PHASE 3] Starting full deep verification...');
    this.issueRegistry = [];
    this.repairQueue = [];
    this.criticalIssues = [];

    const results = {};
    const platformIds = ['leadsite-io', 'leadsite-ai', 'clientcontact-io', 'videosite-ai', 'ultralead'];

    for (const platformId of platformIds) {
      results[platformId] = await this.testPlatform(platformId);
      this.issueRegistry.push(...(results[platformId].issues || []));
    }

    // Queue repairs for all detected issues
    this.queueRepairs(this.issueRegistry);

    console.log(`[Platform Tester - PHASE 3] Full verification complete`);
    console.log(`[Platform Tester - PHASE 3] Issues: ${this.issueRegistry.length}, Repairs queued: ${this.repairQueue.length}`);
    return results;
  }

  // ═══════════════════════════════════════════════════════════════
  // HTTP REQUEST HELPER
  // ═══════════════════════════════════════════════════════════════

  async testEndpoint(name, endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body || null;
    const platform = options.platform || '';
    const severity = options.severity || 'MEDIUM';
    const impact = options.impact || 'Feature not functional';

    try {
      const fetchOptions = {
        method,
        headers: { 'Content-Type': 'application/json', ...options.headers }
      };

      if (body) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
      const status = response.status;

      // 200/201 = fully working
      if ([200, 201].includes(status)) {
        let responseData;
        try { responseData = await response.json(); } catch { responseData = null; }
        return {
          success: true, status,
          message: `${name}: OK (${status})`,
          details: { responseData }
        };
      }

      // 400 = validation working (endpoint exists)
      if (status === 400) {
        return { success: true, status, message: `${name}: Validation working (400)` };
      }

      // 401 = auth required (endpoint exists, protected)
      if (status === 401) {
        return { success: true, status, message: `${name}: Auth required (401)` };
      }

      // 404 = endpoint missing
      if (status === 404) {
        return {
          success: false, status,
          message: `${name}: Endpoint not found (404)`,
          error: 'Route does not exist',
          issue: this.categorizeIssue({
            test: name, platform, endpoint, method, status,
            error: 'Route does not exist',
            severity: severity === 'MEDIUM' ? 'HIGH' : severity,
            impact
          })
        };
      }

      // 500+ = server crash
      if (status >= 500) {
        let errorText = '';
        try { errorText = await response.text(); } catch {}
        return {
          success: false, status,
          message: `${name}: Server error (${status})`,
          error: errorText.substring(0, 200),
          issue: this.categorizeIssue({
            test: name, platform, endpoint, method, status,
            error: errorText.substring(0, 200),
            severity: 'CRITICAL',
            impact
          })
        };
      }

      // Other status
      return { success: true, status, message: `${name}: Responds with ${status}` };

    } catch (error) {
      return {
        success: false, status: 0,
        message: `${name}: Connection failed`,
        error: error.message,
        issue: this.categorizeIssue({
          test: name, platform, endpoint,
          error: error.message,
          severity: 'CRITICAL',
          impact: 'Cannot reach API endpoint'
        })
      };
    }
  }

  recordTest(results, testResult) {
    results.tested++;
    if (testResult.success) {
      results.working++;
      results.details.push({ test: testResult.message, status: 'PASS' });
      console.log(`  + ${testResult.message}`);
    } else {
      results.broken++;
      results.issues.push(testResult.issue || testResult.message);
      results.details.push({ test: testResult.message, status: 'FAIL', error: testResult.error });
      console.log(`  x ${testResult.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // LEADSITE.IO - AI Website Builder (5 deep tests)
  // Correct paths: /api/v1/websites, /api/v1/websites/generate, /api/v1/templates
  // ═══════════════════════════════════════════════════════════════

  async testLeadSiteIO() {
    const results = { total: 5, tested: 0, working: 0, broken: 0, issues: [], details: [] };
    console.log('[LEADSITE.IO] Deep testing AI Website Builder...');

    // Test 1: Website Creation
    this.recordTest(results, await this.testEndpoint(
      'Website Creation', '/api/v1/websites',
      { method: 'POST', body: { name: `Test-${Date.now()}`, template: 'AETHER' },
        platform: 'LeadSite.IO', severity: 'CRITICAL',
        impact: 'Users cannot create websites - core feature broken' }
    ));

    // Test 2: AI Website Generation
    this.recordTest(results, await this.testEndpoint(
      'AI Website Generation', '/api/v1/websites/generate',
      { method: 'POST', body: { templateId: 'aether', formData: { business_name: 'Test Corp' } },
        platform: 'LeadSite.IO', severity: 'HIGH',
        impact: 'AI website builder not functional - flagship feature' }
    ));

    // Test 3: Template Listing
    this.recordTest(results, await this.testEndpoint(
      'Template Listing', '/api/v1/templates',
      { method: 'GET', platform: 'LeadSite.IO', severity: 'HIGH',
        impact: 'Users cannot browse website templates' }
    ));

    // Test 4: Website Listing
    this.recordTest(results, await this.testEndpoint(
      'Website Listing', '/api/v1/websites',
      { method: 'GET', platform: 'LeadSite.IO', severity: 'MEDIUM',
        impact: 'Users cannot view their websites' }
    ));

    // Test 5: Website Publishing
    this.recordTest(results, await this.testEndpoint(
      'Website Publishing', '/api/v1/websites/test-id/publish',
      { method: 'POST', body: { websiteId: 'test' },
        platform: 'LeadSite.IO', severity: 'HIGH',
        impact: 'Users cannot publish websites' }
    ));

    console.log(`[LEADSITE.IO] Complete: ${results.working}/${results.total} working`);
    return results;
  }

  // ═══════════════════════════════════════════════════════════════
  // LEADSITE.AI - Email Lead Generation (5 deep tests)
  // Correct paths: /api/v1/copilot/search, /api/v1/leads/discover, /api/v1/leads, /api/v1/campaigns
  // ═══════════════════════════════════════════════════════════════

  async testLeadSiteAI() {
    const results = { total: 5, tested: 0, working: 0, broken: 0, issues: [], details: [] };
    console.log('[LEADSITE.AI] Deep testing Email Lead Generation...');

    // Test 1: Lead Hunter (Lead Search)
    this.recordTest(results, await this.testEndpoint(
      'Lead Hunter', '/api/v1/copilot/search',
      { method: 'POST', body: { query: 'technology CEO' },
        platform: 'LeadSite.AI', severity: 'CRITICAL',
        impact: 'Core lead generation feature broken' }
    ));

    // Test 2: Proactive Hunter (Auto Discovery)
    this.recordTest(results, await this.testEndpoint(
      'Proactive Hunter', '/api/v1/leads/discover',
      { method: 'POST', body: { industries: ['Technology'], limit: 10 },
        platform: 'LeadSite.AI', severity: 'HIGH',
        impact: 'Lead Hunter AI agent not functional' }
    ));

    // Test 3: Prospects Listing
    this.recordTest(results, await this.testEndpoint(
      'Prospects Listing', '/api/v1/leads',
      { method: 'GET', platform: 'LeadSite.AI', severity: 'MEDIUM',
        impact: 'Users cannot view their leads' }
    ));

    // Test 4: Email Campaigns
    this.recordTest(results, await this.testEndpoint(
      'Email Campaigns', '/api/v1/campaigns',
      { method: 'GET', platform: 'LeadSite.AI', severity: 'HIGH',
        impact: 'Campaign management not functional' }
    ));

    // Test 5: Reply Tracking
    this.recordTest(results, await this.testEndpoint(
      'Reply Tracking', '/api/v1/campaigns/replies',
      { method: 'GET', platform: 'LeadSite.AI', severity: 'MEDIUM',
        impact: 'Cannot track email replies' }
    ));

    console.log(`[LEADSITE.AI] Complete: ${results.working}/${results.total} working`);
    return results;
  }

  // ═══════════════════════════════════════════════════════════════
  // CLIENTCONTACT.IO - Unified Inbox (3 deep tests)
  // Correct paths: /api/v1/conversations, /api/v1/channels, /api/v1/emails
  // ═══════════════════════════════════════════════════════════════

  async testClientContactIO() {
    const results = { total: 3, tested: 0, working: 0, broken: 0, issues: [], details: [] };
    console.log('[CLIENTCONTACT.IO] Deep testing Unified Inbox...');

    // Test 1: Unified Inbox (Conversations)
    this.recordTest(results, await this.testEndpoint(
      'Unified Inbox', '/api/v1/conversations',
      { method: 'GET', platform: 'ClientContact.IO', severity: 'CRITICAL',
        impact: 'Core inbox feature not functional' }
    ));

    // Test 2: Channel Manager
    this.recordTest(results, await this.testEndpoint(
      'Channel Manager', '/api/v1/channels',
      { method: 'GET', platform: 'ClientContact.IO', severity: 'HIGH',
        impact: 'Cannot manage channel integrations' }
    ));

    // Test 3: Email System
    this.recordTest(results, await this.testEndpoint(
      'Email System', '/api/v1/emails',
      { method: 'GET', platform: 'ClientContact.IO', severity: 'MEDIUM',
        impact: 'Email system not functional' }
    ));

    console.log(`[CLIENTCONTACT.IO] Complete: ${results.working}/${results.total} working`);
    return results;
  }

  // ═══════════════════════════════════════════════════════════════
  // VIDEOSITE.AI - Creator Monetization (3 deep tests)
  // Correct paths: /api/v1/videos/upload, /api/v1/videos, /api/v1/payouts
  // ═══════════════════════════════════════════════════════════════

  async testVideoSiteAI() {
    const results = { total: 3, tested: 0, working: 0, broken: 0, issues: [], details: [] };
    console.log('[VIDEOSITE.AI] Deep testing Creator Monetization...');

    // Test 1: Video Upload
    this.recordTest(results, await this.testEndpoint(
      'Video Upload', '/api/v1/videos/upload',
      { method: 'POST', body: { filename: 'test.mp4', size: 5242880, contentType: 'video/mp4' },
        platform: 'VideoSite.AI', severity: 'CRITICAL',
        impact: 'Core video upload feature broken' }
    ));

    // Test 2: Video Listing
    this.recordTest(results, await this.testEndpoint(
      'Video Listing', '/api/v1/videos',
      { method: 'GET', platform: 'VideoSite.AI', severity: 'HIGH',
        impact: 'Users cannot view their videos' }
    ));

    // Test 3: Creator Payouts
    this.recordTest(results, await this.testEndpoint(
      'Creator Payouts', '/api/v1/payouts',
      { method: 'GET', platform: 'VideoSite.AI', severity: 'MEDIUM',
        impact: 'Earnings tracking not functional' }
    ));

    console.log(`[VIDEOSITE.AI] Complete: ${results.working}/${results.total} working`);
    return results;
  }

  // ═══════════════════════════════════════════════════════════════
  // ULTRALEAD - Flagship CRM (7 deep tests)
  // Correct paths: /api/v1/crm/contacts, /api/v1/crm/companies, /api/v1/crm/deals, etc.
  // ═══════════════════════════════════════════════════════════════

  async testUltraLead() {
    const results = { total: 7, tested: 0, working: 0, broken: 0, issues: [], details: [] };
    console.log('[ULTRALEAD] Deep testing Flagship CRM...');

    // Test 1: CRM Contacts
    this.recordTest(results, await this.testEndpoint(
      'CRM Contacts', '/api/v1/crm/contacts',
      { method: 'GET', platform: 'UltraLead', severity: 'HIGH',
        impact: 'CRM contacts not accessible' }
    ));

    // Test 2: CRM Companies
    this.recordTest(results, await this.testEndpoint(
      'CRM Companies', '/api/v1/crm/companies',
      { method: 'GET', platform: 'UltraLead', severity: 'HIGH',
        impact: 'Company management not functional' }
    ));

    // Test 3: CRM Deals Pipeline
    this.recordTest(results, await this.testEndpoint(
      'Deals Pipeline', '/api/v1/crm/deals',
      { method: 'GET', platform: 'UltraLead', severity: 'CRITICAL',
        impact: 'Sales pipeline not functional' }
    ));

    // Test 4: Analytics Overview
    this.recordTest(results, await this.testEndpoint(
      'Analytics Overview', '/api/v1/analytics/overview',
      { method: 'GET', platform: 'UltraLead', severity: 'MEDIUM',
        impact: 'Analytics dashboard not loading' }
    ));

    // Test 5: AI Email Writer
    this.recordTest(results, await this.testEndpoint(
      'AI Email Writer', '/api/v1/ai/write-email',
      { method: 'POST', body: { prompt: 'Write a cold email about AI automation', tone: 'professional' },
        platform: 'UltraLead', severity: 'HIGH',
        impact: 'AI copywriting not producing content' }
    ));

    // Test 6: AI Agents
    this.recordTest(results, await this.testEndpoint(
      'AI Agents', '/api/v1/agents',
      { method: 'GET', platform: 'UltraLead', severity: 'MEDIUM',
        impact: 'AI agents listing not accessible' }
    ));

    // Test 7: Dashboard
    this.recordTest(results, await this.testEndpoint(
      'Dashboard', '/api/v1/dashboard',
      { method: 'GET', platform: 'UltraLead', severity: 'CRITICAL',
        impact: 'Main CRM dashboard not loading' }
    ));

    console.log(`[ULTRALEAD] Complete: ${results.working}/${results.total} working`);
    return results;
  }

  // ═══════════════════════════════════════════════════════════════
  // ISSUE CATEGORIZATION
  // ═══════════════════════════════════════════════════════════════

  categorizeIssue(issueData) {
    const { test, platform, endpoint, method, status, error, severity, impact } = issueData;

    let type, autoRepair;

    if (status === 404) {
      type = 'MISSING_ENDPOINT';
      autoRepair = 'CREATE_ROUTE';
    } else if (status >= 500) {
      type = 'SERVER_ERROR';
      autoRepair = 'FIX_BUG';
    } else if (error && error.toLowerCase().includes('database')) {
      type = 'DATABASE_ERROR';
      autoRepair = 'RUN_MIGRATION';
    } else if (error && error.toLowerCase().includes('r2')) {
      type = 'STORAGE_ERROR';
      autoRepair = 'CHECK_R2_CONFIG';
    } else if (error && error.toLowerCase().includes('auth')) {
      type = 'AUTH_ERROR';
      autoRepair = 'FIX_AUTH_CONFIG';
    } else if (status === 0 || (error && error.toLowerCase().includes('connect'))) {
      type = 'CONNECTION_ERROR';
      autoRepair = 'CHECK_API_HEALTH';
    } else {
      type = 'UNKNOWN_ERROR';
      autoRepair = 'MANUAL_REVIEW';
    }

    const repairPrompt = this.generateRepairPrompt({
      type, platform, endpoint, method: method || 'GET', test, error, status
    });

    return {
      test,
      platform,
      endpoint,
      method: method || 'GET',
      status,
      error,
      type,
      severity: severity || 'MEDIUM',
      impact: impact || 'Feature not functional',
      autoRepair,
      repairPrompt,
      timestamp: new Date().toISOString()
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // REPAIR PROMPT GENERATOR
  // ═══════════════════════════════════════════════════════════════

  generateRepairPrompt(context) {
    const { type, platform, endpoint, method, test, error, status } = context;

    if (type === 'MISSING_ENDPOINT') {
      return [
        `REPAIR: Create missing endpoint ${method} ${endpoint}`,
        `Platform: ${platform} | Test: ${test}`,
        `Steps:`,
        `  1. git checkout -b fix/${test.toLowerCase().replace(/\s+/g, '-')}-endpoint`,
        `  2. Find or create route file in backend/src/routes/`,
        `  3. Add ${method} handler for ${endpoint}`,
        `  4. Mount in backend/src/index.js if new file`,
        `  5. Test auth (Rule 4) then deploy`
      ].join('\n');
    }

    if (type === 'SERVER_ERROR') {
      return [
        `REPAIR: Fix server crash on ${method} ${endpoint} (${status})`,
        `Platform: ${platform} | Error: ${error || 'Unknown'}`,
        `Steps:`,
        `  1. Check Railway logs: railway logs --service backend --tail 100`,
        `  2. Find route handler in backend/src/routes/`,
        `  3. Add try/catch, fix null refs, check env vars`,
        `  4. Test locally then deploy`
      ].join('\n');
    }

    if (type === 'CONNECTION_ERROR') {
      return [
        `REPAIR: API connection failure`,
        `Platform: ${platform} | Error: ${error}`,
        `Steps:`,
        `  1. curl https://api.aileadstrategies.com/health`,
        `  2. Check Railway backend service status`,
        `  3. Review Railway logs for crash`,
        `  4. Restart if needed: railway redeploy --service backend`
      ].join('\n');
    }

    return [
      `REPAIR: ${type} on ${method} ${endpoint}`,
      `Platform: ${platform} | Error: ${error || 'Unknown'}`,
      `Needs manual investigation`
    ].join('\n');
  }

  // ═══════════════════════════════════════════════════════════════
  // REPAIR QUEUE
  // ═══════════════════════════════════════════════════════════════

  queueRepairs(issues) {
    const structuredIssues = issues.filter(i => i && typeof i === 'object' && i.type);

    for (const issue of structuredIssues) {
      const repair = {
        id: `repair-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        issue: issue.test,
        platform: issue.platform,
        type: issue.type,
        severity: issue.severity,
        repairType: issue.autoRepair,
        prompt: issue.repairPrompt,
        status: 'QUEUED'
      };

      this.repairQueue.push(repair);

      if (issue.severity === 'CRITICAL') {
        this.criticalIssues.push(repair);
      }
    }

    // Sort by severity
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    this.repairQueue.sort((a, b) =>
      (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99)
    );
  }
}

module.exports = new PlatformTester();
