/**
 * API Client with Backend Token Management (BFF Pattern)
 * Automatically fetches and attaches backend tokens to API requests
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';

interface BackendTokenResponse {
  token: string;
  expiresIn: number;
  expiresAt: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get backend token from frontend BFF endpoint
 */
async function getBackendToken(): Promise<string> {
  // Check if cached token is still valid (with 1 minute buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token;
  }

  try {
    const response = await fetch('/api/backend-token', {
      method: 'GET',
      credentials: 'include', // Include cookies for NextAuth session
    });

    if (!response.ok) {
      throw new Error('Failed to get backend token');
    }

    const data: BackendTokenResponse = await response.json();
    
    // Cache token
    cachedToken = {
      token: data.token,
      expiresAt: new Date(data.expiresAt).getTime(),
    };

    return data.token;
  } catch (error) {
    console.error('Error fetching backend token:', error);
    throw error;
  }
}

/**
 * Make authenticated API request to backend
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getBackendToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `API request failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Copilot API client
 */
export const copilotApi = {
  /**
   * Send chat message to copilot
   */
  async chat(message: string, context?: Record<string, any>) {
    return apiRequest<{
      response: string;
      actions: Array<{ type: string; [key: string]: any }>;
      suggestions: string[];
      agent: string;
      reasoning: string;
      data: any;
    }>('/api/v1/copilot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  },

  /**
   * Get suggestions
   */
  async getSuggestions() {
    return apiRequest<{ suggestions: string[] }>('/api/v1/copilot/suggestions');
  },
};

/**
 * Clear cached token (useful for logout)
 */
export function clearBackendToken() {
  cachedToken = null;
}

/**
 * API Client object for backwards compatibility
 */
export const apiClient = {
  get: async (endpoint: string) => {
    return apiRequest(endpoint, { method: 'GET' });
  },
  post: async (endpoint: string, data?: any) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  put: async (endpoint: string, data?: any) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (endpoint: string) => {
    return apiRequest(endpoint, { method: 'DELETE' });
  },
};
