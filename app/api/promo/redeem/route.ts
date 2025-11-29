/**
 * Promo Code Redemption API
 * Allows users to redeem discount codes for free access or discounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

interface PromoCode {
  code: string;
  type: 'free_forever' | 'free_trial_extension' | 'discount_percent' | 'discount_fixed';
  value?: number; // For discounts: percentage (0-100) or fixed amount in cents
  trialDays?: number; // For trial extensions
  maxUses?: number;
  currentUses: number;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
  description?: string;
  usedBy?: string[]; // Array of user emails who used this code
}

interface UserPromo {
  code: string;
  type: PromoCode['type'];
  redeemedAt: Date;
  expiresAt?: Date;
  hasForeverAccess: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { code, userId } = await req.json();

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Missing code or userId' },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();

    // Look up the promo code
    const promoRef = adminDb.collection('promoCodes').doc(normalizedCode);
    const promoDoc = await promoRef.get();

    if (!promoDoc.exists) {
      return NextResponse.json(
        { error: 'Invalid promo code' },
        { status: 404 }
      );
    }

    const promo = promoDoc.data() as PromoCode;

    // Validate promo code
    if (!promo.isActive) {
      return NextResponse.json(
        { error: 'This promo code is no longer active' },
        { status: 400 }
      );
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This promo code has expired' },
        { status: 400 }
      );
    }

    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      return NextResponse.json(
        { error: 'This promo code has reached its maximum uses' },
        { status: 400 }
      );
    }

    // Check if user already used this code
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (userData?.redeemedCodes?.includes(normalizedCode)) {
      return NextResponse.json(
        { error: 'You have already used this promo code' },
        { status: 400 }
      );
    }

    // Apply the promo based on type
    const userPromo: UserPromo = {
      code: normalizedCode,
      type: promo.type,
      redeemedAt: new Date(),
      hasForeverAccess: promo.type === 'free_forever',
    };

    const updateData: Record<string, unknown> = {
      'promo.active': userPromo,
      redeemedCodes: [...(userData?.redeemedCodes || []), normalizedCode],
    };

    // Handle different promo types
    switch (promo.type) {
      case 'free_forever':
        updateData['subscription.hasPromoAccess'] = true;
        updateData['subscription.promoType'] = 'free_forever';
        updateData['subscription.status'] = 'active';
        break;

      case 'free_trial_extension':
        // Extend trial by adding days
        const currentTrialEnd = userData?.trialEndsAt
          ? new Date(userData.trialEndsAt)
          : new Date();
        currentTrialEnd.setDate(currentTrialEnd.getDate() + (promo.trialDays || 30));
        updateData['trialEndsAt'] = currentTrialEnd;
        userPromo.expiresAt = currentTrialEnd;
        break;

      case 'discount_percent':
      case 'discount_fixed':
        // Store discount for use at checkout
        updateData['promo.discount'] = {
          type: promo.type,
          value: promo.value,
          code: normalizedCode,
        };
        break;
    }

    // Update user with promo
    await userRef.set(updateData, { merge: true });

    // Increment usage count and track who used it
    const userEmail = userData?.email || userId;
    await promoRef.update({
      currentUses: (promo.currentUses || 0) + 1,
      usedBy: [...(promo.usedBy || []), userEmail],
    });

    // Return success with promo details
    return NextResponse.json({
      success: true,
      promo: {
        type: promo.type,
        description: promo.description,
        hasForeverAccess: promo.type === 'free_forever',
        trialDays: promo.trialDays,
        discountValue: promo.value,
      },
    });
  } catch (error) {
    console.error('Promo redemption error:', error);
    return NextResponse.json(
      { error: 'Failed to redeem promo code' },
      { status: 500 }
    );
  }
}
