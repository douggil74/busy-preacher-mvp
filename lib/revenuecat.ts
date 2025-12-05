/**
 * RevenueCat Service for iOS In-App Purchases
 * Handles subscription management for the iOS app
 */

import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-capacitor';

// Product IDs - these must match EXACTLY what you create in App Store Connect
// Pricing: $6.99/month (competitive with market)
// Annual: $39.99/year when ready (saves ~50%)
export const PRODUCT_IDS = {
  MONTHLY: 'busy_christian_monthly',    // $6.99/month
  ANNUAL: 'busy_christian_annual',      // $39.99/year (add later)
};

// RevenueCat API Key - will be set from environment (trim to handle any trailing newlines)
const REVENUECAT_API_KEY = (process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || '').trim();

let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 * Should be called once when the app starts on iOS
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('RevenueCat: Not a native platform, skipping initialization');
    return;
  }

  if (isInitialized) {
    console.log('RevenueCat: Already initialized');
    return;
  }

  if (!REVENUECAT_API_KEY) {
    console.error('RevenueCat: API key not configured');
    return;
  }

  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId || undefined,
    });

    isInitialized = true;
    console.log('RevenueCat: Initialized successfully');
  } catch (error) {
    console.error('RevenueCat: Initialization failed:', error);
    throw error;
  }
}

/**
 * Set the user ID for RevenueCat (call after Firebase auth)
 */
export async function setRevenueCatUserId(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform() || !isInitialized) return;

  try {
    await Purchases.logIn({ appUserID: userId });
    console.log('RevenueCat: User ID set to', userId);
  } catch (error) {
    console.error('RevenueCat: Failed to set user ID:', error);
  }
}

/**
 * Get available subscription packages
 */
export async function getOfferings(): Promise<PurchasesPackage[]> {
  if (!Capacitor.isNativePlatform()) return [];

  try {
    const offerings = await Purchases.getOfferings();

    if (offerings.current && offerings.current.availablePackages.length > 0) {
      return offerings.current.availablePackages;
    }

    console.log('RevenueCat: No offerings available');
    return [];
  } catch (error) {
    console.error('RevenueCat: Failed to get offerings:', error);
    return [];
  }
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) {
    console.error('RevenueCat: Cannot purchase on web');
    return null;
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    console.log('RevenueCat: Purchase successful');
    return customerInfo;
  } catch (error: unknown) {
    const purchaseError = error as { userCancelled?: boolean };
    if (purchaseError.userCancelled) {
      console.log('RevenueCat: User cancelled purchase');
    } else {
      console.error('RevenueCat: Purchase failed:', error);
    }
    return null;
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;

  try {
    const { customerInfo } = await Purchases.restorePurchases();
    console.log('RevenueCat: Purchases restored');
    return customerInfo;
  } catch (error) {
    console.error('RevenueCat: Failed to restore purchases:', error);
    return null;
  }
}

/**
 * Get current customer info (subscription status)
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('RevenueCat: Failed to get customer info:', error);
    return null;
  }
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const customerInfo = await getCustomerInfo();
  if (!customerInfo) return false;

  // Check for active entitlement (you'll configure this in RevenueCat dashboard)
  const entitlement = customerInfo.entitlements.active['premium'];
  return !!entitlement;
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(): Promise<{
  isActive: boolean;
  productId: string | null;
  expirationDate: string | null;
  willRenew: boolean;
} | null> {
  const customerInfo = await getCustomerInfo();
  if (!customerInfo) return null;

  const entitlement = customerInfo.entitlements.active['premium'];

  if (!entitlement) {
    return {
      isActive: false,
      productId: null,
      expirationDate: null,
      willRenew: false,
    };
  }

  return {
    isActive: true,
    productId: entitlement.productIdentifier,
    expirationDate: entitlement.expirationDate,
    willRenew: !entitlement.willRenew ? false : entitlement.willRenew,
  };
}

/**
 * Format price for display
 */
export function formatPrice(pkg: PurchasesPackage): string {
  return pkg.product.priceString;
}

/**
 * Get package type (monthly/annual)
 */
export function getPackageType(pkg: PurchasesPackage): 'monthly' | 'annual' | 'unknown' {
  const productId = pkg.product.identifier;
  if (productId.includes('monthly')) return 'monthly';
  if (productId.includes('annual')) return 'annual';
  return 'unknown';
}
