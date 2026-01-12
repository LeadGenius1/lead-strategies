// Test bypass component - injects test user data if test token is present
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function TestBypass() {
  const { user } = useAuth();

  useEffect(() => {
    // This component ensures test users are properly loaded
    // It's included in the dashboard layout
  }, [user]);

  return null; // This is a utility component, no UI
}
