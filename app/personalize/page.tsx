// app/personalize/page.tsx
"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { useEffect, useState } from "react";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const studyStyles = {
  "Casual Devotional": {
    description: "Friendly, encouraging, short reflections that focus on daily life application.",
    icon: "☕",
    example: "Like chatting with a friend over coffee about how Scripture applies to your day"
  },
  "Bible Student": {
    description: "Balanced study with meaning, background, and practical insights.",
    icon: "📖",
    example: "Explores context and key terms while staying accessible and personal"
  },
  "Pastor / Teacher": {
    description: "Structured outlines with application points and illustrative examples.",
    icon: "👨‍🏫",
    example: "Clear teaching structure with practical sermon illustrations and action steps"
  },
  "Theologian": {
    description: "Analytical study with context, language detail, and precise references.",
    icon: "🎓",
    example: "Academic depth with Greek/Hebrew terms and careful doctrinal analysis"
  },
} as const;

export default function PersonalizePage() {
  const [selectedStyle, setSelectedStyle] = useState<string>("Casual Devotional");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedStyle = localStorage.getItem("bc-style");
    if (savedStyle && savedStyle in studyStyles) {
      setSelectedStyle(savedStyle);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("bc-style", selectedStyle);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-3 text-white/95 text-center`}>
        Personalize Your Study
      </h1>
      <p className="text-white/70 mb-8 text-center">
        Choose the style that fits how you like to study Scripture. This affects the tone and depth of AI-generated outlines.
      </p>

      <div className="space-y-4">
        {Object.entries(studyStyles).map(([name, info]) => (
          <button
            key={name}
            onClick={() => setSelectedStyle(name)}
            className={`w-full text-left rounded-2xl border-2 p-6 transition-all ${
              selectedStyle === name
                ? "border-yellow-400 bg-yellow-400/10"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{info.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`${playfair.className} text-xl font-semibold`}>
                    {name}
                  </h3>
                  {selectedStyle === name && (
                    <span className="text-yellow-400 text-sm">✓ Selected</span>
                  )}
                </div>
                <p className="text-white/80 mb-2">{info.description}</p>
                <p className="text-sm text-white/60 italic">
                  Example: {info.example}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={handleSave}
          className="rounded-lg bg-yellow-400/20 border-2 border-yellow-400 px-6 py-3 text-sm font-semibold hover:bg-yellow-400/30 transition-colors"
        >
          {saved ? "✓ Saved!" : "Save Preference"}
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6">
        <div className="flex gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="font-semibold mb-2">How This Works</h3>
            <ul className="text-sm text-white/80 space-y-1">
              <li>• Your choice adjusts how AI generates study outlines</li>
              <li>• More casual styles = shorter, practical insights</li>
              <li>• More academic styles = deeper language and context</li>
              <li>• You can change this anytime</li>
              <li>• Setting is saved to your device</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}