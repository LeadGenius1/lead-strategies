// contexts/PlatformContext.tsx
'use client'; // For Next.js App Router compatibility

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  PlatformType,
  FeatureCode,
  PlatformFeature,
  getPlatformFeatures,
  hasFeature as checkFeature,
  detectPlatformFromDomain,
  detectPlatformFromUser,
  getFeatureCount,
} from '@/lib/platformFeatures';

interface PlatformContextType {
  platform: PlatformType;
  features: PlatformFeature[];
  featureCount: number;
  hasFeature: (feature: FeatureCode) => boolean;
  setPlatform: (platform: PlatformType) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export interface PlatformProviderProps {
  children: ReactNode;
  initialPlatform?: PlatformType;
  user?: {
    subscription_tier?: string;
    plan_tier?: string;
    role?: string;
  };
}

export function PlatformProvider({
  children,
  initialPlatform,
  user,
}: PlatformProviderProps) {
  // Determine initial platform
  const getInitialPlatform = (): PlatformType => {
    if (initialPlatform) return initialPlatform;
    if (user) return detectPlatformFromUser(user);
    return detectPlatformFromDomain();
  };

  const [platform, setPlatform] = useState<PlatformType>(() => getInitialPlatform());
  const [features, setFeatures] = useState<PlatformFeature[]>(() =>
    getPlatformFeatures(getInitialPlatform())
  );
  const [featureCount, setFeatureCount] = useState<number>(() =>
    getFeatureCount(getInitialPlatform())
  );

  // Update features when platform changes
  useEffect(() => {
    const newFeatures = getPlatformFeatures(platform);
    setFeatures(newFeatures);
    setFeatureCount(newFeatures.length);
  }, [platform]);

  // Update platform when user changes
  useEffect(() => {
    if (user && !initialPlatform) {
      const detectedPlatform = detectPlatformFromUser(user);
      setPlatform(detectedPlatform);
    }
  }, [user, initialPlatform]);

  const hasFeature = (feature: FeatureCode): boolean => {
    return checkFeature(platform, feature);
  };

  return (
    <PlatformContext.Provider
      value={{
        platform,
        features,
        featureCount,
        hasFeature,
        setPlatform,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

// Hook to access platform context
export function usePlatform() {
  const context = useContext(PlatformContext);

  if (!context) {
    throw new Error('usePlatform must be used within PlatformProvider');
  }

  return context;
}

// Convenience hook to check if a specific feature is available
export function useFeature(feature: FeatureCode): boolean {
  const { hasFeature } = usePlatform();
  return hasFeature(feature);
}

// Convenience hook to get all features for current platform
export function usePlatformFeatures(): PlatformFeature[] {
  const { features } = usePlatform();
  return features;
}
