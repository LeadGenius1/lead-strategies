import { NextResponse } from 'next/server';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

export async function GET() {
  try {
    const health: {
      status: string;
      timestamp: string;
      frontend: string;
      backend: string;
      backendUrl: string;
      backendError?: string;
    } = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      frontend: 'operational',
      backend: RAILWAY_API_URL ? 'configured' : 'not_configured',
      backendUrl: RAILWAY_API_URL || 'not_set',
    };

    // Try to ping backend if URL is configured
    if (RAILWAY_API_URL) {
      try {
        const response = await fetch(`${RAILWAY_API_URL}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        
        if (response.ok) {
          health.backend = 'operational';
        } else {
          health.backend = 'unreachable';
        }
      } catch (error) {
        health.backend = 'unreachable';
        health.backendError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
