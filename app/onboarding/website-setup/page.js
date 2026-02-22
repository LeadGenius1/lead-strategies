'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import { Globe, Sparkles, Check, ArrowRight } from 'lucide-react'

export default function WebsiteSetupPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [extractUrl, setExtractUrl] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [extracted, setExtracted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    industry: '',
    services: '',
    location: '',
    targetMarket: '',
    website: '',
  })

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      if (currentUser.user?.name) {
        setFormData(prev => ({ ...prev, name: currentUser.user.name }))
      }
    }
    loadUser()
  }, [router])

  const extractBusinessInfo = async () => {
    if (!extractUrl.trim()) {
      toast.error('Please enter a website URL')
      return
    }
    setExtracting(true)
    try {
      const token = Cookies.get('token')
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'
      const res = await fetch(`${backendUrl}/api/v1/copilot/extract-business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url: extractUrl.trim() }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          company: data.data.company || prev.company,
          industry: data.data.industry || prev.industry,
          services: data.data.services || prev.services,
          location: data.data.location || prev.location,
          targetMarket: data.data.targetMarket || prev.targetMarket,
          website: extractUrl.trim(),
        }))
        setExtracted(true)
        toast.success('Business info extracted! Review below and continue.')
      } else {
        toast.error(data.error || 'Could not extract info. Please fill in manually.')
      }
    } catch (error) {
      console.error('Extract error:', error)
      toast.error('Extraction failed. Please fill in manually.')
    } finally {
      setExtracting(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/api/users/onboarding', {
        ...formData,
        onboardingComplete: true,
      })
      toast.success('Profile setup complete! Welcome to LeadSite.AI')
      router.push('/prospects')
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-neutral-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            <span className="font-bold text-white font-space-grotesk tracking-tight">AI LEAD STRATEGIES</span>
          </div>
          <h1 className="text-3xl font-light text-white font-space-grotesk tracking-tight mb-2">
            Set Up Your <span className="text-purple-400">LeadSite.AI</span>
          </h1>
          <p className="text-neutral-500 font-geist">
            Paste your website and our AI will learn about your business instantly.
          </p>

          {/* Progress Steps */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm text-neutral-500 font-geist">Account</span>
            </div>
            <div className="w-12 h-0.5 bg-neutral-800 mt-4"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold animate-pulse">
                2
              </div>
              <span className="text-sm text-white font-medium font-geist">Business Profile</span>
            </div>
            <div className="w-12 h-0.5 bg-neutral-800 mt-4"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm font-bold">
                3
              </div>
              <span className="text-sm text-neutral-500 font-geist">Find Leads</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#050505] border border-subtle p-8">
          {/* AI Extraction Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-space-grotesk text-white">Auto-fill with AI</h2>
            </div>
            <p className="text-sm text-neutral-500 font-geist mb-4">
              Enter your website URL and we'll extract your business information automatically.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type="text"
                  value={extractUrl}
                  onChange={(e) => setExtractUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), extractBusinessInfo())}
                  className="w-full pl-10 pr-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist"
                  placeholder="https://yourcompany.com"
                  disabled={extracting}
                />
              </div>
              <button
                type="button"
                onClick={extractBusinessInfo}
                disabled={extracting}
                className="px-5 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium text-sm transition disabled:opacity-50 whitespace-nowrap font-geist"
              >
                {extracting ? 'Analyzing...' : 'Extract'}
              </button>
            </div>
            {extracting && (
              <p className="text-xs text-purple-400 mt-2 animate-pulse font-geist">AI is analyzing your website...</p>
            )}
            {extracted && (
              <p className="text-xs text-green-400 mt-2 font-geist">Extracted! Review and edit below.</p>
            )}
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-subtle"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#050505] text-neutral-500 text-xs uppercase tracking-widest font-geist">
                {extracted ? 'Review & edit' : 'Or fill in manually'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                Your Name *
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist"
                  placeholder="Acme Corp"
                />
              </div>
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
                  placeholder="e.g., SaaS, Real Estate, Cleaning"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                Services / Products *
              </label>
              <textarea
                required
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist resize-none"
                placeholder="Describe what you sell or offer"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                  Location / Service Area *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-subtle text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition font-geist"
                  placeholder="e.g., Philadelphia, PA"
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

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-white text-black font-bold tracking-widest uppercase hover:bg-neutral-200 transition disabled:opacity-50 font-geist text-sm flex items-center justify-center gap-2"
            >
              {saving ? 'Saving...' : (
                <>Complete Setup & Find Leads <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Skip Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="text-neutral-600 hover:text-neutral-400 text-sm font-geist transition"
            >
              Skip for now — I'll set up later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
