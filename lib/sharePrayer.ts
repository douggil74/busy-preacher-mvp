// lib/sharePrayer.ts
// Bridge between Prayer Journal and Community Prayer Network

import { submitPrayerRequest } from './firebase';
import { updatePrayer } from './prayerStorage';
import type { Prayer } from './prayerStorage';

/**
 * Share a prayer from Prayer Journal to Community Prayer Network
 */
export async function sharePrayerToCommunity(
  prayer: Prayer,
  userId: string,
  userName: string,
  userLocation?: string
): Promise<boolean> {
  try {
    // Map prayer journal category to community prayer category
    const categoryMap: Record<string, 'health' | 'family' | 'work' | 'spiritual' | 'other'> = {
      'health': 'health',
      'family': 'family',
      'work': 'work',
      'faith': 'spiritual',
      'personal': 'other',
      'relationship': 'family',
      'financial': 'work',
      'other': 'other'
    };

    // Get the first tag as category, or default to 'other'
    const tag = prayer.tags[0]?.toLowerCase() || 'other';
    const category = categoryMap[tag] || 'other';

    // Combine title and description
    const request = prayer.description 
      ? `${prayer.title}\n\n${prayer.description}` 
      : prayer.title;

    // Submit to Firebase
    await submitPrayerRequest(
      userId,
      userName,
      request,
      category,
      false, // not anonymous
      userLocation
    );

    // Mark as shared in local storage
    updatePrayer(prayer.id, {
      ...prayer,
      isShared: true
    });

    return true;
  } catch (error) {
    console.error('Error sharing prayer to community:', error);
    return false;
  }
}
