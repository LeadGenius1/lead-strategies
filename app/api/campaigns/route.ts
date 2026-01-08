import { NextRequest, NextResponse } from 'next/server';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

export const dynamic = 'force-dynamic';

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';

    const queryParams = new URLSearchParams({ page, limit });
    if (status) queryParams.append('status', status);

    if (!RAILWAY_API_URL) {
      return NextResponse.json(
        { success: false, error: 'Backend API not configured. Please set RAILWAY_API_URL environment variable.' },
        { status: 503 }
      );
    }

    const response = await fetch(`${RAILWAY_API_URL}/api/campaigns?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || data.error || 'Failed to fetch campaigns' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!RAILWAY_API_URL) {
      return NextResponse.json(
        { success: false, error: 'Backend API not configured. Please set RAILWAY_API_URL environment variable.' },
        { status: 503 }
      );
    }

    const response = await fetch(`${RAILWAY_API_URL}/api/campaigns`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || data.error || 'Failed to create campaign' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
