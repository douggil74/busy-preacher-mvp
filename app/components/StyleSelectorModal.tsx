// app/components/StyleSelectorModal.tsx
"use client";

import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

type StudyStyle = "Casual Devotional" | "Bible Student" | "Pastor / Teacher";

interface StyleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: string;
  onStyleSelect: (style: string) => void;
}

const styles: { name: StudyStyle; icon: string; description: string }[] = [
  {
    name: "Casual Devotional",
    icon: "☕",
    description: "Warm, practical insights for daily life. Perfect for morning coffee or quiet time.",
  },
  {
    name: "Bible Student",
    icon: "📖",
    description: "Balanced depth with clear teaching. Great for personal study and small groups.",
  },
  {
    name: "Pastor / Teacher",
    icon: "👨‍🏫",
    description: "Sermon-ready structure with rich content. Ideal for teaching and preaching.",
  },
];

export function StyleSelectorModal({ isOpen, onClose, currentStyle, onStyleSelect }: StyleSelectorModalProps) {
  if (!isOpen) return null;

  const handleStyleSelect = (style: string) => {
    onStyleSelect(style);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`${playfair.className} text-2xl font-semibold text-yellow-400`}>
              Choose Your Study Style
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-white/70 mb-6">
            Your study style personalizes how AI generates outlines, illustrations, and applications.
          </p>

          <div className="space-y-3">
            {styles.map((style) => {
              const isSelected = currentStyle === style.name;
              
              return (
                <button
                  key={style.name}
                  onClick={() => handleStyleSelect(style.name)}
                  className={`
                    w-full text-left p-4 rounded-xl border-2 transition-all
                    ${isSelected
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-white/10 bg-white/5 hover:border-yellow-400/50 hover:bg-white/10"
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{style.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-white">
                          {style.name}
                        </h3>
                        {isSelected && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
                            Current ✓
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/70">
                        {style.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/60">
              💡 <strong>Tip:</strong> You can change your style anytime. Each style affects the tone, depth, and structure of your study materials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}