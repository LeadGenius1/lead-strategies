// API Client for Railway Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.RAILWAY_API_URL || '';

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  password: string;
  tier: string;
  industry?: string;
  companySize?: string;
  currentTools?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async signup(data: SignupData): Promise<ApiResponse> {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request(`/api/auth/verify-email?token=${token}`, {
      method: 'GET',
    });
  }

  async getProfile(): Promise<ApiResponse> {
    return this.request('/api/user/profile', {
      method: 'GET',
    });
  }

  async updateProfile(data: Partial<SignupData>): Promise<ApiResponse> {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
