'use client';

import { useEffect, useState } from 'react';
import { isFromIOSApp, isPaidAppUser, shouldShowPaywall, getPlatform } from '@/lib/platform-detector';

/**
 * Hook to detect platform and paywall status
 * Use this to conditionally show paywalls or premium features
 */
export function usePlatform() {
  const [platform, setPlatform] = useState<'ios-app' | 'web'>('web');
  const [isApp, setIsApp] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect platform on client side only
    const detectedPlatform = getPlatform();
    const fromApp = isFromIOSApp();
    const paidUser = isPaidAppUser();
    const needsPaywall = shouldShowPaywall();

    setPlatform(detectedPlatform);
    setIsApp(fromApp);
    setIsPaid(paidUser);
    setShowPaywall(needsPaywall);
    setIsLoading(false);

    // Log for debugging (remove in production)
    console.log('Platform detected:', {
      platform: detectedPlatform,
      isApp: fromApp,
      isPaidUser: paidUser,
      showPaywall: needsPaywall,
    });
  }, []);

  return {
    platform,
    isApp,
    isPaid,
    showPaywall,
    isLoading,
  };
}
