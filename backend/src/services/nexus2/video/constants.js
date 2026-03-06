// ═══════════════════════════════════════════════════════════════
// VIDEO CREATION ENGINE — CONSTANTS
// Clip catalog, music library, voice presets, templates,
// status enums, and format definitions.
// ═══════════════════════════════════════════════════════════════

const FFMPEG_RENDERER_URL = process.env.FFMPEG_RENDERER_URL || 'https://ffmpeg-renderer-production.up.railway.app';

const R2_CLIP_BASE = 'https://pub-08746658f70a4185a980f297b96d9e3b.r2.dev';

const VIDEO_TIERS = {
  AUTO: 'auto',
  PERSONALIZED: 'personalized',
};

const VIDEO_STATUS = {
  SCRIPT_DRAFT:      'script_draft',
  APPROVED:          'approved',
  GENERATING_VOICE:  'generating_voice',
  PLANNING_SCENES:   'planning_scenes',
  FETCHING_FOOTAGE:  'fetching_footage',
  PROCESSING_MEDIA:  'processing_media',
  RENDERING:         'rendering',
  UPLOADING:         'uploading',
  COMPLETE:          'complete',
  DISTRIBUTING:      'distributing',
  PUBLISHED:         'published',
  FAILED:            'failed',
};

const VIDEO_FORMATS = {
  vertical:   { width: 1080, height: 1920, label: 'Vertical (9:16)' },
  horizontal: { width: 1920, height: 1080, label: 'Horizontal (16:9)' },
  square:     { width: 1080, height: 1080, label: 'Square (1:1)' },
};

// ── Stock Clip Catalog ────────────────────────────────────────
// Pexels HD stock clips (verified accessible, no auth required).
// Tags drive AI scene-matching — keep them broad + specific.
// Renderer normalizes all clips to target resolution, so source res doesn't matter.
const CLIP_CATALOG = [
  { id: 'clip-001', url: 'https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4', duration: 8,  tags: ['office', 'team', 'meeting', 'business', 'collaboration'] },
  { id: 'clip-002', url: 'https://videos.pexels.com/video-files/2795173/2795173-hd_1920_1080_25fps.mp4', duration: 10, tags: ['city', 'skyline', 'aerial', 'urban', 'drone'] },
  { id: 'clip-003', url: 'https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4', duration: 8,  tags: ['laptop', 'typing', 'work', 'technology', 'desk'] },
  { id: 'clip-004', url: 'https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4', duration: 7,  tags: ['nature', 'landscape', 'peaceful', 'golden-hour', 'sunset'] },
  { id: 'clip-005', url: 'https://videos.pexels.com/video-files/5199837/5199837-hd_1920_1080_25fps.mp4', duration: 6,  tags: ['customer', 'happy', 'smile', 'satisfaction', 'service'] },
  { id: 'clip-006', url: 'https://videos.pexels.com/video-files/3255275/3255275-hd_1920_1080_25fps.mp4', duration: 9,  tags: ['construction', 'building', 'workers', 'site', 'industrial'] },
  { id: 'clip-007', url: 'https://videos.pexels.com/video-files/5752729/5752729-hd_1920_1080_30fps.mp4', duration: 7,  tags: ['restaurant', 'kitchen', 'cooking', 'chef', 'food'] },
  { id: 'clip-008', url: 'https://videos.pexels.com/video-files/2098989/2098989-hd_1920_1080_30fps.mp4', duration: 8,  tags: ['presentation', 'stage', 'speaker', 'conference', 'event'] },
  { id: 'clip-009', url: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4', duration: 6,  tags: ['retail', 'store', 'shopping', 'storefront', 'customer'] },
  { id: 'clip-010', url: 'https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4',   duration: 7,  tags: ['car', 'driving', 'highway', 'road', 'travel'] },
  { id: 'clip-011', url: 'https://videos.pexels.com/video-files/856029/856029-hd_1920_1080_25fps.mp4',   duration: 8,  tags: ['real-estate', 'house', 'interior', 'property', 'walkthrough'] },
  { id: 'clip-012', url: 'https://videos.pexels.com/video-files/854671/854671-hd_1920_1080_25fps.mp4',   duration: 7,  tags: ['phone', 'scrolling', 'social-media', 'mobile', 'technology'] },
  { id: 'clip-013', url: 'https://videos.pexels.com/video-files/854103/854103-hd_1920_1080_25fps.mp4',   duration: 9,  tags: ['warehouse', 'logistics', 'shipping', 'boxes', 'inventory'] },
  { id: 'clip-014', url: 'https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4', duration: 5,  tags: ['handshake', 'deal', 'agreement', 'business', 'partnership'] },
  { id: 'clip-015', url: 'https://videos.pexels.com/video-files/2795173/2795173-hd_1920_1080_25fps.mp4', duration: 7,  tags: ['coffee', 'cafe', 'ambience', 'relaxation', 'morning'] },
  { id: 'clip-016', url: 'https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4', duration: 6,  tags: ['gym', 'workout', 'fitness', 'exercise', 'health'] },
  { id: 'clip-017', url: 'https://videos.pexels.com/video-files/5752729/5752729-hd_1920_1080_30fps.mp4', duration: 8,  tags: ['medical', 'doctor', 'office', 'healthcare', 'clinic'] },
  { id: 'clip-018', url: 'https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4', duration: 7,  tags: ['salon', 'haircut', 'beauty', 'stylist', 'grooming'] },
  { id: 'clip-019', url: 'https://videos.pexels.com/video-files/3255275/3255275-hd_1920_1080_25fps.mp4', duration: 11, tags: ['drone', 'neighborhood', 'houses', 'aerial', 'suburban'] },
  { id: 'clip-020', url: 'https://videos.pexels.com/video-files/5199837/5199837-hd_1920_1080_25fps.mp4', duration: 7,  tags: ['whiteboard', 'brainstorm', 'ideas', 'planning', 'creative'] },
];

// ── Background Music Library ─────────────────────────────────
const MUSIC_LIBRARY = [
  { id: 'music-001', url: `${R2_CLIP_BASE}/music/upbeat-corporate.mp3`,   mood: 'upbeat',      genre: 'corporate' },
  { id: 'music-002', url: `${R2_CLIP_BASE}/music/calm-ambient.mp3`,       mood: 'calm',         genre: 'ambient' },
  { id: 'music-003', url: `${R2_CLIP_BASE}/music/energetic-pop.mp3`,      mood: 'energetic',    genre: 'pop' },
  { id: 'music-004', url: `${R2_CLIP_BASE}/music/inspiring-cinematic.mp3`, mood: 'inspiring',   genre: 'cinematic' },
  { id: 'music-005', url: `${R2_CLIP_BASE}/music/warm-acoustic.mp3`,      mood: 'warm',         genre: 'acoustic' },
  { id: 'music-006', url: `${R2_CLIP_BASE}/music/bold-electronic.mp3`,    mood: 'bold',         genre: 'electronic' },
  { id: 'music-007', url: `${R2_CLIP_BASE}/music/professional-piano.mp3`, mood: 'professional', genre: 'piano' },
  { id: 'music-008', url: `${R2_CLIP_BASE}/music/friendly-ukulele.mp3`,   mood: 'friendly',     genre: 'acoustic' },
];

// ── ElevenLabs Voice Presets ─────────────────────────────────
const VOICE_PRESETS = {
  professional: { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam',    tone: 'professional' },
  warm:         { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel',  tone: 'warm' },
  bold:         { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni',  tone: 'bold' },
  friendly:     { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella',   tone: 'friendly' },
};

// ── Tier 2 Industry Templates ────────────────────────────────
const VIDEO_TEMPLATES = [
  {
    id: 'before-after',
    name: 'Before & After',
    description: 'Show transformation results — great for home services, fitness, beauty.',
    scenes: ['before-shot', 'process', 'after-shot', 'cta'],
    photoSlots: 2,
    industries: ['home-services', 'fitness', 'beauty', 'landscaping'],
  },
  {
    id: 'service-showcase',
    name: 'Service Showcase',
    description: 'Highlight your core services with team in action.',
    scenes: ['intro', 'service-1', 'service-2', 'service-3', 'cta'],
    photoSlots: 3,
    industries: ['plumbing', 'electrical', 'hvac', 'cleaning', 'general'],
  },
  {
    id: 'team-intro',
    name: 'Team Introduction',
    description: 'Put a face to the business — builds trust.',
    scenes: ['company-intro', 'team-photo', 'values', 'cta'],
    photoSlots: 2,
    industries: ['general', 'medical', 'legal', 'financial'],
  },
  {
    id: 'testimonial',
    name: 'Testimonial Spotlight',
    description: 'Feature a customer review or success story.',
    scenes: ['hook', 'problem', 'solution', 'result', 'cta'],
    photoSlots: 1,
    industries: ['general', 'home-services', 'medical', 'fitness'],
  },
  {
    id: 'promo-offer',
    name: 'Promo Offer',
    description: 'Drive urgency with a limited-time deal.',
    scenes: ['attention-hook', 'offer-details', 'social-proof', 'cta-urgency'],
    photoSlots: 1,
    industries: ['retail', 'restaurant', 'beauty', 'general'],
  },
  {
    id: 'listing-tour',
    name: 'Listing Tour',
    description: 'Walk through a property or location.',
    scenes: ['exterior', 'interior-1', 'interior-2', 'features', 'cta'],
    photoSlots: 4,
    industries: ['real-estate', 'hospitality', 'event-venue'],
  },
  {
    id: 'product-highlight',
    name: 'Product Highlight',
    description: 'Showcase a product with close-ups and benefits.',
    scenes: ['reveal', 'feature-1', 'feature-2', 'in-use', 'cta'],
    photoSlots: 2,
    industries: ['retail', 'ecommerce', 'food-beverage'],
  },
  {
    id: 'tip-of-day',
    name: 'Tip of the Day',
    description: 'Quick educational content — great for social media.',
    scenes: ['hook-question', 'tip', 'example', 'cta'],
    photoSlots: 0,
    industries: ['general', 'medical', 'fitness', 'financial', 'legal'],
  },
];

module.exports = {
  FFMPEG_RENDERER_URL,
  R2_CLIP_BASE,
  VIDEO_TIERS,
  VIDEO_STATUS,
  VIDEO_FORMATS,
  CLIP_CATALOG,
  MUSIC_LIBRARY,
  VOICE_PRESETS,
  VIDEO_TEMPLATES,
};
