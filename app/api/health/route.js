// Health Check Endpoint for Railway
// Returns 200 OK immediately - no dependencies

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ai-lead-strategies-frontend'
  }, { status: 200 });
}

// Use edge runtime for fastest response
export const runtime = 'edge';
