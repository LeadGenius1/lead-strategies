/**
 * API Route: Update User Profile
 * Proxy to backend or provide fallback
 */

import { NextResponse } from 'next/server'

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'

    try {
      // Try backend endpoint (if it exists)
      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.error('Backend profile update failed:', error)
    }

    // Fallback: Update via auth/me or return success
    // TODO: Backend needs to implement /api/users/profile endpoint
    return NextResponse.json({
      success: true,
      message: 'Profile update endpoint not yet implemented in backend',
      data: body
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    )
  }
}
