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
      return NextResponse.json(
        { success: false, error: 'Backend API not configured. Please set RAILWAY_API_URL environment variable.' },
        { status: 503 }
      );
    }

    const response = await fetch(`${RAILWAY_API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || data.error || 'Signup failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
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
