// Tracks usage metrics locally and queues for sync

const METRICS_KEY = 'busyChristian_metrics';

export function recordMetric(event: string): void {
  if (typeof window === 'undefined') return;

  const today = new Date().toISOString().split('T')[0];
  const metrics = JSON.parse(localStorage.getItem(METRICS_KEY) || '{}');
  metrics[today] = metrics[today] || {};
  metrics[today][event] = (metrics[today][event] || 0) + 1;

  localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
}

export function getMetrics(): Record<string, Record<string, number>> {
  if (typeof window === 'undefined') return {};
  return JSON.parse(localStorage.getItem(METRICS_KEY) || '{}');
}

export function clearMetrics(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(METRICS_KEY, '{}');
}
