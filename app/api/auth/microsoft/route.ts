import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Microsoft OAuth configuration
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || '';
const MICROSOFT_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/microsoft/callback`
  : 'http://localhost:3000/api/auth/microsoft/callback';

export async function GET(request: NextRequest) {
  if (!MICROSOFT_CLIENT_ID) {
    console.error('❌ MICROSOFT_CLIENT_ID not configured');
    return NextResponse.redirect(new URL('/login?error=oauth_not_configured', request.url));
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Microsoft OAuth URL
  const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  authUrl.searchParams.set('client_id', MICROSOFT_CLIENT_ID);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', MICROSOFT_REDIRECT_URI);
  authUrl.searchParams.set('scope', 'openid email profile User.Read');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('response_mode', 'query');

  const response = NextResponse.redirect(authUrl.toString());

  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  return response;
}
