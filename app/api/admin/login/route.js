import { NextResponse } from 'next/server'
import api from '@/lib/api'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Try to login via backend admin endpoint
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        return NextResponse.json({
          success: true,
          admin: data.admin || data.data?.admin,
          token: data.token || data.data?.token,
        })
      } else {
        return NextResponse.json(
          { success: false, message: data.message || 'Invalid credentials' },
          { status: response.status }
        )
      }
    } catch (error) {
      console.error('Backend admin login error:', error)
      
      // Fallback: Check if it's the default admin account
      if (email === 'admin@aileadstrategies.com' && password === 'YourSecurePassword123!') {
        return NextResponse.json({
          success: true,
          admin: {
            id: 'admin-1',
            email: 'admin@aileadstrategies.com',
            role: 'super_admin',
            name: 'Admin User'
          },
          token: 'admin-token-placeholder-' + Date.now(),
        })
      }

      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
