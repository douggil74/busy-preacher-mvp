// app/components/JourneyDashboard.tsx
"use client";

import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
});

interface JourneyDashboardProps {
  totalStudies: number;
  currentStreak: number;
  topThemes: { theme: string; count: number }[];
  frequentPassages: { passage: string; count: number }[];
}

export function JourneyDashboard({ totalStudies, currentStreak, topThemes, frequentPassages }: JourneyDashboardProps) {
  const themeEmojis: Record<string, string> = {
    anxiety: "🕊️",
    grief: "💜",
    joy: "😊",
    leadership: "🧭",
    marriage: "💑",
    parenting: "👨‍👩‍👧‍👦",
    forgiveness: "🤲",
    prayer: "🙏",
    faithfulness: "⛰️",
    suffering: "💪",
    hope: "🌅",
    love: "❤️",
    faith: "✝️",
    wisdom: "🦉",
    salvation: "✨",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h3 className={`${playfair.className} text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2`}>
        📊 Your Study Journey
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{totalStudies}</div>
          <div className="text-sm text-white/60 mt-1">Total Studies</div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400 flex items-center justify-center gap-1">
            {currentStreak > 0 && "🔥"} {currentStreak}
          </div>
          <div className="text-sm text-white/60 mt-1">Day Streak</div>
        </div>
      </div>

      {/* Top Themes */}
      {topThemes.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white/80 mb-3">Themes You're Exploring</h4>
          <div className="space-y-2">
            {topThemes.map((theme, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xl">{themeEmojis[theme.theme] || "📖"}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/80 capitalize">{theme.theme}</span>
                    <span className="text-xs text-white/50">{theme.count}x</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400/60 rounded-full transition-all"
                      style={{ width: `${Math.min((theme.count / totalStudies) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frequent Passages */}
      {frequentPassages.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white/80 mb-3">Passages You Return To</h4>
          <div className="space-y-2">
            {frequentPassages.map((passage, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span className="text-sm text-white/80 capitalize">{passage.passage}</span>
                <span className="text-xs text-yellow-400 font-semibold">{passage.count}x</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50 mt-3 italic">
            God often teaches us deeper truths through repeated study. Keep digging!
          </p>
        </div>
      )}

      {totalStudies === 0 && (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🌱</div>
          <p className="text-white/60 text-sm">
            Your journey is just beginning!<br />
            Start your first study above.
          </p>
        </div>
      )}
    </div>
  );
}