// app/components/DevotionalModal.tsx
"use client";

import { useState } from 'react';
import { DailyDevotional } from '../devotional/DailyDevotional';

interface DevotionalModalProps {
  isOpen: boolean;
  userName: string;
  onClose: () => void;
}

export function DevotionalModal({ isOpen, userName, onClose }: DevotionalModalProps) {
  const [disableDailyPopup, setDisableDailyPopup] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    // Mark as shown today
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('bc-devotional-last-shown', today);

    // Optionally disable daily pop-ups permanently
    if (disableDailyPopup) {
      localStorage.setItem('bc-devotional-popup-disabled', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl border border-white/10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Today's Devotional 📖
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Good morning, {userName}! Start your day with Scripture.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Devotional Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <DailyDevotional />
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dont-show-devotional"
              checked={disableDailyPopup}
              onChange={(e) => setDisableDailyPopup(e.target.checked)}
              className="w-4 h-4 rounded border-white/30 bg-white/10 text-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
            />
            <label
              htmlFor="dont-show-devotional"
              className="text-sm text-white/70 cursor-pointer select-none hover:text-white/90 transition-colors"
            >
              Don't show daily devotional pop-ups
            </label>
          </div>
          <button
            onClick={handleClose}
            className="bg-yellow-400 text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}