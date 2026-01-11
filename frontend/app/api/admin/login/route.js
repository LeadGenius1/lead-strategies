/**
 * Admin Login API Route
 * Proxies to backend admin login
 */

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || 'unknown',
        'User-Agent': request.headers.get('user-agent') || 'unknown'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // Create response with cookie if login successful
    if (data.success && data.data?.token) {
      const res = NextResponse.json(data);

      // Set HTTP-only cookie
      res.cookies.set('admin_token', data.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 4 * 60 * 60 // 4 hours
      });

      return res;
    }

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to connect to server' },
      { status: 500 }
    );
  }
}
