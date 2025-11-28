import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Force Node.js runtime for Square SDK compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Pricing tiers - must match subscription plan IDs set up in Square
const PRICING = {
  annual: {
    name: 'The Busy Christian - Annual (Save 25%)',
    amount: BigInt(3588), // $35.88/year ($2.99/mo)
    description: 'Billed annually - Best Value!',
    planId: process.env.SQUARE_PLAN_ANNUAL_ID,
  },
  monthly: {
    name: 'The Busy Christian - Monthly',
    amount: BigInt(399), // $3.99/month
    description: 'Billed monthly',
    planId: process.env.SQUARE_PLAN_MONTHLY_ID,
  },
};

async function getOrCreateSquareCustomer(client: any, userId: string, userEmail: string, userName?: string) {
  // Search for existing customer by email
  const { result: searchResult } = await client.customersApi.searchCustomers({
    query: {
      filter: {
        emailAddress: {
          exact: userEmail,
        },
      },
    },
  });

  if (searchResult.customers?.length > 0) {
    return searchResult.customers[0];
  }

  // Create new customer
  const { result: createResult } = await client.customersApi.createCustomer({
    idempotencyKey: `customer-${userId}-${Date.now()}`,
    emailAddress: userEmail,
    givenName: userName || 'User',
    referenceId: userId, // Link to Firebase user ID
  });

  return createResult.customer;
}

export async function POST(request: NextRequest) {
  try {
    // Import Square SDK at runtime to avoid build-time issues
    const { Client, Environment } = require('square');

    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
    });

    const { userId, userEmail, userName, plan = 'annual' } = await request.json();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing userId or userEmail' },
        { status: 400 }
      );
    }

    const pricing = PRICING[plan as keyof typeof PRICING] || PRICING.annual;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Get or create Square customer
    const customer = await getOrCreateSquareCustomer(client, userId, userEmail, userName);

    // Store customer ID mapping in Firestore for later use
    await adminDb.collection('users').doc(userId).set({
      squareCustomerId: customer.id,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // If subscription plans are set up, use subscription checkout flow
    // Otherwise, fall back to simple payment link
    if (pricing.planId) {
      // Create checkout link that will store card on file and create subscription
      const { result: checkoutResult } = await client.checkoutApi.createPaymentLink({
        idempotencyKey: `subscription-${userId}-${plan}-${Date.now()}`,
        quickPay: {
          name: pricing.name,
          priceMoney: {
            amount: pricing.amount,
            currency: 'USD',
          },
          locationId: process.env.SQUARE_LOCATION_ID!,
        },
        checkoutOptions: {
          redirectUrl: `${baseUrl}/subscription/success?plan=${plan}&customerId=${customer.id}`,
          askForShippingAddress: false,
          acceptedPaymentMethods: {
            applePay: true,
            googlePay: true,
          },
          // Store card on file for future subscription payments
          merchantSupportEmail: 'support@busypreacher.com',
        },
        prePopulatedData: {
          buyerEmail: userEmail,
        },
      });

      if (checkoutResult.paymentLink?.url) {
        // Store pending subscription info
        await adminDb.collection('pending_subscriptions').doc(userId).set({
          userId,
          userEmail,
          plan,
          planId: pricing.planId,
          squareCustomerId: customer.id,
          checkoutId: checkoutResult.paymentLink.id,
          createdAt: new Date().toISOString(),
          status: 'pending',
        });

        return NextResponse.json({
          url: checkoutResult.paymentLink.url,
          customerId: customer.id,
        });
      }
    } else {
      // Fallback: Simple payment link (no subscription plans configured)
      const { result: paymentResult } = await client.checkoutApi.createPaymentLink({
        idempotencyKey: `${userId}-${plan}-${Date.now()}`,
        quickPay: {
          name: pricing.name,
          priceMoney: {
            amount: pricing.amount,
            currency: 'USD',
          },
          locationId: process.env.SQUARE_LOCATION_ID!,
        },
        checkoutOptions: {
          redirectUrl: `${baseUrl}/subscription/success?plan=${plan}`,
          askForShippingAddress: false,
          acceptedPaymentMethods: {
            applePay: true,
            googlePay: true,
          },
        },
        prePopulatedData: {
          buyerEmail: userEmail,
        },
      });

      if (paymentResult.paymentLink?.url) {
        return NextResponse.json({ url: paymentResult.paymentLink.url });
      }
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Square checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
