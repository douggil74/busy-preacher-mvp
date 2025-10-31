import { getSyncQueue, clearSyncQueue } from "./prayedForStorage";
import { getMetrics, clearMetrics } from "./metricsTracker";

// Wait a bit after load, then attempt to sync
export function startBackgroundSync(intervalHours = 3) {
  if (typeof window === "undefined") return;

  const SYNC_URL = "/api/sync";

  async function runSync() {
    try {
      const queue = getSyncQueue();
      const metrics = getMetrics();
      if (queue.length === 0 && Object.keys(metrics).length === 0) return;

      const payload = { queue, metrics, timestamp: new Date().toISOString() };

      const res = await fetch(SYNC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log("✅ Background sync successful");
        clearSyncQueue();
        clearMetrics();
      } else {
        console.warn("⚠️ Sync failed, keeping data for retry");
      }
    } catch (err) {
      console.error("❌ Background sync error:", err);
    }
  }

  // initial sync after short delay
  setTimeout(runSync, 10_000);
  // repeat every few hours
  setInterval(runSync, intervalHours * 60 * 60 * 1000);
}
