import { NextRequest, NextResponse } from 'next/server';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!RAILWAY_API_URL) {
      return NextResponse.json(
        { success: false, error: 'Backend API not configured. Please set RAILWAY_API_URL environment variable.' },
        { status: 503 }
      );
    }

    const response = await fetch(`${RAILWAY_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const backendData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: backendData.message || backendData.error || 'Login failed' },
        { status: response.status }
      );
    }

    // Backend returns: { success: true, token, data: { user } }
    const token = backendData.token || backendData.data?.token;

    if (!token) {
      console.error('❌ No token received from backend login');
      return NextResponse.json(
        { success: false, error: 'Authentication token not received' },
        { status: 500 }
      );
    }

    // Set HTTP-only cookie for token
    const responseData = NextResponse.json({
      success: true,
      data: backendData.data || backendData,
    });

    // Set cookie - let browser handle domain automatically
    const isProduction = process.env.NODE_ENV === 'production';
    responseData.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      // Don't set domain - browser will use current domain automatically
    });

    console.log(`✅ Auth token cookie set for login (user: ${backendData.data?.user?.email || 'unknown'})`);

    return responseData;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
