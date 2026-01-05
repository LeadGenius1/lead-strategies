'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { ChevronRight, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      // TODO: Implement password reset API call
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full"></div>
              <span className="text-xl font-medium tracking-widest uppercase">AI LEAD STRATEGIES</span>
            </div>
            <h1 className="text-3xl font-medium tracking-tight mb-2">
              Reset Password
            </h1>
            <p className="text-neutral-400 text-sm">
              Enter your email to receive a password reset link
            </p>
          </div>

          {/* Form */}
          <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-8">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-neutral-600"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="relative group pt-2">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full inline-flex h-12 overflow-hidden rounded-lg p-[1px] focus:outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#6366f1_50%,#000000_100%)]"></span>
                    <span className="inline-flex h-full w-full items-center justify-center rounded-lg bg-black px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors">
                      {isLoading ? 'Sending...' : 'Send Reset Link'} <ChevronRight className="w-4 h-4 ml-2" />
                    </span>
                  </button>
                  <div className="absolute inset-0 -z-10 bg-indigo-500/50 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-lg"></div>
                </div>

                <p className="text-xs text-center text-neutral-500 pt-4">
                  Remember your password?{' '}
                  <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    Sign in
                  </Link>
                </p>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-medium mb-2">Check your email</h2>
                  <p className="text-neutral-400 text-sm">
                    We've sent a password reset link to <span className="text-white font-medium">{email}</span>
                  </p>
                </div>
                <div className="pt-4">
                  <Link href="/login">
                    <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-3 rounded-lg font-medium text-sm transition-colors">
                      Back to Sign In
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}


