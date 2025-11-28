// components/EncouragingBanner.tsx
"use client";

import { useState, useEffect } from "react";

interface EncouragingBannerProps {
  message: string;
}

export function EncouragingBanner({ message }: EncouragingBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if dismissed today
    const dismissedDate = localStorage.getItem("bc-encouraging-dismissed");
    const today = new Date().toDateString();
    if (dismissedDate === today) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    // Save dismissal for today
    localStorage.setItem("bc-encouraging-dismissed", new Date().toDateString());
    setTimeout(() => setIsDismissed(true), 300);
  };

  if (isDismissed) return null;

  return (
    <div className={`mb-6 max-w-3xl mx-auto transition-all duration-300 ${isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 dark:from-yellow-500/5 dark:to-orange-500/5 border-l-4 border-yellow-500/50 dark:border-yellow-500/30 rounded-lg p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/40 hover:text-white/80 transition-colors p-1"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-start gap-3 pr-6">
          <div className="text-2xl flex-shrink-0">📖</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">Fuel for Living</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
              "{message}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
