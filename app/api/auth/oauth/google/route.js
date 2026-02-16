import { NextResponse } from 'next/server'

// Mark route as dynamic to prevent static rendering
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get('tier') || 'leadsite-ai'
    
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
    const redirectUri = `${frontendUrl}/api/auth/oauth/callback`
    
    // Google OAuth 2.0 configuration
    const clientId = process.env.GOOGLE_CLIENT_ID
    
    if (!clientId) {
      // Redirect to signup with error message
      return NextResponse.redirect(`${frontendUrl}/signup?error=${encodeURIComponent('Google OAuth is not configured. Please contact support.')}`)
    }

    // Build state parameter
    const state = encodeURIComponent(JSON.stringify({ tier, provider: 'google' }))

    // Build Google OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Google OAuth error:', error)
    const frontendUrl = (process.env.BASE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://aileadstrategies.com').replace(/\/$/, '')
    return NextResponse.redirect(`${frontendUrl}/signup?error=${encodeURIComponent('OAuth initiation failed. Please try again.')}`)
  }
}

