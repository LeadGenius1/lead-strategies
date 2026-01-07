import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'

// Create axios instance
// Backend uses /api (not /api/v1)
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ==================== AUTH API ====================
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  // Backend uses /auth/signup (not /auth/register)
  register: async (userData) => {
    const response = await api.post('/auth/signup', {
      email: userData.email,
      password: userData.password,
      first_name: userData.name?.split(' ')[0] || userData.first_name,
      last_name: userData.name?.split(' ').slice(1).join(' ') || userData.last_name,
      company_name: userData.company_name,
      phone: userData.phone
    })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// ==================== DASHBOARD API ====================
// Dashboard stats are computed from campaigns + prospects endpoints
export const dashboardAPI = {
  getStats: async () => {
    try {
      // Fetch campaigns and prospects to compute stats
      const [campaignsRes, prospectsRes] = await Promise.all([
        api.get('/campaigns').catch(() => ({ data: { campaigns: [] } })),
        api.get('/prospects', { params: { limit: 1000 } }).catch(() => ({ data: { prospects: [], pagination: { total: 0 } } }))
      ])
      
      const campaigns = campaignsRes.data.campaigns || []
      const prospects = prospectsRes.data.prospects || []
      const totalProspects = prospectsRes.data.pagination?.total || prospects.length
      
      // Compute stats
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length
      const emailsSent = campaigns.reduce((sum, c) => sum + (parseInt(c.prospect_count) || 0), 0)
      const replies = campaigns.reduce((sum, c) => sum + (parseInt(c.reply_count) || 0), 0)
      const replyRate = emailsSent > 0 ? Math.round((replies / emailsSent) * 100) : 0
      
      return {
        total_leads: totalProspects,
        active_campaigns: activeCampaigns,
        emails_sent: emailsSent,
        reply_rate: replyRate
      }
    } catch (error) {
      console.error('Dashboard stats error:', error)
      return {
        total_leads: 0,
        active_campaigns: 0,
        emails_sent: 0,
        reply_rate: 0
      }
    }
  },
}

// ==================== CAMPAIGN API ====================
export const campaignAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/campaigns', { params })
    // Backend returns { campaigns: [] }
    return response.data.campaigns || []
  },

  getById: async (id) => {
    const response = await api.get(`/campaigns/${id}`)
    return response.data.campaign || response.data
  },

  create: async (data) => {
    const response = await api.post('/campaigns', data)
    return response.data.campaign || response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/campaigns/${id}`, data)
    return response.data.campaign || response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/campaigns/${id}`)
    return response.data
  },

  start: async (id) => {
    const response = await api.post(`/campaigns/${id}/start`)
    return response.data
  },

  pause: async (id) => {
    const response = await api.post(`/campaigns/${id}/pause`)
    return response.data
  },
}

// ==================== LEAD/PROSPECT API ====================
// Backend uses /prospects (not /leads)
export const leadAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/prospects', { params })
    // Backend returns { prospects: [], pagination: {} }
    return response.data.prospects || []
  },

  getById: async (id) => {
    const response = await api.get(`/prospects/${id}`)
    return response.data.prospect || response.data
  },

  create: async (data) => {
    // Map frontend field names to backend field names
    const response = await api.post('/prospects', {
      email: data.email,
      first_name: data.name?.split(' ')[0] || data.first_name,
      last_name: data.name?.split(' ').slice(1).join(' ') || data.last_name,
      company: data.company,
      title: data.title,
      linkedin_url: data.linkedinUrl || data.linkedin_url,
      campaign_id: data.campaign_id,
      tags: data.tags,
      notes: data.notes
    })
    return response.data.prospect || response.data
  },

  update: async (id, data) => {
    const response = await api.patch(`/prospects/${id}`, data)
    return response.data.prospect || response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/prospects/${id}`)
    return response.data
  },

  import: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/prospects/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

// ==================== ANALYTICS API ====================
export const analyticsAPI = {
  getOverview: async (dateRange = {}) => {
    const response = await api.get('/analytics/overview', { params: dateRange })
    return response.data
  },

  getCampaignAnalytics: async (campaignId, dateRange = {}) => {
    const response = await api.get(`/analytics/campaigns/${campaignId}`, { params: dateRange })
    return response.data
  },
}

export default api




