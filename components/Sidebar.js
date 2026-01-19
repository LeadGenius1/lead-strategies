'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth'
import { 
  LayoutDashboard, 
  Globe, 
  Mail, 
  Users, 
  MessageSquare, 
  Phone, 
  Briefcase, 
  Settings,
  LogOut,
  BrainCircuit,
  Target,
  Sparkles,
  BarChart3,
  Zap
} from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, tier: 'all' },
  { name: 'Lead Hunter', href: '/copilot', icon: BrainCircuit, tier: 'all', highlight: true },
  { name: 'Websites', href: '/dashboard/websites', icon: Globe, tier: 'websites' },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Zap, tier: 'campaigns' },
  { name: 'Prospects', href: '/dashboard/prospects', icon: Target, tier: 'prospects' },
  { name: 'Inbox', href: '/dashboard/inbox', icon: MessageSquare, tier: 'inbox' },
  { name: 'Voice Calls', href: '/dashboard/calls', icon: Phone, tier: 'voice' },
  { name: 'CRM', href: '/dashboard/crm', icon: Briefcase, tier: 'crm' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, tier: 'all' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, tier: 'all' },
]

export default function Sidebar({ features = {} }) {
  const pathname = usePathname()

  const visibleNav = navigation.filter((item) => {
    if (item.tier === 'all') return true
    return features[item.tier] === true
  })

  return (
    <div className="w-64 bg-black border-r border-white/5 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium tracking-wide text-white">AI Lead Strategies</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-500/10 text-white border border-indigo-500/30'
                  : item.highlight
                  ? 'text-indigo-400 hover:bg-indigo-500/10 hover:text-white border border-transparent hover:border-indigo-500/20'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              {/* Glow effect for active */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-50"></div>
              )}
              
              <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isActive 
                  ? 'bg-indigo-500/20' 
                  : item.highlight 
                  ? 'bg-indigo-500/10 group-hover:bg-indigo-500/20' 
                  : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : item.highlight ? 'text-indigo-400' : ''}`} />
              </div>
              
              <span className="relative text-sm font-medium">{item.name}</span>
              
              {/* Pulsing dot for Lead Hunter */}
              {item.highlight && (
                <span className="relative flex h-2 w-2 ml-auto">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-red-500/10 flex items-center justify-center transition-colors">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
