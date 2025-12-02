// app/api/admin/toasts/seed/route.ts
// One-time seed of default toast messages
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const DEFAULT_TOASTS = [
  {
    title: "Good to see you",
    message: "Pick up where you left off?",
    icon: "👋",
    trigger: "welcome_back",
    isActive: true,
    position: "bottom",
    style: "card",
    showChance: 100,
  },
  {
    title: "7 days strong",
    message: "Consistency matters. You're building something good.",
    icon: "🔥",
    trigger: "streak",
    triggerValue: 7,
    isActive: true,
    position: "bottom",
    style: "card",
    showChance: 100,
  },
  {
    title: "30 days with God",
    message: "A month of showing up. That's beautiful.",
    icon: "🌟",
    trigger: "streak",
    triggerValue: 30,
    isActive: true,
    position: "bottom",
    style: "card",
    showChance: 100,
  },
  {
    title: "100 studies",
    message: "Your hunger for truth is inspiring.",
    icon: "📖",
    trigger: "milestone",
    triggerValue: 100,
    isActive: true,
    position: "bottom",
    style: "card",
    showChance: 100,
  },
  {
    title: "Quick thought",
    message: "God's not looking for perfect. He's looking for willing.",
    icon: "💭",
    trigger: "encouragement",
    isActive: true,
    position: "bottom",
    style: "glass",
    showChance: 5, // Only 5% chance - very rare
  },
  {
    title: "Thanks for being here",
    message: "We're glad you're part of this community.",
    icon: "❤️",
    trigger: "random",
    isActive: false, // Disabled by default - turn on for special occasions
    position: "bottom",
    style: "card",
    showChance: 100,
  },
];

export async function POST() {
  try {
    // Check if toasts already exist
    const existing = await adminDb.collection('toastMessages').limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({
        message: "Toasts already exist. Delete them first if you want to reseed.",
        count: (await adminDb.collection('toastMessages').count().get()).data().count
      });
    }

    // Seed default toasts
    const batch = adminDb.batch();
    const now = new Date().toISOString();

    for (const toast of DEFAULT_TOASTS) {
      const ref = adminDb.collection('toastMessages').doc();
      batch.set(ref, {
        ...toast,
        createdAt: now,
        updatedAt: now,
      });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Seeded ${DEFAULT_TOASTS.length} default toast messages`,
      toasts: DEFAULT_TOASTS.map(t => t.title)
    });

  } catch (error) {
    console.error('Error seeding toasts:', error);
    return NextResponse.json({ error: 'Failed to seed toasts' }, { status: 500 });
  }
}
