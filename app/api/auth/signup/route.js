/**
 * CRITICAL AUTH ROUTE - DO NOT MODIFY WITHOUT TESTING
 * POST /api/auth/signup - Proxy to backend with error handling
 */
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const backendUrl = process.env.API_URL ||
                       process.env.NEXT_PUBLIC_API_URL ||
                       'https://api.aileadstrategies.com'
    console.log(`[SIGNUP] Proxying to: ${backendUrl}/api/v1/auth/signup`)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    const response = await fetch(`${backendUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LeadStrategies-Frontend/1.0'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    const data = await response.json()
    if (!response.ok) {
      console.error(`[SIGNUP] Backend error: ${response.status}`, data)
      return NextResponse.json(
        { success: false, error: data?.error || 'Signup failed' },
        { status: response.status }
      )
    }
    console.log('[SIGNUP] Success - user created')
    return NextResponse.json(data)
  } catch (error) {
    console.error('[SIGNUP] Proxy error:', error.message)
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Request timeout - please try again' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Connection error - please try again' },
      { status: 500 }
    )
  }
}
