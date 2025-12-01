/**
 * Admin Whitelist API
 * Add/remove emails from premium whitelist stored in Firestore
 *
 * Roles:
 * - owner: Full access + admin dashboard
 * - developer: Full access + admin dashboard
 * - admin: Full access + admin dashboard
 * - user: Premium app access only (bypasses paywall, NO admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const WHITELIST_COLLECTION = 'whitelist';

// Valid roles
const VALID_ROLES = ['owner', 'developer', 'admin', 'user'] as const;
type WhitelistRole = typeof VALID_ROLES[number];

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
      role: doc.data().role || 'user', // Default to 'user' if no role set
      addedAt: doc.data().addedAt?.toDate?.()?.toISOString() || doc.data().addedAt,
      isBuiltIn: false,
    }));

    // Add hardcoded emails
    const hardcodedEmails = [
      ...HARDCODED_ADMINS.map(email => ({
        email,
        role: 'owner' as WhitelistRole,
        note: 'Owner (built-in)',
        isBuiltIn: true,
        addedAt: null,
      })),
      ...HARDCODED_PREMIUM.map(email => ({
        email,
        role: 'user' as WhitelistRole,
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
    const { email, note, role = 'user' } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be: owner, developer, admin, or user' }, { status: 400 });
    }

    // Check if already exists
    const existing = await adminDb.collection(WHITELIST_COLLECTION).doc(normalizedEmail).get();
    if (existing.exists) {
      return NextResponse.json({ error: 'Email already whitelisted' }, { status: 409 });
    }

    // Add to whitelist with role
    await adminDb.collection(WHITELIST_COLLECTION).doc(normalizedEmail).set({
      addedAt: new Date(),
      note: note || '',
      role,
    });

    return NextResponse.json({ success: true, email: normalizedEmail, role });
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    return NextResponse.json({ error: 'Failed to add email' }, { status: 500 });
  }
}

// PUT - Update whitelist entry (change role or note)
export async function PUT(req: NextRequest) {
  try {
    const { email, role, note } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if exists
    const existing = await adminDb.collection(WHITELIST_COLLECTION).doc(normalizedEmail).get();
    if (!existing.exists) {
      return NextResponse.json({ error: 'Email not found in whitelist' }, { status: 404 });
    }

    // Validate role if provided
    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be: owner, developer, admin, or user' }, { status: 400 });
    }

    // Build update object
    const updates: Record<string, string> = {};
    if (role) updates.role = role;
    if (note !== undefined) updates.note = note;

    // Update whitelist entry
    await adminDb.collection(WHITELIST_COLLECTION).doc(normalizedEmail).update(updates);

    return NextResponse.json({ success: true, email: normalizedEmail, ...updates });
  } catch (error) {
    console.error('Error updating whitelist:', error);
    return NextResponse.json({ error: 'Failed to update whitelist entry' }, { status: 500 });
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
