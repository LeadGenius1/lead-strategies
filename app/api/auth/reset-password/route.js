import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Try backend endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'
    
    try {
      const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        return NextResponse.json(
          { success: false, message: errorData.message || 'Failed to reset password' },
          { status: response.status }
        )
      }
    } catch (error) {
      console.error('Backend reset password error:', error)
    }

    // Fallback: Return error if backend is not available
    return NextResponse.json(
      { success: false, message: 'Password reset service is currently unavailable. Please try again later.' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
