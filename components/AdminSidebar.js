'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function AdminSidebar({ admin }) {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    Cookies.remove('admin_token')
    Cookies.remove('admin_user')
    toast.success('Logged out successfully')
    router.push('/admin/login')
  }

  const navigation = [
    { name: 'System Health', href: '/admin/dashboard', icon: '🖥️' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Platform Stats', href: '/admin/stats', icon: '📊' },
  ]

  // Add admin-only routes for super_admin
  if (admin?.role === 'super_admin') {
    navigation.push(
      { name: 'Admin Users', href: '/admin/admins', icon: '🔐' },
      { name: 'Audit Logs', href: '/admin/audit', icon: '📋' }
    )
  }

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
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
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
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
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
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
