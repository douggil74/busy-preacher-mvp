// app/components/OnboardingModal.tsx
"use client";

import { useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

type StudyStyle = "Casual Devotional" | "Bible Student" | "Pastor / Teacher";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (name: string, style: StudyStyle) => void;
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

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<StudyStyle | null>(null);

  if (!isOpen) return null;

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep(2);
    }
  };

  const handleStyleSelect = (style: StudyStyle) => {
    setSelectedStyle(style);
    setTimeout(() => {
      onComplete(name.trim(), style);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">👋</div>
              <h2 className={`${playfair.className} text-3xl font-semibold text-yellow-400 mb-3`}>
                Welcome to The Busy Christian
              </h2>
              <p className="text-white/80 text-lg">
                Let's personalize your Bible study experience
              </p>
            </div>

            <form onSubmit={handleNameSubmit} className="max-w-md mx-auto">
              <label htmlFor="userName" className="block text-sm font-medium text-white/80 mb-2">
                What should we call you?
              </label>
              <input
                id="userName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border-2 border-white/10 text-white placeholder:text-white/40 focus:border-yellow-400 focus:outline-none transition-colors"
                autoFocus
              />
              
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full mt-6 px-6 py-3 rounded-lg bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue
              </button>
            </form>

            <p className="text-center text-xs text-white/50 mt-6">
              We'll save this locally in your browser
            </p>
          </div>
        )}

        {/* Step 2: Style Selection */}
        {step === 2 && (
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className={`${playfair.className} text-2xl font-semibold text-yellow-400 mb-2`}>
                Great to meet you, {name}!
              </h2>
              <p className="text-white/80">
                How do you prefer to study Scripture?
              </p>
            </div>

            <div className="space-y-3">
              {styles.map((style) => {
                const isSelected = selectedStyle === style.name;
                
                return (
                  <button
                    key={style.name}
                    onClick={() => handleStyleSelect(style.name)}
                    disabled={selectedStyle !== null}
                    className={`
                      w-full text-left p-4 rounded-xl border-2 transition-all
                      ${isSelected
                        ? "border-yellow-400 bg-yellow-400/10 scale-[1.02]"
                        : "border-white/10 bg-white/5 hover:border-yellow-400/50 hover:bg-white/10"
                      }
                      ${selectedStyle !== null && !isSelected ? "opacity-50" : ""}
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
                              Selected ✓
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

            <button
              onClick={() => setStep(1)}
              className="w-full mt-6 text-sm text-white/60 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}