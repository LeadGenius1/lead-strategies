import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * GET /api/auth/me - Proxy to backend for session verification
 * AuthContext fetches this with credentials. We read the token cookie and forward to backend.
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    // No token = not logged in. Return 200 + null user (never 401 - prevents "same error" on auth check)
    if (!token) {
      return NextResponse.json({
        success: true,
        data: { user: null },
      })
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://api.aileadstrategies.com'

    const response = await fetch(`${backendUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[api/auth/me] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication check failed', data: { user: null } },
      { status: 500 }
    )
  }
}
