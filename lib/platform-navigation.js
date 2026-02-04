/**
 * Platform-specific navigation based on hostname.
 * Returns nav items for the dashboard sidebar.
 */

export const PLATFORM_CONFIGS = {
  'leadsite.io': {
    name: 'LeadSite.IO',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'Target' },
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
      { name: 'Websites', href: '/websites', icon: 'Globe', unique: true },
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

export function getNavigation(hostname = '') {
  const host = (hostname || '').replace(/^www\./, '').split(':')[0];
  return PLATFORM_CONFIGS[host] || DEFAULT_PLATFORM;
}
