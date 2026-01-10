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

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || data.error || 'Signup failed' },
        { status: response.status }
      );
    }

    // Set HTTP-only cookie for token if provided (auto-login after signup)
    const responseData = NextResponse.json({
      success: true,
      data,
    });

    if (data.token) {
      responseData.cookies.set('auth-token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

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
