import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// LinkedIn OAuth configuration
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '';
const LINKEDIN_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`
  : 'http://localhost:3000/api/auth/linkedin/callback';

export async function GET(request: NextRequest) {
  if (!LINKEDIN_CLIENT_ID) {
    console.error('❌ LINKEDIN_CLIENT_ID not configured');
    return NextResponse.redirect(new URL('/login?error=oauth_not_configured', request.url));
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // LinkedIn OAuth URL
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', LINKEDIN_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', LINKEDIN_REDIRECT_URI);
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);

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
