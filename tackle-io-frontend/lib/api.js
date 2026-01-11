import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-2987.up.railway.app'

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

// ==================== TACKLE.IO DASHBOARD API ====================
export const tackleAPI = {
  getDashboard: async () => {
    const response = await api.get('/tackle/dashboard')
    return response.data
  },
}

// ==================== COMPANIES API ====================
export const companiesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/tackle/companies', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/tackle/companies/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/tackle/companies', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/tackle/companies/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/tackle/companies/${id}`)
    return response.data
  },

  getContacts: async (id) => {
    const response = await api.get(`/tackle/companies/${id}/contacts`)
    return response.data
  },

  getDeals: async (id) => {
    const response = await api.get(`/tackle/companies/${id}/deals`)
    return response.data
  },
}

// ==================== CONTACTS API ====================
export const contactsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/tackle/contacts', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/tackle/contacts/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/tackle/contacts', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/tackle/contacts/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/tackle/contacts/${id}`)
    return response.data
  },

  bulkImport: async (contacts) => {
    const response = await api.post('/tackle/contacts/bulk', { contacts })
    return response.data
  },

  getActivities: async (id) => {
    const response = await api.get(`/tackle/contacts/${id}/activities`)
    return response.data
  },
}

// ==================== DEALS API ====================
export const dealsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/tackle/deals', { params })
    return response.data
  },

  getPipeline: async (pipelineId) => {
    const response = await api.get('/tackle/deals/pipeline', { params: { pipelineId } })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/tackle/deals/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/tackle/deals', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/tackle/deals/${id}`, data)
    return response.data
  },

  updateStage: async (id, stageId) => {
    const response = await api.patch(`/tackle/deals/${id}/stage`, { stageId })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/tackle/deals/${id}`)
    return response.data
  },
}

// ==================== ACTIVITIES API ====================
export const activitiesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/tackle/activities', { params })
    return response.data
  },

  getUpcoming: async () => {
    const response = await api.get('/tackle/activities/upcoming')
    return response.data
  },

  getOverdue: async () => {
    const response = await api.get('/tackle/activities/overdue')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/tackle/activities/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/tackle/activities', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/tackle/activities/${id}`, data)
    return response.data
  },

  complete: async (id, outcome) => {
    const response = await api.patch(`/tackle/activities/${id}/complete`, { outcome })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/tackle/activities/${id}`)
    return response.data
  },
}

// ==================== CALLS API ====================
export const callsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/tackle/calls', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/tackle/calls/${id}`)
    return response.data
  },

  initiate: async (data) => {
    const response = await api.post('/tackle/calls/initiate', data)
    return response.data
  },

  log: async (data) => {
    const response = await api.post('/tackle/calls/log', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/tackle/calls/${id}`, data)
    return response.data
  },
}

// ==================== DOCUMENTS API ====================
export const documentsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/tackle/documents', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/tackle/documents/${id}`)
    return response.data
  },

  upload: async (file, metadata) => {
    const formData = new FormData()
    formData.append('file', file)
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key])
    })
    const response = await api.post('/tackle/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/tackle/documents/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/tackle/documents/${id}`)
    return response.data
  },

  sendForSignature: async (id, signers) => {
    const response = await api.post(`/tackle/documents/${id}/send-signature`, { signers })
    return response.data
  },
}

// ==================== PIPELINES API ====================
export const pipelinesAPI = {
  getAll: async () => {
    const response = await api.get('/tackle/pipelines')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/tackle/pipelines/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/tackle/pipelines', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/tackle/pipelines/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/tackle/pipelines/${id}`)
    return response.data
  },

  reorderStages: async (id, stageIds) => {
    const response = await api.patch(`/tackle/pipelines/${id}/reorder`, { stageIds })
    return response.data
  },
}

// ==================== SEQUENCES API ====================
export const sequencesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/tackle/sequences', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/tackle/sequences/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/tackle/sequences', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/tackle/sequences/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/tackle/sequences/${id}`)
    return response.data
  },

  addStep: async (id, step) => {
    const response = await api.post(`/tackle/sequences/${id}/steps`, step)
    return response.data
  },

  updateStep: async (id, stepId, data) => {
    const response = await api.put(`/tackle/sequences/${id}/steps/${stepId}`, data)
    return response.data
  },

  deleteStep: async (id, stepId) => {
    const response = await api.delete(`/tackle/sequences/${id}/steps/${stepId}`)
    return response.data
  },

  enrollContacts: async (id, contactIds) => {
    const response = await api.post(`/tackle/sequences/${id}/enroll`, { contactIds })
    return response.data
  },
}

// ==================== TEAMS API ====================
export const teamsAPI = {
  getAll: async () => {
    const response = await api.get('/tackle/teams')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/tackle/teams/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/tackle/teams', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/tackle/teams/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/tackle/teams/${id}`)
    return response.data
  },

  addMember: async (id, memberData) => {
    const response = await api.post(`/tackle/teams/${id}/members`, memberData)
    return response.data
  },

  removeMember: async (id, memberId) => {
    const response = await api.delete(`/tackle/teams/${id}/members/${memberId}`)
    return response.data
  },
}

// ==================== ANALYTICS API ====================
export const analyticsAPI = {
  getSalesOverview: async (params = {}) => {
    const response = await api.get('/tackle/analytics/sales', { params })
    return response.data
  },

  getActivityMetrics: async (params = {}) => {
    const response = await api.get('/tackle/analytics/activities', { params })
    return response.data
  },

  getPipelineMetrics: async (params = {}) => {
    const response = await api.get('/tackle/analytics/pipeline', { params })
    return response.data
  },

  getForecast: async (params = {}) => {
    const response = await api.get('/tackle/analytics/forecast', { params })
    return response.data
  },

  getLeaderboard: async (params = {}) => {
    const response = await api.get('/tackle/analytics/leaderboard', { params })
    return response.data
  },

  getRepPerformance: async (repId, params = {}) => {
    const response = await api.get(`/tackle/analytics/rep/${repId}`, { params })
    return response.data
  },
}

export default api

