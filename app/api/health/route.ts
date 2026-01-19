/**
 * Frontend Health Check Endpoint
 * For Railway health monitoring
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if backend is reachable
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';
    let backendStatus = 'unknown';
    
    try {
      const backendResponse = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
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
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
