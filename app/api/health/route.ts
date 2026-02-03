/**
 * Frontend Health Check Endpoint
 * For Railway health monitoring - minimal response for fast pass
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Minimal sync response - no backend fetch to avoid timeouts on cold start
  return NextResponse.json(
    {
      status: 'ok',
      service: 'frontend',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

// Use Node.js runtime for standalone deploy compatibility (Edge can fail in Railway)
