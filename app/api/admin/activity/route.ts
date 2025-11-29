/**
 * Admin Activity Feed API
 * Get recent activity across the app
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

interface ActivityItem {
  id: string;
  type: 'signup' | 'prayer' | 'promo' | 'subscription' | 'message';
  title: string;
  description: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const activities: ActivityItem[] = [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7); // Last 7 days

    // Get recent signups
    try {
      const usersSnapshot = await adminDb
        .collection('users')
        .where('createdAt', '>=', cutoff)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: `signup-${doc.id}`,
          type: 'signup',
          title: 'New User Signup',
          description: data.email || 'Anonymous user',
          timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          meta: { userId: doc.id },
        });
      });
    } catch (e) {
      console.error('Error fetching signups:', e);
    }

    // Get recent prayers
    try {
      const prayersSnapshot = await adminDb
        .collection('prayers')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

      prayersSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: `prayer-${doc.id}`,
          type: 'prayer',
          title: `Prayer Request (${data.status || 'pending'})`,
          description: data.request?.substring(0, 60) + '...' || 'No content',
          timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          meta: { status: data.status, name: data.name },
        });
      });
    } catch (e) {
      console.error('Error fetching prayers:', e);
    }

    // Get recent promo redemptions
    try {
      const promoCodesSnapshot = await adminDb.collection('promoCodes').get();

      promoCodesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.usedBy && data.usedBy.length > 0) {
          // Add most recent use
          const recentUser = data.usedBy[data.usedBy.length - 1];
          activities.push({
            id: `promo-${doc.id}-${data.usedBy.length}`,
            type: 'promo',
            title: 'Promo Code Redeemed',
            description: `${doc.id} used by ${recentUser}`,
            timestamp: data.updatedAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            meta: { code: doc.id, uses: data.currentUses },
          });
        }
      });
    } catch (e) {
      console.error('Error fetching promo activity:', e);
    }

    // Get recent subscriptions
    try {
      const subsSnapshot = await adminDb
        .collection('subscriptions')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

      subsSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: `sub-${doc.id}`,
          type: 'subscription',
          title: `Subscription ${data.status}`,
          description: data.plan || 'Unknown plan',
          timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          meta: { status: data.status, plan: data.plan },
        });
      });
    } catch (e) {
      console.error('Error fetching subscriptions:', e);
    }

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({
      activities: limitedActivities,
      total: activities.length,
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
