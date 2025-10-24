'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export function DevotionalBellNotification() {
  const [hasUnread, setHasUnread] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    checkForUnreadDevotional();
  }, []);

  const checkForUnreadDevotional = () => {
    const lastRead = localStorage.getItem('lastDevotionalRead');
    const today = new Date().toDateString();
    
    if (lastRead !== today) {
      setHasUnread(true);
    }
  };

  const handleClick = () => {
    // Mark as read when they click
    const today = new Date().toDateString();
    localStorage.setItem('lastDevotionalRead', today);
    setHasUnread(false);
  };

  return (
    <div className="relative">
      <Link 
        href="/devotional"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        
        {/* Red Dot Indicator */}
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
        )}

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 text-white text-sm rounded-lg p-2 shadow-xl z-50">
            {hasUnread ? (
              <>
                <p className="font-semibold">New Devotional!</p>
                <p className="text-gray-300 text-xs">Today's reading is ready</p>
              </>
            ) : (
              <p>View Daily Devotional</p>
            )}
            <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45" />
          </div>
        )}
      </Link>
    </div>
  );
}

// ============================================
// Add to your header/navbar component like this:
// ============================================
/*
import { DevotionalBellNotification } from '@/components/DevotionalBellNotification';

export function Header() {
  return (
    <header>
      <nav className="flex items-center gap-4">
        // ... your other nav items
        <DevotionalBellNotification />
      </nav>
    </header>
  );
}
*/