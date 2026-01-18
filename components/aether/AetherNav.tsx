'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface NavLink {
  label: string;
  href: string;
}

interface AetherNavProps {
  links?: NavLink[];
  showAuth?: boolean;
  variant?: 'landing' | 'dashboard';
}

export default function AetherNav({ 
  links = [], 
  showAuth = true,
  variant = 'landing' 
}: AetherNavProps) {
  const { user, logout } = useAuth();

  const defaultLandingLinks: NavLink[] = [
    { label: 'LeadSite.AI', href: '/leadsite-ai' },
    { label: 'LeadSite.IO', href: '/leadsite-io' },
    { label: 'ClientContact', href: '/clientcontact-io' },
    { label: 'Tackle.IO', href: '/tackle-io' },
  ];

  const defaultDashboardLinks: NavLink[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Leads', href: '/dashboard/leads' },
    { label: 'Campaigns', href: '/dashboard/campaigns' },
    { label: 'Analytics', href: '/dashboard/analytics' },
    { label: 'Settings', href: '/dashboard/settings' },
  ];

  const navLinks = links.length > 0 ? links : (variant === 'dashboard' ? defaultDashboardLinks : defaultLandingLinks);

  return (
    <nav className="nav-aether">
      <div className="nav-aether-inner">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full transition-transform group-hover:scale-110"></div>
          <span className="text-sm font-medium tracking-widest uppercase text-white">AI LEAD</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="nav-link-aether"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Section */}
        {showAuth && (
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden md:block text-sm text-neutral-400">{user.firstName}</span>
                <button 
                  onClick={logout}
                  className="btn-aether-secondary"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/signup" className="btn-aether-secondary">
                Start Free Trial
              </Link>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button className="md:hidden text-neutral-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
