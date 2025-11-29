/**
 * Admin Users API
 * Search users, view details, grant/revoke access
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: string;
  subscription?: {
    hasPromoAccess?: boolean;
    hasIosSubscription?: boolean;
    status?: string;
  };
  redeemedCodes?: string[];
}

// GET - Search users by email
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (email) {
      // Search for specific user by email
      const usersRef = adminDb.collection('users');
      const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();

      if (snapshot.empty) {
        return NextResponse.json({ user: null, message: 'User not found' });
      }

      const doc = snapshot.docs[0];
      const data = doc.data();

      return NextResponse.json({
        user: {
          uid: doc.id,
          email: data.email,
          displayName: data.displayName || data.name,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          subscription: data.subscription || {},
          redeemedCodes: data.redeemedCodes || [],
          promo: data.promo || {},
        },
      });
    }

    // List recent users
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.orderBy('createdAt', 'desc').limit(limit).get();

    const users: UserData[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        email: data.email,
        displayName: data.displayName || data.name,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        subscription: data.subscription || {},
        redeemedCodes: data.redeemedCodes || [],
      });
    });

    return NextResponse.json({ users, count: users.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST - Grant access to user
export async function POST(req: NextRequest) {
  try {
    const { userId, email, accessType, reason } = await req.json();

    let targetUserId = userId;

    // If email provided instead of userId, look up user
    if (!targetUserId && email) {
      const usersRef = adminDb.collection('users');
      const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();

      if (snapshot.empty) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      targetUserId = snapshot.docs[0].id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID or email required' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(targetUserId);

    if (accessType === 'free_forever') {
      await userRef.set(
        {
          subscription: {
            hasPromoAccess: true,
            promoType: 'admin_granted',
            status: 'active',
            grantedAt: new Date(),
            grantedReason: reason || 'Admin granted access',
          },
        },
        { merge: true }
      );
    } else if (accessType === 'revoke') {
      await userRef.set(
        {
          subscription: {
            hasPromoAccess: false,
            promoType: null,
            revokedAt: new Date(),
            revokedReason: reason || 'Admin revoked access',
          },
        },
        { merge: true }
      );
    } else if (accessType === 'extend_trial') {
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      const currentTrialEnd = userData?.trialEndsAt
        ? new Date(userData.trialEndsAt.toDate?.() || userData.trialEndsAt)
        : new Date();
      currentTrialEnd.setDate(currentTrialEnd.getDate() + 30);

      await userRef.set(
        {
          trialEndsAt: currentTrialEnd,
          trialExtendedBy: 'admin',
          trialExtendedAt: new Date(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({ success: true, userId: targetUserId, accessType });
  } catch (error) {
    console.error('Error updating user access:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
