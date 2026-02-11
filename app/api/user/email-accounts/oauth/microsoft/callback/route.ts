// Microsoft OAuth callback for Outlook SENDING (NOT login)
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeMicrosoftEmailCode } from '@/lib/email-oauth/microsoft';
import { encryptToken } from '@/lib/email-oauth/token-manager';
import { prisma } from '@/lib/prisma';

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

    const result = await exchangeMicrosoftEmailCode(code);
    const account = result?.account;
    const email = account?.username;
    if (!email || !result?.accessToken) {
      return NextResponse.redirect(new URL('/settings?error=oauth_no_email', req.url));
    }

    const existing = await prisma.userEmailAccount.findUnique({
      where: { userId_email: { userId, email } },
    });
    const refreshToken = (result as { refreshToken?: string }).refreshToken;
    const tokenData = {
      accessToken: encryptToken(result.accessToken),
      refreshToken: refreshToken ? encryptToken(refreshToken) : null,
      tokenExpiresAt: result.expiresOn ? new Date(result.expiresOn) : null,
      scopes: result.scopes?.join(' ') || null,
    };

    if (existing) {
      await prisma.userEmailAccount.update({
        where: { id: existing.id },
        data: { ...tokenData, status: 'WARMING' },
      });
    } else {
      await prisma.userEmailAccount.create({
        data: {
          userId,
          email,
          displayName: account.name || email,
          provider: 'OUTLOOK',
          status: 'WARMING',
          tier: 'FREE',
          dailyLimit: 50,
          ...tokenData,
        },
      });
    }

    const res = NextResponse.redirect(new URL('/settings?email=connected', req.url));
    res.cookies.delete('email_oauth_state');
    res.cookies.delete('email_oauth_user_id');
    return res;
  } catch (err) {
    console.error('Microsoft OAuth callback error:', err);
    return NextResponse.redirect(new URL('/settings?error=oauth_failed', req.url));
  }
}
