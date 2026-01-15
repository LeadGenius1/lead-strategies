'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import CreateCampaignModal from '@/components/CreateCampaignModal'

export default function WebsitesPage() {
  const router = useRouter()
  const [websites, setWebsites] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [url, setUrl] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [websiteProspects, setWebsiteProspects] = useState([])

  useEffect(() => {
    loadWebsites()
  }, [])

  async function loadWebsites() {
    try {
      const response = await api.get('/api/websites')
      setWebsites(response.data || [])
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
      const response = await api.post('/api/websites/analyze', { url })
      toast.success('Website analyzed successfully!')
      setWebsites([response.data, ...websites])
      setUrl('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze website')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-text">Websites</h1>
        <p className="text-dark-textMuted mt-1">Analyze websites to discover leads and generate campaigns</p>
      </div>

      {/* Analyze Form */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-dark-text mb-4">Analyze New Website</h2>
        <form onSubmit={analyzeWebsite} className="flex gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
            required
          />
          <button
            type="submit"
            disabled={analyzing}
            className="px-6 py-3 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg transition disabled:opacity-50"
          >
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
        <p className="text-dark-textMuted text-sm mt-3">
          Our AI will analyze the website, extract key information, and identify potential leads.
        </p>
      </div>

      {/* Websites List */}
      <div>
        <h2 className="text-lg font-semibold text-dark-text mb-4">Analyzed Websites</h2>
        
        {loading ? (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-8 text-center">
            <p className="text-dark-textMuted">Loading...</p>
          </div>
        ) : websites.length === 0 ? (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-8 text-center">
            <p className="text-dark-textMuted">No websites analyzed yet. Enter a URL above to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {websites.map((website) => (
              <div
                key={website.id}
                className="bg-dark-surface border border-dark-border rounded-xl p-6 hover:border-dark-primary transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-text">{website.company_name || website.url}</h3>
                    <a 
                      href={website.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-dark-primary hover:text-dark-primaryHover text-sm"
                    >
                      {website.url}
                    </a>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    website.status === 'analyzed' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {website.status || 'Pending'}
                  </span>
                </div>
                
                {website.description && (
                  <p className="text-dark-textMuted mt-3 text-sm">{website.description}</p>
                )}

                <div className="flex gap-4 mt-4">
                  <span className="text-sm text-dark-textMuted">
                    👥 {website.prospects_count || 0} prospects
                  </span>
                  <span className="text-sm text-dark-textMuted">
                    📧 {website.campaigns_count || 0} campaigns
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleViewProspects(website.id)}
                    className="px-4 py-2 bg-dark-primary hover:bg-dark-primaryHover text-white text-sm rounded-lg transition"
                  >
                    View Prospects
                  </button>
                  <button
                    onClick={() => handleCreateCampaign(website.id)}
                    className="px-4 py-2 bg-dark-surfaceHover hover:bg-dark-border text-dark-text text-sm rounded-lg transition"
                  >
                    Create Campaign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setWebsiteProspects([])
        }}
        onSuccess={handleCampaignCreated}
        websiteProspects={websiteProspects}
      />
    </div>
  )
}
