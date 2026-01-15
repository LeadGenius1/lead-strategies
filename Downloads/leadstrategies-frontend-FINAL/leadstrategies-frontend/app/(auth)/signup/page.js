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
  }, [searchParams])
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
