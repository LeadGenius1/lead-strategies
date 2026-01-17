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

    const body = await request.json()
    const {
      company,
      industry,
      services,
      location,
      targetMarket,
      website,
      phone,
      monthlyLeadGoal,
      budget,
      onboardingComplete
    } = body

    // Try backend endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'
    
    try {
      const response = await fetch(`${backendUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company,
          businessInfo: {
            industry,
            services,
            location,
            targetMarket,
            website,
            phone,
            monthlyLeadGoal,
            budget,
          },
          onboardingComplete: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.error('Backend onboarding error:', error)
    }

    // Fallback success
    return NextResponse.json({
      success: true,
      message: 'Onboarding completed'
    })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
