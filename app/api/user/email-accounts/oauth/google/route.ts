// Initiate Google OAuth for Gmail SENDING (NOT login)
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { getGoogleEmailAuthUrl } from '@/lib/email-oauth/google';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL('/login?error=Unauthorized&callbackUrl=/settings', req.url)
      );
    }

    const state = crypto.randomBytes(32).toString('hex');
    const authUrl = getGoogleEmailAuthUrl(state);

    // Store state in cookie for verification (5 min)
    const res = NextResponse.redirect(authUrl);
    res.cookies.set('email_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300,
      path: '/',
    });
    res.cookies.set('email_oauth_user_id', session.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300,
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('Google OAuth init error:', error);
    return NextResponse.redirect(
      new URL('/settings?error=oauth_failed', req.url)
    );
  }
}
