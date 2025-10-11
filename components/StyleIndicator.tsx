// components/StyleIndicator.tsx
"use client";

import { useStudyStyle } from "@/app/hooks/useStudyStyle";
import Link from "next/link";

const studyStyleIcons = {
  "Casual Devotional": "☕",
  "Bible Student": "📖",
  "Pastor / Teacher": "👨‍🏫",
  "Theologian": "🎓",
} as const;

export function StyleIndicator() {
  const { style } = useStudyStyle();

  return (
    <div className="mb-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{studyStyleIcons[style]}</span>
        <div>
          <div className="text-xs text-white/60 uppercase tracking-wide">Your Study Style</div>
          <div className="font-semibold text-white/90">{style}</div>
        </div>
      </div>
      <Link
        href="/personalize"
        className="text-sm text-yellow-400 hover:text-yellow-300 underline decoration-yellow-400/50 underline-offset-4"
      >
        Change
      </Link>
    </div>
  );
}