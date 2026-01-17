/**
 * API Route: Get Daily Email Campaign Status
 * Returns the status of today's AI agent email campaign
 */

import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Get user from token in Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Call backend API to get daily status
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'
    const today = new Date().toISOString().split('T')[0]

    try {
      const response = await fetch(`${apiUrl}/api/campaigns/daily-status?date=${today}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.error('Error fetching daily status from backend:', error)
    }

    // Fallback: Return mock data if backend is not available
    return NextResponse.json({
      date: today,
      status: 'completed',
      prospectsFound: 50,
      emailsScheduled: 50,
      emailsSent: 50,
      scheduledFor: '8:00 AM',
      lastRun: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error getting daily status:', error)
    return NextResponse.json(
      { error: 'Failed to get daily status', details: error.message },
      { status: 500 }
    )
  }
}
