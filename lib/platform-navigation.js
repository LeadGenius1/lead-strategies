/**
 * Platform-specific navigation based on hostname.
 * Returns nav items for the dashboard sidebar.
 */

const DEFAULT_NAV = [
  { name: 'Lead Hunter', href: '/lead-hunter', icon: 'MagnifyingGlass', unique: true },
  { name: 'Inbox', href: '/inbox', icon: 'Inbox' },
  { name: 'Settings', href: '/settings', icon: 'Cog6Tooth' },
];

const PLATFORMS = {
  'aileadstrategies.com': { name: 'AI Lead Strategies', nav: DEFAULT_NAV },
  'localhost': { name: 'AI Lead Strategies', nav: DEFAULT_NAV },
  '127.0.0.1': { name: 'AI Lead Strategies', nav: DEFAULT_NAV },
};

export function getNavigation(hostname = '') {
  const host = (hostname || '').replace(/^www\./, '').split(':')[0];
  const platform = PLATFORMS[host] || { name: 'AI Lead Strategies', nav: DEFAULT_NAV };
  return platform;
}
