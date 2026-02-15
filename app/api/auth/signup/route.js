/**
 * POST /api/auth/signup - Same-origin proxy to backend
 * Fixes CORS/connection issues by routing through Next.js (same domain)
 */
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://api.aileadstrategies.com'

    const response = await fetch(`${backendUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data?.error || 'Signup failed' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[api/auth/signup] Proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Connection error. Please try again.' },
      { status: 500 }
    )
  }
}
