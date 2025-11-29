'use client';

import { useEffect, useState } from 'react';
import { isFromIOSApp, isPaidAppUser, shouldShowPaywall, getPlatform } from '@/lib/platform-detector';
import { isWhitelisted } from '@/lib/whitelist';
import { useAuth } from '@/contexts/AuthContext';
import { hasActiveSubscription, hasActiveIosSubscription, hasActivePromoAccess } from '@/lib/subscription';

const FREE_TRIAL_DAYS = 7;

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
      const whitelisted = user?.email ? isWhitelisted(user.email) : false;

      // Check for active web subscription (Square)
      let hasWebSubscription = false;
      if (user?.uid && !fromApp) {
        hasWebSubscription = await hasActiveSubscription(user.uid);
      }

      // Check for active iOS IAP subscription (RevenueCat)
      let hasIosSubscription = false;
      if (user?.uid) {
        hasIosSubscription = await hasActiveIosSubscription(user.uid);
      }

      // Check for promo code access (free forever, etc.)
      let hasPromoAccess = false;
      if (user?.uid) {
        hasPromoAccess = await hasActivePromoAccess(user.uid);
      }

      // Check free trial status
      const inTrial = user?.createdAt ? isWithinFreeTrial(user.createdAt) : true;
      const daysRemaining = user?.createdAt ? getDaysRemainingInTrial(user.createdAt) : FREE_TRIAL_DAYS;

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

      // Log for debugging (remove in production)
      console.log('Platform detected:', {
        platform: detectedPlatform,
        isApp: fromApp,
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
