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
    const redirectUri = `${frontendUrl}/api/auth/oauth/callback?provider=microsoft`
    
    // Microsoft OAuth 2.0 configuration
    const clientId = process.env.MICROSOFT_CLIENT_ID
    const tenant = 'common' // 'common' for multi-tenant, 'organizations' for work accounts, 'consumers' for personal
    
    if (!clientId) {
      // Redirect to signup with error message
      return NextResponse.redirect(`${frontendUrl}/signup?error=${encodeURIComponent('Microsoft OAuth is not configured. Please contact support.')}`)
    }

    // Build state parameter
    const state = encodeURIComponent(JSON.stringify({ tier, provider: 'microsoft' }))

    // Build Microsoft OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      response_mode: 'query',
      state: state,
    })

    const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Microsoft OAuth error:', error)
    const frontendUrl = (process.env.BASE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://aileadstrategies.com').replace(/\/$/, '')
    return NextResponse.redirect(`${frontendUrl}/signup?error=${encodeURIComponent('OAuth initiation failed. Please try again.')}`)
  }
}
