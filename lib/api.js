import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Check if this is an admin route (/admin/* or /api/admin/*)
  const isAdminRoute = config.url?.startsWith('/admin') || config.url?.startsWith('/api/admin')
  const token = isAdminRoute ? Cookies.get('admin_token') : Cookies.get('token')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors - DO NOT transform responses, let calling code handle data extraction
api.interceptors.response.use(
  (response) => {
    // Return response as-is - don't transform!
    // This preserves the full backend response including token
    return response
  },
  (error) => {
    // Don't do hard redirect on 401 - let calling code handle it
    if (error.response?.status === 401) {
      Cookies.remove('token')
    }
    return Promise.reject(error)
  }
)

export default api
