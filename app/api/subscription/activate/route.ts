/**
 * Activate subscription from success page
 * This is called when user returns from Square checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, plan, customerId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Calculate expiry date based on plan
    const now = new Date();
    let expiresAt: Date;
    if (plan === 'annual') {
      expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Check if subscription already exists
    const existingSub = await adminDb.collection('subscriptions').doc(userId).get();

    if (existingSub.exists) {
      const data = existingSub.data();
      // If already active, just return success
      if (data?.status === 'active') {
        return NextResponse.json({
          success: true,
          message: 'Subscription already active',
          subscription: data,
        });
      }
    }

    // Create or update subscription
    const subscriptionData = {
      userId,
      plan: plan || 'annual',
      status: 'active',
      type: 'one_time',
      squareCustomerId: customerId || null,
      paidAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      createdAt: existingSub.exists ? existingSub.data()?.createdAt : now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await adminDb.collection('subscriptions').doc(userId).set(subscriptionData, { merge: true });

    // Also update user document with subscription status
    await adminDb.collection('users').doc(userId).set({
      'subscription.status': 'active',
      'subscription.plan': plan || 'annual',
      'subscription.paidAt': now.toISOString(),
      'subscription.expiresAt': expiresAt.toISOString(),
      updatedAt: now.toISOString(),
    }, { merge: true });

    // Delete any pending subscription
    try {
      await adminDb.collection('pending_subscriptions').doc(userId).delete();
    } catch (e) {
      // Ignore if doesn't exist
    }

    console.log('Subscription activated for user:', userId);

    return NextResponse.json({
      success: true,
      subscription: subscriptionData,
    });

  } catch (error: any) {
    console.error('Subscription activation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to activate subscription' },
      { status: 500 }
    );
  }
}
