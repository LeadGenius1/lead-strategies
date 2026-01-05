import api from './api'

export const auth = {
  /**
   * Register new user
   */
  async signup(data) {
    try {
      const response = await api.post('/auth/signup', {
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        company: data.company,
        subscription_tier: data.tier
      })
      
      if (response.data.token) {
        this.setSession(response.data.token, response.data.user)
      }
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      })
      
      if (response.data.token) {
        this.setSession(response.data.token, response.data.user)
      }
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * OAuth login (Google, Microsoft, Twitter)
   */
  async oauthLogin(provider) {
    // Redirect to backend OAuth endpoint
    const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/${provider}`
    window.location.href = redirectUrl
  },

  /**
   * Logout user
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  },

  /**
   * Set session data
   */
  setSession(token, user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token')
    }
    return false
  },

  /**
   * Get user's subscription tier
   */
  getUserTier() {
    const user = this.getCurrentUser()
    return user?.subscription_tier || 'leadsite-ai'
  },

  /**
   * Refresh user data from server
   */
  async refreshUser() {
    try {
      const response = await api.get('/auth/me')
      if (response.data.user) {
        const token = localStorage.getItem('auth_token')
        this.setSession(token, response.data.user)
      }
      return response.data.user
    } catch (error) {
      throw error
    }
  }
}
