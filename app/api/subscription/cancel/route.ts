import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get current subscription
    const subRef = adminDb.collection('subscriptions').doc(userId);
    const subDoc = await subRef.get();

    if (!subDoc.exists) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const subscription = subDoc.data();

    // If using Square subscriptions, cancel via API
    if (subscription?.squareSubscriptionId) {
      try {
        const { Client, Environment } = require('square');

        const client = new Client({
          accessToken: process.env.SQUARE_ACCESS_TOKEN!,
          environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
        });

        await client.subscriptionsApi.cancelSubscription(subscription.squareSubscriptionId);
      } catch (squareError: any) {
        console.error('Square cancel error:', squareError);
        // Continue with local cancel even if Square fails
      }
    }

    // Update subscription status in Firestore
    await subRef.update({
      status: 'canceled',
      canceledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Log the cancellation
    console.log(`Subscription cancelled for user: ${userId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
