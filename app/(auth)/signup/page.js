'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signup } from '@/lib/auth'
import toast from 'react-hot-toast'

const TIERS = [
  { id: 'leadsite-ai', name: 'LeadSite.AI', price: '$49/mo', description: 'Email lead generation' },
  { id: 'leadsite-io', name: 'LeadSite.IO', price: '$29/mo', description: 'AI website builder' },
  { id: 'clientcontact', name: 'ClientContact.IO', price: '$149/mo', description: '22+ social channels' },
  { id: 'tackle', name: 'Tackle.IO', price: '$499/mo', description: 'Full suite + Voice + CRM' },
]

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState('leadsite-ai')

  useEffect(() => {
    // Read tier from URL query params
    const tierFromUrl = searchParams.get('tier')
    if (tierFromUrl && TIERS.some(t => t.id === tierFromUrl)) {
      setSelectedTier(tierFromUrl)
    }

    // Check for OAuth errors
    const error = searchParams.get('error')
    if (error) {
      toast.error(decodeURIComponent(error))
      // Clean URL
      router.replace('/signup', undefined, { shallow: true })
    }
  }, [searchParams, router])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
    // Business info for AI agent context
    industry: '',
    services: '',
    location: '',
    targetMarket: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        password: formData.password,
        tier: selectedTier,
        // Business info for AI agent
        businessInfo: {
          industry: formData.industry,
          services: formData.services,
          location: formData.location,
          targetMarket: formData.targetMarket,
        },
      })
      toast.success('Account created! Welcome to AI Lead Strategies.')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-dark-text">Create your account</h1>
            <p className="text-dark-textMuted mt-2">Choose your plan and get started</p>
            <div className="mt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-dark-textMuted hover:text-dark-text transition border border-dark-border rounded-lg hover:border-dark-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Already have an account? Sign In
              </Link>
            </div>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => window.location.href = `/api/auth/oauth/google?tier=${selectedTier}`}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-gray-50 text-gray-900 font-medium transition border border-gray-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <button
              type="button"
              onClick={() => window.location.href = `/api/auth/oauth/microsoft?tier=${selectedTier}`}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition border border-gray-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                <path fill="#F25022" d="M0 0h11v11H0z"/>
                <path fill="#00A4EF" d="M12 0h11v11H12z"/>
                <path fill="#7FBA00" d="M0 12h11v11H0z"/>
                <path fill="#FFB900" d="M12 12h11v11H12z"/>
              </svg>
              Continue with Microsoft
            </button>
            
            <button
              type="button"
              onClick={() => window.location.href = `/api/auth/oauth/linkedin?tier=${selectedTier}`}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#0077B5] hover:bg-[#006399] text-white font-medium transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continue with LinkedIn
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-surface text-dark-textMuted">OR CONTINUE WITH EMAIL</span>
            </div>
          </div>

          {/* Tier Selection */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier.id)}
                className={`p-4 rounded-lg border text-left transition ${
                  selectedTier === tier.id
                    ? 'border-dark-primary bg-dark-primary/10'
                    : 'border-dark-border hover:border-dark-textMuted'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-dark-text">{tier.name}</span>
                  <span className="text-sm text-dark-primary">{tier.price}</span>
                </div>
                <p className="text-sm text-dark-textMuted mt-1">{tier.description}</p>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                  placeholder="Acme Inc (optional)"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Business Info Section for AI Agent */}
            <div className="border-t border-dark-border pt-6 mt-6">
              <h3 className="text-lg font-semibold text-dark-text mb-4">Business Information (for AI Agent)</h3>
              <p className="text-sm text-dark-textMuted mb-4">
                Help our AI agent find the best prospects for your business
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Industry *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                    placeholder="e.g., Commercial Cleaning, SaaS, Real Estate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Services/Products *
                  </label>
                  <textarea
                    required
                    value={formData.services}
                    onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                    placeholder="Describe your main services or products (e.g., Office cleaning, carpet cleaning, post-construction cleanup)"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Location/Service Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                      placeholder="e.g., Berks County, PA or Nationwide"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Target Market *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.targetMarket}
                      onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                      placeholder="e.g., Offices, Medical Facilities, Property Managers"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-dark-primary hover:bg-dark-primaryHover text-white font-medium transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-dark-textMuted">
              Already have an account?{' '}
              <Link href="/login" className="text-dark-primary hover:text-dark-primaryHover">
                Sign in
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

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-dark-textMuted">Loading...</div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
