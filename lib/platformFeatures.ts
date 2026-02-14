// lib/platformFeatures.ts
// FINAL APPROVED FEATURE MATRIX - Last Updated: Feb 14, 2026
// DO NOT MODIFY WITHOUT CLIENT APPROVAL

export type PlatformType =
  | 'leadsite-ai'
  | 'leadsite-io'
  | 'clientcontact-io'
  | 'ultralead-ai'
  | 'videosite-ai'
  | 'admin';

export type FeatureCode =
  | 'F01' | 'F02' | 'F03' | 'F04' | 'F05' | 'F06' | 'F07' | 'F08' | 'F09' | 'F10'
  | 'F11' | 'F12' | 'F13' | 'F14' | 'F15' | 'F16' | 'F17' | 'F18' | 'F19' | 'F20';

export interface PlatformFeature {
  code: FeatureCode;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  href: string;
  tier?: 'free' | 'pro' | 'enterprise';
}

// ALL AVAILABLE FEATURES (F01-F20)
export const ALL_FEATURES: Record<FeatureCode, Omit<PlatformFeature, 'code'>> = {
  F01: {
    name: 'Lead Hunter',
    description: 'Find and scrape leads from web',
    icon: 'Search',
    href: '/lead-hunter',
  },
  F02: {
    name: 'Proactive Hunter',
    description: 'AI-powered lead discovery',
    icon: 'Zap',
    href: '/proactive-hunter',
    tier: 'pro',
  },
  F03: {
    name: 'Prospects',
    description: 'Manage prospect database',
    icon: 'Users',
    href: '/prospects',
  },
  F04: {
    name: 'Campaigns',
    description: 'Email campaign management',
    icon: 'Mail',
    href: '/campaigns',
  },
  F05: {
    name: 'Replies',
    description: 'View and manage email replies',
    icon: 'MessageSquare',
    href: '/replies',
  },
  F06: {
    name: 'Websites',
    description: 'Create and manage AI websites',
    icon: 'Globe',
    href: '/websites',
    tier: 'pro',
  },
  F07: {
    name: 'Inbox',
    description: 'Unified inbox across all channels',
    icon: 'Inbox',
    href: '/inbox',
  },
  F08: {
    name: 'Channels',
    description: '22+ social media channels with video posting',
    icon: 'Hash',
    href: '/inbox/settings/channels',
    tier: 'pro',
  },
  F09: {
    name: 'Videos',
    description: 'Hosted video library (VideoSite exclusive)',
    icon: 'Video',
    href: '/videos',
    tier: 'pro',
  },
  F10: {
    name: 'Upload',
    description: 'Upload videos to platform (VideoSite exclusive)',
    icon: 'Upload',
    href: '/videos/upload',
    tier: 'pro',
  },
  F11: {
    name: 'Earnings',
    description: 'Creator earnings dashboard (VideoSite exclusive)',
    icon: 'DollarSign',
    href: '/earnings',
    tier: 'pro',
  },
  F12: {
    name: 'CRM',
    description: 'Customer relationship management',
    icon: 'Building',
    href: '/crm',
    tier: 'pro',
  },
  F13: {
    name: 'Deals',
    description: 'Sales pipeline and deal tracking',
    icon: 'TrendingUp',
    href: '/crm/deals',
    tier: 'pro',
  },
  F14: {
    name: 'Analytics',
    description: 'Platform analytics and insights',
    icon: 'BarChart',
    href: '/analytics',
  },
  F15: {
    name: 'Profile',
    description: 'User profile and preferences',
    icon: 'User',
    href: '/profile',
  },
  F16: {
    name: 'Settings',
    description: 'Account and platform settings',
    icon: 'Settings',
    href: '/settings',
  },
  F17: {
    name: 'SMS Outreach',
    description: 'SMS campaign management',
    icon: 'Phone',
    href: '/sms',
  },
  F18: {
    name: 'AI Copywriter',
    description: 'AI-powered content generation',
    icon: 'Sparkles',
    href: '/copywriter',
  },
  F19: {
    name: 'Platforms',
    description: 'Platform switcher and overview',
    icon: 'Grid',
    href: '/admin/platforms',
  },
  F20: {
    name: 'Admin',
    description: 'Admin panel and user management',
    icon: 'Shield',
    href: '/admin/users',
  },
};

// APPROVED FEATURE MATRIX - FINAL VERSION
// Each platform's features were confirmed with client on Feb 14, 2026
export const PLATFORM_FEATURES: Record<PlatformType, FeatureCode[]> = {
  // LeadSite.AI: Email lead generation platform (9 features)
  'leadsite-ai': [
    'F01', // Lead Hunter
    'F02', // Proactive Hunter
    'F03', // Prospects
    'F04', // Campaigns
    'F05', // Replies
    'F14', // Analytics
    'F15', // Profile
    'F16', // Settings
    'F18', // AI Copywriter
  ],

  // LeadSite.IO: Website creator + email marketing (10 features)
  'leadsite-io': [
    'F01', // Lead Hunter
    'F02', // Proactive Hunter
    'F03', // Prospects
    'F04', // Campaigns
    'F05', // Replies
    'F06', // Websites (UNIQUE - website builder)
    'F14', // Analytics
    'F15', // Profile
    'F16', // Settings
    'F18', // AI Copywriter
  ],

  // ClientContact.IO: Unified inbox + social media (11 features)
  // NOTE: F08 (Channels) includes ability to post videos to social media
  'clientcontact-io': [
    'F01', // Lead Hunter
    'F02', // Proactive Hunter
    'F03', // Prospects
    'F04', // Campaigns
    'F05', // Replies
    'F07', // Inbox (UNIQUE - unified inbox)
    'F08', // Channels (UNIQUE - 22+ social media with video posting)
    'F14', // Analytics
    'F15', // Profile
    'F16', // Settings
    'F18', // AI Copywriter
  ],

  // UltraLead.AI: All-in-one business platform (15 features)
  // NOTE: Does NOT include video hosting (F09, F10, F11) - that's VideoSite exclusive
  // NOTE: F08 (Channels) allows posting videos to social media
  'ultralead-ai': [
    'F01', // Lead Hunter
    'F02', // Proactive Hunter
    'F03', // Prospects
    'F04', // Campaigns
    'F05', // Replies
    'F06', // Websites
    'F07', // Inbox
    'F08', // Channels (22+ social media with video posting)
    'F12', // CRM (UNIQUE - customer relationship management)
    'F13', // Deals (UNIQUE - sales pipeline)
    'F14', // Analytics
    'F15', // Profile
    'F16', // Settings
    'F17', // SMS Outreach (UNIQUE - SMS campaigns)
    'F18', // AI Copywriter
    // NO F09, F10, F11 - Video hosting is VideoSite.AI exclusive
  ],

  // VideoSite.AI: Video hosting platform with monetization (15 features)
  // NOTE: F09, F10, F11 are EXCLUSIVE to VideoSite.AI
  // NOTE: F08 (Channels) allows sharing videos to social media
  'videosite-ai': [
    'F01', // Lead Hunter (for audience growth)
    'F02', // Proactive Hunter
    'F03', // Prospects
    'F04', // Campaigns
    'F05', // Replies
    'F08', // Channels (share videos to social media)
    'F09', // Videos (EXCLUSIVE - hosted video library)
    'F10', // Upload (EXCLUSIVE - upload to platform)
    'F11', // Earnings (EXCLUSIVE - creator monetization)
    'F12', // CRM
    'F13', // Deals
    'F14', // Analytics
    'F15', // Profile
    'F16', // Settings
    'F18', // AI Copywriter
  ],

  // Admin: Super-dashboard with ALL features for testing (20 features)
  admin: [
    'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10',
    'F11', 'F12', 'F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19', 'F20',
  ],
};

// Display names for sidebar header
export const PLATFORM_DISPLAY_NAMES: Record<PlatformType, string> = {
  'leadsite-ai': 'LeadSite.AI',
  'leadsite-io': 'LeadSite.IO',
  'clientcontact-io': 'ClientContact.IO',
  'ultralead-ai': 'UltraLead',
  'videosite-ai': 'VideoSite.AI',
  admin: 'AI Lead Strategies',
};

// Helper: Get all features for a platform with full details
export function getPlatformFeatures(platform: PlatformType): PlatformFeature[] {
  const featureCodes = PLATFORM_FEATURES[platform] || [];
  return featureCodes.map((code) => ({
    code,
    ...ALL_FEATURES[code],
  }));
}

// Helper: Check if a platform has a specific feature
export function hasFeature(platform: PlatformType, feature: FeatureCode): boolean {
  return PLATFORM_FEATURES[platform]?.includes(feature) || false;
}

// Helper: Get feature count for a platform
export function getFeatureCount(platform: PlatformType): number {
  return PLATFORM_FEATURES[platform]?.length || 0;
}

// Helper: Detect platform from current domain/route
export function detectPlatformFromDomain(): PlatformType {
  if (typeof window === 'undefined') return 'ultralead-ai'; // SSR default

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // Admin route takes precedence
  if (pathname.startsWith('/admin')) {
    return 'admin';
  }

  // Domain-based detection (hostname for subdomains, pathname for aileadstrategies.com)
  if (hostname.includes('leadsite.ai') || pathname.includes('/leadsite-ai')) {
    return 'leadsite-ai';
  }

  if (hostname.includes('leadsite.io') || pathname.includes('/leadsite-io')) {
    return 'leadsite-io';
  }

  if (hostname.includes('clientcontact.io') || pathname.includes('/clientcontact-io')) {
    return 'clientcontact-io';
  }

  if (hostname.includes('ultralead.ai') || pathname.includes('/ultralead-ai')) {
    return 'ultralead-ai';
  }

  if (hostname.includes('videosite.ai') || pathname.includes('/videosite-ai')) {
    return 'videosite-ai';
  }

  // Default to UltraLead (most features) if can't determine
  return 'ultralead-ai';
}

// Helper: Detect platform from user subscription tier
export function detectPlatformFromUser(user: {
  subscription_tier?: string;
  plan_tier?: string;
  role?: string;
  tier?: number;
}): PlatformType {
  // Admin users get admin dashboard
  if (user.role === 'admin' || user.role === 'super_admin') {
    return 'admin';
  }

  // Numeric tier from backend (1-5) - matches platform-navigation.js TIER_TO_HOST
  if (typeof user.tier === 'number') {
    const TIER_MAP: Record<number, PlatformType> = {
      1: 'leadsite-ai',
      2: 'leadsite-io',
      3: 'clientcontact-io',
      4: 'videosite-ai',
      5: 'ultralead-ai',
    };
    return TIER_MAP[user.tier] || 'ultralead-ai';
  }

  const tier = (user.subscription_tier || user.plan_tier || '').toLowerCase();

  if (tier.includes('leadsite-ai') || tier.includes('leadsite_ai')) {
    return 'leadsite-ai';
  }

  if (tier.includes('leadsite-io') || tier.includes('leadsite_io')) {
    return 'leadsite-io';
  }

  if (tier.includes('clientcontact') || tier.includes('client_contact')) {
    return 'clientcontact-io';
  }

  if (tier.includes('ultralead') || tier.includes('ultra_lead')) {
    return 'ultralead-ai';
  }

  if (tier.includes('videosite') || tier.includes('video_site')) {
    return 'videosite-ai';
  }

  // Default based on tier level - map numeric tier to platform
  if (tier.includes('free') || tier.includes('starter')) {
    return 'leadsite-ai';
  }

  return 'ultralead-ai';
}
