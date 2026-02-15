/**
 * GET /api/websites - List AiBuilderSites for current user
 * POST is handled by /api/websites/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';

async function getUserId(request) {
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value || cookieStore.get('admin_token')?.value;
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const id = decoded.id || decoded.userId || decoded.sub;
      if (id) return id;
    } catch {
      /* fall through */
    }
  }
  const session = await getSession();
  return session?.user?.id || null;
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
