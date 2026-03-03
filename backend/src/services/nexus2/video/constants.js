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

// ── R2 Clip Catalog ──────────────────────────────────────────
// Pre-uploaded stock clips in Cloudflare R2.
// Tags drive AI scene-matching — keep them broad + specific.
const CLIP_CATALOG = [
  { id: 'clip-001', url: `${R2_CLIP_BASE}/clips/office-team-meeting.mp4`,     duration: 8,  tags: ['office', 'team', 'meeting', 'business', 'collaboration'] },
  { id: 'clip-002', url: `${R2_CLIP_BASE}/clips/typing-laptop-closeup.mp4`,   duration: 6,  tags: ['laptop', 'typing', 'work', 'technology', 'desk'] },
  { id: 'clip-003', url: `${R2_CLIP_BASE}/clips/city-skyline-aerial.mp4`,     duration: 10, tags: ['city', 'skyline', 'aerial', 'urban', 'drone'] },
  { id: 'clip-004', url: `${R2_CLIP_BASE}/clips/handshake-deal.mp4`,          duration: 5,  tags: ['handshake', 'deal', 'agreement', 'business', 'partnership'] },
  { id: 'clip-005', url: `${R2_CLIP_BASE}/clips/coffee-shop-ambience.mp4`,    duration: 7,  tags: ['coffee', 'cafe', 'ambience', 'relaxation', 'morning'] },
  { id: 'clip-006', url: `${R2_CLIP_BASE}/clips/construction-site.mp4`,       duration: 9,  tags: ['construction', 'building', 'workers', 'hard-hat', 'site'] },
  { id: 'clip-007', url: `${R2_CLIP_BASE}/clips/restaurant-kitchen.mp4`,      duration: 7,  tags: ['restaurant', 'kitchen', 'cooking', 'chef', 'food'] },
  { id: 'clip-008', url: `${R2_CLIP_BASE}/clips/gym-workout.mp4`,             duration: 8,  tags: ['gym', 'workout', 'fitness', 'exercise', 'health'] },
  { id: 'clip-009', url: `${R2_CLIP_BASE}/clips/retail-store-front.mp4`,      duration: 6,  tags: ['retail', 'store', 'shopping', 'storefront', 'customer'] },
  { id: 'clip-010', url: `${R2_CLIP_BASE}/clips/medical-office.mp4`,          duration: 7,  tags: ['medical', 'doctor', 'office', 'healthcare', 'clinic'] },
  { id: 'clip-011', url: `${R2_CLIP_BASE}/clips/real-estate-walkthrough.mp4`, duration: 12, tags: ['real-estate', 'house', 'walkthrough', 'interior', 'property'] },
  { id: 'clip-012', url: `${R2_CLIP_BASE}/clips/car-driving-highway.mp4`,     duration: 8,  tags: ['car', 'driving', 'highway', 'road', 'travel'] },
  { id: 'clip-013', url: `${R2_CLIP_BASE}/clips/salon-haircut.mp4`,           duration: 7,  tags: ['salon', 'haircut', 'beauty', 'stylist', 'grooming'] },
  { id: 'clip-014', url: `${R2_CLIP_BASE}/clips/warehouse-logistics.mp4`,     duration: 9,  tags: ['warehouse', 'logistics', 'shipping', 'boxes', 'inventory'] },
  { id: 'clip-015', url: `${R2_CLIP_BASE}/clips/sunset-nature.mp4`,           duration: 10, tags: ['sunset', 'nature', 'landscape', 'golden-hour', 'peaceful'] },
  { id: 'clip-016', url: `${R2_CLIP_BASE}/clips/phone-scrolling.mp4`,         duration: 5,  tags: ['phone', 'scrolling', 'social-media', 'mobile', 'technology'] },
  { id: 'clip-017', url: `${R2_CLIP_BASE}/clips/presentation-stage.mp4`,      duration: 8,  tags: ['presentation', 'stage', 'speaker', 'conference', 'event'] },
  { id: 'clip-018', url: `${R2_CLIP_BASE}/clips/happy-customer.mp4`,          duration: 6,  tags: ['customer', 'happy', 'smile', 'satisfaction', 'service'] },
  { id: 'clip-019', url: `${R2_CLIP_BASE}/clips/drone-neighborhood.mp4`,      duration: 11, tags: ['drone', 'neighborhood', 'houses', 'aerial', 'suburban'] },
  { id: 'clip-020', url: `${R2_CLIP_BASE}/clips/whiteboard-brainstorm.mp4`,   duration: 7,  tags: ['whiteboard', 'brainstorm', 'ideas', 'planning', 'creative'] },
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
