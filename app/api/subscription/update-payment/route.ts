import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { Client, Environment } = require('square');

    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
    });

    const { userId, userEmail } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get user's Square customer ID
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const customerId = userData?.squareCustomerId;

    if (!customerId) {
      return NextResponse.json({ error: 'No payment account found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create a checkout link to update card on file
    const { result } = await client.checkoutApi.createPaymentLink({
      idempotencyKey: `update-card-${userId}-${Date.now()}`,
      quickPay: {
        name: 'Update Payment Method',
        priceMoney: {
          amount: BigInt(0), // $0 - just saving card
          currency: 'USD',
        },
        locationId: process.env.SQUARE_LOCATION_ID!,
      },
      checkoutOptions: {
        redirectUrl: `${baseUrl}/account?updated=payment`,
        askForShippingAddress: false,
        acceptedPaymentMethods: {
          applePay: true,
          googlePay: true,
        },
      },
      prePopulatedData: {
        buyerEmail: userEmail || userData?.email,
      },
    });

    if (result.paymentLink?.url) {
      return NextResponse.json({ url: result.paymentLink.url });
    }

    return NextResponse.json({ error: 'Failed to create update link' }, { status: 500 });

  } catch (error: any) {
    console.error('Update payment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
