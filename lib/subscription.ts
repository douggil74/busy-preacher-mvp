import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Subscription {
  userId: string;
  plan?: 'monthly' | 'annual';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | 'pending' | 'paused' | 'inactive' | 'payment_failed';
  type?: 'subscription' | 'one_time';
  // Square fields
  squareCustomerId?: string;
  squareSubscriptionId?: string;
  squarePaymentId?: string;
  startDate?: string;
  chargedThroughDate?: string;
  expiresAt?: string;
  paidAt?: string;
  canceledDate?: string;
  // Legacy Stripe fields
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  canceledAt?: Date;
  // Common fields
  createdAt: string | Date;
  updatedAt: string | Date;
  lastPaymentAt?: string;
  lastPaymentFailedAt?: string;
}

/**
 * Check if user has an active web subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const subDoc = await getDoc(doc(db, 'subscriptions', userId));

    if (!subDoc.exists()) {
      return false;
    }

    const sub = subDoc.data() as Subscription;

    // Check if subscription is active
    const isActive = sub.status === 'active' || sub.status === 'trialing';

    // Check expiration for one-time payments
    if (sub.type === 'one_time' && sub.expiresAt) {
      const notExpired = new Date(sub.expiresAt) > new Date();
      return isActive && notExpired;
    }

    // Check charged through date for subscriptions
    if (sub.chargedThroughDate) {
      const notExpired = new Date(sub.chargedThroughDate) > new Date();
      return isActive && notExpired;
    }

    // Legacy Stripe check
    if (sub.currentPeriodEnd) {
      const notExpired = new Date(sub.currentPeriodEnd) > new Date();
      return isActive && notExpired;
    }

    return isActive;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

/**
 * Get user's subscription details
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const subDoc = await getDoc(doc(db, 'subscriptions', userId));

    if (!subDoc.exists()) {
      return null;
    }

    return subDoc.data() as Subscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Check if user has an active promo code (free forever access)
 */
export async function hasActivePromoAccess(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    const subscription = userData?.subscription;

    // Check for promo access (free forever)
    if (subscription?.hasPromoAccess === true) {
      return true;
    }

    // Check for active promo with expiration
    const promo = userData?.promo?.active;
    if (promo?.hasForeverAccess) {
      return true;
    }

    if (promo?.expiresAt) {
      const expiresAt = promo.expiresAt.toDate ? promo.expiresAt.toDate() : new Date(promo.expiresAt);
      return expiresAt > new Date();
    }

    return false;
  } catch (error) {
    console.error('Error checking promo access:', error);
    return false;
  }
}

/**
 * Check if user has an active iOS IAP subscription (from RevenueCat webhook)
 */
export async function hasActiveIosSubscription(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    const subscription = userData?.subscription;

    if (!subscription) {
      return false;
    }

    // Check hasIosSubscription flag (set by RevenueCat webhook)
    if (subscription.hasIosSubscription === true) {
      // Also check expiration if available
      const iosData = subscription.ios;
      if (iosData?.expiresAt) {
        const expiresAt = iosData.expiresAt.toDate ? iosData.expiresAt.toDate() : new Date(iosData.expiresAt);
        return expiresAt > new Date();
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking iOS subscription:', error);
    return false;
  }
}
