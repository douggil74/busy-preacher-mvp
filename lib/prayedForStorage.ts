// Handles local prayed-for counts and sync queue

const PRAYED_KEY = 'busyChristian_prayedFor';
const SYNC_QUEUE_KEY = 'busyChristian_syncQueue';

export function getPrayedCount(id: string): number {
  if (typeof window === 'undefined') return 0;
  const data = JSON.parse(localStorage.getItem(PRAYED_KEY) || '{}');
  return data[id] || 0;
}

export function incrementPrayedCount(id: string): number {
  if (typeof window === 'undefined') return 0;

  const prayed = JSON.parse(localStorage.getItem(PRAYED_KEY) || '{}');
  prayed[id] = (prayed[id] || 0) + 1;
  localStorage.setItem(PRAYED_KEY, JSON.stringify(prayed));

  // queue for future sync
  const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
  queue.push({ id, action: 'prayed', timestamp: Date.now() });
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));

  return prayed[id];
}

export function getSyncQueue() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
}

export function clearSyncQueue() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SYNC_QUEUE_KEY, '[]');
}
