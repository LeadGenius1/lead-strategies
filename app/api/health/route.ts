/**
 * Frontend Health Check Endpoint
 * For Railway health monitoring
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Simple health check - always return 200 for Railway
  // Backend check is optional and won't fail health check
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';
    let backendStatus = 'unknown';
    
    try {
      const backendResponse = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 second timeout for health check
      });
      backendStatus = backendResponse.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      backendStatus = 'unreachable';
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'frontend',
      environment: process.env.NODE_ENV || 'production',
      backend: {
        url: backendUrl,
        status: backendStatus,
      },
    }, { status: 200 });
  } catch (error: any) {
    // Even on error, return 200 - don't fail Railway health check
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'frontend',
        error: error.message,
      },
      { status: 200 }
    );
  }
}

// Use edge runtime for fastest response
export const runtime = 'edge';
