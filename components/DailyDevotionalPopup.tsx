// components/DailyDevotionalPopup.tsx
"use client";

interface DailyDevotionalPopupProps {
  message: string;
  onClose: () => void;
}

export function DailyDevotionalPopup({ message, onClose }: DailyDevotionalPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gradient-to-br from-yellow-50/95 to-orange-50/95 dark:from-slate-800/95 dark:to-slate-900/95 rounded-2xl shadow-2xl max-w-lg w-full p-8 border-2 border-yellow-400/30 dark:border-yellow-600/30 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
            Daily Devotional
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A word from your pastor
          </p>
        </div>

        {/* Message */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 mb-6 border border-yellow-400/20">
          <p className="text-lg leading-relaxed text-slate-800 dark:text-white italic text-center">
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white font-semibold transition-colors shadow-lg"
        >
          Thank you, I'll reflect on this
        </button>
      </div>
    </div>
  );
}
