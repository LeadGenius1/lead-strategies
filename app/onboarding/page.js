'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { getCurrentUser } from '@/lib/auth'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import { Check, Bot } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Business Information
    company: '',
    industry: '',
    services: '',
    location: '',
    targetMarket: '',
    // Additional Details
    website: '',
    phone: '',
    monthlyLeadGoal: '',
    budget: '',
  })

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      
      // Pre-fill if data exists
      if (currentUser.company) setFormData(prev => ({ ...prev, company: currentUser.company }))
      if (currentUser.businessInfo) {
        setFormData(prev => ({
          ...prev,
          ...currentUser.businessInfo
        }))
      }
    }
    loadUser()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Save onboarding data to user profile
      await api.post('/api/users/onboarding', {
        ...formData,
        onboardingComplete: true
      })
      
      toast.success('Profile setup complete! Welcome aboard!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error(error.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-dark-textMuted">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            <span className="font-bold text-white">AI LEAD STRATEGIES</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user.name?.split(' ')[0]}!</h1>
          <p className="text-dark-textMuted">Let's set up your profile to find the perfect prospects</p>
          
          {/* Progress Steps */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm text-dark-textMuted">Sign Up</span>
            </div>
            <div className="w-16 h-0.5 bg-dark-border mt-4"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold animate-pulse">
                2
              </div>
              <span className="text-sm text-white font-medium">Profile Setup</span>
            </div>
            <div className="w-16 h-0.5 bg-dark-border mt-4"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center text-dark-textMuted text-sm font-bold">
                3
              </div>
              <span className="text-sm text-dark-textMuted">Start AI Agent</span>
            </div>
          </div>
        </div>

        {/* Onboarding Form */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Tell us about your business</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                    placeholder="Acme Corp"
                  />
                </div>

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
                    placeholder="e.g., SaaS, Real Estate, Cleaning Services"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  What do you sell/offer? *
                </label>
                <textarea
                  required
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                  placeholder="Describe your products or services (e.g., Commercial cleaning, office maintenance, carpet cleaning)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Service Area/Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                    placeholder="e.g., Philadelphia, PA or Nationwide"
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
                    placeholder="e.g., Office Buildings, Medical Facilities"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Goals */}
            <div className="border-t border-dark-border pt-6 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Contact & Goals</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Monthly Lead Goal
                  </label>
                  <select
                    value={formData.monthlyLeadGoal}
                    onChange={(e) => setFormData({ ...formData, monthlyLeadGoal: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text focus:outline-none focus:border-dark-primary transition"
                  >
                    <option value="">Select goal</option>
                    <option value="10-25">10-25 leads/month</option>
                    <option value="25-50">25-50 leads/month</option>
                    <option value="50-100">50-100 leads/month</option>
                    <option value="100+">100+ leads/month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Marketing Budget
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text focus:outline-none focus:border-dark-primary transition"
                  >
                    <option value="">Select budget</option>
                    <option value="<1k">Less than $1,000/mo</option>
                    <option value="1k-5k">$1,000 - $5,000/mo</option>
                    <option value="5k-10k">$5,000 - $10,000/mo</option>
                    <option value="10k+">$10,000+/mo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Agent Info Box */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Your AI Agent is Ready</h3>
                  <p className="text-sm text-dark-textMuted">
                    Based on your information, our AI will analyze and find the best prospects for your business. 
                    You'll be able to start the AI agent from your dashboard with one click.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold text-lg transition disabled:opacity-50 shadow-lg shadow-purple-500/20"
            >
              {loading ? 'Saving Profile...' : 'Complete Setup & Go to Dashboard →'}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <p className="text-center text-dark-textMuted text-sm mt-6">
          You can update this information anytime from your settings
        </p>
      </div>
    </div>
  )
}
