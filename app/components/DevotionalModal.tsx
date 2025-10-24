// app/components/DevotionalModal.tsx
"use client";

import { DailyDevotional } from '../devotional/DailyDevotional';

interface DevotionalModalProps {
  isOpen: boolean;
  userName: string;
  onClose: () => void;
}

export function DevotionalModal({ isOpen, userName, onClose }: DevotionalModalProps) {
  if (!isOpen) return null;

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
            onClick={onClose}
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
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/5">
          <p className="text-xs text-white/50">
            This devotional appears once per day. You can disable it in Settings.
          </p>
          <button
            onClick={onClose}
            className="bg-yellow-400 text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}