/**
 * GET /api/websites - List AiBuilderSites for current user
 * POST is handled by /api/websites/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';

async function getUserId(request) {
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value || cookieStore.get('admin_token')?.value;
  }
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id || decoded.userId || decoded.sub || null;
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sites = await prisma.aiBuilderSite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        subdomain: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { websites: sites, aiBuilderSites: sites },
    });
  } catch (error) {
    console.error('[api/websites] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load websites' },
      { status: 500 }
    );
  }
}
