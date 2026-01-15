'use client'

import { useState } from 'react'
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
      await login(formData.email, formData.password)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-dark-text">AI Lead Strategies</h1>
            <p className="text-dark-textMuted mt-2">Sign in to your account</p>
          </div>

          {/* Platform badges */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {['LeadSite.AI', 'LeadSite.IO', 'ClientContact', 'Tackle.IO', 'VideoSite'].map((platform) => (
              <span key={platform} className="text-xs px-2 py-1 rounded bg-dark-surfaceHover text-dark-textMuted">
                {platform}
              </span>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-dark-primary hover:bg-dark-primaryHover text-white font-medium transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-dark-textMuted">
              Don't have an account?{' '}
              <Link href="/signup" className="text-dark-primary hover:text-dark-primaryHover">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-dark-border">
          <div className="text-center space-y-4">
            <p className="text-dark-textMuted text-sm">
              One platform. Five powerful tools. Unlimited growth.
            </p>
            <div className="text-dark-textMuted text-xs space-y-1">
              <p className="font-semibold text-dark-text">AI Lead Strategies LLC</p>
              <p>600 Eagleview Blvd Suite 317, Exton, PA 19341</p>
              <p>
                Phone: <a href="tel:6107571587" className="text-dark-primary hover:text-dark-primaryHover">610.757.1587</a>
              </p>
              <p>
                Email: <a href="mailto:info@aileadstrategies.com" className="text-dark-primary hover:text-dark-primaryHover">info@aileadstrategies.com</a>
              </p>
              <p>
                <a href="mailto:aileadstrategies@gmail.com" className="text-dark-primary hover:text-dark-primaryHover">aileadstrategies@gmail.com</a>
              </p>
            </div>
            <div className="flex justify-center gap-4 text-xs text-dark-textMuted pt-4">
              <Link href="/privacy" className="hover:text-dark-text transition">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-dark-text transition">Terms of Service</Link>
            </div>
            <p className="text-dark-textMuted text-xs pt-2">
              © 2026 AI Lead Strategies LLC. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
