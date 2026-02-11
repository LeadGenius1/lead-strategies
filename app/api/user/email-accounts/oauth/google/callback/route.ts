// Google OAuth callback for Gmail SENDING (NOT login)
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeGoogleEmailCode } from '@/lib/email-oauth/google';
import { encryptToken } from '@/lib/email-oauth/token-manager';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/settings?error=oauth_${error}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/settings?error=oauth_missing', req.url));
    }

    const cookieStore = await cookies();
    const savedState = cookieStore.get('email_oauth_state')?.value;
    const userId = cookieStore.get('email_oauth_user_id')?.value;

    if (!savedState || savedState !== state || !userId) {
      return NextResponse.redirect(new URL('/settings?error=oauth_invalid_state', req.url));
    }

    const tokens = await exchangeGoogleEmailCode(code);
    const oauth2 = google.oauth2({ version: 'v2', auth: tokens.access_token as string });
    const { data } = await oauth2.userinfo.get();
    const email = data.email;
    if (!email) {
      return NextResponse.redirect(new URL('/settings?error=oauth_no_email', req.url));
    }

    const existing = await prisma.userEmailAccount.findUnique({
      where: { userId_email: { userId, email } },
    });
    if (existing) {
      await prisma.userEmailAccount.update({
        where: { id: existing.id },
        data: {
          accessToken: encryptToken(tokens.access_token!),
          refreshToken: tokens.refresh_token ? encryptToken(tokens.refresh_token) : existing.refreshToken,
          tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          scopes: tokens.scope || null,
          status: 'WARMING',
        },
      });
    } else {
      await prisma.userEmailAccount.create({
        data: {
          userId,
          email,
          displayName: data.name || email,
          provider: 'GMAIL',
          status: 'WARMING',
          tier: 'FREE',
          dailyLimit: 50,
          accessToken: encryptToken(tokens.access_token!),
          refreshToken: tokens.refresh_token ? encryptToken(tokens.refresh_token) : null,
          tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          scopes: tokens.scope || null,
        },
      });
    }

    const res = NextResponse.redirect(new URL('/settings?email=connected', req.url));
    res.cookies.delete('email_oauth_state');
    res.cookies.delete('email_oauth_user_id');
    return res;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(new URL('/settings?error=oauth_failed', req.url));
  }
}
