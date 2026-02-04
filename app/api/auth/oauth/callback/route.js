import { NextResponse } from 'next/server'

// Mark route as dynamic to prevent static rendering
export const dynamic = 'force-dynamic'

function getBaseUrl(request) {
  if (process.env.NEXT_PUBLIC_FRONTEND_URL) return process.env.NEXT_PUBLIC_FRONTEND_URL.replace(/\/$/, '')
  const host = request.headers.get('host') || 'aileadstrategies.com'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  return `${protocol}://${host}`
}

export async function GET(request) {
  try {
    const baseUrl = getBaseUrl(request)
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      const errorMsg = errorDescription || error
      return NextResponse.redirect(`${baseUrl}/signup?error=${encodeURIComponent(`OAuth error: ${errorMsg}`)}`)
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/signup?error=` + encodeURIComponent('Authorization failed. Please try again.'))
    }

    let stateData = {}
    try {
      stateData = state ? JSON.parse(decodeURIComponent(state)) : {}
    } catch (e) {
      console.error('State parse error:', e)
    }

    const provider = stateData.provider || 'google'
    const tier = stateData.tier || 'leadsite-ai'
    const redirectUri = `${baseUrl}/api/auth/oauth/callback`

    // Exchange authorization code for user info via backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'
    
    try {
      const response = await fetch(`${backendUrl}/api/auth/oauth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          code,
          redirectUri,
          tier,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const token = data.token || data.data?.token
        const user = data.user || data.data?.user

        if (token) {
          // Redirect each tier to their chosen platform dashboard (not all platforms offer same products)
          const tier = (user?.subscription_tier || user?.tier || stateData.tier || '').toLowerCase()
          const tierDashboardMap = {
            'videosite': '/dashboard',
            'videosite-io': '/dashboard',
            'leadsite-io': '/dashboard',
            'clientcontact': '/inbox',
            'clientcontact-io': '/inbox',
            'leadsite-ai': '/prospects',
            'ultralead': '/crm',
          }
          const redirectPath = tierDashboardMap[tier] || '/dashboard'
          const redirectResponse = NextResponse.redirect(`${baseUrl}${redirectPath}`)
          redirectResponse.cookies.set('token', token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            httpOnly: false, // Needs to be accessible by client-side JS
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          })
          return redirectResponse
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.message || errorData.error || `OAuth failed (${response.status})`
        return NextResponse.redirect(`${baseUrl}/signup?error=${encodeURIComponent(errorMsg)}`)
      }
    } catch (backendError) {
      console.error('Backend OAuth callback error:', backendError)
      return NextResponse.redirect(`${baseUrl}/signup?error=${encodeURIComponent('Unable to connect to authentication server. Please try again later.')}`)
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    const fallbackUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://aileadstrategies.com'
    return NextResponse.redirect(`${fallbackUrl.replace(/\/$/, '')}/signup?error=${encodeURIComponent('Authentication error occurred. Please try again.')}`)
  }
}

export async function POST(request) {
  return GET(request)
}
