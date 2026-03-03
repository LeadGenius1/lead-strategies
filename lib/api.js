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
  // User routes: prefer token, fallback to admin_token (admin uses same JWT for both)
  const token = isAdminRoute
    ? Cookies.get('admin_token')
    : (Cookies.get('token') || Cookies.get('admin_token'))

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Silent token refresh on 401 "Token expired"
let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const msg = error.response?.data?.error || ''

    // Only attempt refresh for token expiration on user routes (not admin)
    if (status === 401 && msg.includes('expired') && !originalRequest._retry) {
      const token = Cookies.get('token')
      if (!token) return Promise.reject(error)

      if (isRefreshing) {
        // Another request is already refreshing — wait for it
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(api(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'
        const res = await axios.post(`${baseURL}/api/v1/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const newToken = res.data.token
        if (newToken) {
          const isProd = typeof window !== 'undefined' && location?.protocol === 'https:'
          Cookies.set('token', newToken, { expires: 7, secure: isProd, sameSite: 'lax' })
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          onTokenRefreshed(newToken)
          return api(originalRequest)
        }
      } catch {
        // Refresh failed — clear token, user must re-login
        Cookies.remove('token')
      } finally {
        isRefreshing = false
      }
    }

    // Non-expired 401 or refresh failed
    if (status === 401) {
      Cookies.remove('token')
    }
    return Promise.reject(error)
  }
)

export default api
