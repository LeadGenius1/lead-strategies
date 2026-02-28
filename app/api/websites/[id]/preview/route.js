/**
 * GET /api/websites/[id]/preview
 * Returns the generated HTML for an AiBuilderSite (public preview)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const resolved = typeof params?.then === 'function' ? await params : params;
    const id = resolved?.id;
    if (!id) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    const site = await prisma.website.findUnique({
      where: { id },
      select: { htmlContent: true, status: true, name: true },
    });

    if (!site || !site.htmlContent) {
      return new NextResponse('Preview not found', { status: 404 });
    }

    return new NextResponse(site.htmlContent, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('[api/websites/[id]/preview] Error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
