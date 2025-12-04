'use client';

import { useEffect, useState } from 'react';
import { isFromIOSApp, isPaidAppUser, shouldShowPaywall, getPlatform } from '@/lib/platform-detector';
import { isWhitelistedAsync } from '@/lib/whitelist';
import { useAuth } from '@/contexts/AuthContext';
import { hasActiveSubscription, hasActiveIosSubscription, hasActivePromoAccess } from '@/lib/subscription';

const FREE_TRIAL_DAYS = 7;

/**
 * Check if running in Capacitor/iOS native app (must be called on client)
 */
function checkIsCapacitor(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!(window as any).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

/**
 * Wrap an async function with a timeout
 */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
}

/**
 * Check if user is still within their free trial period
 */
function isWithinFreeTrial(createdAt: any): boolean {
  if (!createdAt) return true; // If no creation date, assume trial active

  // Handle Firestore Timestamp or Date
  let createdDate: Date;
  if (createdAt.toDate) {
    createdDate = createdAt.toDate();
  } else if (createdAt instanceof Date) {
    createdDate = createdAt;
  } else if (typeof createdAt === 'string') {
    createdDate = new Date(createdAt);
  } else {
    return true; // Unknown format, assume trial active
  }

  const now = new Date();
  const trialEndDate = new Date(createdDate);
  trialEndDate.setDate(trialEndDate.getDate() + FREE_TRIAL_DAYS);

  return now < trialEndDate;
}

/**
 * Calculate days remaining in trial
 */
function getDaysRemainingInTrial(createdAt: any): number {
  if (!createdAt) return FREE_TRIAL_DAYS;

  let createdDate: Date;
  if (createdAt.toDate) {
    createdDate = createdAt.toDate();
  } else if (createdAt instanceof Date) {
    createdDate = createdAt;
  } else if (typeof createdAt === 'string') {
    createdDate = new Date(createdAt);
  } else {
    return FREE_TRIAL_DAYS;
  }

  const now = new Date();
  const trialEndDate = new Date(createdDate);
  trialEndDate.setDate(trialEndDate.getDate() + FREE_TRIAL_DAYS);

  const msRemaining = trialEndDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  return Math.max(0, daysRemaining);
}

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
  const [isInTrial, setIsInTrial] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [isUserWhitelisted, setIsUserWhitelisted] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      // Detect platform on client side only
      const detectedPlatform = getPlatform();
      const fromApp = isFromIOSApp();
      const paidUser = isPaidAppUser();
      const isNativeApp = checkIsCapacitor();

      // Check free trial status FIRST - this is synchronous and fast
      // If user is in trial, grant access immediately without waiting for slow Firestore calls
      // For brand new users without createdAt, assume they're in trial (will be set shortly)
      const inTrial = user?.uid ? isWithinFreeTrial(user.createdAt) : false;
      const daysRemaining = user?.uid ? getDaysRemainingInTrial(user.createdAt) : FREE_TRIAL_DAYS;

      // For iOS native app (Capacitor), grant immediate access to ALL authenticated users
      // This prevents lockups from slow Firestore calls on iOS WKWebView
      // The app is free with 7-day trial, so just let them in
      if (isNativeApp && user?.uid) {
        console.log('iOS Capacitor: Granting immediate access to authenticated user');
        setPlatform(detectedPlatform);
        setIsApp(fromApp || isNativeApp);
        setIsPaid(true);
        setShowPaywall(false);
        setIsInTrial(inTrial);
        setTrialDaysRemaining(daysRemaining);
        setIsUserWhitelisted(false);
        setIsLoading(false);
        return;
      }

      // Use short timeout (3s) for Firestore calls on iOS to prevent lockups
      const timeout = isNativeApp ? 3000 : 10000;

      // Run all checks in parallel with timeouts to prevent blocking
      const [whitelisted, hasWebSubscription, hasIosSubscription, hasPromoAccess] = await Promise.all([
        user?.email
          ? withTimeout(isWhitelistedAsync(user.email), timeout, false)
          : Promise.resolve(false),
        user?.uid && !fromApp
          ? withTimeout(hasActiveSubscription(user.uid), timeout, false)
          : Promise.resolve(false),
        user?.uid
          ? withTimeout(hasActiveIosSubscription(user.uid), timeout, false)
          : Promise.resolve(false),
        user?.uid
          ? withTimeout(hasActivePromoAccess(user.uid), timeout, false)
          : Promise.resolve(false),
      ]);

      // User has paid access if:
      // 1. They're from iOS app (paid $2.99)
      // 2. They're whitelisted (admin/friends)
      // 3. They have an active web subscription (Square)
      // 4. They have an active iOS IAP subscription (RevenueCat)
      // 5. They have a promo code (free forever, etc.)
      // 6. They're within their free trial period
      const hasPaidAccess = paidUser || whitelisted || hasWebSubscription || hasIosSubscription || hasPromoAccess || inTrial;
      const needsPaywall = !hasPaidAccess;

      setPlatform(detectedPlatform);
      setIsApp(fromApp);
      setIsPaid(hasPaidAccess);
      setShowPaywall(needsPaywall);
      setIsInTrial(inTrial && !paidUser && !whitelisted && !hasWebSubscription && !hasIosSubscription && !hasPromoAccess);
      setTrialDaysRemaining(daysRemaining);
      setIsUserWhitelisted(whitelisted);
      setIsLoading(false);

      // Log for debugging
      console.log('Platform detected:', {
        platform: detectedPlatform,
        isApp: fromApp,
        isNativeApp,
        isPaidUser: paidUser,
        whitelisted,
        hasWebSubscription,
        hasIosSubscription,
        hasPromoAccess,
        inTrial,
        daysRemaining,
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
    isInTrial,
    trialDaysRemaining,
    isWhitelisted: isUserWhitelisted,
  };
}
