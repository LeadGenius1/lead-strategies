/**
 * API Route: Daily AI Agent Email Process
 * This endpoint runs on a schedule (cron job) every night
 * Fetches 50 prospects, generates personalized emails, and schedules them for 8am send
 */

import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Vercel Cron sends authorization header with bearer token
    // The token is set in Vercel dashboard under Cron Jobs
    const authHeader = request.headers.get('authorization')
    const cronSecretHeader = request.headers.get('x-cron-secret')
    
    // Verify authorization (Vercel Cron) or cron secret (manual testing)
    let isAuthorized = false
    
    if (authHeader?.startsWith('Bearer ')) {
      // Vercel Cron request - authorized
      isAuthorized = true
    } else if (cronSecretHeader === process.env.CRON_SECRET) {
      // Manual testing with header - authorized
      isAuthorized = true
    } else {
      // Try reading from body for manual testing (only if no header auth)
      try {
        const body = await request.json()
        if (body.cronSecret === process.env.CRON_SECRET) {
          isAuthorized = true
        }
      } catch {
        // Body might be empty or invalid - not authorized
      }
    }
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid cron secret or missing authorization' },
        { status: 401 }
      )
    }

    // Get all active users from backend
    const activeUsers = await getAllActiveUsers()
    
    // Process daily email campaign for each user
    const results = []
    for (const user of activeUsers) {
      try {
        const result = await processDailyEmailCampaign(user.id)
        results.push({ userId: user.id, ...result })
      } catch (error) {
        console.error(`Error processing campaign for user ${user.id}:`, error)
        results.push({ userId: user.id, error: error.message })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Daily email campaign processed for ${results.length} users`,
      results,
    })
  } catch (error) {
    console.error('Error processing daily email campaign:', error)
    return NextResponse.json(
      { error: 'Failed to process daily email campaign', details: error.message },
      { status: 500 }
    )
  }
}

async function processDailyEmailCampaign(userId) {
  // Step 1: Fetch user's business info
  const user = await getUserWithBusinessInfo(userId)
  if (!user) {
    throw new Error('User not found')
  }

  // Step 2: Search for 50 prospects based on business info
  const prospects = await searchProspects({
    industry: user.businessInfo?.industry,
    services: user.businessInfo?.services,
    location: user.businessInfo?.location,
    targetMarket: user.businessInfo?.targetMarket,
    limit: 50,
  })

  // Step 3: Score prospects (scale of 6)
  const scoredProspects = prospects.map(prospect => ({
    ...prospect,
    score: calculateProspectScore(prospect, user.businessInfo),
  }))

  // Step 4: Sort by score (highest first)
  const sortedProspects = scoredProspects.sort((a, b) => b.score - a.score)

  // Step 5: Generate personalized email for each prospect
  const emailCampaigns = await Promise.all(
    sortedProspects.map(prospect =>
      generatePersonalizedEmail(prospect, user.businessInfo)
    )
  )

  // Step 6: Schedule emails for 8am send
  const scheduledEmails = await scheduleEmailsFor8AM(emailCampaigns, userId)

  // Step 7: Store campaign status for dashboard
  await storeCampaignStatus({
    userId,
    date: new Date().toISOString().split('T')[0],
    totalProspects: sortedProspects.length,
    emailsScheduled: scheduledEmails.length,
    status: 'scheduled',
  })

  return {
    prospectsFound: sortedProspects.length,
    emailsScheduled: scheduledEmails.length,
    scheduledFor: '8:00 AM',
  }
}

async function getAllActiveUsers() {
  // Call backend API to get all active users
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'
  try {
    const response = await fetch(`${apiUrl}/api/users/active`, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
      },
    })
    if (response.ok) {
      const data = await response.json()
      return data.users || []
    }
  } catch (error) {
    console.error('Error fetching active users:', error)
  }
  return []
}

async function getUserWithBusinessInfo(userId) {
  // Call backend API to get user with business info
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'
  try {
    const response = await fetch(`${apiUrl}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
      },
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  }
  return null
}

async function searchProspects(criteria) {
  // Call backend API or external service to search prospects
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'
  try {
    const response = await fetch(`${apiUrl}/api/prospects/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
      },
      body: JSON.stringify(criteria),
    })
    if (response.ok) {
      const data = await response.json()
      return data.prospects || []
    }
  } catch (error) {
    console.error('Error searching prospects:', error)
  }
  return []
}

function calculateProspectScore(prospect, businessInfo) {
  // Score from 1-6 based on relevance
  let score = 1

  // Industry match (+2)
  if (prospect.industry?.toLowerCase().includes(businessInfo?.industry?.toLowerCase() || '')) {
    score += 2
  }

  // Location match (+2)
  if (prospect.location?.toLowerCase().includes(businessInfo?.location?.toLowerCase() || '')) {
    score += 2
  }

  // Target market match (+1)
  if (businessInfo?.targetMarket && prospect.companyType) {
    const targetMarkets = businessInfo.targetMarket.toLowerCase().split(',').map(t => t.trim())
    if (targetMarkets.some(market => prospect.companyType?.toLowerCase().includes(market))) {
      score += 1
    }
  }

  // Company size/relevance (+1)
  if (prospect.companySize && prospect.companySize >= 10) {
    score += 1
  }

  return Math.min(score, 6) // Cap at 6
}

async function generatePersonalizedEmail(prospect, businessInfo) {
  // Call AI service to generate personalized email
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'
  try {
    const response = await fetch(`${apiUrl}/api/ai/generate-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
      },
      body: JSON.stringify({
        prospect,
        businessInfo,
        context: {
          industry: businessInfo?.industry,
          services: businessInfo?.services,
          location: businessInfo?.location,
        },
      }),
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error generating email:', error)
  }

  // Fallback: Generate basic email
  return {
    to: prospect.email,
    subject: `Help ${prospect.companyName || prospect.name} with ${businessInfo?.industry || 'your business'}`,
    body: generateFallbackEmail(prospect, businessInfo),
  }
}

function generateFallbackEmail(prospect, businessInfo) {
  return `Hi ${prospect.name || 'there'},

I noticed ${prospect.companyName || 'your company'} operates in ${prospect.location || 'your area'}. As a ${businessInfo?.industry || 'business'} serving ${businessInfo?.location || 'the area'}, I wanted to reach out because I think we can help.

Our services include: ${businessInfo?.services || 'professional solutions'}

Would you be open to a quick conversation about how we can help ${prospect.companyName || 'your business'}?

Best regards,
AI Lead Strategies`
}

async function scheduleEmailsFor8AM(emailCampaigns, userId) {
  // Schedule emails to be sent at 8am
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'
  const scheduledEmails = []

  for (const email of emailCampaigns) {
    try {
      // Calculate next 8am
      const now = new Date()
      const next8AM = new Date(now)
      next8AM.setHours(8, 0, 0, 0)
      if (next8AM <= now) {
        next8AM.setDate(next8AM.getDate() + 1)
      }

      const response = await fetch(`${apiUrl}/api/campaigns/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          email,
          scheduledFor: next8AM.toISOString(),
        }),
      })

      if (response.ok) {
        const scheduled = await response.json()
        scheduledEmails.push(scheduled)
      }
    } catch (error) {
      console.error('Error scheduling email:', error)
    }
  }

  return scheduledEmails
}

async function storeCampaignStatus(statusData) {
  // Store campaign status for dashboard display
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'
  try {
    await fetch(`${apiUrl}/api/campaigns/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
      },
      body: JSON.stringify(statusData),
    })
  } catch (error) {
    console.error('Error storing campaign status:', error)
  }
}
