'use client';

import { useState, useEffect } from 'react';
import { Bell, Send, Smartphone, Loader2 } from 'lucide-react';

interface NotificationStats {
  registeredDevices: number;
  recentNotifications: Array<{
    id: string;
    title: string;
    body: string;
    sentAt: string;
    successCount: number;
    failureCount: number;
  }>;
}

export default function AdminPushNotification() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load notification stats
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const baseUrl = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()
        ? process.env.NEXT_PUBLIC_API_URL || 'https://thebusypreacher.vercel.app'
        : '';
      const response = await fetch(`${baseUrl}/api/admin/push-notification`);
      const data = await response.json();
      if (!data.error) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setResult({ success: false, message: 'Please enter both title and message' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const baseUrl = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()
        ? process.env.NEXT_PUBLIC_API_URL || 'https://thebusypreacher.vercel.app'
        : '';

      const response = await fetch(`${baseUrl}/api/admin/push-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || `Sent to ${data.sent} device(s)`,
        });
        setTitle('');
        setBody('');
        fetchStats(); // Refresh stats
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send notification',
        });
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      setResult({
        success: false,
        message: error.message || 'Network error',
      });
    } finally {
      setSending(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <Bell className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Push Notifications</h3>
          <p className="text-sm text-white/60">Send to all iOS devices</p>
        </div>
      </div>

      {/* Device Count */}
      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
        <Smartphone className="w-5 h-5 text-blue-400" />
        <div>
          <p className="text-sm font-medium text-white">
            {loadingStats ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </span>
            ) : (
              <>
                <span className="text-blue-400 font-bold">{stats?.registeredDevices || 0}</span> registered device(s)
              </>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Notification Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., New Devotional Available"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="e.g., Today's devotional is ready! Tap to read..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none resize-none"
            maxLength={200}
            rows={3}
          />
          <p className="text-xs text-white/40 mt-1">{body.length}/200 characters</p>
        </div>

        {result && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium ${
              result.success
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {result.success ? '✅' : '❌'} {result.message}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending || !title.trim() || !body.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 py-3 transition-colors flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Push Notification
            </>
          )}
        </button>

        {/* Recent Notifications */}
        {stats?.recentNotifications && stats.recentNotifications.length > 0 && (
          <div className="border-t border-white/10 pt-4 mt-4">
            <h4 className="text-sm font-medium text-white/60 mb-3">Recent Notifications</h4>
            <div className="space-y-2">
              {stats.recentNotifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white truncate">{notif.title}</p>
                    <span className="text-xs text-white/40">{formatTimeAgo(notif.sentAt)}</span>
                  </div>
                  <p className="text-xs text-white/60 truncate">{notif.body}</p>
                  <p className="text-xs text-green-400/70 mt-1">
                    Sent to {notif.successCount} device(s)
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-white/40 text-center">
          Push notifications are sent to all iOS app users who have enabled notifications.
        </p>
      </div>
    </div>
  );
}
