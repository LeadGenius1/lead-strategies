import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get('tier') || 'leadsite-ai'
    
    // Get frontend URL from request headers or env
    const host = request.headers.get('host') || ''
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || `${protocol}://${host}`
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
    const host = request.headers.get('host') || ''
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || `${protocol}://${host}`
    return NextResponse.redirect(`${frontendUrl}/signup?error=${encodeURIComponent('OAuth initiation failed. Please try again.')}`)
  }
}
