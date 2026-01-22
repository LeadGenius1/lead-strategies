'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signup } from '@/lib/auth'
import toast from 'react-hot-toast'

const TIERS = [
  { id: 'leadsite-ai', name: 'LeadSite.AI', price: '$49/mo', description: 'AI email lead generation' },
  { id: 'leadsite-io', name: 'LeadSite.IO', price: '$49/mo', description: '+ Free AI Website', highlight: true },
  { id: 'clientcontact', name: 'ClientContact.IO', price: '$79/mo', description: '22+ channel unified inbox' },
  { id: 'videosite', name: 'VideoSite.AI', price: 'FREE', description: 'Earn $1/viewer • Content creators' },
  { id: 'tackle', name: 'TackleAI', price: '$99/mo', description: 'Full CRM + Voice + 7 AI Agents' },
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
      router.push('/copilot')
    } catch (error) {
      toast.error(error.message || 'Signup failed')
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
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl text-white uppercase tracking-tighter font-space-grotesk font-light mb-6">
              <div className="w-2 h-2 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
              AI LEAD STRATEGIES
            </Link>
            <h1 className="text-4xl sm:text-5xl md:text-6xl uppercase font-light text-white tracking-tighter font-space-grotesk mb-4">
              Get <span className="text-gradient">Started</span>
            </h1>
            <p className="text-neutral-400 font-geist text-base sm:text-lg">
              Choose your plan and start generating leads today
            </p>
          </div>

          <div className="bg-[#050505] border border-subtle p-6 sm:p-8 md:p-10">
            {/* Already have account link */}
            <div className="text-center mb-8">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-neutral-400 hover:text-white transition border border-subtle hover:border-purple-500/30 font-geist"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Already have an account? Sign In
              </Link>
            </div>

            {/* Social Auth Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <button
                type="button"
                onClick={() => window.location.href = `/api/auth/oauth/google?tier=${selectedTier}`}
                className="flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-neutral-100 text-neutral-900 font-medium transition font-geist text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              
              <button
                type="button"
                onClick={() => window.location.href = `/api/auth/oauth/microsoft?tier=${selectedTier}`}
                className="flex items-center justify-center gap-3 px-4 py-3 bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium transition font-geist text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                  <path fill="#F25022" d="M0 0h11v11H0z"/>
                  <path fill="#00A4EF" d="M12 0h11v11H12z"/>
                  <path fill="#7FBA00" d="M0 12h11v11H0z"/>
                  <path fill="#FFB900" d="M12 12h11v11H12z"/>
                </svg>
                Microsoft
              </button>
              
              <button
                type="button"
                onClick={() => window.location.href = `/api/auth/oauth/linkedin?tier=${selectedTier}`}
                className="flex items-center justify-center gap-3 px-4 py-3 bg-[#0077B5] hover:bg-[#006399] text-white font-medium transition font-geist text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-subtle"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[#050505] text-neutral-500 text-xs uppercase tracking-widest font-geist">Or continue with email</span>
              </div>
            </div>

            {/* Tier Selection - Transparent Pricing Display */}
            <div className="mb-10">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-4 text-center">Select Your Plan</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier.id)}
                    className={`p-4 border text-left transition-all relative overflow-hidden ${
                      selectedTier === tier.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-subtle hover:border-purple-500/30 bg-[#080808]'
                    } ${tier.free ? 'border-green-500/30' : ''}`}
                  >
                    {tier.highlight && (
                      <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-green-500/20 border-l border-b border-green-500/30 text-green-400 text-[8px] uppercase tracking-wider font-geist">
                        +Free Site
                      </div>
                    )}
                    {tier.free && (
                      <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-green-500/20 border-l border-b border-green-500/30 text-green-400 text-[8px] uppercase tracking-wider font-geist">
                        Free
                      </div>
                    )}
                    <div className="font-space-grotesk text-white text-sm mb-1">{tier.name}</div>
                    <div className={`text-xl font-space-grotesk font-light mb-2 ${tier.free ? 'text-green-400' : 'text-purple-400'}`}>
                      {tier.price}
                    </div>
                    <p className="text-[10px] text-neutral-500 font-geist leading-tight">{tier.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist"
                    placeholder="Acme Inc (optional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist"
                  placeholder="you@company.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Business Info Section for AI Agent */}
              <div className="border-t border-subtle pt-8 mt-8">
                <h3 className="text-lg font-space-grotesk text-white mb-2">Business Information</h3>
                <p className="text-sm text-neutral-500 font-geist mb-6">
                  Help our AI agent find the best prospects for your business
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                      Industry *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist"
                      placeholder="e.g., Commercial Cleaning, SaaS, Real Estate"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                      Services/Products *
                    </label>
                    <textarea
                      required
                      value={formData.services}
                      onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist resize-none"
                      placeholder="Describe your main services or products"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                        Location/Service Area *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist"
                        placeholder="e.g., Berks County, PA"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                        Target Market *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.targetMarket}
                        onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                        className="w-full px-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist"
                        placeholder="e.g., Offices, Medical Facilities"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white text-black font-bold tracking-widest uppercase hover:bg-neutral-200 transition disabled:opacity-50 font-geist text-sm"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            {/* Links */}
            <div className="mt-8 text-center">
              <p className="text-neutral-500 font-geist text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 transition">
                  Sign in
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
