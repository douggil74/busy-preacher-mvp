import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for Square SDK compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Pricing tiers
const PRICING = {
  annual: {
    name: 'The Busy Christian - Annual (Save 25%)',
    amount: BigInt(3588), // $35.88/year ($2.99/mo)
    description: 'Billed annually - Best Value!',
  },
  monthly: {
    name: 'The Busy Christian - Monthly',
    amount: BigInt(399), // $3.99/month
    description: 'Billed monthly',
  },
};

export async function POST(request: NextRequest) {
  try {
    // Import Square SDK at runtime to avoid build-time issues
    const { Client, Environment } = require('square');

    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
    });

    const { userId, userEmail, plan = 'annual' } = await request.json();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing userId or userEmail' },
        { status: 400 }
      );
    }

    const pricing = PRICING[plan as keyof typeof PRICING] || PRICING.annual;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create a checkout session with Square
    const response = await client.checkoutApi.createPaymentLink({
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

    if (response.result.paymentLink?.url) {
      return NextResponse.json({ url: response.result.paymentLink.url });
    } else {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Square checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
