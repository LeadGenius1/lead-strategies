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

    // Try to get audit logs from backend
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'
      const { searchParams } = new URL(request.url)
      const action = searchParams.get('action')
      const url = action && action !== 'all'
        ? `${backendUrl}/api/admin/audit?action=${action}`
        : `${backendUrl}/api/admin/audit`

      const response = await fetch(url, {
        headers: {
          'Authorization': authHeader,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.error('Backend audit error:', error)
    }

    // Fallback: return empty audit logs
    return NextResponse.json({
      success: true,
      logs: []
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
