'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Clock, Calendar } from 'lucide-react';

interface BannerData {
  message: string;
  active: boolean;
  scheduledActive?: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

export default function SetAdminBanner() {
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [currentBanner, setCurrentBanner] = useState<BannerData | null>(null);

  // Schedule state
  const [useSchedule, setUseSchedule] = useState(false);
  const [durationHours, setDurationHours] = useState(24); // Default 24 hours
  const [durationDays, setDurationDays] = useState(0);

  // Load current banner on mount
  useEffect(() => {
    fetchCurrentBanner();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchCurrentBanner, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentBanner = async () => {
    try {
      // Use full URL for iOS, relative for web
      const baseUrl = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()
        ? process.env.NEXT_PUBLIC_API_URL || 'https://thebusypreacher.vercel.app'
        : '';

      const response = await fetch(`${baseUrl}/api/banner`);
      const data = await response.json();
      if (data.scheduledActive || data.active) {
        setCurrentBanner(data);
      } else {
        setCurrentBanner(null);
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
    }
  };

  const formatScheduleTime = (isoString: string | null | undefined) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleSetBanner = async () => {
    if (!message.trim()) {
      setResult({ success: false, message: 'Please enter a message' });
      return;
    }

    setSaving(true);
    setResult(null);

    try {
      // Use full URL for iOS, relative for web
      const baseUrl = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()
        ? process.env.NEXT_PUBLIC_API_URL || 'https://thebusypreacher.vercel.app'
        : '';

      // Calculate start and end times
      const startTime = new Date().toISOString();
      let endTime: string | null = null;

      if (useSchedule && (durationHours > 0 || durationDays > 0)) {
        const endDate = new Date();
        endDate.setHours(endDate.getHours() + durationHours);
        endDate.setDate(endDate.getDate() + durationDays);
        endTime = endDate.toISOString();
      }

      const response = await fetch(`${baseUrl}/api/banner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          active: true,
          startTime,
          endTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const scheduleText = endTime
          ? ` Banner will expire in ${durationDays > 0 ? `${durationDays}d ` : ''}${durationHours}h.`
          : '';
        setResult({
          success: true,
          message: `✅ Banner activated!${scheduleText}`,
        });
        setMessage('');
        fetchCurrentBanner();
      } else {
        setResult({
          success: false,
          message: `❌ Failed: ${data.error || 'Unknown error'}`,
        });
      }
    } catch (error: any) {
      console.error('Error setting banner:', error);
      setResult({
        success: false,
        message: `❌ Failed: ${error.message || 'Network error'}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClearBanner = async () => {
    setSaving(true);
    setResult(null);

    try {
      // Use full URL for iOS, relative for web
      const baseUrl = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()
        ? process.env.NEXT_PUBLIC_API_URL || 'https://thebusypreacher.vercel.app'
        : '';

      const response = await fetch(`${baseUrl}/api/banner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '', active: false }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: '✅ Banner cleared.',
        });
        fetchCurrentBanner();
      } else {
        setResult({
          success: false,
          message: `❌ Failed to clear: ${data.error || 'Unknown error'}`,
        });
      }
    } catch (error: any) {
      console.error('Error clearing banner:', error);
      setResult({
        success: false,
        message: `❌ Failed to clear: ${error.message || 'Network error'}`,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <Megaphone className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">App-Wide Banner</h3>
          <p className="text-sm text-white/60">Show a persistent message to all users</p>
        </div>
      </div>

      {/* Current Banner Status */}
      {currentBanner?.scheduledActive && (
        <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-purple-300">
                  {currentBanner.active ? '🟢 Active Now' : '⏸️ Scheduled (not active yet)'}
                </p>
              </div>
              <p className="text-sm text-white font-medium">{currentBanner.message}</p>
              {currentBanner.endTime && (
                <p className="text-xs text-purple-300/70 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Expires: {formatScheduleTime(currentBanner.endTime)}
                </p>
              )}
            </div>
            <button
              onClick={handleClearBanner}
              disabled={saving}
              className="flex-shrink-0 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Banner Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., 📢 Join us for special prayer meeting this Sunday at 7 PM"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-purple-400 focus:outline-none resize-none"
            maxLength={200}
            rows={2}
          />
          <p className="text-xs text-white/40 mt-1">{message.length}/200 characters</p>
        </div>

        {/* Schedule Toggle */}
        <div className="border border-white/10 rounded-lg p-4 bg-white/5">
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={useSchedule}
              onChange={(e) => setUseSchedule(e.target.checked)}
              className="w-4 h-4 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
            />
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Set expiration time</span>
            </div>
          </label>

          {useSchedule && (
            <div className="flex flex-wrap gap-3 mt-3 pl-7">
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/60">Days:</label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value))}
                  className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:border-purple-400 focus:outline-none"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 14, 30].map((d) => (
                    <option key={d} value={d} className="bg-slate-800">{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/60">Hours:</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseInt(e.target.value))}
                  className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:border-purple-400 focus:outline-none"
                >
                  {[0, 1, 2, 3, 4, 6, 8, 12, 24, 48].map((h) => (
                    <option key={h} value={h} className="bg-slate-800">{h}</option>
                  ))}
                </select>
              </div>
              {(durationDays > 0 || durationHours > 0) && (
                <p className="text-xs text-purple-300 w-full mt-1">
                  Banner expires in {durationDays > 0 ? `${durationDays} day${durationDays > 1 ? 's' : ''} ` : ''}{durationHours > 0 ? `${durationHours} hour${durationHours > 1 ? 's' : ''}` : ''}
                </p>
              )}
            </div>
          )}

          {!useSchedule && (
            <p className="text-xs text-white/40 pl-7">Banner stays active until you manually clear it</p>
          )}
        </div>

        {result && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium ${
              result.success
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {result.message}
          </div>
        )}

        <button
          onClick={handleSetBanner}
          disabled={saving || !message.trim()}
          className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 py-3 transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Setting Banner...
            </>
          ) : (
            <>
              <Megaphone className="w-4 h-4" />
              Set Banner for All Users
            </>
          )}
        </button>

        <p className="text-xs text-white/40 text-center">
          💡 Banner appears at the top of the app. Users can dismiss it, but won't see it again until you set a new message.
        </p>
      </div>
    </div>
  );
}
