/**
 * Admin Whitelist API
 * Add/remove emails from premium whitelist stored in Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const WHITELIST_COLLECTION = 'whitelist';

// Hardcoded emails from lib/whitelist.ts
const HARDCODED_ADMINS = [
  'doug.cag@gmail.com',
  'developer@ilovecornerstone.com',
];

const HARDCODED_PREMIUM = [
  'cory.gilford@gmail.com',
];

// GET - List all whitelisted emails
export async function GET() {
  try {
    const snapshot = await adminDb.collection(WHITELIST_COLLECTION).orderBy('addedAt', 'desc').get();

    const firestoreEmails = snapshot.docs.map((doc) => ({
      email: doc.id,
      ...doc.data(),
      addedAt: doc.data().addedAt?.toDate?.()?.toISOString() || doc.data().addedAt,
      isBuiltIn: false,
    }));

    // Add hardcoded emails
    const hardcodedEmails = [
      ...HARDCODED_ADMINS.map(email => ({
        email,
        note: 'Admin (built-in)',
        isBuiltIn: true,
        addedAt: null,
      })),
      ...HARDCODED_PREMIUM.map(email => ({
        email,
        note: 'Premium (built-in)',
        isBuiltIn: true,
        addedAt: null,
      })),
    ];

    // Combine: hardcoded first, then Firestore emails
    const allEmails = [...hardcodedEmails, ...firestoreEmails];

    return NextResponse.json({ emails: allEmails, count: allEmails.length });
  } catch (error) {
    console.error('Error fetching whitelist:', error);
    return NextResponse.json({ error: 'Failed to fetch whitelist' }, { status: 500 });
  }
}

// POST - Add email to whitelist
export async function POST(req: NextRequest) {
  try {
    const { email, note } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if already exists
    const existing = await adminDb.collection(WHITELIST_COLLECTION).doc(normalizedEmail).get();
    if (existing.exists) {
      return NextResponse.json({ error: 'Email already whitelisted' }, { status: 409 });
    }

    // Add to whitelist
    await adminDb.collection(WHITELIST_COLLECTION).doc(normalizedEmail).set({
      addedAt: new Date(),
      note: note || '',
    });

    return NextResponse.json({ success: true, email: normalizedEmail });
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    return NextResponse.json({ error: 'Failed to add email' }, { status: 500 });
  }
}

// DELETE - Remove email from whitelist
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if exists
    const existing = await adminDb.collection(WHITELIST_COLLECTION).doc(normalizedEmail).get();
    if (!existing.exists) {
      return NextResponse.json({ error: 'Email not found in whitelist' }, { status: 404 });
    }

    // Remove from whitelist
    await adminDb.collection(WHITELIST_COLLECTION).doc(normalizedEmail).delete();

    return NextResponse.json({ success: true, email: normalizedEmail });
  } catch (error) {
    console.error('Error removing from whitelist:', error);
    return NextResponse.json({ error: 'Failed to remove email' }, { status: 500 });
  }
}
