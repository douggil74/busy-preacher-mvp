// app/api/toast/route.ts
// Public API to get the right toast message for a user based on their activity
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  icon: string;
  trigger: 'welcome_back' | 'streak' | 'milestone' | 'encouragement' | 'random';
  triggerValue?: number;
  isActive: boolean;
  position: 'top' | 'bottom';
  style: 'minimal' | 'card' | 'glass';
  showChance?: number;
}

// POST - Get appropriate toast for user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      daysSinceLastVisit = 0,
      currentStreak = 0,
      totalStudies = 0,
      lastToastShown = null
    } = body;

    // Don't show toast if one was shown today
    if (lastToastShown) {
      const lastShown = new Date(lastToastShown);
      const today = new Date();
      if (lastShown.toDateString() === today.toDateString()) {
        return NextResponse.json({ toast: null });
      }
    }

    // Fetch all active toasts
    const snapshot = await adminDb
      .collection('toastMessages')
      .where('isActive', '==', true)
      .get();

    const toasts: ToastMessage[] = [];
    snapshot.forEach((doc) => {
      toasts.push({ id: doc.id, ...doc.data() } as ToastMessage);
    });

    if (toasts.length === 0) {
      return NextResponse.json({ toast: null });
    }

    // Priority order: welcome_back > streak > milestone > random/encouragement
    let selectedToast: ToastMessage | null = null;

    // 1. Check for welcome back (3+ days away)
    if (daysSinceLastVisit >= 3) {
      selectedToast = toasts.find(t => t.trigger === 'welcome_back') || null;
    }

    // 2. Check for streak milestones (7, 14, 30, 60, 90, 365)
    if (!selectedToast) {
      const streakMilestones = [7, 14, 30, 60, 90, 365];
      if (streakMilestones.includes(currentStreak)) {
        selectedToast = toasts.find(t =>
          t.trigger === 'streak' && t.triggerValue === currentStreak
        ) || toasts.find(t => t.trigger === 'streak' && !t.triggerValue) || null;
      }
    }

    // 3. Check for study milestones (10, 25, 50, 100, 250, 500)
    if (!selectedToast) {
      const studyMilestones = [10, 25, 50, 100, 250, 500];
      if (studyMilestones.includes(totalStudies)) {
        selectedToast = toasts.find(t =>
          t.trigger === 'milestone' && t.triggerValue === totalStudies
        ) || toasts.find(t => t.trigger === 'milestone' && !t.triggerValue) || null;
      }
    }

    // 4. Random encouragement (based on showChance percentage)
    if (!selectedToast) {
      const randomToasts = toasts.filter(t =>
        t.trigger === 'random' || t.trigger === 'encouragement'
      );

      if (randomToasts.length > 0) {
        // Pick one and check if it should show based on chance
        const randomToast = randomToasts[Math.floor(Math.random() * randomToasts.length)];
        const chance = randomToast.showChance ?? 10;

        if (Math.random() * 100 < chance) {
          selectedToast = randomToast;
        }
      }
    }

    return NextResponse.json({ toast: selectedToast });

  } catch (error) {
    console.error('Error getting toast:', error);
    return NextResponse.json({ toast: null });
  }
}
