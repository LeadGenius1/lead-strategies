'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      // Use admin login endpoint
      const response = await api.post('/api/admin/login', formData)
      
      // Store admin token
      const token = response.data?.token || response.data?.data?.token
      if (token) {
        Cookies.set('admin_token', token, { expires: 7 }) // 7 days
        Cookies.set('admin_user', JSON.stringify(response.data?.admin || response.data?.data?.admin), { expires: 7 })
        toast.success('Admin login successful!')
        router.push('/admin/dashboard')
      } else {
        toast.error('Invalid response from server')
      }
    } catch (error) {
      console.error('Admin login error:', error)
      toast.error(error.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            <span className="font-bold text-xl tracking-tight">AI LEAD STRATEGIES</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
          <p className="text-neutral-400">Access the admin dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#050505] border border-white/10 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#030303] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition"
                placeholder="admin@aileadstrategies.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#030303] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Default Credentials Info */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-400">
              <strong>Default Credentials:</strong><br />
              Email: admin@aileadstrategies.com<br />
              Password: YourSecurePassword123!
            </p>
            <p className="text-xs text-yellow-400 mt-2">
              ⚠️ Change this password after first login for security.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-neutral-400 hover:text-white transition text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
