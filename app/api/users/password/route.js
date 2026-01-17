/**
 * API Route: Change User Password
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'

    try {
      // Try backend endpoint (if it exists)
      const response = await fetch(`${apiUrl}/api/users/password`, {
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
      console.error('Backend password change failed:', error)
    }

    // Fallback: Return error that endpoint needs implementation
    return NextResponse.json(
      { error: 'Password change endpoint not yet implemented in backend' },
      { status: 501 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to change password', details: error.message },
      { status: 500 }
    )
  }
}
