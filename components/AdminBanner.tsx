'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, Info } from 'lucide-react';
import storage from '@/lib/storage';

export default function AdminBanner() {
  const [banner, setBanner] = useState<{ message: string; id: string } | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const pathname = usePathname();

  // Don't show banner on splash screen
  const isSplashPage = pathname === '/splash' || pathname === '/';

  useEffect(() => {
    // Don't fetch banner on splash page
    if (isSplashPage) return;

    // Fetch banner on mount
    fetchBanner();

    // Poll for updates every 30 seconds (reduced from 10s to minimize server load)
    const interval = setInterval(fetchBanner, 30000);
    return () => clearInterval(interval);
  }, [isSplashPage]);

  const fetchBanner = async () => {
    try {
      // Use full URL for iOS, relative for web
      const baseUrl = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()
        ? process.env.NEXT_PUBLIC_API_URL || 'https://thebusypreacher.vercel.app'
        : '';

      const response = await fetch(`${baseUrl}/api/banner`);
      const data = await response.json();

      if (data.active && data.message) {
        const bannerId = data.id || data.message;

        // Check if user has dismissed this banner
        const dismissedBanners = await storage.getItem('dismissed-banners');
        const dismissedList = dismissedBanners ? JSON.parse(dismissedBanners) : [];

        if (!dismissedList.includes(bannerId)) {
          setBanner({ message: data.message, id: bannerId });
          setDismissed(false);
        } else {
          setDismissed(true);
        }
      } else {
        setBanner(null);
        setDismissed(true);
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
    }
  };

  const handleDismiss = async () => {
    if (!banner) return;

    // Save dismissed banner ID to storage
    const dismissedBanners = await storage.getItem('dismissed-banners');
    const dismissedList = dismissedBanners ? JSON.parse(dismissedBanners) : [];
    dismissedList.push(banner.id);
    await storage.setItem('dismissed-banners', JSON.stringify(dismissedList));

    setDismissed(true);
  };

  // Don't render on splash page or if no banner/dismissed
  if (isSplashPage || !banner || dismissed) return null;

  return (
    <div className="bg-red-600 border-b-2 border-red-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 py-2">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">
              {banner.message}
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors -mt-0.5"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
