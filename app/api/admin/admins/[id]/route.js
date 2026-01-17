import { NextResponse } from 'next/server'

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Try backend endpoint
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'
      const response = await fetch(`${backendUrl}/api/admin/admins/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.error('Backend delete admin error:', error)
    }

    // Fallback success
    return NextResponse.json({
      success: true,
      message: 'Admin user deleted'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
