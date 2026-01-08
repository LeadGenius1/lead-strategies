import { NextRequest, NextResponse } from 'next/server';
import { exportLeadsToCSV } from '@/lib/leads';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

export const dynamic = 'force-dynamic';

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

    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    if (source) queryParams.append('source', source);
    if (industry) queryParams.append('industry', industry);
    if (search) queryParams.append('search', search);
    queryParams.append('limit', '10000'); // Get all leads for export

    if (!RAILWAY_API_URL) {
      return NextResponse.json(
        { success: false, error: 'Backend API not configured. Please set RAILWAY_API_URL environment variable.' },
        { status: 503 }
      );
    }

    const response = await fetch(`${RAILWAY_API_URL}/api/leads?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { success: false, error: data.message || data.error || 'Failed to fetch leads' },
        { status: response.status }
      );
    }

    const result = await response.json();
    const leads = result.data?.leads || result.leads || [];

    // Convert to CSV
    const csv = exportLeadsToCSV(leads);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export leads error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
