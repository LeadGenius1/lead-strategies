/**
 * POST /api/auth/login - Same-origin proxy to backend
 * Fixes 401/CORS by routing through Next.js (same domain) instead of cross-origin to api subdomain
 */
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://api.aileadstrategies.com'

    const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })

    let data = {}
    try {
      const text = await response.text()
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { error: 'Invalid response from login service' }
    }

    // Always return 200 with success/error - never expose 401/404 to client (prevents "same error" in console/network)
    if (!response.ok) {
      const userMessage = data?.error || (response.status === 401
        ? 'Wrong email or password. Check your spelling or use Forgot password.'
        : response.status === 404
        ? 'Login service unavailable. Please try again in a few minutes.'
        : 'Login failed. Please try again.')
      return NextResponse.json({ success: false, error: userMessage })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[api/auth/login] Proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Connection error. Please try again.' },
      { status: 500 }
    )
  }
}
