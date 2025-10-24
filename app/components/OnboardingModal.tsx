// app/components/OnboardingModal.tsx
"use client";

import { useState } from "react";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (name: string, style: string, showDevotional: boolean) => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [showDevotional, setShowDevotional] = useState(true);

  if (!isOpen) return null;

  const styles = [
    {
      id: "Casual Devotional",
      icon: "☕",
      title: "Casual Devotional",
      description: "Warm, conversational tone perfect for daily reflection and personal growth"
    },
    {
      id: "Bible Student",
      icon: "📖",
      title: "Bible Student",
      description: "Balanced approach with context, cross-references, and practical insights"
    },
    {
      id: "Seminary Scholar",
      icon: "👨‍🏫",
      title: "Seminary Scholar",
      description: "In-depth academic analysis with original languages and theological depth"
    }
  ];

  const handleContinue = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && selectedStyle) {
      setStep(3);
    } else if (step === 3) {
      onComplete(name.trim(), selectedStyle, showDevotional);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-white/10">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? "w-8 bg-yellow-400"
                  : s < step
                  ? "w-2 bg-yellow-400/50"
                  : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-6xl mb-6">👋</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to The Busy Christian
            </h2>
            <p className="text-white/70 mb-8">
              Let's personalize your Bible study experience
            </p>

            <div className="text-left mb-6">
              <label htmlFor="userName" className="block text-sm text-white/80 mb-2">
                What should we call you?
              </label>
              <input
                id="userName"
                type="text"
                placeholder="Enter your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                autoFocus
              />
            </div>

            <button
              onClick={handleContinue}
              disabled={!name.trim()}
              className="w-full bg-yellow-400 text-slate-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Study Style */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Choose Your Study Style
              </h2>
              <p className="text-white/70">
                This determines the tone and depth of your study guides
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedStyle === style.id
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{style.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">{style.title}</div>
                      <div className="text-sm text-white/60">{style.description}</div>
                    </div>
                    {selectedStyle === style.id && (
                      <svg className="w-6 h-6 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                disabled={!selectedStyle}
                className="flex-1 bg-yellow-400 text-slate-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Devotional Preference */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📖✨</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Daily Devotional
              </h2>
              <p className="text-white/70">
                Would you like to see a new devotional each day?
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={showDevotional}
                    onChange={(e) => setShowDevotional(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-yellow-400 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white mb-1">
                    Show daily devotional popup
                  </div>
                  <div className="text-sm text-white/60">
                    Each day, you'll see a thoughtful devotional message when you visit. 
                    You can change this anytime in Settings.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 bg-yellow-400 text-slate-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => onComplete("Friend", "Casual Devotional", false)}
            className="text-sm text-white/50 hover:text-white/70 underline transition-colors"
          >
            Skip setup (use defaults)
          </button>
        </div>
      </div>
    </div>
  );
}