// Prayer Journal Storage Utilities
import storage, { STORAGE_KEYS } from './storage';

export interface Prayer {
  id: string;
  title: string;
  description: string;
  tags: string[];
  dateAdded: string;
  dateAnswered?: string;
  isAnswered: boolean;
  linkedPassage?: string;
  answerNotes?: string;
  isShared?: boolean; // ✅ added to support community prayers
}

export type PrayerFilter = 'all' | 'active' | 'answered';

/** Load all prayers from storage (async) */
export async function getPrayers(): Promise<Prayer[]> {
  if (typeof window === 'undefined') return [];
  try {
    return await storage.getJSON<Prayer[]>(STORAGE_KEYS.PRAYERS) || [];
  } catch (error) {
    console.error('Error loading prayers:', error);
    return [];
  }
}

/** Save all prayers (async) */
export async function savePrayers(prayers: Prayer[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await storage.setJSON(STORAGE_KEYS.PRAYERS, prayers);
  } catch (error) {
    console.error('Error saving prayers:', error);
  }
}

/** Add a new prayer (async) */
export async function addPrayer(prayer: Omit<Prayer, 'id' | 'dateAdded' | 'isAnswered'>): Promise<Prayer> {
  const newPrayer: Prayer = {
    ...prayer,
    id: crypto.randomUUID(),
    dateAdded: new Date().toISOString(),
    isAnswered: false,
  };

  const prayers = await getPrayers();
  prayers.unshift(newPrayer);
  await savePrayers(prayers);
  return newPrayer;
}

/** Update prayer by ID (async) */
export async function updatePrayer(id: string, updates: Partial<Prayer>): Promise<void> {
  const prayers = await getPrayers();
  const index = prayers.findIndex(p => p.id === id);
  if (index !== -1) {
    prayers[index] = { ...prayers[index], ...updates };
    await savePrayers(prayers);
  }
}

/** Mark prayer answered (async) */
export async function markAnswered(id: string, answerNotes?: string): Promise<void> {
  await updatePrayer(id, {
    isAnswered: true,
    dateAnswered: new Date().toISOString(),
    answerNotes: answerNotes || undefined,
  });
}

/** Delete prayer (async) */
export async function deletePrayer(id: string): Promise<void> {
  const prayers = await getPrayers();
  const filtered = prayers.filter(p => p.id !== id);
  await savePrayers(filtered);
}

/** Filter prayers by active/answered status */
export function filterPrayers(prayers: Prayer[], filter: PrayerFilter): Prayer[] {
  switch (filter) {
    case 'active':
      return prayers.filter(p => !p.isAnswered);
    case 'answered':
      return prayers.filter(p => p.isAnswered);
    default:
      return prayers;
  }
}

/** Search through prayers */
export function searchPrayers(prayers: Prayer[], query: string): Prayer[] {
  const lowerQuery = query.toLowerCase();
  return prayers.filter(p =>
    p.title.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/** Predefined tags */
export const PRAYER_TAGS = [
  'Family',
  'Health',
  'Work',
  'Finances',
  'Relationships',
  'Ministry',
  'Salvation',
  'Healing',
  'Guidance',
  'Protection',
  'Thanksgiving',
  'Confession',
  'Praise',
  'Church',
  'Friends',
  'Mission',
  'Spiritual Growth',
  'Anxiety',
  'Decision',
  'Travel',
];

/** Quick stats for dashboard */
export function getPrayerStats(prayers: Prayer[]) {
  const active = prayers.filter(p => !p.isAnswered).length;
  const answered = prayers.filter(p => p.isAnswered).length;
  const total = prayers.length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentlyAnswered = prayers.filter(p =>
    p.isAnswered &&
    p.dateAnswered &&
    new Date(p.dateAnswered) > thirtyDaysAgo
  ).length;

  return {
    total,
    active,
    answered,
    recentlyAnswered,
    answerRate: total > 0 ? Math.round((answered / total) * 100) : 0,
  };
}

/** ✅ Community prayers only (for /community-prayers) (async) */
export async function getCommunityPrayers(): Promise<Prayer[]> {
  const prayers = await getPrayers();
  return prayers.filter(p => p.isShared === true);
}

/** Format timestamps for UI */
export function formatPrayerDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
