'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: '📊', tier: 'all' },
  { name: 'Websites', href: '/dashboard/websites', icon: '🌐', tier: 'websites' },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: '📧', tier: 'campaigns' },
  { name: 'Prospects', href: '/dashboard/prospects', icon: '👥', tier: 'prospects' },
  { name: 'Inbox', href: '/dashboard/inbox', icon: '💬', tier: 'inbox' },
  { name: 'Voice Calls', href: '/dashboard/calls', icon: '📞', tier: 'voice' },
  { name: 'CRM', href: '/dashboard/crm', icon: '💼', tier: 'crm' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️', tier: 'all' },
]

export default function Sidebar({ features = {} }) {
  const pathname = usePathname()

  const visibleNav = navigation.filter((item) => {
    if (item.tier === 'all') return true
    return features[item.tier] === true
  })

  return (
    <div className="w-64 bg-dark-surface border-r border-dark-border h-screen flex flex-col">
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-xl font-bold text-dark-text">AI Lead Strategies</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {visibleNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-dark-primary text-white'
                  : 'text-dark-textMuted hover:bg-dark-surfaceHover hover:text-dark-text'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-dark-border">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-dark-textMuted hover:bg-dark-surfaceHover hover:text-dark-text transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}


