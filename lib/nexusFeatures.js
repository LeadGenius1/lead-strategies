// lib/nexusFeatures.js — NEXUS OS panel definitions + tier-based feature gating

export const NEXUS_PANELS = [
  { id: 'feed',      name: 'Feed',      icon: 'Activity',  href: '/nexus/feed',      minTier: 0 },
  { id: 'strategy',  name: 'Strategy',  icon: 'Target',    href: '/nexus/strategy',  minTier: 0 },
  { id: 'outreach',  name: 'Outreach',  icon: 'Mail',      href: '/nexus/outreach',  minTier: 0 },
  { id: 'prospects', name: 'Prospects', icon: 'Users',     href: '/nexus/prospects', minTier: 1 },
  { id: 'websites',  name: 'Websites',  icon: 'Globe',     href: '/nexus/websites',  minTier: 2 },
  { id: 'videos',    name: 'Videos',    icon: 'PlayCircle', href: '/nexus/videos',   minTier: 4 },
  { id: 'settings',  name: 'Settings',  icon: 'Settings',  href: '/nexus/settings',  minTier: 0 },
];

/**
 * Returns panels with `available` and `locked` flags based on user tier.
 * @param {number} tier — numeric tier 1-5 (0 = free/default)
 * @returns {{ id: string, name: string, icon: string, href: string, minTier: number, available: boolean, locked: boolean }[]}
 */
export function getNexusPanels(tier = 0) {
  const t = Number(tier) || 0;
  return NEXUS_PANELS.map((panel) => ({
    ...panel,
    available: t >= panel.minTier,
    locked: t < panel.minTier,
  }));
}

/**
 * Tier-to-plan-name mapping used for display badges.
 */
export const TIER_PLAN_NAMES = {
  1: 'LeadSite.AI',
  2: 'LeadSite.IO',
  3: 'ClientContact',
  4: 'VideoSite.AI',
  5: 'UltraLead',
};
