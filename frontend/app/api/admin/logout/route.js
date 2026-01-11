/**
 * Admin Logout API Route
 */

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/admin/logout`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    // Clear the cookie
    const res = NextResponse.json(data);
    res.cookies.delete('admin_token');

    return res;

  } catch (error) {
    const res = NextResponse.json(
      { success: true, message: 'Logged out' },
      { status: 200 }
    );
    res.cookies.delete('admin_token');
    return res;
  }
}
