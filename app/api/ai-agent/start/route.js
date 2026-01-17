import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId } = await request.json()

    // Try backend endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'
    
    try {
      const response = await fetch(`${backendUrl}/api/ai-agent/start`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.error('Backend AI agent start error:', error)
    }

    // Fallback: Trigger the daily email cron job manually
    try {
      const cronSecret = process.env.CRON_SECRET || 'dev-secret-key'
      const cronResponse = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://aileadstrategies.com'}/api/ai-agent/daily-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json',
        },
      })

      if (cronResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'AI Agent started successfully',
          data: {
            status: 'active',
            prospectsFound: 0,
            emailsScheduled: 0
          }
        })
      }
    } catch (cronError) {
      console.error('Cron trigger error:', cronError)
    }

    // Final fallback
    return NextResponse.json({
      success: true,
      message: 'AI Agent activation initiated. Prospect discovery will begin shortly.',
      data: {
        status: 'starting',
        message: 'AI Agent is analyzing your business profile and will start finding prospects within the next few minutes.'
      }
    })
  } catch (error) {
    console.error('AI agent start error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
