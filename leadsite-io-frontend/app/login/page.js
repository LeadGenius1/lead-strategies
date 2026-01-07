'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '../../lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden min-h-screen">
      {/* Ambient Space Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="stars absolute w-[1px] h-[1px] bg-transparent rounded-full opacity-50"></div>
        <div className="absolute inset-0 bg-grid opacity-30"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] glow-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] glow-blob animation-delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full"></div>
            <span className="text-sm font-medium tracking-widest uppercase text-white">LeadSite.IO</span>
          </Link>
          <Link href="/signup" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">
            Don't have an account? Sign up
          </Link>
        </div>
      </nav>

      {/* Login Form */}
      <section className="relative z-10 pt-32 pb-20 px-6 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">Welcome Back</h1>
            <p className="text-neutral-400 text-sm">Sign in to your account</p>
          </div>

          <div className="rounded-2xl bg-neutral-900/30 border border-white/10 p-8 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-neutral-600"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-neutral-600"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-neutral-400">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-black/50 text-indigo-500 focus:ring-indigo-500/20" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none transition-transform hover:scale-105 active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#6366f1_50%,#000000_100%)]"></span>
                <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors">
                  {loading ? 'Signing in...' : 'Sign In'}
                  {!loading && <i data-lucide="chevron-right" className="w-4 h-4 ml-2"></i>}
                </span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/signup" className="text-xs text-neutral-400 hover:text-white transition-colors">
                Don't have an account? <span className="text-indigo-400">Sign up</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

