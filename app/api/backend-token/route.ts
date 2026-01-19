/**
 * Backend Token Mint Endpoint (BFF Pattern)
 * Mints short-lived JWT tokens for backend API access
 * Requires authenticated NextAuth session
 */

import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { authOptions } from '../auth/[...nextauth]/route';

const BACKEND_TOKEN_SECRET = process.env.BACKEND_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || 'change-me';
const BACKEND_TOKEN_EXPIRES_IN = parseInt(process.env.BACKEND_TOKEN_EXPIRES_IN || '900', 10); // 15 minutes default

export async function GET(request: Request) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Please sign in to access the backend API.',
        },
        { status: 401 }
      );
    }

    // Mint short-lived backend token
    const token = jwt.sign(
      {
        sub: (session.user as any).id || session.user.email,
        email: session.user.email,
        name: session.user.name,
        roles: ['user'], // Can be enhanced with role-based access
        tier: (session.user as any).tier || 1,
      },
      BACKEND_TOKEN_SECRET,
      {
        expiresIn: BACKEND_TOKEN_EXPIRES_IN,
        audience: 'backend',
        issuer: 'frontend',
        algorithm: 'HS256',
      }
    );

    return NextResponse.json({
      token,
      expiresIn: BACKEND_TOKEN_EXPIRES_IN,
      expiresAt: new Date(Date.now() + BACKEND_TOKEN_EXPIRES_IN * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('Backend token mint error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to mint backend token.',
      },
      { status: 500 }
    );
  }
}
