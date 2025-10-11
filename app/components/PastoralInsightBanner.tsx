// app/components/PastoralInsightBanner.tsx
"use client";

import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
});

interface PastoralInsightBannerProps {
  message: string;
  emoji: string;
  type: "welcome_back" | "pattern_recognition" | "encouragement" | "check_in" | "milestone";
  onDismiss?: () => void;
}

export function PastoralInsightBanner({ message, emoji, type, onDismiss }: PastoralInsightBannerProps) {
  const colors = {
    welcome_back: "border-blue-400/30 bg-blue-400/10",
    pattern_recognition: "border-purple-400/30 bg-purple-400/10",
    encouragement: "border-green-400/30 bg-green-400/10",
    check_in: "border-yellow-400/30 bg-yellow-400/10",
    milestone: "border-yellow-400/40 bg-yellow-400/15",
  };

  const iconColors = {
    welcome_back: "text-blue-400",
    pattern_recognition: "text-purple-400",
    encouragement: "text-green-400",
    check_in: "text-yellow-400",
    milestone: "text-yellow-400",
  };

  return (
    <div className={`rounded-xl border-2 p-5 mb-6 ${colors[type]} animate-fade-in relative overflow-hidden`}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }}></div>

      <div className="relative flex items-start gap-4">
        <div className={`text-4xl flex-shrink-0 ${iconColors[type]}`}>
          {emoji}
        </div>
        
        <div className="flex-1">
          <p className={`${playfair.className} text-lg leading-relaxed text-white/90`}>
            {message}
          </p>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}