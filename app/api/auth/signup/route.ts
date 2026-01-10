import { NextRequest, NextResponse } from 'next/server';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { firstName, lastName, email, password, tier, companyName } = body;
    
    if (!firstName || !lastName || !email || !password || !tier || !companyName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Forward to Railway backend
    if (!RAILWAY_API_URL) {
      console.error('RAILWAY_API_URL not configured');
      return NextResponse.json(
        { success: false, error: 'Backend API not configured. Please set RAILWAY_API_URL environment variable.' },
        { status: 503 }
      );
    }

    // Map frontend fields to backend expected format
    // Backend supports both formats now
    const backendPayload = {
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      companyName: body.companyName,
      tier: body.tier || 'leadsite-ai', // Backend will map to tier number
      industry: body.industry,
      companySize: body.companySize,
      currentTools: body.currentTools,
    };

    console.log('Signup request to backend:', RAILWAY_API_URL);

    const response = await fetch(`${RAILWAY_API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    const backendData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: backendData.message || backendData.error || 'Signup failed' },
        { status: response.status }
      );
    }

    // Backend returns: { success: true, token, data: { user, subscription } }
    const token = backendData.token || backendData.data?.token;
    const user = backendData.data?.user || backendData.user;

    if (!token) {
      console.error('❌ No token received from backend signup');
      return NextResponse.json(
        { success: false, error: 'Authentication token not received' },
        { status: 500 }
      );
    }

    // Set HTTP-only cookie for token (auto-login after signup)
    const responseData = NextResponse.json({
      success: true,
      data: backendData.data || backendData,
      token: token, // Also include in response for debugging
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

    console.log(`✅ Auth token cookie set for signup (user: ${user?.email || 'unknown'})`);

    return responseData;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
