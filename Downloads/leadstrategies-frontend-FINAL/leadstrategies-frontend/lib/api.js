import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Check if this is an admin route
  const isAdminRoute = config.url?.startsWith('/api/admin')
  const token = isAdminRoute ? Cookies.get('admin_token') : Cookies.get('token')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors and normalize backend response format
api.interceptors.response.use(
  (response) => {
    // Backend returns { success: true, data: {...} }
    // Normalize to always have data at response.data level
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      // Extract data from backend response format
      return {
        ...response,
        data: response.data.data || response.data
      }
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      Cookies.remove('token')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api


