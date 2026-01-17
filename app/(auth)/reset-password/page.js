'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { resetPassword } from '@/lib/auth'
import toast from 'react-hot-toast'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [token, setToken] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      toast.error('Invalid or missing reset token')
      router.push('/forgot-password')
    }
  }, [searchParams, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!token) {
      toast.error('Invalid reset token')
      return
    }

    setLoading(true)

    try {
      await resetPassword(token, password)
      setSuccess(true)
      toast.success('Password reset successfully!')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error(error.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
        <div className="w-full max-w-md">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-dark-text mb-2">Password Reset Successful</h1>
              <p className="text-dark-textMuted">
                Your password has been reset successfully. Redirecting to login...
              </p>
            </div>
            
            <Link
              href="/login"
              className="block w-full py-3 px-4 rounded-lg bg-dark-primary hover:bg-dark-primaryHover text-white font-medium transition"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
        <div className="w-full max-w-md">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-dark-text mb-4">Invalid Reset Link</h1>
            <p className="text-dark-textMuted mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link
              href="/forgot-password"
              className="block w-full py-3 px-4 rounded-lg bg-dark-primary hover:bg-dark-primaryHover text-white font-medium transition"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-dark-text">Reset Password</h1>
            <p className="text-dark-textMuted mt-2">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                placeholder="••••••••"
                autoFocus
              />
              <p className="text-xs text-dark-textMuted mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-dark-primary hover:bg-dark-primaryHover text-white font-medium transition disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-dark-primary hover:text-dark-primaryHover"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-dark-border">
          <div className="text-center space-y-4">
            <div className="text-dark-textMuted text-xs space-y-1">
              <p className="font-semibold text-dark-text">AI Lead Strategies LLC</p>
              <p>600 Eagleview Blvd Suite 317, Exton, PA 19341</p>
              <p>
                Phone: <a href="tel:6107571587" className="text-dark-primary hover:text-dark-primaryHover">610.757.1587</a>
              </p>
              <p>
                Email: <a href="mailto:info@aileadstrategies.com" className="text-dark-primary hover:text-dark-primaryHover">info@aileadstrategies.com</a>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-dark-textMuted">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
