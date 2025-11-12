'use client';

import { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';

export default function SetAdminBanner() {
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [currentBanner, setCurrentBanner] = useState<{ message: string; active: boolean } | null>(null);

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
      if (data.active) {
        setCurrentBanner({ message: data.message, active: data.active });
      } else {
        setCurrentBanner(null);
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
    }
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

      const response = await fetch(`${baseUrl}/api/banner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), active: true }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: '✅ Banner activated! All users will see it.',
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
      {currentBanner?.active && (
        <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-purple-300 mb-1">Current Active Banner:</p>
              <p className="text-sm text-white font-medium truncate">{currentBanner.message}</p>
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
