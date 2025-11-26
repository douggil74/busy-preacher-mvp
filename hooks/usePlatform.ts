'use client';

import { useEffect, useState } from 'react';
import { isFromIOSApp, isPaidAppUser, shouldShowPaywall, getPlatform } from '@/lib/platform-detector';
import { isWhitelisted } from '@/lib/whitelist';
import { useAuth } from '@/contexts/AuthContext';
import { hasActiveSubscription } from '@/lib/subscription';

/**
 * Hook to detect platform and paywall status
 * Use this to conditionally show paywalls or premium features
 */
export function usePlatform() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState<'ios-app' | 'web'>('web');
  const [isApp, setIsApp] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      // Detect platform on client side only
      const detectedPlatform = getPlatform();
      const fromApp = isFromIOSApp();
      const paidUser = isPaidAppUser();
      const whitelisted = user?.email ? isWhitelisted(user.email) : false;

      // Check for active web subscription
      let hasWebSubscription = false;
      if (user?.uid && !fromApp) {
        hasWebSubscription = await hasActiveSubscription(user.uid);
      }

      // User has paid access if:
      // 1. They're from iOS app (paid $2.99)
      // 2. They're whitelisted (admin/friends)
      // 3. They have an active web subscription
      const hasPaidAccess = paidUser || whitelisted || hasWebSubscription;
      const needsPaywall = !hasPaidAccess;

      setPlatform(detectedPlatform);
      setIsApp(fromApp);
      setIsPaid(hasPaidAccess);
      setShowPaywall(needsPaywall);
      setIsLoading(false);

      // Log for debugging (remove in production)
      console.log('Platform detected:', {
        platform: detectedPlatform,
        isApp: fromApp,
        isPaidUser: paidUser,
        whitelisted,
        hasWebSubscription,
        hasPaidAccess,
        showPaywall: needsPaywall,
      });
    }

    checkAccess();
  }, [user]);

  return {
    platform,
    isApp,
    isPaid,
    showPaywall,
    isLoading,
  };
}
