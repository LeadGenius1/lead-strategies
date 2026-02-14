'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import {
  Monitor,
  Users,
  BarChart3,
  Shield,
  FileText,
  LogOut,
  Search,
  Zap,
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
  User,
  Settings,
  Phone,
  Sparkles,
  LayoutGrid,
} from 'lucide-react'
import { getPlatformFeatures } from '@/lib/platformFeatures'

const FEATURE_ICON_MAP = {
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
  const router = useRouter()

  function handleLogout() {
    Cookies.remove('admin_token')
    Cookies.remove('admin_user')
    toast.success('Logged out successfully')
    router.push('/admin/login')
  }

  // Admin Panel - role-protected
  const adminNav = [
    { name: 'System Health', href: '/admin/dashboard', icon: Monitor },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Platform Stats', href: '/admin/stats', icon: BarChart3 },
  ]
  if (admin?.role === 'super_admin') {
    adminNav.push(
      { name: 'Admin Users', href: '/admin/admins', icon: Shield },
      { name: 'Audit Logs', href: '/admin/audit', icon: FileText }
    )
  }

  // All 20 features (F01-F20) from platform config - admin super-dashboard
  const allFeatures = getPlatformFeatures('admin')

  return (
    <div className="w-64 bg-[#050505] border-r border-white/10 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          <span className="font-bold text-white">ADMIN PANEL</span>
        </div>
        <p className="text-xs text-neutral-400">
          {admin?.email || 'Admin'}
        </p>
        {admin?.role && (
          <span className="inline-block mt-2 text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Admin Panel</p>
        {adminNav.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-500 text-white'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}

        <p className="px-4 py-2 mt-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">All Features (F01-F20)</p>
        <p className="px-4 pb-2 text-[11px] text-neutral-600">Platform feature access — admin super-dashboard</p>
        {allFeatures.map((feature) => {
          const isActive = pathname === feature.href || (feature.href !== '/' && pathname.startsWith(feature.href + '/'))
          const Icon = FEATURE_ICON_MAP[feature.icon] || Search
          return (
            <Link
              key={feature.code}
              href={feature.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                isActive
                  ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{feature.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
