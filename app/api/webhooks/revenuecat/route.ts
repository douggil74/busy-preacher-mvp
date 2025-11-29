/**
 * RevenueCat Webhook Handler
 * Receives subscription events from RevenueCat and syncs to Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// RevenueCat event types we care about
type RevenueCatEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'NON_RENEWING_PURCHASE'
  | 'SUBSCRIPTION_PAUSED'
  | 'EXPIRATION'
  | 'BILLING_ISSUE'
  | 'PRODUCT_CHANGE';

interface RevenueCatEvent {
  event: {
    type: RevenueCatEventType;
    app_user_id: string;
    original_app_user_id: string;
    product_id: string;
    entitlement_ids: string[];
    period_type: string;
    purchased_at_ms: number;
    expiration_at_ms: number | null;
    environment: 'SANDBOX' | 'PRODUCTION';
    store: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE';
    is_trial_conversion: boolean;
    cancel_reason?: string;
    price?: number;
    currency?: string;
    subscriber_attributes?: Record<string, { value: string }>;
  };
  api_version: string;
}

// Webhook authorization key (set in RevenueCat dashboard)
const REVENUECAT_WEBHOOK_AUTH_KEY = process.env.REVENUECAT_WEBHOOK_AUTH_KEY;

export async function POST(req: NextRequest) {
  try {
    // Verify authorization header
    const authHeader = req.headers.get('Authorization');
    if (REVENUECAT_WEBHOOK_AUTH_KEY && authHeader !== `Bearer ${REVENUECAT_WEBHOOK_AUTH_KEY}`) {
      console.error('RevenueCat webhook: Invalid authorization');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: RevenueCatEvent = await req.json();
    const event = body.event;

    console.log('RevenueCat webhook received:', {
      type: event.type,
      userId: event.app_user_id,
      productId: event.product_id,
      environment: event.environment,
    });

    // Get the Firebase user ID (app_user_id should be set to Firebase UID)
    const userId = event.app_user_id;

    if (!userId || userId.startsWith('$RCAnonymousID:')) {
      console.log('RevenueCat webhook: Anonymous user, skipping Firestore update');
      return NextResponse.json({ received: true });
    }

    // Determine subscription status based on event type
    let subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'paused' | 'billing_issue';
    let shouldHaveAccess = false;

    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
        subscriptionStatus = 'active';
        shouldHaveAccess = true;
        break;

      case 'CANCELLATION':
        subscriptionStatus = 'cancelled';
        // Still has access until expiration
        shouldHaveAccess = event.expiration_at_ms ? event.expiration_at_ms > Date.now() : false;
        break;

      case 'EXPIRATION':
        subscriptionStatus = 'expired';
        shouldHaveAccess = false;
        break;

      case 'SUBSCRIPTION_PAUSED':
        subscriptionStatus = 'paused';
        shouldHaveAccess = false;
        break;

      case 'BILLING_ISSUE':
        subscriptionStatus = 'billing_issue';
        // Still has access for grace period
        shouldHaveAccess = event.expiration_at_ms ? event.expiration_at_ms > Date.now() : false;
        break;

      case 'PRODUCT_CHANGE':
      case 'NON_RENEWING_PURCHASE':
        subscriptionStatus = 'active';
        shouldHaveAccess = true;
        break;

      default:
        console.log('RevenueCat webhook: Unhandled event type:', event.type);
        return NextResponse.json({ received: true });
    }

    // Determine plan type from product ID
    let plan: 'monthly' | 'annual' = 'monthly';
    if (event.product_id.includes('annual') || event.product_id.includes('yearly')) {
      plan = 'annual';
    }

    // Update Firestore user document
    const userRef = adminDb.collection('users').doc(userId);

    const updateData: Record<string, unknown> = {
      // iOS subscription data
      'subscription.ios': {
        status: subscriptionStatus,
        productId: event.product_id,
        plan: plan,
        purchasedAt: event.purchased_at_ms ? new Date(event.purchased_at_ms) : null,
        expiresAt: event.expiration_at_ms ? new Date(event.expiration_at_ms) : null,
        isTrialConversion: event.is_trial_conversion,
        environment: event.environment,
        store: event.store,
        lastUpdated: new Date(),
        cancelReason: event.cancel_reason || null,
      },
      // Overall subscription status (for usePlatform hook)
      'subscription.hasIosSubscription': shouldHaveAccess,
      'subscription.lastUpdated': new Date(),
    };

    // If this is an active subscription, also update the general subscription fields
    if (shouldHaveAccess) {
      updateData['subscription.status'] = 'active';
      updateData['subscription.plan'] = plan;
      updateData['subscription.source'] = 'ios_iap';
    }

    await userRef.set(updateData, { merge: true });

    console.log('RevenueCat webhook: Firestore updated for user', userId, {
      status: subscriptionStatus,
      hasAccess: shouldHaveAccess,
    });

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error('RevenueCat webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
