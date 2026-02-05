/**
 * Platform-specific navigation based on hostname.
 * Returns nav items for the dashboard sidebar.
 */

export const PLATFORM_CONFIGS = {
  'leadsite.io': {
    name: 'LeadSite.IO',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'Target' },
      { name: 'Proactive Hunter', href: '/proactive-hunter', icon: 'Zap' },
      { name: 'Websites', href: '/websites', icon: 'Globe', unique: true },
      { name: 'Prospects', href: '/prospects', icon: 'Users' },
      { name: 'Campaigns', href: '/campaigns', icon: 'Envelope' },
      { name: 'Replies', href: '/replies', icon: 'ChatBubbleLeft' },
      { name: 'Analytics', href: '/analytics', icon: 'ChartBar' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
    ],
  },

  'leadsite.ai': {
    name: 'LeadSite.AI',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'Target' },
      { name: 'Proactive Hunter', href: '/proactive-hunter', icon: 'Zap', unique: true },
      { name: 'Websites', href: '/websites', icon: 'Globe' },
      { name: 'Prospects', href: '/prospects', icon: 'Users' },
      { name: 'Campaigns', href: '/campaigns', icon: 'Envelope' },
      { name: 'Replies', href: '/replies', icon: 'ChatBubbleLeft' },
      { name: 'Analytics', href: '/analytics', icon: 'ChartBar' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
    ],
  },

  'clientcontact.io': {
    name: 'ClientContact.IO',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'Target' },
      { name: 'Proactive Hunter', href: '/proactive-hunter', icon: 'Zap' },
      { name: 'Channels', href: '/inbox/channels', icon: 'Squares2X2', unique: true },
      { name: 'Campaigns', href: '/campaigns', icon: 'Envelope' },
      { name: 'Analytics', href: '/analytics', icon: 'ChartBar' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
    ],
  },

  'ultralead.ai': {
    name: 'UltraLead',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'Target' },
      { name: 'Proactive Hunter', href: '/proactive-hunter', icon: 'Zap' },
      { name: 'CRM', href: '/crm', icon: 'UserGroup', unique: true },
      { name: 'Deals', href: '/crm/deals', icon: 'CurrencyDollar', unique: true },
      { name: 'Prospects', href: '/prospects', icon: 'Users' },
      { name: 'Campaigns', href: '/campaigns', icon: 'Envelope' },
      { name: 'Replies', href: '/replies', icon: 'ChatBubbleLeft' },
      { name: 'Analytics', href: '/analytics', icon: 'ChartBar' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
    ],
  },

  'videosite.ai': {
    name: 'VideoSite.AI',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass' },
      { name: 'Proactive Hunter', href: '/proactive-hunter', icon: 'Zap' },
      { name: 'Videos', href: '/videos', icon: 'PlayCircle', unique: true },
      { name: 'Upload', href: '/videos/upload', icon: 'ArrowUpTray', unique: true },
      { name: 'Analytics', href: '/videos/analytics', icon: 'ChartBar', unique: true },
      { name: 'Earnings', href: '/earnings', icon: 'BankNotes', unique: true },
      { name: 'Replies', href: '/replies', icon: 'ChatBubbleLeft' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
      { name: 'Settings', href: '/settings', icon: 'Cog' },
    ],
  },

  'aileadstrategies.com': {
    name: 'AI Lead Strategies',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass' },
      { name: 'Proactive Hunter', href: '/proactive-hunter', icon: 'Zap' },
      { name: 'Platforms', href: '/platforms', icon: 'Squares2X2', unique: true },
      { name: 'Admin', href: '/admin', icon: 'ShieldCheck', unique: true },
      { name: 'Inbox', href: '/inbox', icon: 'Inbox' },
      { name: 'Analytics', href: '/analytics', icon: 'ChartBar' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
      { name: 'Settings', href: '/settings', icon: 'Cog' },
    ],
  },

  localhost: {
    name: 'AI Lead Strategies',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass' },
      { name: 'Proactive Hunter', href: '/proactive-hunter', icon: 'Zap' },
      { name: 'Prospects', href: '/prospects', icon: 'Users' },
      { name: 'Campaigns', href: '/campaigns', icon: 'Envelope' },
      { name: 'Replies', href: '/replies', icon: 'ChatBubbleLeft' },
      { name: 'Inbox', href: '/inbox', icon: 'Inbox' },
      { name: 'Videos', href: '/videos', icon: 'PlayCircle' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
      { name: 'Settings', href: '/settings', icon: 'Cog' },
    ],
  },

  '127.0.0.1': {
    name: 'AI Lead Strategies',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass' },
      { name: 'Proactive Hunter', href: '/proactive-hunter', icon: 'Zap' },
      { name: 'Prospects', href: '/prospects', icon: 'Users' },
      { name: 'Campaigns', href: '/campaigns', icon: 'Envelope' },
      { name: 'Replies', href: '/replies', icon: 'ChatBubbleLeft' },
      { name: 'Inbox', href: '/inbox', icon: 'Inbox' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
      { name: 'Settings', href: '/settings', icon: 'Cog' },
    ],
  },
};

const DEFAULT_PLATFORM = PLATFORM_CONFIGS['aileadstrategies.com'];

/** Tier → hostname for platform-specific nav when on aileadstrategies.com */
const TIER_TO_HOST = {
  1: 'leadsite.ai',
  2: 'leadsite.io',
  3: 'clientcontact.io',
  4: 'videosite.ai',
  5: 'ultralead.ai',
};

export function getNavigation(hostname = '', userTier = null) {
  const host = (hostname || '').replace(/^www\./, '').split(':')[0];
  const config = PLATFORM_CONFIGS[host];

  // On main domain: use user tier to show platform-specific nav
  if ((!config || host === 'aileadstrategies.com' || host === 'localhost' || host === '127.0.0.1') && userTier != null) {
    const tierHost = TIER_TO_HOST[Number(userTier)];
    if (tierHost && PLATFORM_CONFIGS[tierHost]) {
      return PLATFORM_CONFIGS[tierHost];
    }
  }

  return config || DEFAULT_PLATFORM;
}
