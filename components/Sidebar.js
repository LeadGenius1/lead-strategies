'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { 
  MessageSquare, 
  LogOut,
  BrainCircuit,
  Menu,
  X,
  Settings
} from 'lucide-react'

// Simplified sidebar – Lead Hunter as master coordinator
const navigation = [
  { name: 'Lead Hunter', href: '/lead-hunter', icon: BrainCircuit, highlight: true },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar({ features = {}, isAdminMode = false }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handleLogout() {
    if (isAdminMode) {
      Cookies.remove('admin_token')
      Cookies.remove('admin_user')
      toast.success('Logged out from admin')
      router.push('/admin/login')
    } else {
      logout()
    }
  }

  const visibleNav = navigation

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-black/90 border border-white/10 rounded-lg backdrop-blur-md text-white"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-black border-r border-white/5 h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          <span className="text-sm font-medium tracking-widest uppercase text-white">AI Lead Strategies</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
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
          onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
          className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200 touch-manipulation"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-red-500/10 flex items-center justify-center transition-colors">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
    </>
  )
}
