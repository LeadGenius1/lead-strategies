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

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },
}

// ==================== LEADS API ====================
export const leadsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/leads', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/leads/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/leads', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/leads/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/leads/${id}`)
    return response.data
  },
}

// ==================== CAMPAIGNS API ====================
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

// ==================== FORMS API ====================
export const formsAPI = {
  getAll: async () => {
    const response = await api.get('/forms')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/forms/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/forms', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/forms/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/forms/${id}`)
    return response.data
  },
}

export default api

