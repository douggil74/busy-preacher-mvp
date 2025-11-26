import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Subscription {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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

    // Check if subscription is active and not expired
    const isActive = sub.status === 'active' || sub.status === 'trialing';
    const notExpired = sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) > new Date();

    return isActive && notExpired;
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
