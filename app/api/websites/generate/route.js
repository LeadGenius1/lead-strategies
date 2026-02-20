/**
 * POST /api/websites/generate
 * AI Website Builder: reads template from disk, calls Anthropic to generate
 * compelling marketing copy, replaces {{placeholders}}, saves to AiBuilderSite
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

// Template slug → file mapping
const TEMPLATE_FILES = {
  // New templates (Tailwind-based)
  'aether': 'template-aether.html',
  'uslu': 'template-uslu.html',
  'vitalis': 'template-vitalis.html',
  'sourcing-sense': 'template-sourcing-sense.html',
  'svrn': 'template-svrn.html',
  // Short ID aliases
  '1a': 'template-aether.html',
  '2b': 'template-uslu.html',
  '3c': 'template-vitalis.html',
  '4d': 'template-sourcing-sense.html',
  '5e': 'template-svrn.html',
  // Legacy slugs (existing sites still reference these)
  'executive-dark': 'template-1a-executive-dark.html',
  'warm-professional': 'template-2b-warm-professional.html',
  'tech-premium': 'template-3c-tech-premium.html',
  'minimal-portfolio': 'template-4d-minimal-portfolio.html',
  'ai-agency': 'template-5e-ai-agency.html',
};

const SLUG_MAP = {
  '1a': 'aether',
  '2b': 'uslu',
  '3c': 'vitalis',
  '4d': 'sourcing-sense',
  '5e': 'svrn',
};

// Template selection based on business type
const BUSINESS_TYPE_TEMPLATES = {
  'ai': 'aether',
  'tech': 'aether',
  'saas': 'aether',
  'software': 'aether',
  'real-estate': 'uslu',
  'architecture': 'uslu',
  'luxury': 'uslu',
  'food': 'vitalis',
  'health': 'vitalis',
  'wellness': 'vitalis',
  'nutrition': 'vitalis',
  'lifestyle': 'vitalis',
  'fitness': 'vitalis',
  'consulting': 'sourcing-sense',
  'b2b': 'sourcing-sense',
  'professional-services': 'sourcing-sense',
  'finance': 'sourcing-sense',
  'legal': 'sourcing-sense',
  'marketplace': 'svrn',
  'ecommerce': 'svrn',
  'fashion': 'svrn',
  'agency': 'aether',
  'marketing': 'aether',
};

function selectTemplate(businessType) {
  if (!businessType) return 'aether';
  const key = businessType.toLowerCase().replace(/\s+/g, '-');
  return BUSINESS_TYPE_TEMPLATES[key] || 'aether';
}

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

// ============================================
// AI CONTENT GENERATION (Anthropic API)
// ============================================

const COPYWRITER_SYSTEM_PROMPT = `You are a world-class conversion-focused copywriter for website landing pages. Your job is to take basic business information and transform it into compelling, benefit-focused marketing copy that SELLS.

RULES:
- NEVER repeat the user's input verbatim. Transform everything into polished marketing copy.
- Write headlines that grab attention and communicate a clear benefit or transformation.
- Write descriptions that focus on OUTCOMES and BENEFITS, not just features.
- CTAs should create urgency and be action-oriented.
- About sections should tell a story and build trust, not just list facts.
- Service descriptions should lead with the problem solved and the result delivered.
- Keep all copy concise — headlines under 8 words, descriptions under 40 words.
- Match the tone to the business type (tech = bold/innovative, luxury = refined/exclusive, wellness = warm/caring, consulting = authoritative/trustworthy).

You MUST respond with ONLY a valid JSON object. No markdown, no code fences, no extra text.`;

function buildUserPrompt(formData) {
  return `Generate website marketing copy for this business. Transform the raw input into compelling, benefit-focused content.

BUSINESS INFO:
- Name: ${formData.business_name || 'My Business'}
- Type: ${formData.businessType || 'general'}
- Tagline: ${formData.tagline || 'none provided'}
- Description: ${formData.about_story || formData.description || 'none provided'}
- Service 1: ${formData.service1_name || 'none'} — ${formData.service1_description || 'none'}
- Service 2: ${formData.service2_name || 'none'} — ${formData.service2_description || 'none'}
- Service 3: ${formData.service3_name || 'none'} — ${formData.service3_description || 'none'}
- Years in business: ${formData.years_experience || 'not specified'}
- Clients served: ${formData.clients_served || 'not specified'}

Generate a JSON object with these EXACT keys:
{
  "hero_title_line1": "A powerful 3-5 word headline (NOT the business name)",
  "hero_title_line2": "A benefit-focused second line, 3-5 words",
  "tagline": "A compelling one-line value proposition (max 10 words)",
  "hero_description": "2-3 sentences that hook the reader and communicate the core transformation (max 50 words)",
  "service1_title": "Benefit-focused service name (3-5 words)",
  "service1_description": "What problem this solves and the outcome delivered (max 30 words)",
  "service2_title": "Benefit-focused service name (3-5 words)",
  "service2_description": "What problem this solves and the outcome delivered (max 30 words)",
  "service3_title": "Benefit-focused service name (3-5 words)",
  "service3_description": "What problem this solves and the outcome delivered (max 30 words)",
  "about_headline": "An engaging about section headline (4-7 words)",
  "about_description": "A trust-building about paragraph that tells a story (max 60 words)",
  "cta_primary": "Action-oriented primary button text (2-4 words)",
  "cta_secondary": "Softer secondary button text (2-4 words)"
}`;
}

async function generateAIContent(formData) {
  if (!ANTHROPIC_API_KEY) {
    console.warn('[websites/generate] ANTHROPIC_API_KEY not set — using fallback copy');
    return null;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: COPYWRITER_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: buildUserPrompt(formData) }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[websites/generate] Anthropic API error:', response.status, errText);
      return null;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) {
      console.error('[websites/generate] Empty Anthropic response');
      return null;
    }

    // Parse JSON — strip markdown fences if present
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    console.log('[websites/generate] AI content generated successfully');
    return parsed;
  } catch (error) {
    console.error('[websites/generate] AI generation failed, using fallback:', error.message);
    return null;
  }
}

// ============================================
// PLACEHOLDER REPLACEMENT
// ============================================

function buildPlaceholders(formData, aiContent) {
  // AI-generated fields (with fallbacks to raw input)
  const ai = aiContent || {};

  return {
    // Literal fields — never AI-generated
    business_name: formData.business_name || '',
    accent_color: formData.accent_color || '#3b82f6',
    email: formData.email || '',
    contact_email: formData.email || '',
    contact_phone: formData.phone || '',
    contact_address: formData.address || '',
    stat1_value: formData.years_experience || '5+',
    stat2_value: formData.clients_served || '100+',
    cta_destination: formData.cta_destination || '#contact',
    social_link1: formData.linkedin || '#',
    social_link2: formData.facebook || '#',
    social_link3: formData.instagram || '#',
    current_year: String(new Date().getFullYear()),

    // AI-generated fields (fallback to raw input if AI unavailable)
    tagline: ai.tagline || formData.tagline || '',
    hero_title_line1: ai.hero_title_line1 || formData.business_name || '',
    hero_title_line2: ai.hero_title_line2 || formData.tagline || '',
    hero_description: ai.hero_description || formData.about_story || formData.tagline || '',
    service1_title: ai.service1_title || formData.service1_name || '',
    service1_description: ai.service1_description || formData.service1_description || '',
    service2_title: ai.service2_title || formData.service2_name || '',
    service2_description: ai.service2_description || formData.service2_description || '',
    service3_title: ai.service3_title || formData.service3_name || '',
    service3_description: ai.service3_description || formData.service3_description || '',
    about_headline: ai.about_headline || formData.about_headline || '',
    about_description: ai.about_description || formData.about_story || '',
    about_story: ai.about_description || formData.about_story || '',
    cta_primary: ai.cta_primary || formData.primary_cta || 'Get Started',
    cta_secondary: ai.cta_secondary || formData.secondary_cta || 'Learn More',
  };
}

function replacePlaceholders(html, placeholders) {
  let out = html;
  for (const [key, value] of Object.entries(placeholders)) {
    out = out.replace(new RegExp(`{{${key}}}`, 'g'), String(value ?? ''));
  }
  return out;
}

// ============================================
// TEMPLATE LOADING (always reads from disk)
// ============================================

async function loadTemplate(slug) {
  const s = SLUG_MAP[slug] || slug;
  const file = TEMPLATE_FILES[s] || TEMPLATE_FILES[slug];
  if (!file) return null;

  const publicDir = path.join(process.cwd(), 'public', 'templates');
  const html = await readFile(path.join(publicDir, file), 'utf-8');

  // Upsert DB record so we have a templateId for AiBuilderSite
  const name = s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const t = await prisma.websiteTemplate.upsert({
    where: { slug: s },
    update: { html },
    create: { name, slug: s, html, css: '' },
  });

  return t;
}

// ============================================
// POST HANDLER
// ============================================

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { formData } = body;
    // Support explicit templateId or auto-select from businessType
    const templateId = body.templateId || selectTemplate(formData?.businessType);

    if (!formData || typeof formData !== 'object') {
      return NextResponse.json(
        { error: 'formData is required' },
        { status: 400 }
      );
    }

    // 1. Load template HTML from disk (always fresh)
    const template = await loadTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        { error: `Template not found: ${templateId}` },
        { status: 404 }
      );
    }

    // 2. Generate AI content (falls back to raw input if API unavailable)
    const aiContent = await generateAIContent(formData);

    // 3. Build placeholders and replace in template
    const placeholders = buildPlaceholders(formData, aiContent);
    const html = replacePlaceholders(template.html, placeholders);
    const css = template.css || '';

    // 4. Generate unique subdomain
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

    // 5. Save to database
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
        templateUsed: templateId,
        aiGenerated: !!aiContent,
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
