import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    if (!RAILWAY_API_URL) {
      console.error('RAILWAY_API_URL not configured');
      return NextResponse.json(
        { success: false, error: 'Backend API not configured' },
        { status: 503 }
      );
    }

    // Forward to Railway backend
    const response = await fetch(`${RAILWAY_API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const backendData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: backendData.message || backendData.error || 'Verification failed' },
        { status: response.status }
      );
    }

    // Backend returns: { success: true, data: { user, token } }
    const authToken = backendData.token || backendData.data?.token;
    const user = backendData.data?.user || backendData.user;

    if (!authToken) {
      console.error('❌ No token received from backend verification');
      return NextResponse.json(
        { success: false, error: 'Authentication token not received' },
        { status: 500 }
      );
    }

    // Set HTTP-only cookie for token (auto-login after verification)
    const responseData = NextResponse.json({
      success: true,
      data: backendData.data || backendData,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    responseData.cookies.set('auth-token', authToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log(`✅ Auth token cookie set after email verification (user: ${user?.email || 'unknown'})`);

    return responseData;
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
