/**
 * Admin Stats API
 * Get live statistics from Firebase and Supabase
 */

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get user stats from Firebase
    const usersRef = adminDb.collection('users');

    // Total users (count all)
    const allUsersSnapshot = await usersRef.get();
    const totalUsers = allUsersSnapshot.size;

    // Recent signups (last 24h)
    const recentSignupsSnapshot = await usersRef
      .where('createdAt', '>=', oneDayAgo)
      .get();
    const recentSignups = recentSignupsSnapshot.size;

    // Weekly signups
    const weeklySignupsSnapshot = await usersRef
      .where('createdAt', '>=', oneWeekAgo)
      .get();
    const weeklySignups = weeklySignupsSnapshot.size;

    // Count active subscriptions
    let activeSubscriptions = 0;
    let promoAccess = 0;
    let iosSubscriptions = 0;

    allUsersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.subscription?.hasPromoAccess) promoAccess++;
      if (data.subscription?.hasIosSubscription) iosSubscriptions++;
    });

    // Check Square subscriptions
    const subsRef = adminDb.collection('subscriptions');
    const activeSubsSnapshot = await subsRef.where('status', '==', 'active').get();
    activeSubscriptions = activeSubsSnapshot.size;

    // Get sermon count from Supabase
    let sermonCount = 817; // Default fallback
    try {
      const { count } = await supabase
        .from('sermons')
        .select('*', { count: 'exact', head: true });
      if (count !== null) sermonCount = count;
    } catch (e) {
      console.error('Error fetching sermon count:', e);
    }

    // Get promo codes stats
    const promoCodesSnapshot = await adminDb.collection('promoCodes').get();
    const totalPromoCodes = promoCodesSnapshot.size;
    let activePromoCodes = 0;
    promoCodesSnapshot.forEach((doc) => {
      if (doc.data().isActive) activePromoCodes++;
    });

    // Get prayer stats
    let pendingPrayers = 0;
    try {
      const prayersRef = adminDb.collection('prayers');
      const pendingSnapshot = await prayersRef.where('status', '==', 'pending').get();
      pendingPrayers = pendingSnapshot.size;
    } catch (e) {
      console.error('Error fetching prayer count:', e);
    }

    return NextResponse.json({
      users: {
        total: totalUsers,
        recentSignups,
        weeklySignups,
      },
      subscriptions: {
        active: activeSubscriptions,
        promoAccess,
        iosSubscriptions,
        total: activeSubscriptions + promoAccess + iosSubscriptions,
      },
      content: {
        sermons: sermonCount,
      },
      promoCodes: {
        total: totalPromoCodes,
        active: activePromoCodes,
      },
      moderation: {
        pendingPrayers,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
