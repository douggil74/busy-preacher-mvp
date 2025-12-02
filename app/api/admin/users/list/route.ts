/**
 * Admin Users List API
 * Paginated list of all users with IP/location data
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: string;
  lastLoginAt?: string;
  lastLoginIP?: string;
  lastLoginLocation?: string;
  subscription?: {
    hasPromoAccess?: boolean;
    hasIosSubscription?: boolean;
    status?: string;
  };
  deviceInfo?: string;
  platform?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get total count
    const countSnapshot = await adminDb.collection('users').count().get();
    const totalCount = countSnapshot.data().count;

    // Get paginated users
    const usersRef = adminDb.collection('users');
    let query = usersRef.orderBy('createdAt', 'desc');

    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    if (offset > 0) {
      // Get the document at the offset position to use as start point
      const offsetSnapshot = await usersRef
        .orderBy('createdAt', 'desc')
        .limit(offset)
        .get();

      if (!offsetSnapshot.empty) {
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.limit(limit).get();

    const users: UserData[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        email: data.email || '',
        displayName: data.displayName || data.name || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || '',
        lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString() || data.lastLoginAt || '',
        lastLoginIP: data.lastLoginIP || '',
        lastLoginLocation: data.lastLoginLocation || '',
        subscription: data.subscription || {},
        deviceInfo: data.deviceInfo || '',
        platform: data.platform || '',
      });
    });

    return NextResponse.json({
      users,
      totalCount,
      page,
      pageSize: limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching users list:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
