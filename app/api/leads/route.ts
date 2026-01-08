import { NextRequest, NextResponse } from 'next/server';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

export const dynamic = 'force-dynamic';

// GET /api/leads - List all leads
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
    const source = searchParams.get('source');
    const industry = searchParams.get('industry');
    const search = searchParams.get('search');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';

    const queryParams = new URLSearchParams({
      page,
      limit,
    });

    if (status) queryParams.append('status', status);
    if (source) queryParams.append('source', source);
    if (industry) queryParams.append('industry', industry);
    if (search) queryParams.append('search', search);

    if (!RAILWAY_API_URL) {
      // Demo mode
      return NextResponse.json({
        success: true,
        data: {
          leads: [],
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      });
    }

    const response = await fetch(`${RAILWAY_API_URL}/api/leads?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || data.error || 'Failed to fetch leads' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get leads error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create new lead
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
      // Demo mode
      return NextResponse.json({
        success: true,
        data: {
          id: 'demo-lead-' + Date.now(),
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }

    const response = await fetch(`${RAILWAY_API_URL}/api/leads`, {
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
        { success: false, error: data.message || data.error || 'Failed to create lead' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
