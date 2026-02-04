/**
 * Platform-specific navigation based on hostname.
 * Returns nav items for the dashboard sidebar.
 */

export const PLATFORM_CONFIGS = {
  'leadsite.io': {
    name: 'LeadSite.IO',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass', unique: true },
      { name: 'Prospects', href: '/prospects', icon: 'Users' },
      { name: 'Campaigns', href: '/campaigns', icon: 'Envelope' },
      { name: 'Replies', href: '/replies', icon: 'ChatBubbleLeft' },
      { name: 'Analytics', href: '/analytics', icon: 'ChartBar' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
      { name: 'Settings', href: '/settings', icon: 'Cog' },
    ],
  },
  'leadsite.ai': {
    name: 'LeadSite.AI',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass', unique: true },
      { name: 'Websites', href: '/websites', icon: 'Globe' },
      { name: 'Prospects', href: '/prospects', icon: 'Users' },
      { name: 'Campaigns', href: '/campaigns', icon: 'Envelope' },
      { name: 'Replies', href: '/replies', icon: 'ChatBubbleLeft' },
      { name: 'Analytics', href: '/analytics', icon: 'ChartBar' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
      { name: 'Settings', href: '/settings', icon: 'Cog' },
    ],
  },
  'clientcontact.io': {
    name: 'ClientContact.IO',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass', unique: true },
      { name: 'Inbox', href: '/inbox', icon: 'Inbox' },
      { name: 'Channels', href: '/inbox/settings/channels', icon: 'Squares2X2' },
      { name: 'Campaigns', href: '/campaigns', icon: 'Envelope' },
      { name: 'Analytics', href: '/analytics', icon: 'ChartBar' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
      { name: 'Settings', href: '/settings', icon: 'Cog' },
    ],
  },
  'ultralead.ai': {
    name: 'UltraLead',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass', unique: true },
      { name: 'CRM', href: '/crm', icon: 'UserGroup' },
      { name: 'Deals', href: '/crm/deals', icon: 'CurrencyDollar' },
      { name: 'Prospects', href: '/prospects', icon: 'Users' },
      { name: 'Campaigns', href: '/campaigns', icon: 'Envelope' },
      { name: 'Replies', href: '/replies', icon: 'ChatBubbleLeft' },
      { name: 'Analytics', href: '/analytics', icon: 'ChartBar' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
      { name: 'Settings', href: '/settings', icon: 'Cog' },
    ],
  },
  'videosite.ai': {
    name: 'VideoSite.AI',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass', unique: true },
      { name: 'Videos', href: '/videos', icon: 'PlayCircle' },
      { name: 'Upload', href: '/videos/upload', icon: 'ArrowUpTray' },
      { name: 'Earnings', href: '/earnings', icon: 'BankNotes' },
      { name: 'Analytics', href: '/videos/analytics', icon: 'ChartBar' },
      { name: 'Replies', href: '/replies', icon: 'ChatBubbleLeft' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
      { name: 'Settings', href: '/settings', icon: 'Cog' },
    ],
  },
  'aileadstrategies.com': {
    name: 'AI Lead Strategies',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass', unique: true },
      { name: 'Prospects', href: '/prospects', icon: 'Users' },
      { name: 'Campaigns', href: '/campaigns', icon: 'Envelope' },
      { name: 'Replies', href: '/replies', icon: 'ChatBubbleLeft' },
      { name: 'Inbox', href: '/inbox', icon: 'Inbox' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
      { name: 'Settings', href: '/settings', icon: 'Cog' },
    ],
  },
  'localhost': {
    name: 'AI Lead Strategies',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass', unique: true },
      { name: 'Prospects', href: '/prospects', icon: 'Users' },
      { name: 'Campaigns', href: '/campaigns', icon: 'Envelope' },
      { name: 'Replies', href: '/replies', icon: 'ChatBubbleLeft' },
      { name: 'Inbox', href: '/inbox', icon: 'Inbox' },
      { name: 'Profile', href: '/settings', icon: 'UserCircle' },
      { name: 'Settings', href: '/settings', icon: 'Cog' },
    ],
  },
  '127.0.0.1': {
    name: 'AI Lead Strategies',
    nav: [
      { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass', unique: true },
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
