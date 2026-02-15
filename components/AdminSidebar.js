'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import {
  Search,
  Zap,
  Users,
  Mail,
  MessageSquare,
  Globe,
  Inbox,
  Hash,
  Video,
  Upload,
  DollarSign,
  Building,
  TrendingUp,
  BarChart3,
  User,
  Settings,
  Phone,
  Sparkles,
  LayoutGrid,
  Shield,
  LogOut,
} from 'lucide-react'
import { getPlatformFeatures } from '@/lib/platformFeatures'

const ICON_MAP = {
  Search,
  Zap,
  Users,
  Mail,
  MessageSquare,
  Globe,
  Inbox,
  Hash,
  Video,
  Upload,
  DollarSign,
  Building,
  TrendingUp,
  BarChart: BarChart3,
  User,
  Settings,
  Phone,
  Sparkles,
  Grid: LayoutGrid,
  Shield,
}

export default function AdminSidebar({ admin }) {
  const pathname = usePathname()

  function handleLogout() {
    Cookies.remove('admin_token')
    Cookies.remove('admin_user')
    Cookies.remove('token') // Clear user token (shared with admin for /api/v1/*)
    toast.success('Logged out successfully')
    window.location.href = '/admin/login'
  }

  // Admin gets ALL 20 features - F01-F18 use same /dashboard routes as users
  const features = getPlatformFeatures('admin')

  return (
    <div className="w-64 bg-black/30 backdrop-blur-sm border-r border-white/10 h-screen flex flex-col">
      {/* Admin Logo/Title - links to dashboard overview */}
      <Link
        href="/admin/dashboard"
        className="p-6 border-b border-white/10 block hover:bg-white/5 transition-colors"
      >
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-400 flex-shrink-0" />
          Admin Panel
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          All Features • Testing & Management
        </p>
        {admin?.email && (
          <p className="text-xs text-neutral-500 mt-2 truncate">{admin.email}</p>
        )}
        {admin?.role === 'super_admin' && (
          <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
            Super Admin
          </span>
        )}
      </Link>

      {/* Navigation - all 20 features */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {features.map((feature) => {
          const Icon = ICON_MAP[feature.icon] || Search
          const href = feature.href
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
          const isPro = feature.tier === 'pro' || feature.tier === 'enterprise'
          const isAdminExclusive = feature.code === 'F19' || feature.code === 'F20'

          return (
            <Link
              key={feature.code}
              href={href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all border
                ${isActive
                  ? 'bg-indigo-500/20 text-white border-indigo-500/30'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white border-transparent'
                }
              `}
            >
              {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
              <span className="flex-1 font-medium text-sm truncate">{feature.name}</span>

              {isPro && !isAdminExclusive && (
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs font-medium border border-indigo-500/30 flex-shrink-0">
                  Pro
                </span>
              )}

              {isAdminExclusive && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs font-medium border border-red-500/30 flex-shrink-0">
                  Admin
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Admin Footer */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="text-xs text-neutral-500 space-y-1">
          <div className="font-medium text-neutral-400">Admin Access</div>
          <div>✓ All User Features (F01-F18)</div>
          <div>✓ Admin Tools (F19-F20)</div>
          <div className="mt-2 pt-2 border-t border-white/10">
            Total: {features.length}/20 Features
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-white/5 hover:text-white transition-colors border border-transparent hover:border-white/10"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
