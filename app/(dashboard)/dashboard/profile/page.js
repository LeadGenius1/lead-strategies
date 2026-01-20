'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/auth'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { 
  User, Building2, Mail, Phone, Globe, MapPin, Briefcase, 
  Target, Package, Users, DollarSign, Save, Loader2, 
  CheckCircle2, Shield, Sparkles, Tag, FileText, Heart, CreditCard,
  Check, X, Zap, MessageSquare, Video, BarChart3
} from 'lucide-react'

// Subscription tier information with features
const TIER_INFO = {
  'leadsite-ai': {
    name: 'LeadSite.AI',
    price: '$49/mo',
    features: {
      leads: true,
      campaigns: true,
      websites: false,
      inbox: false,
      voice: false,
      crm: false,
      video: false,
      analytics: true
    },
    limits: {
      leads: 1000,
      campaigns: 10,
      emails: 5000
    }
  },
  'leadsite-io': {
    name: 'LeadSite.IO',
    price: '$49/mo + Free Website',
    features: {
      leads: true,
      campaigns: true,
      websites: true,
      inbox: false,
      voice: false,
      crm: false,
      video: false,
      analytics: true
    },
    limits: {
      leads: 1000,
      campaigns: 25,
      emails: 5000,
      websites: 1
    }
  },
  'clientcontact': {
    name: 'ClientContact.IO',
    price: '$79/mo',
    features: {
      leads: true,
      campaigns: true,
      websites: true,
      inbox: true,
      voice: false,
      crm: false,
      video: false,
      analytics: true
    },
    limits: {
      leads: 2500,
      campaigns: 50,
      emails: 10000,
      websites: 3
    }
  },
  'videosite': {
    name: 'VideoSite.AI',
    price: 'FREE (earn $1/viewer)',
    features: {
      leads: true,
      campaigns: true,
      websites: false,
      inbox: false,
      voice: false,
      crm: false,
      video: true,
      analytics: true
    },
    limits: {
      leads: 500,
      campaigns: 5,
      videos: 'Unlimited'
    }
  },
  'tackle': {
    name: 'TackleAI',
    price: '$99/mo',
    features: {
      leads: true,
      campaigns: true,
      websites: true,
      inbox: true,
      voice: true,
      crm: true,
      video: true,
      analytics: true
    },
    limits: {
      leads: 5000,
      campaigns: 'Unlimited',
      emails: 25000,
      websites: 10
    }
  }
}

// Subscription Section Component
function SubscriptionSection({ user }) {
  const tier = TIER_INFO[user?.subscription_tier] || TIER_INFO['leadsite-ai']
  
  const featureList = [
    { key: 'leads', label: 'Lead Discovery', icon: Target },
    { key: 'campaigns', label: 'Email Campaigns', icon: Zap },
    { key: 'websites', label: 'AI Websites', icon: Globe },
    { key: 'inbox', label: '22+ Channel Inbox', icon: MessageSquare },
    { key: 'voice', label: 'Voice Calling', icon: Phone },
    { key: 'crm', label: 'Full CRM', icon: Briefcase },
    { key: 'video', label: 'Video Platform', icon: Video },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <section className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-semibold">Subscription</h2>
      </div>
      
      {/* Current Plan */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
          <p className="text-indigo-300 text-sm">{tier.price}</p>
        </div>
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
          Manage Plan
        </button>
      </div>

      {/* Features Grid */}
      <h4 className="text-sm font-medium text-neutral-400 mb-3">Your Plan Features</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {featureList.map(({ key, label, icon: Icon }) => {
          const hasFeature = tier.features[key]
          return (
            <div
              key={key}
              className={`flex items-center gap-2 p-3 rounded-lg border ${
                hasFeature
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-neutral-800/50 border-white/5 text-neutral-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{label}</span>
              {hasFeature ? (
                <Check className="w-3 h-3 ml-auto" />
              ) : (
                <X className="w-3 h-3 ml-auto" />
              )}
            </div>
          )
        })}
      </div>

      {/* Usage Limits */}
      {tier.limits && (
        <>
          <h4 className="text-sm font-medium text-neutral-400 mb-3">Usage Limits</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tier.limits.leads && (
              <div className="p-3 bg-black/30 rounded-lg">
                <p className="text-xs text-neutral-500">Leads/mo</p>
                <p className="text-lg font-semibold text-white">{tier.limits.leads.toLocaleString()}</p>
              </div>
            )}
            {tier.limits.campaigns && (
              <div className="p-3 bg-black/30 rounded-lg">
                <p className="text-xs text-neutral-500">Campaigns</p>
                <p className="text-lg font-semibold text-white">{tier.limits.campaigns}</p>
              </div>
            )}
            {tier.limits.emails && (
              <div className="p-3 bg-black/30 rounded-lg">
                <p className="text-xs text-neutral-500">Emails/mo</p>
                <p className="text-lg font-semibold text-white">{tier.limits.emails.toLocaleString()}</p>
              </div>
            )}
            {tier.limits.websites && (
              <div className="p-3 bg-black/30 rounded-lg">
                <p className="text-xs text-neutral-500">Websites</p>
                <p className="text-lg font-semibold text-white">{tier.limits.websites}</p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  
  // Comprehensive profile data for Lead Hunter AI
  const [profile, setProfile] = useState({
    // Personal Info
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    
    // Business Info
    companyName: '',
    companyWebsite: '',
    companySize: '',
    industry: '',
    location: '',
    
    // Products & Services (CRITICAL for Lead Hunter)
    productsServices: '',
    uniqueValueProposition: '',
    targetAudience: '',
    idealCustomerProfile: '',
    
    // Sales Context
    averageDealSize: '',
    salesCycle: '',
    painPointsSolved: '',
    competitorDifferentiation: '',
    
    // Outreach Preferences
    preferredTone: 'professional',
    callToAction: '',
    keyBenefits: '',
    testimonialHighlight: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const userData = await getCurrentUser()
      const user = userData?.user || userData
      setUser(user)
      
      // Try to load saved profile from backend
      try {
        const response = await api.get('/api/v1/users/profile')
        const savedProfile = response.data?.data || response.data
        if (savedProfile) {
          setProfile(prev => ({
            ...prev,
            name: user?.name || '',
            email: user?.email || '',
            companyName: user?.company || '',
            ...savedProfile
          }))
        } else {
          setProfile(prev => ({
            ...prev,
            name: user?.name || '',
            email: user?.email || '',
            companyName: user?.company || '',
          }))
        }
      } catch (e) {
        // Profile not found, use defaults
        setProfile(prev => ({
          ...prev,
          name: user?.name || '',
          email: user?.email || '',
          companyName: user?.company || '',
        }))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    
    try {
      await api.put('/api/v1/users/profile', profile)
      toast.success('Profile saved! Lead Hunter will now use this information.')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  function updateField(field, value) {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Profile</h1>
              <p className="text-neutral-400">Help Lead Hunter understand your business for personalized prospecting</p>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        {user && (
          <SubscriptionSection user={user} />
        )}

        {/* Important Notice */}
        <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-indigo-300">Why this matters</h3>
              <p className="text-sm text-neutral-400 mt-1">
                The more detailed your profile, the better Lead Hunter can find qualified prospects, 
                write personalized emails, and give tailored advice. This information powers your AI assistant!
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Personal Information */}
          <section className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                  placeholder="John Smith"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={profile.jobTitle}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                  placeholder="CEO, Sales Director, Founder..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                  placeholder="you@company.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </section>

          {/* Business Information */}
          <section className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold">Business Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Company Name *</label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                  placeholder="Acme Inc."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Company Website</label>
                <input
                  type="url"
                  value={profile.companyWebsite}
                  onChange={(e) => updateField('companyWebsite', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                  placeholder="https://yourcompany.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Industry *</label>
                <select
                  value={profile.industry}
                  onChange={(e) => updateField('industry', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                  required
                >
                  <option value="">Select your industry</option>
                  <option value="SaaS / Software">SaaS / Software</option>
                  <option value="Marketing Agency">Marketing Agency</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Education">Education</option>
                  <option value="Technology">Technology</option>
                  <option value="Staffing / Recruiting">Staffing / Recruiting</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Legal">Legal</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Company Size</label>
                <select
                  value={profile.companySize}
                  onChange={(e) => updateField('companySize', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1-10 employees (Startup)</option>
                  <option value="11-50">11-50 employees (Small)</option>
                  <option value="51-200">51-200 employees (Medium)</option>
                  <option value="201-500">201-500 employees (Large)</option>
                  <option value="501+">501+ employees (Enterprise)</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                  placeholder="City, State, Country"
                />
              </div>
            </div>
          </section>

          {/* Products & Services - CRITICAL */}
          <section className="bg-gradient-to-br from-indigo-950/30 to-purple-950/30 border border-indigo-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold">Products & Services</h2>
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">Critical for AI</span>
            </div>
            <p className="text-sm text-neutral-400 mb-6">This is the most important section - it helps Lead Hunter understand what you sell.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  What products/services do you offer? *
                </label>
                <textarea
                  value={profile.productsServices}
                  onChange={(e) => updateField('productsServices', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 min-h-[120px]"
                  placeholder="Example: We provide marketing automation software for B2B companies. Our main products include email marketing platform, CRM integration tools, and analytics dashboards..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  What's your unique value proposition?
                </label>
                <textarea
                  value={profile.uniqueValueProposition}
                  onChange={(e) => updateField('uniqueValueProposition', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 min-h-[100px]"
                  placeholder="Example: Unlike competitors, we offer AI-powered personalization that increases open rates by 40%..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Key benefits for customers (comma-separated)
                </label>
                <input
                  type="text"
                  value={profile.keyBenefits}
                  onChange={(e) => updateField('keyBenefits', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                  placeholder="Save 10 hours/week, Increase revenue by 30%, Reduce costs by 50%..."
                />
              </div>
            </div>
          </section>

          {/* Target Audience */}
          <section className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold">Target Audience</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Who is your target audience? *
                </label>
                <textarea
                  value={profile.targetAudience}
                  onChange={(e) => updateField('targetAudience', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 min-h-[100px]"
                  placeholder="Example: Marketing directors and CMOs at B2B SaaS companies with 50-500 employees in North America..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Ideal Customer Profile (ICP)
                </label>
                <textarea
                  value={profile.idealCustomerProfile}
                  onChange={(e) => updateField('idealCustomerProfile', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 min-h-[100px]"
                  placeholder="Job titles: VP of Marketing, CMO, Marketing Director&#10;Company size: 50-500 employees&#10;Industries: SaaS, Tech, Professional Services&#10;Revenue: $5M-$50M ARR&#10;Pain points: Low email engagement, manual processes..."
                />
              </div>
            </div>
          </section>

          {/* Sales Context */}
          <section className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold">Sales Context</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Average Deal Size</label>
                <input
                  type="text"
                  value={profile.averageDealSize}
                  onChange={(e) => updateField('averageDealSize', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                  placeholder="$5,000 - $50,000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Typical Sales Cycle</label>
                <select
                  value={profile.salesCycle}
                  onChange={(e) => updateField('salesCycle', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="">Select sales cycle length</option>
                  <option value="1-2 weeks">1-2 weeks (Quick)</option>
                  <option value="1-3 months">1-3 months (Standard)</option>
                  <option value="3-6 months">3-6 months (Longer)</option>
                  <option value="6+ months">6+ months (Enterprise)</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  What pain points do you solve?
                </label>
                <textarea
                  value={profile.painPointsSolved}
                  onChange={(e) => updateField('painPointsSolved', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 min-h-[100px]"
                  placeholder="Example: Our customers struggle with low email open rates, manual lead qualification, and disjointed sales tools..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  How do you differentiate from competitors?
                </label>
                <textarea
                  value={profile.competitorDifferentiation}
                  onChange={(e) => updateField('competitorDifferentiation', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 min-h-[100px]"
                  placeholder="Example: Unlike HubSpot, we're 70% cheaper. Unlike Mailchimp, we have built-in CRM..."
                />
              </div>
            </div>
          </section>

          {/* Outreach Preferences */}
          <section className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Mail className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold">Outreach Preferences</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Preferred Tone</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['professional', 'friendly', 'casual', 'formal'].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => updateField('preferredTone', tone)}
                      className={`px-4 py-3 rounded-xl border transition-all capitalize ${
                        profile.preferredTone === tone
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-black/50 border-white/10 text-neutral-400 hover:border-white/20'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Preferred Call-to-Action
                </label>
                <input
                  type="text"
                  value={profile.callToAction}
                  onChange={(e) => updateField('callToAction', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                  placeholder="Book a 15-min demo, Schedule a call, Get a free trial..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Testimonial/Social Proof to Highlight
                </label>
                <textarea
                  value={profile.testimonialHighlight}
                  onChange={(e) => updateField('testimonialHighlight', e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 min-h-[80px]"
                  placeholder="Example: 'We increased our pipeline by 300% in 3 months' - John D., VP Sales at TechCorp"
                />
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
