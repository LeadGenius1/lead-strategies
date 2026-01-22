'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/api/auth/forgot-password', { email })
      
      if (response.data?.success || response.data) {
        setEmailSent(true)
        toast.success('Password reset email sent! Check your inbox.')
      } else {
        throw new Error('Failed to send reset email')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      // Still show success message for security (don't reveal if email exists)
      setEmailSent(true)
      toast.success('If an account exists with this email, a password reset link has been sent.')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
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
              <h1 className="text-2xl font-bold text-dark-text mb-2">Check Your Email</h1>
              <p className="text-dark-textMuted">
                We've sent a password reset link to <strong className="text-dark-text">{email}</strong>
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-dark-textMuted">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              
              <div className="pt-4 border-t border-dark-border">
                <Link
                  href="/login"
                  className="block w-full py-3 px-4 rounded-lg bg-dark-primary hover:bg-dark-primaryHover text-white font-medium transition"
                >
                  Back to Sign In
                </Link>
              </div>
              
              <p className="text-sm text-dark-textMuted">
                Didn't receive the email?{' '}
                <button
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                  }}
                  className="text-dark-primary hover:text-dark-primaryHover"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-dark-border">
            <div className="text-center space-y-4">
              <div className="text-dark-textMuted text-xs space-y-1">
                <p className="font-semibold text-dark-text">AI Lead Strategies LLC</p>
                <p>600 Eagleview Blvd Suite 317, Exton, PA 19341</p>
                <p>
                  Phone: <a href="tel:8555068886" className="text-dark-primary hover:text-dark-primaryHover">(855) 506-8886</a>
                </p>
                <p>
                  Email: <a href="mailto:info@aileadstrategies.com" className="text-dark-primary hover:text-dark-primaryHover">info@aileadstrategies.com</a>
                </p>
              </div>
            </div>
          </footer>
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
            <h1 className="text-2xl font-bold text-dark-text">Forgot Password</h1>
            <p className="text-dark-textMuted mt-2">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                placeholder="you@company.com"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-dark-primary hover:bg-dark-primaryHover text-white font-medium transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/login"
              className="block text-dark-primary hover:text-dark-primaryHover text-sm"
            >
              ← Back to Sign In
            </Link>
            <p className="text-dark-textMuted text-sm">
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
