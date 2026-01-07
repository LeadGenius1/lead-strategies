import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
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

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
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

// ==================== VIDEO API ====================
export const videoAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/videos', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/videos/${id}`)
    return response.data
  },

  upload: async (file, data = {}) => {
    const formData = new FormData()
    formData.append('file', file)
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key])
    })
    const response = await api.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/videos/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/videos/${id}`)
    return response.data
  },

  getAnalytics: async (id) => {
    const response = await api.get(`/videos/${id}/analytics`)
    return response.data
  },
}

// ==================== CAMPAIGN API ====================
export const campaignAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/campaigns', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/campaigns/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/campaigns', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/campaigns/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/campaigns/${id}`)
    return response.data
  },
}

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },
}

// ==================== ANALYTICS API ====================
export const analyticsAPI = {
  getOverview: async (dateRange = {}) => {
    const response = await api.get('/analytics/overview', { params: dateRange })
    return response.data
  },

  getVideoAnalytics: async (videoId, dateRange = {}) => {
    const response = await api.get(`/analytics/videos/${videoId}`, { params: dateRange })
    return response.data
  },
}

export default api




