import { NextRequest, NextResponse } from 'next/server';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

export async function POST(request: NextRequest) {
  try {
    if (!RAILWAY_API_URL) {
      console.error('RAILWAY_API_URL not configured');
      return NextResponse.json(
        { success: false, error: 'Backend API not configured' },
        { status: 503 }
      );
    }

    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Forward to Railway backend
    const response = await fetch(`${RAILWAY_API_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const backendData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: backendData.message || backendData.error || 'Failed to resend verification email' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      data: backendData.data || backendData,
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
