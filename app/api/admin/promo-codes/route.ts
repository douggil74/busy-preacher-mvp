/**
 * Admin Promo Codes API
 * CRUD operations for managing promo codes
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const MAX_CODES = 10;

interface PromoCode {
  code: string;
  type: 'free_forever' | 'free_trial_extension' | 'discount_percent';
  description?: string;
  value?: number;
  trialDays?: number;
  maxUses?: number;
  currentUses: number;
  expiresAt?: Date | null;
  createdAt: Date;
  isActive: boolean;
  usedBy: string[]; // Array of user emails who used this code
}

// GET - List all promo codes
export async function GET() {
  try {
    const snapshot = await adminDb.collection('promoCodes').get();
    const codes: PromoCode[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      codes.push({
        code: doc.id,
        type: data.type,
        description: data.description,
        value: data.value,
        trialDays: data.trialDays,
        maxUses: data.maxUses,
        currentUses: data.currentUses || 0,
        expiresAt: data.expiresAt?.toDate?.() || data.expiresAt || null,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        isActive: data.isActive,
        usedBy: data.usedBy || [],
      });
    });

    return NextResponse.json({ codes, count: codes.length, maxCodes: MAX_CODES });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}

// POST - Create new promo code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, type, description, value, trialDays, maxUses, expiresAt } = body;

    if (!code || !type) {
      return NextResponse.json({ error: 'Code and type are required' }, { status: 400 });
    }

    // Check if we've reached the limit
    const snapshot = await adminDb.collection('promoCodes').get();
    if (snapshot.size >= MAX_CODES) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_CODES} promo codes allowed. Delete one first.` },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();

    // Check if code already exists
    const existingDoc = await adminDb.collection('promoCodes').doc(normalizedCode).get();
    if (existingDoc.exists) {
      return NextResponse.json({ error: 'A code with this name already exists' }, { status: 400 });
    }

    const promoData: Record<string, unknown> = {
      code: normalizedCode,
      type,
      description: description || `${type} promo code`,
      currentUses: 0,
      isActive: true,
      createdAt: new Date(),
      usedBy: [],
    };

    if (value !== undefined) promoData.value = value;
    if (trialDays !== undefined) promoData.trialDays = trialDays;
    if (maxUses !== undefined) promoData.maxUses = maxUses;
    if (expiresAt) promoData.expiresAt = new Date(expiresAt);

    await adminDb.collection('promoCodes').doc(normalizedCode).set(promoData);

    return NextResponse.json({ success: true, code: normalizedCode });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
  }
}

// PUT - Update promo code
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, isActive, description, maxUses, expiresAt } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase().trim();
    const docRef = adminDb.collection('promoCodes').doc(normalizedCode);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (description !== undefined) updateData.description = description;
    if (maxUses !== undefined) updateData.maxUses = maxUses;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

    await docRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 });
  }
}

// DELETE - Delete promo code
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase().trim();
    await adminDb.collection('promoCodes').doc(normalizedCode).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 });
  }
}
