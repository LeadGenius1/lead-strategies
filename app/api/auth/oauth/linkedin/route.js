import { NextResponse } from 'next/server'

// Mark route as dynamic to prevent static rendering
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get('tier') || 'leadsite-ai'
    
    // Get frontend URL - prefer env vars to avoid 0.0.0.0 / Railway internal host
    const prodFallback = 'https://aileadstrategies.com'
    const frontendUrl = (
      process.env.BASE_URL ||
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      (() => {
        const host = request.headers.get('host') || ''
        if (!host || host.startsWith('0.0.0.0') || host === 'localhost' || host.startsWith('localhost:')) {
          return prodFallback
        }
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
        return `${protocol}://${host}`
      })()
    ).replace(/\/$/, '')
    const redirectUri = `${frontendUrl}/api/auth/oauth/callback?provider=linkedin`
    
    // LinkedIn OAuth 2.0 configuration
    const clientId = process.env.LINKEDIN_CLIENT_ID
    
    if (!clientId) {
      // Redirect to signup with error message
      return NextResponse.redirect(`${frontendUrl}/signup?error=${encodeURIComponent('LinkedIn OAuth is not configured. Please contact support.')}`)
    }

    // Build state parameter
    const state = encodeURIComponent(JSON.stringify({ tier, provider: 'linkedin' }))

    // Build LinkedIn OAuth URL (using newer API scopes)
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'openid profile email',
      state: state,
    })

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('LinkedIn OAuth error:', error)
    const frontendUrl = (process.env.BASE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://aileadstrategies.com').replace(/\/$/, '')
    return NextResponse.redirect(`${frontendUrl}/signup?error=${encodeURIComponent('OAuth initiation failed. Please try again.')}`)
  }
}
