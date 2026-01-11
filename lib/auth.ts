// Authentication utilities

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  tier: number; // 1=LeadSite.AI, 2=LeadSite.IO, 3=ClientContact.IO, 4=VideoSite.IO, 5=Tackle.IO
  tierName?: string; // Human-readable tier name
  createdAt: string;
}

// Helper to convert tier string to number
export function getTierNumber(tier: string | number): number {
  if (typeof tier === 'number') return tier;

  const tierMap: Record<string, number> = {
    'leadsite-ai': 1,
    'leadsite.ai': 1,
    'leadsite-io': 2,
    'leadsite.io': 2,
    'clientcontact-io': 3,
    'clientcontact.io': 3,
    'videosite-io': 4,
    'videosite.io': 4,
    'tackle-io': 5,
    'tackle.io': 5,
  };

  return tierMap[tier.toLowerCase()] || 1;
}

// Helper to get tier name from number
export function getTierName(tier: number | string): string {
  if (typeof tier === 'string') return tier;

  const tierNames: Record<number, string> = {
    1: 'LeadSite.AI',
    2: 'LeadSite.IO',
    3: 'ClientContact.IO',
    4: 'VideoSite.IO',
    5: 'Tackle.IO',
  };

  return tierNames[tier] || 'Free';
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
}

// Get current user from token
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Logout user
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    // Redirect to home
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect anyway
    window.location.href = '/';
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  // Check for auth token cookie
  if (typeof document === 'undefined') return false;
  return document.cookie.includes('auth-token=');
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
