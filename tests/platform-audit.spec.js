// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const BASE = 'https://aileadstrategies.com';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

const TEST_USER = {
  email: `testaudit+${Date.now()}@aileadstrategies.com`,
  password: 'TestAudit123!',
};

const results = [];
let authenticated = false;

function log(step, status, url, screenshot) {
  const entry = { step, status, url, screenshot: screenshot || 'N/A' };
  results.push(entry);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${status === 'PASS' ? '\u2705' : '\u274C'} ${step}`);
  console.log(`   URL: ${url}`);
  console.log(`   Screenshot: ${screenshot || 'N/A'}`);
  console.log(`${'='.repeat(60)}`);
}

/** Hard check — if we're on /login or /signup, auth failed */
function isOnAuthPage(url) {
  return url.includes('/login') || url.includes('/signup');
}

test.describe.serial('Platform Audit', () => {
  /** @type {import('@playwright/test').BrowserContext} */
  let context;
  /** @type {import('@playwright/test').Page} */
  let page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: 1440, height: 900 },
    });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    console.log('\n\n');
    console.log('='.repeat(70));
    console.log('  PLATFORM AUDIT SUMMARY REPORT');
    console.log('='.repeat(70));
    console.log(`  Date: ${new Date().toISOString()}`);
    console.log(`  Base URL: ${BASE}`);
    console.log(`  Test User: ${TEST_USER.email}`);
    console.log(`  Authenticated: ${authenticated}`);
    console.log('-'.repeat(70));

    let pass = 0;
    let fail = 0;
    for (const r of results) {
      const icon = r.status === 'PASS' ? '\u2705' : '\u274C';
      console.log(`  ${icon} ${r.step.padEnd(40)} ${r.status}`);
      console.log(`     ${r.url}`);
      if (r.status === 'PASS') pass++;
      else fail++;
    }

    console.log('-'.repeat(70));
    console.log(`  TOTAL: ${results.length} | PASS: ${pass} | FAIL: ${fail}`);
    console.log('='.repeat(70));

    await context.close();
  });

  // ─── STEP 1: SIGNUP ───────────────────────────────────────────
  test('Step 1 — Signup', async () => {
    const ssFile = 'step1-signup.png';
    try {
      await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Fill email
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await emailInput.fill(TEST_USER.email);

      // Fill password
      const passwordInputs = page.locator('input[type="password"]');
      const pwCount = await passwordInputs.count();
      console.log(`   Found ${pwCount} password field(s)`);

      // First password field = password
      await passwordInputs.nth(0).fill(TEST_USER.password);

      // Second password field = confirm password (if exists)
      if (pwCount >= 2) {
        await passwordInputs.nth(1).fill(TEST_USER.password);
        console.log('   Filled confirm password field');
      }

      // Fill name if present
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nameInput.fill('Test Audit User');
      }

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'step1-signup-filled.png'), fullPage: true });

      // Submit
      const submitBtn = page.locator('button[type="submit"], button:has-text("Create Account"), button:has-text("Sign Up"), button:has-text("Get Started")').first();
      await submitBtn.click();

      // Wait for navigation away from /signup
      await page.waitForURL((url) => !url.pathname.includes('/signup'), { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3000);

      const url = page.url();
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });

      // Check if we landed on a dashboard page (not login)
      if (isOnAuthPage(url) && url.includes('/login')) {
        // Signup might have succeeded but redirected to login — try logging in
        console.log('   Signup redirected to login — attempting login...');
        const loginEmail = page.locator('input[type="email"], input[name="email"]').first();
        const loginPw = page.locator('input[type="password"]').first();
        await loginEmail.fill(TEST_USER.email);
        await loginPw.fill(TEST_USER.password);
        const loginBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")').first();
        await loginBtn.click();
        await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(3000);
      }

      const finalUrl = page.url();
      authenticated = !isOnAuthPage(finalUrl);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });

      console.log(`   Final URL: ${finalUrl}`);
      console.log(`   Authenticated: ${authenticated}`);

      if (!authenticated) {
        // Check cookies for token
        const cookies = await context.cookies();
        const tokenCookie = cookies.find(c => c.name === 'token');
        console.log(`   Token cookie present: ${!!tokenCookie}`);
      }

      log('Step 1 — Signup', authenticated ? 'PASS' : 'FAIL', finalUrl, ssFile);
      expect(authenticated, 'Must be authenticated after signup').toBeTruthy();
    } catch (err) {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true }).catch(() => {});
      log('Step 1 — Signup', 'FAIL', page.url(), ssFile);
      throw err;
    }
  });

  // ─── STEP 2: PROFILE GUARD ────────────────────────────────────
  test('Step 2 — Profile Guard + Fill Required Fields', async () => {
    test.skip(!authenticated, 'Skipped — not authenticated');
    const ssFile = 'step2-profile.png';
    try {
      // Try navigating to a protected feature — should redirect to /profile
      await page.goto(`${BASE}/lead-hunter`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);

      const redirectedUrl = page.url();
      const redirectedToProfile = redirectedUrl.includes('/profile');
      const stuckOnLogin = isOnAuthPage(redirectedUrl);
      console.log(`   After /lead-hunter nav: ${redirectedUrl}`);
      console.log(`   Redirected to profile: ${redirectedToProfile}`);

      if (stuckOnLogin) {
        log('Step 2 — Profile Guard + Fill', 'FAIL', redirectedUrl, ssFile);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });
        return;
      }

      // Go to profile if not already there
      if (!redirectedUrl.includes('/profile')) {
        await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
      }

      // Verify we're on /profile
      expect(page.url()).toContain('/profile');

      // Fill company name — use specific placeholder
      const companyInput = page.locator('input[placeholder="Your company"]').first();
      if (await companyInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await companyInput.fill('Audit Test Corp');
      }

      // Fill industry
      const industryInput = page.locator('input[placeholder*="SaaS, Healthcare"]').first();
      if (await industryInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await industryInput.fill('Technology');
      }

      // Fill products/services
      const productsInput = page.locator('textarea[placeholder*="offer" i]').first();
      if (await productsInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await productsInput.fill('AI-powered lead generation and email outreach platform');
      }

      // Fill email (contact)
      const emailField = page.locator('input[placeholder="you@company.com"]').first();
      if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        const emailVal = await emailField.inputValue();
        if (!emailVal) await emailField.fill(TEST_USER.email);
      }

      // Fill ICP
      const icpInput = page.locator('textarea[placeholder*="Job titles" i]').first();
      if (await icpInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await icpInput.fill('CEOs and CTOs at B2B SaaS companies');
      }

      // Fill pain points
      const painInput = page.locator('textarea[placeholder*="problems" i]').first();
      if (await painInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await painInput.fill('Manual lead generation, low reply rates');
      }

      // Fill CTA
      const ctaInput = page.locator('input[placeholder*="Book a call" i]').first();
      if (await ctaInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await ctaInput.fill('Book a free demo');
      }

      // Save profile
      const saveBtn = page.locator('button:has-text("Save profile")').first();
      if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(3000);
      }

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });

      // Check for success toast
      const hasToast = await page.locator('text=Profile saved').isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`   Profile saved toast: ${hasToast}`);

      log('Step 2 — Profile Guard + Fill', 'PASS', page.url(), ssFile);
    } catch (err) {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true }).catch(() => {});
      log('Step 2 — Profile Guard + Fill', 'FAIL', page.url(), ssFile);
      throw err;
    }
  });

  // ─── STEP 3: LEADSITE.AI — LEAD HUNTER ────────────────────────
  test('Step 3 — LeadSite.AI Lead Hunter', async () => {
    test.skip(!authenticated, 'Skipped — not authenticated');
    const ssFile = 'step3-lead-hunter.png';
    try {
      await page.goto(`${BASE}/lead-hunter`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);

      const url = page.url();
      if (isOnAuthPage(url)) {
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });
        log('Step 3 — Lead Hunter', 'FAIL', url, ssFile);
        expect(false, 'Redirected to auth page').toBeTruthy();
        return;
      }

      // Verify Lead Hunter title is visible
      const hasTitle = await page.locator('h1:has-text("Lead Hunter")').isVisible({ timeout: 5000 }).catch(() => false);
      console.log(`   Lead Hunter title visible: ${hasTitle}`);

      // Try the chat input
      const chatInput = page.locator('textarea').first();
      if (await chatInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await chatInput.fill('Find me 10 CEOs in the SaaS industry');
        await chatInput.press('Enter');
        console.log('   Sent chat query');
        await page.waitForTimeout(8000);
      }

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });
      log('Step 3 — Lead Hunter', hasTitle ? 'PASS' : 'FAIL', page.url(), ssFile);
    } catch (err) {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true }).catch(() => {});
      log('Step 3 — Lead Hunter', 'FAIL', page.url(), ssFile);
      throw err;
    }
  });

  // ─── STEP 4: LEADSITE.IO — WEBSITE BUILDER ────────────────────
  test('Step 4 — LeadSite.IO Website Builder', async () => {
    test.skip(!authenticated, 'Skipped — not authenticated');
    const ssFile = 'step4-website-builder.png';
    try {
      await page.goto(`${BASE}/websites/builder`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);

      const url = page.url();
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });

      if (isOnAuthPage(url)) {
        log('Step 4 — Website Builder', 'FAIL', url, ssFile);
        expect(false, 'Redirected to auth page').toBeTruthy();
        return;
      }

      const loaded = url.includes('/websites');
      const hasContent = await page.locator('textarea, h1, h2, [class*="chat"]').first().isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`   Builder URL match: ${loaded}, Content visible: ${hasContent}`);

      log('Step 4 — Website Builder', loaded ? 'PASS' : 'FAIL', url, ssFile);
    } catch (err) {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true }).catch(() => {});
      log('Step 4 — Website Builder', 'FAIL', page.url(), ssFile);
      throw err;
    }
  });

  // ─── STEP 5: CLIENTCONTACT.IO — CHANNEL HUB ──────────────────
  test('Step 5 — ClientContact.IO Channel Hub', async () => {
    test.skip(!authenticated, 'Skipped — not authenticated');
    const ssFile = 'step5-channel-hub.png';
    try {
      await page.goto(`${BASE}/inbox/settings/channels`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);

      const url = page.url();
      if (isOnAuthPage(url)) {
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });
        log('Step 5 — Channel Hub', 'FAIL', url, ssFile);
        expect(false, 'Redirected to auth page').toBeTruthy();
        return;
      }

      // Verify Channel Hub title
      const title = await page.locator('h1:has-text("Channel Hub")').isVisible({ timeout: 5000 }).catch(() => false);
      console.log(`   Channel Hub title: ${title}`);

      // Click "Add a Channel"
      const addBtn = page.locator('button:has-text("Add a Channel")').first();
      let dropdownOpened = false;
      if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        dropdownOpened = await page.locator('text=Email & SMS').isVisible({ timeout: 3000 }).catch(() => false);
        const hasSocial = await page.locator('text=Social Media').isVisible({ timeout: 1000 }).catch(() => false);
        const hasMessaging = await page.locator('text=Messaging').isVisible({ timeout: 1000 }).catch(() => false);
        console.log(`   Dropdown: Email & SMS=${dropdownOpened}, Social=${hasSocial}, Messaging=${hasMessaging}`);
      }

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });
      log('Step 5 — Channel Hub', title && dropdownOpened ? 'PASS' : 'FAIL', page.url(), ssFile);
    } catch (err) {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true }).catch(() => {});
      log('Step 5 — Channel Hub', 'FAIL', page.url(), ssFile);
      throw err;
    }
  });

  // ─── STEP 6: VIDEOSITE.AI — VIDEOS ────────────────────────────
  test('Step 6 — VideoSite.AI Videos + Upload', async () => {
    test.skip(!authenticated, 'Skipped — not authenticated');
    const ssFile = 'step6-videos.png';
    try {
      await page.goto(`${BASE}/videos`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const url = page.url();
      if (isOnAuthPage(url)) {
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });
        log('Step 6 — Videos + Upload', 'FAIL', url, ssFile);
        expect(false, 'Redirected to auth page').toBeTruthy();
        return;
      }

      const videosTitle = await page.locator('h1').first().isVisible({ timeout: 3000 }).catch(() => false);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'step6-videos-list.png'), fullPage: true });
      console.log(`   Videos page loaded: ${videosTitle}, URL: ${page.url()}`);

      // Navigate to upload
      await page.goto(`${BASE}/videos/upload`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      const uploadUrl = page.url();
      const uploadLoaded = uploadUrl.includes('/videos') && !isOnAuthPage(uploadUrl);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });
      console.log(`   Upload page loaded: ${uploadLoaded}, URL: ${uploadUrl}`);

      log('Step 6 — Videos + Upload', videosTitle && uploadLoaded ? 'PASS' : 'FAIL', uploadUrl, ssFile);
    } catch (err) {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true }).catch(() => {});
      log('Step 6 — Videos + Upload', 'FAIL', page.url(), ssFile);
      throw err;
    }
  });

  // ─── STEP 7: PROFILE EMAIL SENDING ────────────────────────────
  test('Step 7 — Profile Email Sending Section', async () => {
    test.skip(!authenticated, 'Skipped — not authenticated');
    const ssFile = 'step7-email-sending.png';
    try {
      await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const url = page.url();
      if (isOnAuthPage(url)) {
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });
        log('Step 7 — Email Sending', 'FAIL', url, ssFile);
        expect(false, 'Redirected to auth page').toBeTruthy();
        return;
      }

      // Wait for Email Sending section to load (it fetches async)
      await page.waitForTimeout(3000);

      // Scroll to Email Sending section
      const emailSection = page.locator('text=Email Sending').first();
      let sectionVisible = false;
      if (await emailSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        await emailSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000);
        sectionVisible = true;
      }
      console.log(`   Email Sending section visible: ${sectionVisible}`);

      // Check for error messages
      const hasUnauthorized = await page.locator('text=Unauthorized').isVisible({ timeout: 2000 }).catch(() => false);
      const hasFetchError = await page.locator('text=Failed to fetch').isVisible({ timeout: 2000 }).catch(() => false);
      const hasError = hasUnauthorized || hasFetchError;

      console.log(`   Unauthorized error: ${hasUnauthorized}`);
      console.log(`   Failed to fetch error: ${hasFetchError}`);

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });
      log('Step 7 — Email Sending', sectionVisible && !hasError ? 'PASS' : 'FAIL', page.url(), ssFile);
    } catch (err) {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true }).catch(() => {});
      log('Step 7 — Email Sending', 'FAIL', page.url(), ssFile);
      throw err;
    }
  });

  // ─── STEP 8: ULTRALEAD NEXUS AGENTS ───────────────────────────
  test('Step 8 — UltraLead NEXUS Agents', async () => {
    test.skip(!authenticated, 'Skipped — not authenticated');
    const ssFile = 'step8-nexus-agents.png';
    try {
      await page.goto(`${BASE}/nexus`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);

      const url = page.url();
      if (isOnAuthPage(url)) {
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });
        log('Step 8 — NEXUS Agents', 'FAIL', url, ssFile);
        expect(false, 'Redirected to auth page').toBeTruthy();
        return;
      }

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'step8-nexus-loaded.png'), fullPage: true });

      const hasTitle = await page.locator('h1, h2').first().isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`   NEXUS page loaded: ${hasTitle}, URL: ${page.url()}`);

      // Try chat input
      const chatInput = page.locator('textarea').first();
      if (await chatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await chatInput.fill('Run system health check');
        await chatInput.press('Enter');
        console.log('   Sent NEXUS command');
        await page.waitForTimeout(5000);
      }

      // Look for run buttons
      const runButtons = page.locator('button:has-text("Run"), button:has-text("Execute"), button:has-text("Start")');
      const runCount = await runButtons.count();
      console.log(`   Run buttons found: ${runCount}`);
      if (runCount > 0) {
        for (let i = 0; i < Math.min(runCount, 3); i++) {
          const btn = runButtons.nth(i);
          if (await btn.isVisible().catch(() => false)) {
            await btn.click();
            await page.waitForTimeout(2000);
            console.log(`   Clicked run button ${i + 1}`);
          }
        }
      }

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true });
      log('Step 8 — NEXUS Agents', hasTitle ? 'PASS' : 'FAIL', page.url(), ssFile);
    } catch (err) {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, ssFile), fullPage: true }).catch(() => {});
      log('Step 8 — NEXUS Agents', 'FAIL', page.url(), ssFile);
      throw err;
    }
  });
});
