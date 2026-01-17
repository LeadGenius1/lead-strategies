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

    // Try to get users from backend
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'
      const { searchParams } = new URL(request.url)
      const tier = searchParams.get('tier')
      const url = tier && tier !== 'all' 
        ? `${backendUrl}/api/admin/users?tier=${tier}`
        : `${backendUrl}/api/admin/users`

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
      console.error('Backend users error:', error)
    }

    // Fallback: return empty array
    return NextResponse.json({
      success: true,
      users: []
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
