/**
 * POST /api/websites/generate
 * AI Website Builder: generate site from template + form data
 * Replaces {{placeholders}} in template HTML and saves to AiBuilderSite
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';

// Manifest slugs to file mapping (from public/templates/templates-manifest.json)
const TEMPLATE_FILES = {
  'executive-dark': 'template-1a-executive-dark.html',
  'warm-professional': 'template-2b-warm-professional.html',
  'tech-premium': 'template-3c-tech-premium.html',
  'minimal-portfolio': 'template-4d-minimal-portfolio.html',
  'ai-agency': 'template-5e-ai-agency.html',
  '1a': 'template-1a-executive-dark.html',
  '2b': 'template-2b-warm-professional.html',
  '3c': 'template-3c-tech-premium.html',
  '4d': 'template-4d-minimal-portfolio.html',
  '5e': 'template-5e-ai-agency.html',
};

const SLUG_MAP = {
  '1a': 'executive-dark',
  '2b': 'warm-professional',
  '3c': 'tech-premium',
  '4d': 'minimal-portfolio',
  '5e': 'ai-agency',
};

async function getUserId(request) {
  // 1. Try Authorization header
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
      // JWT invalid/expired - fall through to NextAuth
    }
  }
  // 2. Fallback: NextAuth session (OAuth logins)
  const session = await getSession();
  return session?.user?.id || null;
}

function replacePlaceholders(html, formData) {
  const placeholders = {
    business_name: formData.business_name || '',
    tagline: formData.tagline || '',
    accent_color: formData.accent_color || '#3b82f6',
    email: formData.email || '',
    contact_email: formData.email || '',
    contact_phone: formData.phone || '',
    contact_address: formData.address || '',
    hero_title_line1: formData.business_name || '',
    hero_title_line2: (formData.tagline || '').split(/\s+/).slice(0, 3).join(' ') || formData.tagline || '',
    hero_description: (formData.about_story || '').substring(0, 200) || formData.tagline || '',
    service1_title: formData.service1_name || '',
    service1_description: formData.service1_description || '',
    service2_title: formData.service2_name || '',
    service2_description: formData.service2_description || '',
    service3_title: formData.service3_name || '',
    service3_description: formData.service3_description || '',
    about_headline: formData.about_headline || '',
    about_description: formData.about_story || '',
    about_story: formData.about_story || '',
    stat1_value: formData.years_experience || '5+',
    stat2_value: formData.clients_served || '100+',
    cta_primary: formData.primary_cta || 'Get Started',
    cta_secondary: formData.secondary_cta || 'Learn More',
    cta_destination: formData.cta_destination || '#contact',
    social_link1: formData.linkedin || '#',
    social_link2: formData.facebook || '#',
    social_link3: formData.instagram || '#',
    current_year: String(new Date().getFullYear()),
  };
  let out = html;
  for (const [key, value] of Object.entries(placeholders)) {
    out = out.replace(new RegExp(`{{${key}}}`, 'g'), String(value ?? ''));
  }
  return out;
}

async function ensureTemplate(slug) {
  const s = SLUG_MAP[slug] || slug;
  let t = await prisma.websiteTemplate.findUnique({ where: { slug: s } });
  if (t) return t;
  const file = TEMPLATE_FILES[s] || TEMPLATE_FILES[slug];
  if (!file) return null;
  const publicDir = path.join(process.cwd(), 'public', 'templates');
  const html = await readFile(path.join(publicDir, file), 'utf-8');
  const css = ''; // templates embed styles
  t = await prisma.websiteTemplate.create({
    data: {
      name: s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      slug: s,
      html,
      css,
    },
  });
  return t;
}

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, formData } = body;

    if (!templateId || !formData || typeof formData !== 'object') {
      return NextResponse.json(
        { error: 'templateId and formData are required' },
        { status: 400 }
      );
    }

    const template = await ensureTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        { error: `Template not found: ${templateId}` },
        { status: 404 }
      );
    }

    const html = replacePlaceholders(template.html, formData);
    const css = template.css || '';

    const name = formData.business_name || 'My Website';
    const subdomainBase = name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
    let subdomain = subdomainBase;
    let n = 1;
    while (true) {
      const exists = await prisma.aiBuilderSite.findUnique({ where: { subdomain } });
      if (!exists) break;
      subdomain = `${subdomainBase}-${n}`;
      n++;
    }

    const site = await prisma.aiBuilderSite.create({
      data: {
        userId,
        templateId: template.id,
        name,
        html,
        css,
        formData,
        status: 'draft',
        subdomain,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        html,
        css,
        websiteId: site.id,
        name: site.name,
        subdomain: site.subdomain,
      },
    });
  } catch (error) {
    console.error('[api/websites/generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate website', details: error?.message },
      { status: 500 }
    );
  }
}
