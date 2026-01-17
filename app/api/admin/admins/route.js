import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Try to get admins from backend
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'
      const response = await fetch(`${backendUrl}/api/admin/admins`, {
        headers: {
          'Authorization': authHeader,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.error('Backend admins error:', error)
    }

    // Fallback: return default admin
    return NextResponse.json({
      success: true,
      admins: [{
        id: 'admin-1',
        email: 'admin@aileadstrategies.com',
        role: 'super_admin',
        created_at: new Date().toISOString()
      }]
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
