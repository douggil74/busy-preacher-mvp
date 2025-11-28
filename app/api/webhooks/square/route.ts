import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Verify Square webhook signature
function verifySignature(body: string, signature: string, webhookSignatureKey: string): boolean {
  const hmac = crypto.createHmac('sha256', webhookSignatureKey);
  hmac.update(body);
  const expectedSignature = hmac.digest('base64');
  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-square-hmacsha256-signature') || '';

    // Verify webhook signature (optional but recommended in production)
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    if (webhookSignatureKey && !verifySignature(body, signature, webhookSignatureKey)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('Square webhook received:', event.type);

    switch (event.type) {
      case 'payment.completed':
        await handlePaymentCompleted(event.data.object.payment);
        break;

      case 'subscription.created':
        await handleSubscriptionCreated(event.data.object.subscription);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data.object.subscription);
        break;

      case 'invoice.payment_made':
        await handleInvoicePaymentMade(event.data.object.invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object.invoice);
        break;

      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCompleted(payment: any) {
  console.log('Payment completed:', payment.id);

  // Find user by customer ID
  const customerId = payment.customer_id;
  if (!customerId) return;

  // Look up user by Square customer ID
  const usersSnapshot = await adminDb.collection('users')
    .where('squareCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.log('No user found for customer:', customerId);
    return;
  }

  const userDoc = usersSnapshot.docs[0];
  const userId = userDoc.id;

  // Check if there's a pending subscription for this user
  const pendingDoc = await adminDb.collection('pending_subscriptions').doc(userId).get();

  if (pendingDoc.exists) {
    const pending = pendingDoc.data();

    // Create subscription in Square if we have a plan ID
    if (pending?.planId) {
      try {
        const { Client, Environment } = require('square');
        const client = new Client({
          accessToken: process.env.SQUARE_ACCESS_TOKEN!,
          environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
        });

        // Get card on file from payment
        const cardId = payment.card_details?.card?.id;

        if (cardId) {
          // Create subscription
          const { result } = await client.subscriptionsApi.createSubscription({
            idempotencyKey: `sub-${userId}-${Date.now()}`,
            locationId: process.env.SQUARE_LOCATION_ID!,
            customerId: customerId,
            planVariationId: pending.planId,
            cardId: cardId,
          });

          if (result.subscription) {
            // Update Firestore with subscription info
            await adminDb.collection('subscriptions').doc(userId).set({
              userId,
              plan: pending.plan,
              status: 'active',
              squareSubscriptionId: result.subscription.id,
              squareCustomerId: customerId,
              startDate: result.subscription.start_date,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });

            // Delete pending subscription
            await adminDb.collection('pending_subscriptions').doc(userId).delete();

            console.log('Subscription created for user:', userId);
          }
        }
      } catch (subError: any) {
        console.error('Error creating subscription:', subError);
      }
    } else {
      // No subscription plan - just mark as one-time payment
      await adminDb.collection('subscriptions').doc(userId).set({
        userId,
        plan: pending?.plan || 'annual',
        status: 'active',
        type: 'one_time',
        squarePaymentId: payment.id,
        squareCustomerId: customerId,
        paidAt: new Date().toISOString(),
        // Set expiry based on plan
        expiresAt: getExpiryDate(pending?.plan || 'annual'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Delete pending subscription
      await adminDb.collection('pending_subscriptions').doc(userId).delete();
    }
  }
}

function getExpiryDate(plan: string): string {
  const now = new Date();
  if (plan === 'annual') {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString();
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id);

  const customerId = subscription.customer_id;
  if (!customerId) return;

  // Find user by customer ID
  const usersSnapshot = await adminDb.collection('users')
    .where('squareCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) return;

  const userId = usersSnapshot.docs[0].id;

  await adminDb.collection('subscriptions').doc(userId).set({
    userId,
    status: mapSquareStatus(subscription.status),
    squareSubscriptionId: subscription.id,
    squareCustomerId: customerId,
    startDate: subscription.start_date,
    chargedThroughDate: subscription.charged_through_date,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id, subscription.status);

  // Find subscription by Square ID
  const subsSnapshot = await adminDb.collection('subscriptions')
    .where('squareSubscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  if (subsSnapshot.empty) return;

  const subDoc = subsSnapshot.docs[0];

  await subDoc.ref.update({
    status: mapSquareStatus(subscription.status),
    chargedThroughDate: subscription.charged_through_date,
    canceledDate: subscription.canceled_date,
    updatedAt: new Date().toISOString(),
  });
}

async function handleInvoicePaymentMade(invoice: any) {
  console.log('Invoice payment made:', invoice.id);

  // Update subscription's last payment date
  const subscriptionId = invoice.subscription_id;
  if (!subscriptionId) return;

  const subsSnapshot = await adminDb.collection('subscriptions')
    .where('squareSubscriptionId', '==', subscriptionId)
    .limit(1)
    .get();

  if (subsSnapshot.empty) return;

  await subsSnapshot.docs[0].ref.update({
    lastPaymentAt: new Date().toISOString(),
    status: 'active',
    updatedAt: new Date().toISOString(),
  });
}

async function handleInvoicePaymentFailed(invoice: any) {
  console.log('Invoice payment failed:', invoice.id);

  const subscriptionId = invoice.subscription_id;
  if (!subscriptionId) return;

  const subsSnapshot = await adminDb.collection('subscriptions')
    .where('squareSubscriptionId', '==', subscriptionId)
    .limit(1)
    .get();

  if (subsSnapshot.empty) return;

  await subsSnapshot.docs[0].ref.update({
    status: 'payment_failed',
    lastPaymentFailedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

function mapSquareStatus(squareStatus: string): string {
  switch (squareStatus) {
    case 'ACTIVE':
      return 'active';
    case 'CANCELED':
      return 'canceled';
    case 'PENDING':
      return 'pending';
    case 'PAUSED':
      return 'paused';
    case 'DEACTIVATED':
      return 'inactive';
    default:
      return squareStatus.toLowerCase();
  }
}
