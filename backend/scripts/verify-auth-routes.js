#!/usr/bin/env node
/**
 * Verify auth routes exist before deployment.
 * Run: node backend/scripts/verify-auth-routes.js
 * Or from backend: node scripts/verify-auth-routes.js
 *
 * EXIT 0 = routes OK
 * EXIT 1 = routes missing or broken
 */
const BASE = process.env.API_URL || 'http://localhost:3001'

async function request(method, path, body) {
  const url = path.startsWith('http') ? path : new URL(path, BASE).toString()
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(8000),
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  return { status: res.status, data }
}

async function main() {
  console.log('=== VERIFY AUTH ROUTES ===')
  console.log('Base URL:', BASE)

  try {
    // Login should return 401 (bad creds) or 200, NOT 404
    const loginRes = await request('POST', '/api/v1/auth/login', {
      email: 'verify-auth-test@example.com',
      password: 'test',
    })
    if (loginRes.status === 404) {
      console.error('❌ LOGIN ROUTE MISSING (404) - /api/v1/auth/login')
      process.exit(1)
    }
    console.log('✅ Login route OK (status:', loginRes.status + ')')

    // Signup should return 400 (validation) or 201 or 401, NOT 404
    const signupRes = await request('POST', '/api/v1/auth/signup', {
      email: 'verify-auth-test@example.com',
      password: 'test',
    })
    if (signupRes.status === 404) {
      console.error('❌ SIGNUP ROUTE MISSING (404) - /api/v1/auth/signup')
      process.exit(1)
    }
    console.log('✅ Signup route OK (status:', signupRes.status + ')')

    console.log('✅ All auth routes present - safe to deploy')
    process.exit(0)
  } catch (err) {
    console.error('❌ Auth route check failed:', err.message)
    console.error('   Is the backend running on', BASE, '?')
    process.exit(1)
  }
}

main()
