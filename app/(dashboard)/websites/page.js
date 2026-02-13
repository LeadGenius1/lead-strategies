'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Globe, Loader2, ExternalLink, ArrowRight, Sparkles, Eye, Upload } from 'lucide-react'
import WebsiteBuilderChat from '@/components/WebsiteBuilderChat'

export default function WebsitesPage() {
  const [websites, setWebsites] = useState([])
  const [loading, setLoading] = useState(true)
  const [featureBlocked, setFeatureBlocked] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState('')
  const [showBuilder, setShowBuilder] = useState(false)
  const [publishingId, setPublishingId] = useState(null)

  useEffect(() => {
    loadWebsites()
  }, [])

  function handleWebsiteCreated() {
    setShowBuilder(false)
    loadWebsites()
  }

  async function handlePublish(site) {
    setPublishingId(site.id)
    try {
      await api.post(`/api/v1/websites/${site.id}/publish`)
      toast.success('Website published! It\'s now live.')
      loadWebsites()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish')
    } finally {
      setPublishingId(null)
    }
  }

  async function loadWebsites() {
    try {
      setFeatureBlocked(false)
      const response = await api.get('/api/v1/websites')
      const data = response.data?.data || response.data
      const list = Array.isArray(data?.websites) ? data.websites : []
      setWebsites(list)
    } catch (error) {
      const status = error.response?.status
      const errData = error.response?.data
      if (status === 403) {
        setFeatureBlocked(true)
        setUpgradeMessage(errData?.message || 'Upgrade to LeadSite.IO to create AI-powered websites.')
        setWebsites([])
      } else {
        console.error('Error loading websites:', error)
        setWebsites([])
        toast.error('Could not load websites')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black p-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Websites</h1>
            <p className="text-neutral-500 mt-1 text-sm">AI-built websites that generate leads 24/7</p>
          </div>
          {!featureBlocked && (
            <button
              onClick={() => setShowBuilder(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              New Website
            </button>
          )}
        </div>

        {featureBlocked ? (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-8 text-center">
            <Globe className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">Website Builder Unlocked with LeadSite.IO</h2>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto">{upgradeMessage}</p>
            <Link
              href="https://aileadstrategies.com/leadsite-io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-xl font-medium transition-all"
            >
              Learn about LeadSite.IO
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : websites.length === 0 ? (
          <div className="rounded-2xl bg-neutral-900/50 border border-white/10 p-12 text-center">
            <Globe className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">No websites yet</h2>
            <p className="text-neutral-500 mb-6">Build your first AI-powered website in minutes with our chat wizard.</p>
            <button
              onClick={() => setShowBuilder(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-xl font-medium transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Build with AI
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {websites.map((site) => (
              <div
                key={site.id}
                className="rounded-2xl bg-neutral-900/50 border border-white/10 p-6 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    site.isPublished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-500/20 text-neutral-400'
                  }`}>
                    {site.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="font-medium text-white mb-1">{site.name || site.title || 'Untitled Site'}</h3>
                <p className="text-xs text-neutral-500 mb-4 truncate">
                  {site.subdomain ? `aileadstrategies.com/sites/${site.subdomain}` : '—'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={site.subdomain ? `https://aileadstrategies.com/sites/${site.subdomain}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    {site.isPublished ? 'View site' : 'Preview'}
                  </a>
                  {!site.isPublished && (
                    <button
                      onClick={() => handlePublish(site)}
                      disabled={publishingId === site.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-50"
                    >
                      {publishingId === site.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Publish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Website Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-neutral-950 border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-medium text-white">Build Your Website with AI</h2>
              </div>
              <button
                onClick={() => setShowBuilder(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden min-h-[400px]">
              <WebsiteBuilderChat onWebsiteCreated={handleWebsiteCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
