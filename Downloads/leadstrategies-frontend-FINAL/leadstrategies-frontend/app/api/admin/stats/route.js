import { NextResponse } from 'next/server'
import api from '@/lib/api'

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

    // Try to get stats from backend
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'
      const response = await fetch(`${backendUrl}/api/admin/stats`, {
        headers: {
          'Authorization': authHeader,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.error('Backend stats error:', error)
    }

    // Fallback stats
    return NextResponse.json({
      success: true,
      users: {
        total: 0,
        today: 0,
        byTier: {
          'leadsite-ai': 0,
          'leadsite-io': 0,
          'clientcontact': 0,
          'tackle': 0
        }
      },
      leads: {
        total: 0,
        today: 0
      },
      campaigns: {
        total: 0,
        active: 0
      },
      emails: {
        sent: 0,
        today: 0
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
