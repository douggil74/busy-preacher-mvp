// app/personalize/page.tsx
"use client";

import { Playfair_Display } from "next/font/google";
import { useRouter } from "next/navigation";
import { useStudyStyle } from "../hooks/useStudyStyle";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const studyStyles = {
  "Casual Devotional": {
    description:
      "Friendly, encouraging reflections with clear daily-life application.",
    icon: "☕",
    example:
      "Like chatting with a friend over coffee about how Scripture applies to your day",
  },
  "Bible Student": {
    description:
      "Balanced study with meaning, background, and practical insights.",
    icon: "📖",
    example:
      "Explores context and key terms while staying accessible and personal",
  },
  "Pastor / Teacher": {
    description:
      "Structured outlines with application points and illustrative examples.",
    icon: "👨‍🏫",
    example:
      "Clear teaching structure with practical sermon illustrations and action steps",
  },
} as const;

type StyleKey = keyof typeof studyStyles;

export default function PersonalizePage() {
  const router = useRouter();
  const { style: savedStyle, saveStyle } = useStudyStyle();

  const onSelect = (name: StyleKey) => {
    if (name !== (savedStyle as StyleKey)) {
      saveStyle(name); // updates header immediately; no local state to fight it
    }
  };

  return (
    <main className="page-container">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-yellow-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-yellow-400 transition-colors"
        >
          Skip
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      <h1
        className={`${playfair.className} text-4xl md:text-5xl font-bold mb-3 text-white/95 text-center`}
      >
        Personalize Your Study
      </h1>
      <p className="text-white/70 mb-8 text-center">
        Choose the style that fits how you like to study Scripture. This affects
        the tone and depth of AI-generated outlines.
      </p>

      <div className="space-y-4">
        {(Object.entries(studyStyles) as [StyleKey, (typeof studyStyles)[StyleKey]][]).map(
          ([name, info]) => {
            const isActive = savedStyle === name;
            return (
              <div
                key={name}
                onClick={() => onSelect(name)}
                className={`group w-full cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                  isActive
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`text-3xl sm:text-4xl leading-none rounded-xl p-3 ${
                      isActive
                        ? "bg-white/10"
                        : "bg-white/5 group-hover:bg-white/10"
                    }`}
                  >
                    {info.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <h3
                          className={`${playfair.className} text-xl font-semibold`}
                        >
                          {name}
                        </h3>
                        {isActive ? (
                          <span className="rounded-full border border-yellow-400/60 bg-yellow-400/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-yellow-300">
                            Active
                          </span>
                        ) : null}
                      </div>

                      {/* Per-card Save/Active button */}
                      <div className="shrink-0">
                        {isActive ? (
                          <span className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80">
                            ✓ Current style
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(name);
                            }}
                            className="inline-flex items-center rounded-lg border-2 border-yellow-400 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-yellow-400/20"
                          >
                            Save this style
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-white/80 mb-2">{info.description}</p>
                    <p className="text-sm text-white/60 italic">
                      Example: {info.example}
                    </p>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Continue Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => router.push('/home')}
          className="rounded-xl px-8 py-3 font-semibold text-lg transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--accent-color)',
            color: 'var(--bg-color)'
          }}
        >
          Continue →
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-8 rounded-2xl p-6" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>How This Works</h3>
            <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
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