"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/* ---------------------------------
   TYPES
----------------------------------- */
interface PlanProgress {
  id: string;
  title: string;
  startDate: string;
  currentDay: number;
  duration: number;
  completed: boolean;
}

interface DailyReading {
  day: number;
  passages: string[];
}

/* ---------------------------------
   READING SCHEDULES
----------------------------------- */
const readingSchedules: Record<string, DailyReading[]> = {
  "bible-in-year": Array.from({ length: 365 }, (_, i) => {
    const day = i + 1;
    if (day <= 50) return { day, passages: [`Genesis ${day}`] };
    if (day <= 90) return { day, passages: [`Exodus ${day - 50}`] };
    if (day <= 120) return { day, passages: [`Matthew ${day - 90}`] };
    if (day <= 180) return { day, passages: [`Psalm ${day - 120}`, `Proverbs ${((day - 120) % 31) + 1}`] };
    return { day, passages: [`Acts ${Math.min(28, day - 180)}`] };
  }),
  
  "nt-90-days": Array.from({ length: 90 }, (_, i) => {
    const day = i + 1;
    if (day <= 28) return { day, passages: [`Matthew ${day}`] };
    if (day <= 44) return { day, passages: [`Mark ${day - 28}`] };
    if (day <= 68) return { day, passages: [`Luke ${day - 44}`] };
    if (day <= 89) return { day, passages: [`John ${day - 68}`] };
    return { day, passages: [`Acts ${day - 89}`] };
  }),

  "gospels-30-days": Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    passages: [`Matthew ${i + 1}`],
  })),

  "psalms-proverbs": Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return {
      day,
      passages: [
        `Psalm ${day}`,
        `Psalm ${day + 31}`,
        `Psalm ${day + 62}`,
        `Psalm ${day + 93}`,
        `Psalm ${day + 124}`,
        `Proverbs ${day}`,
      ],
    };
  }),

  "pauls-letters": Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    if (day <= 16) return { day, passages: [`Romans ${day}`] };
    if (day <= 22) return { day, passages: [`1 Corinthians ${(day - 16) * 2}`, `1 Corinthians ${(day - 16) * 2 + 1}`] };
    if (day <= 28) return { day, passages: [`Galatians ${day - 22}`] };
    return { day, passages: [`Ephesians ${day - 28}`] };
  }),
};

/* ---------------------------------
   PROGRESS SAVER HOOK
----------------------------------- */
function useReadingProgress(planId: string | null, planTitle: string, currentDay: number, totalDays: number) {
  useEffect(() => {
    if (!planId) return;

    const progress = {
      planId,
      planTitle,
      currentDay,
      totalDays,
      lastRead: new Date().toISOString(),
    };
    localStorage.setItem("bc-reading-progress", JSON.stringify(progress));
  }, [planId, planTitle, currentDay, totalDays]);
}

/* ---------------------------------
   AUDIO PLAYER
----------------------------------- */
function AudioPlayer({ passage }: { passage: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const loadAndPlayAudio = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/esv-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage }),
      });

      if (!response.ok) throw new Error("Failed to load audio");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      setTimeout(() => audioRef.current?.play().catch(() => setError("Click play to listen.")), 150);
    } catch (err) {
      setError("Could not load audio. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
        <h4 className="text-white font-semibold text-sm">Listen: {passage}</h4>
        {playing && <span className="text-green-400 text-xs">▶ Playing</span>}
      </div>

      {!audioUrl && !loading && (
        <button
          onClick={loadAndPlayAudio}
          className="w-full rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-yellow-400 hover:bg-yellow-400/20 transition text-sm font-medium flex items-center justify-center gap-2"
        >
          ▶ Play Audio
        </button>
      )}

      {loading && (
        <div className="flex justify-center items-center py-3 gap-2">
          <div className="animate-spin h-5 w-5 border-2 border-yellow-400 border-t-transparent rounded-full" />
          <span className="text-yellow-400 text-sm">Loading audio...</span>
        </div>
      )}

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {audioUrl && (
        <>
          <audio ref={audioRef} src={audioUrl} controls className="w-full" />
          <p className="text-slate-400 text-xs mt-2 italic">ESV Audio Bible</p>
        </>
      )}
    </div>
  );
}

/* ---------------------------------
   MAIN READING COMPONENT
----------------------------------- */
function ReadingPlanContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");
  const [planProgress, setPlanProgress] = useState<PlanProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [passages, setPassages] = useState<Array<{ ref: string; text: string }>>([]);
  const [loadingPassages, setLoadingPassages] = useState(false);

  useEffect(() => {
    if (planId) {
      const saved = localStorage.getItem(`reading-plan-${planId}`);
      if (saved) {
        const plan = JSON.parse(saved);
        setPlanProgress(plan);

        const schedule = readingSchedules[planId];
        const today = schedule?.find(r => r.day === plan.currentDay);
        if (today) loadPassages(today.passages);
      }
    }
    setLoading(false);
  }, [planId]);

  useReadingProgress(
    planId,
    planProgress?.title || "My Plan",
    planProgress?.currentDay || 1,
    planProgress?.duration || 1
  );

  const loadPassages = async (refs: string[]) => {
    setLoadingPassages(true);
    try {
      const results = await Promise.all(
        refs.map(async (passage) => {
          const res = await fetch("/api/esv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ passage }),
          });
          const data = await res.json();
          return { ref: passage, text: data.text || "Passage not found." };
        })
      );
      setPassages(results);
    } catch (e) {
      console.error("Error fetching passages:", e);
    }
    setLoadingPassages(false);
  };

  const markDayComplete = () => {
    if (!planProgress || !planId) return;

    const newDay = planProgress.currentDay + 1;
    const updated = {
      ...planProgress,
      currentDay: Math.min(newDay, planProgress.duration),
      completed: newDay >= planProgress.duration,
    };

    setPlanProgress(updated);
    localStorage.setItem(`reading-plan-${planId}`, JSON.stringify(updated));
    localStorage.setItem("bc-reading-progress", JSON.stringify(updated));

    if (!updated.completed) {
      const next = readingSchedules[planId]?.find(r => r.day === updated.currentDay);
      if (next) loadPassages(next.passages);
    }
  };

  if (loading)
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto animate-pulse bg-slate-800/50 rounded-lg p-6 h-64"></div>
      </main>
    );

  if (!planId || !planProgress)
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Start a Reading Plan</h1>
          <p className="text-slate-400 mb-6">Choose a plan to begin your journey through Scripture.</p>
          <Link href="/reading-plans" className="text-yellow-400 hover:text-yellow-300 font-semibold">
            Browse Plans →
          </Link>
        </div>
      </main>
    );

  const percent = Math.round((planProgress.currentDay / planProgress.duration) * 100);
  const daysLeft = planProgress.duration - planProgress.currentDay;

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/reading-plans" className="text-yellow-400 hover:text-yellow-300 text-sm mb-4 inline-flex items-center gap-1">
          ← Back to Plans
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">{planProgress.title}</h1>
        <p className="text-slate-400">Day {planProgress.currentDay} of {planProgress.duration}</p>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 my-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Progress</span>
            <span className="text-yellow-400 font-bold">{percent}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-yellow-400 to-amber-400 h-full rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-400">
            {daysLeft > 0 ? `🔥 ${daysLeft} days remaining` : "🎉 Completed!"}
          </p>
        </div>

        {loadingPassages ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
          </div>
        ) : (
          passages.map((p, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">{p.ref}</h2>
              <AudioPlayer passage={p.ref} />
              <div className="text-white/90 leading-relaxed whitespace-pre-wrap font-serif text-lg mt-4">
                {p.text}
              </div>
              <Link
                href={`/deep-study?passage=${encodeURIComponent(p.ref)}`}
                className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm mt-4"
              >
                Study in depth →
              </Link>
            </div>
          ))
        )}

        {!planProgress.completed && (
          <button
            onClick={markDayComplete}
            className="w-full rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-4 font-semibold text-green-400 hover:bg-green-400/20 transition-colors text-lg"
          >
            ✓ Mark Day {planProgress.currentDay} Complete
          </button>
        )}

        {planProgress.completed && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center mt-6">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-green-400 font-bold text-lg">Congratulations!</p>
            <p className="text-slate-300">You've completed {planProgress.title}!</p>
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------------------------
   WRAPPER WITH SUSPENSE
----------------------------------- */
export default function ReadingPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-6">
          <div className="animate-pulse bg-slate-800/50 rounded-lg h-64"></div>
        </div>
      }
    >
      <ReadingPlanContent />
    </Suspense>
  );
}