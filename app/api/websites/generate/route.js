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
import { readFile, access } from 'fs/promises';
import { constants as fsConstants } from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

// Template slug → file mapping
// ALL slugs now point to the new Tailwind templates.
// Legacy slugs redirect to the closest new template.
const TEMPLATE_FILES = {
  // Primary new templates
  'aether': 'template-aether.html',
  'uslu': 'template-uslu.html',
  'vitalis': 'template-vitalis.html',
  'sourcing-sense': 'template-sourcing-sense.html',
  'svrn': 'template-svrn.html',
  // Short ID aliases → new templates
  '1a': 'template-aether.html',
  '2b': 'template-uslu.html',
  '3c': 'template-vitalis.html',
  '4d': 'template-sourcing-sense.html',
  '5e': 'template-svrn.html',
  // Legacy slugs → redirect to new templates (not old generic files)
  'executive-dark': 'template-aether.html',
  'warm-professional': 'template-vitalis.html',
  'tech-premium': 'template-aether.html',
  'minimal-portfolio': 'template-svrn.html',
  'ai-agency': 'template-aether.html',
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

CRITICAL RULES:
- NEVER repeat the user's input verbatim. Rewrite EVERYTHING into polished marketing copy.
- Write headlines that communicate a clear BENEFIT or TRANSFORMATION, not just the business name.
- Focus on OUTCOMES: what the customer GETS, not what the business DOES.
- CTAs should create urgency — "Start Your Free Trial", "Book a Strategy Call", "Get Your Quote".
- About sections should tell a STORY and build TRUST — not just repeat the description.
- You MUST generate ALL 3 services even if the user only described 1. Infer logical services from the business type and description.
- Service descriptions should lead with the PROBLEM SOLVED and the RESULT DELIVERED.
- Keep copy concise — headlines under 8 words, descriptions under 40 words.
- Match tone to business type (tech = bold/innovative, luxury = refined/exclusive, wellness = warm/caring, consulting = authoritative/trustworthy).

You MUST respond with ONLY a valid JSON object. No markdown, no code fences, no extra text.`;

function buildUserPrompt(formData) {
  const biz = formData.business_name || 'My Business';
  const type = formData.businessType || 'general';
  const desc = formData.about_story || formData.description || '';
  const svc1 = formData.service1_name || '';
  const svc1d = formData.service1_description || '';

  return `Generate COMPLETE website marketing copy for this business. Transform all input into compelling copy. DO NOT leave any field empty. If only 1 service is provided, INVENT 2 more that are logical for this business type.

BUSINESS INFO:
- Name: ${biz}
- Type/Industry: ${type}
- Their tagline: ${formData.tagline || 'none — create one'}
- Their description: ${desc || 'none — infer from name and type'}
- Service 1: ${svc1 || 'none'} — ${svc1d || 'none'}
- Service 2: ${formData.service2_name || 'not provided — invent one'} — ${formData.service2_description || ''}
- Service 3: ${formData.service3_name || 'not provided — invent one'} — ${formData.service3_description || ''}
- Years in business: ${formData.years_experience || 'not specified'}
- Clients served: ${formData.clients_served || 'not specified'}

Generate a JSON object with ALL of these keys (every field MUST have a value):
{
  "hero_title_line1": "A powerful 3-5 word headline about the TRANSFORMATION (NOT the business name)",
  "hero_title_line2": "A benefit-focused second line, 3-5 words",
  "tagline": "A compelling one-line value proposition (max 10 words)",
  "hero_description": "2-3 sentences that hook the reader. Focus on what they GAIN. Max 50 words.",
  "service1_title": "Benefit-focused service name (3-5 words, rewritten from input)",
  "service1_description": "Problem solved → outcome delivered. Max 30 words.",
  "service2_title": "Second service name (3-5 words — MUST be filled even if not in input)",
  "service2_description": "Problem solved → outcome delivered. Max 30 words.",
  "service3_title": "Third service name (3-5 words — MUST be filled even if not in input)",
  "service3_description": "Problem solved → outcome delivered. Max 30 words.",
  "about_headline": "Engaging about headline (4-7 words, NOT just 'About Us')",
  "about_description": "Trust-building paragraph — tell a STORY about why this business exists and what makes them different. Max 60 words. MUST differ from hero_description.",
  "cta_primary": "Action-oriented primary button (2-4 words, e.g. 'Start Free Trial')",
  "cta_secondary": "Softer secondary button (2-4 words, e.g. 'See How It Works')",
  "stat1_label": "What the first stat measures (e.g. 'Years Experience')",
  "stat2_label": "What the second stat measures (e.g. 'Clients Served')"
}`;
}

async function generateAIContent(formData) {
  if (!ANTHROPIC_API_KEY) {
    console.warn('[websites/generate] ANTHROPIC_API_KEY not set — using smart fallback');
    return null;
  }

  try {
    console.log('[websites/generate] Calling Anthropic API...');
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
    console.log('[websites/generate] ✅ AI content generated:', Object.keys(parsed).join(', '));
    return parsed;
  } catch (error) {
    console.error('[websites/generate] AI generation failed:', error.message);
    return null;
  }
}

// ============================================
// SMART FALLBACK (when AI is unavailable)
// ============================================

function generateSmartFallback(formData) {
  const biz = formData.business_name || 'Our Company';
  const type = (formData.businessType || '').toLowerCase();
  const desc = formData.about_story || formData.description || '';
  const svc1 = formData.service1_name || '';

  // Generate a headline that's NOT just the business name
  let heroLine1 = 'Elevate Your Business';
  let heroLine2 = 'To The Next Level';
  let ctaPrimary = 'Get Started Today';
  let ctaSecondary = 'Learn More';

  if (type.includes('tech') || type.includes('ai') || type.includes('saas') || type.includes('software')) {
    heroLine1 = 'Innovation That Drives';
    heroLine2 = 'Real Results';
    ctaPrimary = 'Start Free Trial';
    ctaSecondary = 'See How It Works';
  } else if (type.includes('real') || type.includes('architect') || type.includes('luxury')) {
    heroLine1 = 'Exceptional Quality';
    heroLine2 = 'Unmatched Excellence';
    ctaPrimary = 'Schedule Consultation';
    ctaSecondary = 'View Portfolio';
  } else if (type.includes('health') || type.includes('well') || type.includes('food') || type.includes('fit')) {
    heroLine1 = 'Transform Your Life';
    heroLine2 = 'Starting Today';
    ctaPrimary = 'Begin Your Journey';
    ctaSecondary = 'Explore Programs';
  } else if (type.includes('consult') || type.includes('b2b') || type.includes('finance') || type.includes('legal')) {
    heroLine1 = 'Strategic Solutions';
    heroLine2 = 'That Deliver Results';
    ctaPrimary = 'Book a Strategy Call';
    ctaSecondary = 'See Case Studies';
  } else if (type.includes('market') || type.includes('ecom') || type.includes('fashion')) {
    heroLine1 = 'Discover Something';
    heroLine2 = 'Extraordinary';
    ctaPrimary = 'Shop Now';
    ctaSecondary = 'Browse Collection';
  }

  // Build tagline from input or generate
  const tagline = formData.tagline || `${biz} — ${heroLine1} ${heroLine2}`;

  // Hero description — rewrite, don't repeat
  let heroDesc = desc
    ? `Discover how ${biz} is helping businesses achieve their goals. ${desc.split('.')[0]}.`
    : `${biz} delivers proven solutions that transform the way you work. Experience the difference that expertise and dedication make.`;
  if (heroDesc.length > 200) heroDesc = heroDesc.substring(0, 197) + '...';

  // Generate services — always fill all 3
  const service1Title = svc1 || 'Strategic Solutions';
  const service1Desc = formData.service1_description || `Tailored strategies designed to help your business grow and succeed in today's competitive landscape.`;
  const service2Title = formData.service2_name || 'Dedicated Support';
  const service2Desc = formData.service2_description || `Our expert team is committed to providing personalized guidance every step of the way.`;
  const service3Title = formData.service3_name || 'Proven Results';
  const service3Desc = formData.service3_description || `Data-driven approaches that consistently deliver measurable outcomes for our clients.`;

  // About — different from hero
  const aboutHeadline = formData.about_headline || `Why ${biz}?`;
  const aboutDesc = desc
    ? `At ${biz}, we believe in delivering excellence. ${desc.split('.').slice(0, 2).join('.')}. That commitment drives everything we do.`
    : `Founded with a passion for excellence, ${biz} has built a reputation for delivering outstanding results. We combine deep expertise with a client-first approach to help you achieve your goals.`;

  console.log('[websites/generate] Using smart fallback content (no AI API key)');

  return {
    hero_title_line1: heroLine1,
    hero_title_line2: heroLine2,
    tagline,
    hero_description: heroDesc,
    service1_title: service1Title,
    service1_description: service1Desc,
    service2_title: service2Title,
    service2_description: service2Desc,
    service3_title: service3Title,
    service3_description: service3Desc,
    about_headline: aboutHeadline,
    about_description: aboutDesc,
    cta_primary: ctaPrimary,
    cta_secondary: ctaSecondary,
  };
}

// ============================================
// PLACEHOLDER REPLACEMENT
// ============================================

function buildPlaceholders(formData, aiContent) {
  // Use AI content if available, otherwise smart fallback (never empty strings)
  const content = aiContent || generateSmartFallback(formData);

  return {
    // Literal fields — always from user input
    business_name: formData.business_name || 'My Business',
    accent_color: formData.accent_color || '#6366f1',
    email: formData.email || '',
    contact_email: formData.email || 'hello@example.com',
    contact_phone: formData.phone || '',
    contact_address: formData.address || '',
    stat1_value: formData.years_experience || '5+',
    stat2_value: formData.clients_served || '100+',
    cta_destination: formData.cta_destination || '#contact',
    social_link1: formData.linkedin || '#',
    social_link2: formData.facebook || '#',
    social_link3: formData.instagram || '#',
    current_year: String(new Date().getFullYear()),

    // Content fields — AI-generated or smart fallback (never empty)
    tagline: content.tagline,
    hero_title_line1: content.hero_title_line1,
    hero_title_line2: content.hero_title_line2,
    hero_description: content.hero_description,
    service1_title: content.service1_title,
    service1_description: content.service1_description,
    service2_title: content.service2_title,
    service2_description: content.service2_description,
    service3_title: content.service3_title,
    service3_description: content.service3_description,
    about_headline: content.about_headline,
    about_description: content.about_description,
    about_story: content.about_description,
    cta_primary: content.cta_primary,
    cta_secondary: content.cta_secondary,
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
// TEMPLATE LOADING (disk read with HTTP fallback)
// ============================================

async function readTemplateFromDisk(file) {
  // Try multiple possible paths where public/templates/ could live
  const candidates = [
    path.join(process.cwd(), 'public', 'templates', file),
    path.join(process.cwd(), '.next', 'server', 'public', 'templates', file),
    path.resolve('public', 'templates', file),
  ];

  for (const filePath of candidates) {
    try {
      await access(filePath, fsConstants.R_OK);
      const html = await readFile(filePath, 'utf-8');
      console.log(`[loadTemplate] ✅ Read from disk: ${filePath} (${html.length} chars)`);
      return html;
    } catch {
      // Try next path
    }
  }

  console.warn(`[loadTemplate] ❌ File not found on disk for: ${file}`);
  console.warn(`[loadTemplate]    Tried paths: ${candidates.join(', ')}`);
  return null;
}

async function readTemplateFromURL(file) {
  // Fallback: fetch from public URL (files in public/ are served by Next.js)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    || process.env.NEXTAUTH_URL
    || `http://localhost:${process.env.PORT || 3000}`;
  const url = `${baseUrl}/templates/${file}`;

  try {
    console.log(`[loadTemplate] Attempting HTTP fallback: ${url}`);
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      console.error(`[loadTemplate] ❌ HTTP fallback failed: ${res.status} for ${url}`);
      return null;
    }
    const html = await res.text();
    console.log(`[loadTemplate] ✅ Read from URL: ${url} (${html.length} chars)`);
    return html;
  } catch (error) {
    console.error(`[loadTemplate] ❌ HTTP fallback error: ${error.message}`);
    return null;
  }
}

async function loadTemplate(slug) {
  const s = SLUG_MAP[slug] || slug;
  const file = TEMPLATE_FILES[s] || TEMPLATE_FILES[slug];

  console.log(`[loadTemplate] slug="${slug}" → resolved="${s}" → file="${file}"`);

  if (!file) {
    console.error(`[loadTemplate] ❌ No file mapping for slug: ${slug}`);
    return null;
  }

  // Try disk first, then HTTP fallback
  let html = await readTemplateFromDisk(file);
  if (!html) {
    html = await readTemplateFromURL(file);
  }

  if (!html) {
    console.error(`[loadTemplate] ❌ Could not load template "${file}" from any source`);
    return null;
  }

  // Verify it's a real Tailwind template (not old generic HTML)
  const isTailwind = html.includes('cdn.tailwindcss.com') || html.includes('tailwindcss');
  console.log(`[loadTemplate] Template type: ${isTailwind ? 'Tailwind ✅' : 'Legacy/Generic ⚠️'} | Length: ${html.length}`);

  // Upsert DB record so we have a templateId for AiBuilderSite
  const name = s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const t = await prisma.websiteTemplate.upsert({
    where: { slug: s },
    update: { html, updatedAt: new Date() },
    create: { name, slug: s, html, css: '' },
  });

  console.log(`[loadTemplate] ✅ DB upserted: id=${t.id}, slug=${t.slug}`);
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

    console.log(`[websites/generate] ▶ Request: templateId="${body.templateId}" businessType="${formData?.businessType}" → resolved="${templateId}"`);

    if (!formData || typeof formData !== 'object') {
      return NextResponse.json(
        { error: 'formData is required' },
        { status: 400 }
      );
    }

    // 1. Load template HTML from disk (always fresh, with HTTP fallback)
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
