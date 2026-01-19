'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Globe, Search, Users, Zap, ExternalLink, Plus, Loader2 } from 'lucide-react'

export default function WebsitesPage() {
  const router = useRouter()
  const [websites, setWebsites] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    loadWebsites()
  }, [])

  async function loadWebsites() {
    try {
      const response = await api.get('/api/websites')
      const websitesList = response.data?.websites || response.data || []
      setWebsites(websitesList)
    } catch (error) {
      console.error('Error loading websites:', error)
    } finally {
      setLoading(false)
    }
  }

  async function analyzeWebsite(e) {
    e.preventDefault()
    if (!url.trim()) return

    setAnalyzing(true)
    try {
      await api.post('/api/websites/analyze', { url })
      toast.success('Website analyzed successfully!')
      await loadWebsites()
      setUrl('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze website')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black p-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-white">Websites</h1>
          <p className="text-neutral-500 mt-1 text-sm">Analyze websites to discover leads and generate campaigns</p>
        </div>

        {/* Analyze Form */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Analyze New Website</h2>
              <p className="text-xs text-neutral-500">Enter a URL to discover leads and company information</p>
            </div>
          </div>
          
          <form onSubmit={analyzeWebsite} className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-5 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              required
            />
            <button
              type="submit"
              disabled={analyzing}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Analyze
                </>
              )}
            </button>
          </form>
        </div>

        {/* Websites List */}
        <div>
          <h2 className="text-lg font-medium text-white mb-4">Analyzed Websites</h2>
          
          {loading ? (
            <div className="p-12 rounded-2xl bg-neutral-900/50 border border-white/10 text-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">Loading websites...</p>
            </div>
          ) : websites.length === 0 ? (
            <div className="p-12 rounded-2xl bg-neutral-900/50 border border-white/10 text-center">
              <Globe className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
              <p className="text-neutral-400 mb-2">No websites analyzed yet</p>
              <p className="text-neutral-600 text-sm">Enter a URL above to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {websites.map((website) => (
                <div
                  key={website.id}
                  className="group p-6 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-neutral-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{website.company_name || website.url}</h3>
                        <a 
                          href={website.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 mt-1"
                        >
                          {website.url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      website.status === 'analyzed' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {website.status || 'Pending'}
                    </span>
                  </div>
                  
                  {website.description && (
                    <p className="text-neutral-400 mt-4 text-sm">{website.description}</p>
                  )}

                  <div className="flex gap-6 mt-4 pt-4 border-t border-white/5">
                    <span className="text-sm text-neutral-500 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      {website.prospects_count || 0} prospects
                    </span>
                    <span className="text-sm text-neutral-500 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      {website.campaigns_count || 0} campaigns
                    </span>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => router.push(`/dashboard/prospects?websiteId=${website.id}`)}
                      className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm rounded-xl transition-all flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      View Prospects
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/campaigns')}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-sm rounded-xl transition-all flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Create Campaign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
