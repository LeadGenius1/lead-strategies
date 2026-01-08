import { NextRequest, NextResponse } from 'next/server';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

export const dynamic = 'force-dynamic';

// GET /api/analytics - Get overall analytics
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!RAILWAY_API_URL) {
      // Demo mode
      return NextResponse.json({
        success: true,
        data: {
          leads: {
            total: 0,
            new: 0,
            contacted: 0,
            qualified: 0,
            converted: 0,
          },
          campaigns: {
            total: 0,
            sent: 0,
            scheduled: 0,
            draft: 0,
          },
          emails: {
            sent: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            openRate: 0,
            clickRate: 0,
          },
          revenue: {
            mrr: 0,
            arr: 0,
            customers: 0,
          },
        },
      });
    }

    const response = await fetch(`${RAILWAY_API_URL}/api/analytics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || data.error || 'Failed to fetch analytics' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
