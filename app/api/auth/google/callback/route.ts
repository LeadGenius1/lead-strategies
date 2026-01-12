import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  : 'http://localhost:3000/api/auth/google/callback';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('❌ Google OAuth error:', error);
      return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
    }

    // Verify state for CSRF protection
    const storedState = request.cookies.get('oauth_state')?.value;
    if (!state || state !== storedState) {
      console.error('❌ Invalid OAuth state');
      return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
    }

    if (!code) {
      console.error('❌ No authorization code received');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('❌ Token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('❌ Failed to get user info');
      return NextResponse.redirect(new URL('/login?error=user_info_failed', request.url));
    }

    const googleUser = await userInfoResponse.json();
    console.log('✅ Google user:', { email: googleUser.email, name: googleUser.name });

    // Forward to backend for user creation/login
    if (!RAILWAY_API_URL) {
      console.error('❌ RAILWAY_API_URL not configured');
      return NextResponse.redirect(new URL('/login?error=backend_not_configured', request.url));
    }

    const backendResponse = await fetch(`${RAILWAY_API_URL}/api/auth/oauth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: googleUser.email,
        firstName: googleUser.given_name || googleUser.name?.split(' ')[0] || 'User',
        lastName: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || '',
        googleId: googleUser.id,
        picture: googleUser.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      }),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok || !backendData.success) {
      console.error('❌ Backend OAuth failed:', backendData);
      return NextResponse.redirect(new URL(`/login?error=${backendData.error || 'oauth_failed'}`, request.url));
    }

    const token = backendData.token || backendData.data?.token;

    if (!token) {
      console.error('❌ No token received from backend');
      return NextResponse.redirect(new URL('/login?error=no_token', request.url));
    }

    // Create redirect response with auth cookie
    const redirectUrl = new URL('/dashboard', request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Set auth cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Clear OAuth state cookie
    response.cookies.delete('oauth_state');

    console.log(`✅ Google OAuth successful for: ${googleUser.email}`);

    return response;
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
  }
}
