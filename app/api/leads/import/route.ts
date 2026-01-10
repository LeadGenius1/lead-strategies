import { NextRequest, NextResponse } from 'next/server';
import { parseCSV, validateLead } from '@/lib/leads';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'CSV file is empty or invalid' },
        { status: 400 }
      );
    }

    // Map CSV columns to lead fields
    const leads = rows.map((row, index) => {
      const lead: any = {
        firstName: row['first name'] || row['firstname'] || row['first_name'] || '',
        lastName: row['last name'] || row['lastname'] || row['last_name'] || '',
        email: row['email'] || row['e-mail'] || '',
        company: row['company'] || row['company name'] || '',
        title: row['title'] || row['job title'] || row['position'] || '',
        phone: row['phone'] || row['phone number'] || row['telephone'] || '',
        website: row['website'] || row['url'] || '',
        industry: row['industry'] || '',
        source: row['source'] || 'csv_import',
        status: 'new',
        notes: row['notes'] || row['note'] || '',
        tags: row['tags'] ? row['tags'].split(',').map((t: string) => t.trim()) : [],
      };

      return { lead, rowIndex: index + 2 }; // +2 because CSV has header and 1-based index
    });

    // Validate leads
    const validLeads: any[] = [];
    const errors: string[] = [];

    leads.forEach(({ lead, rowIndex }) => {
      const validation = validateLead(lead);
      if (validation.valid) {
        validLeads.push(lead);
      } else {
        errors.push(`Row ${rowIndex}: ${validation.errors.join(', ')}`);
      }
    });

    if (validLeads.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid leads found',
          errors,
        },
        { status: 400 }
      );
    }

    // Import to backend
    if (!RAILWAY_API_URL) {
      return NextResponse.json(
        { success: false, error: 'Backend API not configured. Please set RAILWAY_API_URL environment variable.' },
        { status: 503 }
      );
    }

    // Use bulk import endpoint
    const response = await fetch(`${RAILWAY_API_URL}/api/leads/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leads: validLeads }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Import failed',
          errors: errorData.errors || errors,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    const imported = result.data?.created || 0;
    const failed = result.data?.failed || 0;
    const allErrors = [...errors, ...(result.data?.errors || [])];

    return NextResponse.json({
      success: true,
      data: {
        imported,
        failed,
        errors: allErrors.length > 0 ? allErrors : undefined,
      },
    });
  } catch (error) {
    console.error('Import leads error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
