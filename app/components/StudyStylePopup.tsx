// app/components/StudyStylePopup.tsx
"use client";

import { useState, useEffect } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface StudyStylePopupProps {
  onClose: () => void;
}

export function StudyStylePopup({ onClose }: StudyStylePopupProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>("Casual Devotional");

  const handleSave = () => {
    localStorage.setItem('bc-study-style', selectedStyle);
    localStorage.setItem('bc-study-style-selected', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className="rounded-2xl border max-w-lg w-full max-h-[80vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className={`${playfair.className} text-2xl font-bold mb-2`} style={{ color: 'var(--accent-color)' }}>
              Choose Your Study Style
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              This helps personalize your Bible study experience
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                style: "Casual Devotional",
                emoji: "☕",
                description: "Quick, encouraging insights for daily reflection",
                details: "5-10 minute studies",
              },
              {
                style: "Bible Student",
                emoji: "📖",
                description: "Deeper exploration with cross-references",
                details: "15-20 minute studies",
              },
              {
                style: "Pastor/Teacher",
                emoji: "👨‍🏫",
                description: "Comprehensive analysis for teaching",
                details: "20-30 minute studies",
              },
            ].map((option) => (
              <button
                key={option.style}
                onClick={() => setSelectedStyle(option.style)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                  selectedStyle === option.style
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{option.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                      {option.style}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {option.description}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
                      {option.details}
                    </p>
                  </div>
                  {selectedStyle === option.style && (
                    <div className="text-yellow-400 text-xl">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-6 py-3 rounded-xl font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--accent-color)',
              color: '#0f172a',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
