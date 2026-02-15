#!/usr/bin/env node
/**
 * Test all platform dashboard routes.
 * Run: node scripts/test-dashboard-routes.js
 * Requires: npm run dev (Next.js) running on BASE_URL
 */
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000;

const ROUTES = [
  // Auth (public)
  { path: '/login', name: 'Login', expectRedirect: false },
  { path: '/signup', name: 'Signup', expectRedirect: false },
  // Dashboard routes (may redirect to /login if no auth)
  { path: '/lead-hunter', name: 'Lead Hunter', expectRedirect: true },
  { path: '/proactive-hunter', name: 'Proactive Hunter', expectRedirect: true },
  { path: '/websites', name: 'Websites', expectRedirect: true },
  { path: '/prospects', name: 'Prospects', expectRedirect: true },
  { path: '/campaigns', name: 'Campaigns', expectRedirect: true },
  { path: '/replies', name: 'Replies', expectRedirect: true },
  { path: '/analytics', name: 'Analytics', expectRedirect: true },
  { path: '/videos', name: 'Videos', expectRedirect: true },
  { path: '/videos/upload', name: 'Videos Upload', expectRedirect: true },
  { path: '/videos/analytics', name: 'Videos Analytics', expectRedirect: true },
  { path: '/earnings', name: 'Earnings', expectRedirect: true },
  { path: '/inbox', name: 'Inbox', expectRedirect: true },
  { path: '/inbox/settings/channels', name: 'Inbox Channels', expectRedirect: true },
  { path: '/crm', name: 'CRM', expectRedirect: true },
  { path: '/crm/deals', name: 'CRM Deals', expectRedirect: true },
  { path: '/settings', name: 'Settings', expectRedirect: true },
  { path: '/dashboard', name: 'Dashboard', expectRedirect: true },
  { path: '/platforms', name: 'Platforms', expectRedirect: true },
  { path: '/admin', name: 'Admin', expectRedirect: false },
];

async function testRoute(route) {
  const url = `${BASE}${route.path}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { 'Accept': 'text/html' },
    });
    const status = res.status;
    const location = res.headers.get('location') || '';
    // 200 = page loads, 307/302 = redirect (expected for protected routes without auth)
    const ok = status === 200 || (status >= 300 && status < 400);
    const redirected = status >= 300 && status < 400;
    return {
      ok,
      status,
      redirected,
      location,
      expectRedirect: route.expectRedirect,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  console.log('=== DASHBOARD ROUTE TESTS ===');
  console.log('Base URL:', BASE);
  console.log('');

  const results = [];
  for (const route of ROUTES) {
    const r = await testRoute(route);
    results.push({ name: route.name, path: route.path, ...r });
    const status = r.error ? 'ERROR' : r.status;
    const note = r.error ? r.error : (r.redirected ? `→ ${r.location}` : 'OK');
    const icon = r.ok ? '✓' : '✗';
    console.log(`${icon} ${route.name.padEnd(20)} ${route.path.padEnd(22)} ${status} ${note}`);
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log('');
  console.log('--- RESULTS ---');
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}`);
  if (failed > 0) {
    console.log('');
    console.log('Failed routes:');
    results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.path} (${r.error || r.status})`));
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
