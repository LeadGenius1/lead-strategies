/**
 * Auth API endpoints - SINGLE SOURCE OF TRUTH
 * Do NOT change these without updating backend and docs/AUTH-API-CONTRACT.md
 */
export const AUTH_ENDPOINTS = {
  SIGNUP: '/api/auth/signup',
  LOGIN: '/api/auth/login',
  ME: '/api/auth/me',
  LOGOUT: '/api/v1/auth/logout',
  OAUTH_CALLBACK: '/api/auth/oauth/callback',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
}
