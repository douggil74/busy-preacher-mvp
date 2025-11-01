// Prayer Journal Storage Utilities

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

const STORAGE_KEY = 'busyChristian_prayers';

/** Load all prayers from localStorage */
export function getPrayers(): Prayer[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading prayers:', error);
    return [];
  }
}

/** Save all prayers */
export function savePrayers(prayers: Prayer[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prayers));
  } catch (error) {
    console.error('Error saving prayers:', error);
  }
}

/** Add a new prayer */
export function addPrayer(prayer: Omit<Prayer, 'id' | 'dateAdded' | 'isAnswered'>): Prayer {
  const newPrayer: Prayer = {
    ...prayer,
    id: crypto.randomUUID(),
    dateAdded: new Date().toISOString(),
    isAnswered: false,
  };

  const prayers = getPrayers();
  prayers.unshift(newPrayer);
  savePrayers(prayers);
  return newPrayer;
}

/** Update prayer by ID */
export function updatePrayer(id: string, updates: Partial<Prayer>): void {
  const prayers = getPrayers();
  const index = prayers.findIndex(p => p.id === id);
  if (index !== -1) {
    prayers[index] = { ...prayers[index], ...updates };
    savePrayers(prayers);
  }
}

/** Mark prayer answered */
export function markAnswered(id: string, answerNotes?: string): void {
  updatePrayer(id, {
    isAnswered: true,
    dateAnswered: new Date().toISOString(),
    answerNotes: answerNotes || undefined,
  });
}

/** Delete prayer */
export function deletePrayer(id: string): void {
  const prayers = getPrayers();
  const filtered = prayers.filter(p => p.id !== id);
  savePrayers(filtered);
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

/** ✅ Community prayers only (for /community-prayers) */
export function getCommunityPrayers(): Prayer[] {
  return getPrayers().filter(p => p.isShared === true);
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
