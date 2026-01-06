'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '../../lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-void">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-beige-100 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-beige-200/60">Login to your VideoSite.IO account</p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-8 rounded-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-widest text-beige-200/70 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 py-3 text-white outline-none focus:border-gold-500 transition-colors font-sans"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-beige-200/70 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 py-3 text-white outline-none focus:border-gold-500 transition-colors font-sans"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-300 text-void px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-beige-200/60 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-gold-400 hover:text-gold-300 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

