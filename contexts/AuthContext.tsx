'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getTierNumber, getTierName } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to normalize user data from backend
function normalizeUser(userData: any): User {
  const tier = typeof userData.tier === 'number'
    ? userData.tier
    : getTierNumber(userData.tier || 'leadsite-ai');

  // Backend returns 'name' and 'company', frontend expects 'firstName', 'lastName', 'companyName'
  const nameParts = (userData.name || '').split(' ');
  const firstName = userData.firstName || nameParts[0] || '';
  const lastName = userData.lastName || nameParts.slice(1).join(' ') || '';
  const companyName = userData.companyName || userData.company || '';

  return {
    ...userData,
    firstName,
    lastName,
    companyName,
    tier,
    tierName: getTierName(tier),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Backend returns { success, data: { user, tierLimits, tierFeatures } }
          const userData = result.data.user || result.data;
          setUser(normalizeUser(userData));
        }
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Handle both { data: { user } } and { data: user } formats
        const userData = result.data.user || result.data;
        if (userData && userData.email) {
          setUser(normalizeUser(userData));
          return { success: true };
        }
      }

      return { success: false, error: result.error || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
