'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { getCurrentUser, logout, isAuthenticated } from '../lib/auth'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getCurrentUser()
  const authenticated = isAuthenticated()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Don't show nav on login/signup pages or homepage (has its own nav)
  if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
    return null
  }

  return (
    <nav className="border-b border-white/10 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, sans-serif' }}>
              LeadSite.AI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {authenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <div className="text-slate-400">
                  {user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

