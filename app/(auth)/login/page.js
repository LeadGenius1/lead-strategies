'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { user } = await login(formData.email, formData.password)
      toast.success('Welcome back!')
      // Redirect to user's platform dashboard (tier: 1=LeadSite.AI, 2=LeadSite.IO, 3=ClientContact, 4=VideoSite, 5=UltraLead)
    const tierDashboardMap = {
      1: '/prospects',      // LeadSite.AI
      2: '/dashboard',      // LeadSite.IO
      3: '/inbox',          // ClientContact.IO
      4: '/videos',         // VideoSite.AI
      5: '/crm',            // UltraLead
    }
      const tier = user?.tier != null ? Number(user.tier) : null
      const dashboardPath = tierDashboardMap[tier] || '/dashboard'
      router.push(dashboardPath)
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="grid-overlay">
          <div className="grid-inner">
            <div className="grid-line-v"></div>
            <div className="grid-line-v hidden md:block"></div>
            <div className="grid-line-v hidden lg:block"></div>
            <div className="grid-line-v"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="bg-[#050505] border border-subtle p-6 sm:p-8 md:p-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 text-2xl text-white uppercase tracking-tighter font-space-grotesk font-light mb-2">
                <div className="w-2 h-2 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                AI LEAD STRATEGIES
              </Link>
              <p className="text-neutral-500 font-geist text-xs mb-4">aileadstrategies.com</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl uppercase font-light text-white tracking-tighter font-space-grotesk mb-4">
                Sign <span className="text-gradient">In</span>
              </h1>
              <p className="text-neutral-400 font-geist text-base sm:text-lg">Welcome back — you&apos;ll go to your product dashboard</p>
            </div>

            {/* Google OAuth only (matches signup) */}
            <div className="flex justify-center mb-8">
              <button
                type="button"
                onClick={() => window.location.href = '/api/auth/oauth/google'}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-900 font-medium transition font-geist text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2 font-geist">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-[#080808] border border-subtle text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/30 transition font-geist"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-neutral-300 font-geist">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 font-geist">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-[#080808] border border-subtle text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/30 transition font-geist"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition disabled:opacity-50 font-geist"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center">
              <p className="text-neutral-400 font-geist">
                Don't have an account?{' '}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-subtle">
            <div className="text-center space-y-4">
              <div className="text-neutral-500 text-xs space-y-1 font-geist">
                <p className="font-semibold text-neutral-300">AI Lead Strategies LLC</p>
                <p>600 Eagleview Blvd, Suite 317, Exton, PA 19341</p>
                <p>
                  Phone: <a href="tel:8555068886" className="text-purple-400 hover:text-purple-300">(855) 506-8886</a>
                </p>
                <p>
                  Email: <a href="mailto:support@aileadstrategies.com" className="text-purple-400 hover:text-purple-300">support@aileadstrategies.com</a>
                </p>
              </div>
              <div className="flex justify-center gap-4 text-xs text-neutral-600 pt-4 font-geist">
                <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
              </div>
              <p className="text-neutral-600 text-xs pt-2 font-geist">
                © 2025 AI Lead Strategies LLC. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
