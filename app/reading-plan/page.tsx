// app/reading-plan/page.tsx
"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

// Complete reading schedules for all plans
const readingSchedules: Record<string, DailyReading[]> = {
  "gospels-30-days": [
    { day: 1, passages: ["Matthew 1-2"] },
    { day: 2, passages: ["Matthew 3-4"] },
    { day: 3, passages: ["Matthew 5-7"] },
    { day: 4, passages: ["Matthew 8-10"] },
    { day: 5, passages: ["Matthew 11-13"] },
    { day: 6, passages: ["Matthew 14-16"] },
    { day: 7, passages: ["Matthew 17-19"] },
    { day: 8, passages: ["Matthew 20-22"] },
    { day: 9, passages: ["Matthew 23-25"] },
    { day: 10, passages: ["Matthew 26-28"] },
    { day: 11, passages: ["Mark 1-3"] },
    { day: 12, passages: ["Mark 4-6"] },
    { day: 13, passages: ["Mark 7-9"] },
    { day: 14, passages: ["Mark 10-12"] },
    { day: 15, passages: ["Mark 13-16"] },
    { day: 16, passages: ["Luke 1-2"] },
    { day: 17, passages: ["Luke 3-5"] },
    { day: 18, passages: ["Luke 6-8"] },
    { day: 19, passages: ["Luke 9-11"] },
    { day: 20, passages: ["Luke 12-14"] },
    { day: 21, passages: ["Luke 15-17"] },
    { day: 22, passages: ["Luke 18-20"] },
    { day: 23, passages: ["Luke 21-24"] },
    { day: 24, passages: ["John 1-3"] },
    { day: 25, passages: ["John 4-6"] },
    { day: 26, passages: ["John 7-9"] },
    { day: 27, passages: ["John 10-12"] },
    { day: 28, passages: ["John 13-15"] },
    { day: 29, passages: ["John 16-18"] },
    { day: 30, passages: ["John 19-21"] },
  ],
  "nt-90-days": [
    { day: 1, passages: ["Matthew 1-3"] },
    { day: 2, passages: ["Matthew 4-6"] },
    { day: 3, passages: ["Matthew 7-9"] },
    { day: 4, passages: ["Matthew 10-12"] },
    { day: 5, passages: ["Matthew 13-15"] },
    { day: 6, passages: ["Matthew 16-18"] },
    { day: 7, passages: ["Matthew 19-21"] },
    { day: 8, passages: ["Matthew 22-24"] },
    { day: 9, passages: ["Matthew 25-26"] },
    { day: 10, passages: ["Matthew 27-28"] },
    { day: 11, passages: ["Mark 1-3"] },
    { day: 12, passages: ["Mark 4-6"] },
    { day: 13, passages: ["Mark 7-10"] },
    { day: 14, passages: ["Mark 11-13"] },
    { day: 15, passages: ["Mark 14-16"] },
    { day: 16, passages: ["Luke 1-2"] },
    { day: 17, passages: ["Luke 3-5"] },
    { day: 18, passages: ["Luke 6-8"] },
    { day: 19, passages: ["Luke 9-10"] },
    { day: 20, passages: ["Luke 11-13"] },
    { day: 21, passages: ["Luke 14-16"] },
    { day: 22, passages: ["Luke 17-19"] },
    { day: 23, passages: ["Luke 20-22"] },
    { day: 24, passages: ["Luke 23-24"] },
    { day: 25, passages: ["John 1-3"] },
    { day: 26, passages: ["John 4-6"] },
    { day: 27, passages: ["John 7-9"] },
    { day: 28, passages: ["John 10-12"] },
    { day: 29, passages: ["John 13-15"] },
    { day: 30, passages: ["John 16-18"] },
    { day: 31, passages: ["John 19-21"] },
    { day: 32, passages: ["Acts 1-3"] },
    { day: 33, passages: ["Acts 4-6"] },
    { day: 34, passages: ["Acts 7-9"] },
    { day: 35, passages: ["Acts 10-12"] },
    { day: 36, passages: ["Acts 13-15"] },
    { day: 37, passages: ["Acts 16-18"] },
    { day: 38, passages: ["Acts 19-21"] },
    { day: 39, passages: ["Acts 22-24"] },
    { day: 40, passages: ["Acts 25-28"] },
    { day: 41, passages: ["Romans 1-3"] },
    { day: 42, passages: ["Romans 4-7"] },
    { day: 43, passages: ["Romans 8-10"] },
    { day: 44, passages: ["Romans 11-13"] },
    { day: 45, passages: ["Romans 14-16"] },
    { day: 46, passages: ["1 Corinthians 1-4"] },
    { day: 47, passages: ["1 Corinthians 5-8"] },
    { day: 48, passages: ["1 Corinthians 9-12"] },
    { day: 49, passages: ["1 Corinthians 13-16"] },
    { day: 50, passages: ["2 Corinthians 1-4"] },
    { day: 51, passages: ["2 Corinthians 5-9"] },
    { day: 52, passages: ["2 Corinthians 10-13"] },
    { day: 53, passages: ["Galatians 1-3"] },
    { day: 54, passages: ["Galatians 4-6"] },
    { day: 55, passages: ["Ephesians 1-3"] },
    { day: 56, passages: ["Ephesians 4-6"] },
    { day: 57, passages: ["Philippians 1-2"] },
    { day: 58, passages: ["Philippians 3-4"] },
    { day: 59, passages: ["Colossians 1-2"] },
    { day: 60, passages: ["Colossians 3-4"] },
    { day: 61, passages: ["1 Thessalonians 1-3"] },
    { day: 62, passages: ["1 Thessalonians 4-5", "2 Thessalonians 1"] },
    { day: 63, passages: ["2 Thessalonians 2-3"] },
    { day: 64, passages: ["1 Timothy 1-3"] },
    { day: 65, passages: ["1 Timothy 4-6"] },
    { day: 66, passages: ["2 Timothy 1-2"] },
    { day: 67, passages: ["2 Timothy 3-4", "Titus 1"] },
    { day: 68, passages: ["Titus 2-3", "Philemon 1"] },
    { day: 69, passages: ["Hebrews 1-4"] },
    { day: 70, passages: ["Hebrews 5-8"] },
    { day: 71, passages: ["Hebrews 9-11"] },
    { day: 72, passages: ["Hebrews 12-13"] },
    { day: 73, passages: ["James 1-3"] },
    { day: 74, passages: ["James 4-5"] },
    { day: 75, passages: ["1 Peter 1-2"] },
    { day: 76, passages: ["1 Peter 3-5"] },
    { day: 77, passages: ["2 Peter 1-3"] },
    { day: 78, passages: ["1 John 1-3"] },
    { day: 79, passages: ["1 John 4-5"] },
    { day: 80, passages: ["2 John 1", "3 John 1", "Jude 1"] },
    { day: 81, passages: ["Revelation 1-3"] },
    { day: 82, passages: ["Revelation 4-7"] },
    { day: 83, passages: ["Revelation 8-11"] },
    { day: 84, passages: ["Revelation 12-14"] },
    { day: 85, passages: ["Revelation 15-17"] },
    { day: 86, passages: ["Revelation 18-19"] },
    { day: 87, passages: ["Revelation 20-22"] },
    { day: 88, passages: ["Matthew 1-7"] },
    { day: 89, passages: ["Matthew 8-14"] },
    { day: 90, passages: ["Matthew 15-28"] },
  ],
  "psalms-proverbs": Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    passages: [`Psalm ${(i * 5) + 1}-${(i * 5) + 5}`, `Proverbs ${i + 1}`],
  })),
  "pauls-letters": [
    { day: 1, passages: ["Romans 1-3"] },
    { day: 2, passages: ["Romans 4-6"] },
    { day: 3, passages: ["Romans 7-9"] },
    { day: 4, passages: ["Romans 10-12"] },
    { day: 5, passages: ["Romans 13-16"] },
    { day: 6, passages: ["1 Corinthians 1-4"] },
    { day: 7, passages: ["1 Corinthians 5-8"] },
    { day: 8, passages: ["1 Corinthians 9-12"] },
    { day: 9, passages: ["1 Corinthians 13-16"] },
    { day: 10, passages: ["2 Corinthians 1-5"] },
    { day: 11, passages: ["2 Corinthians 6-10"] },
    { day: 12, passages: ["2 Corinthians 11-13"] },
    { day: 13, passages: ["Galatians 1-3"] },
    { day: 14, passages: ["Galatians 4-6"] },
    { day: 15, passages: ["Ephesians 1-3"] },
    { day: 16, passages: ["Ephesians 4-6"] },
    { day: 17, passages: ["Philippians 1-2"] },
    { day: 18, passages: ["Philippians 3-4"] },
    { day: 19, passages: ["Colossians 1-2"] },
    { day: 20, passages: ["Colossians 3-4"] },
    { day: 21, passages: ["1 Thessalonians 1-3"] },
    { day: 22, passages: ["1 Thessalonians 4-5", "2 Thessalonians 1"] },
    { day: 23, passages: ["2 Thessalonians 2-3"] },
    { day: 24, passages: ["1 Timothy 1-3"] },
    { day: 25, passages: ["1 Timothy 4-6"] },
    { day: 26, passages: ["2 Timothy 1-2"] },
    { day: 27, passages: ["2 Timothy 3-4", "Titus 1"] },
    { day: 28, passages: ["Titus 2-3", "Philemon 1"] },
    { day: 29, passages: ["Hebrews 1-7"] },
    { day: 30, passages: ["Hebrews 8-13"] },
  ],
  "spiritual-foundations": [
    { day: 1, passages: ["John 3:1-21"] },
    { day: 2, passages: ["2 Corinthians 5:17-21"] },
    { day: 3, passages: ["Romans 3:21-26"] },
    { day: 4, passages: ["Galatians 2:15-21"] },
    { day: 5, passages: ["Romans 8:1-17"] },
    { day: 6, passages: ["1 Thessalonians 4:1-12"] },
    { day: 7, passages: ["John 14:15-26"] },
    { day: 8, passages: ["Galatians 5:16-26"] },
    { day: 9, passages: ["Ephesians 2:1-10"] },
    { day: 10, passages: ["Titus 2:11-14"] },
    { day: 11, passages: ["Hebrews 11:1-6"] },
    { day: 12, passages: ["James 2:14-26"] },
    { day: 13, passages: ["Matthew 28:18-20"] },
    { day: 14, passages: ["Romans 6:1-14"] },
    { day: 15, passages: ["1 Corinthians 11:23-34"] },
    { day: 16, passages: ["Luke 22:7-23"] },
    { day: 17, passages: ["Matthew 16:13-20"] },
    { day: 18, passages: ["Ephesians 4:1-16"] },
    { day: 19, passages: ["Matthew 6:5-15"] },
    { day: 20, passages: ["Luke 11:1-13"] },
    { day: 21, passages: ["2 Timothy 3:10-17"] },
    { day: 22, passages: ["Psalm 119:97-112"] },
    { day: 23, passages: ["Matthew 28:16-20"] },
    { day: 24, passages: ["Luke 14:25-35"] },
    { day: 25, passages: ["Romans 12:1-21"] },
    { day: 26, passages: ["1 Peter 4:7-11"] },
    { day: 27, passages: ["Matthew 24:36-44"] },
    { day: 28, passages: ["1 Thessalonians 4:13-18"] },
    { day: 29, passages: ["Revelation 20:11-15"] },
    { day: 30, passages: ["Matthew 25:31-46"] },
    { day: 31, passages: ["Revelation 21-22"] },
    { day: 32, passages: ["1 Corinthians 15:50-58"] },
  ],
  "bible-in-year": Array.from({ length: 365 }, (_, i) => ({
    day: i + 1,
    passages: [`Genesis ${i + 1}`, `Matthew ${Math.floor(i / 3) + 1}`],
  })),
};

// Audio player component with auto-play
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

      if (!response.ok) {
        throw new Error("Failed to load audio");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Auto-play after loading
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error("Auto-play failed:", err);
            setError("Audio loaded. Click play to listen.");
          });
        }
      }, 100);
    } catch (err) {
      console.error("Audio error:", err);
      setError("Could not load audio. Please try again.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("play", () => setPlaying(true));
      audioRef.current.addEventListener("pause", () => setPlaying(false));
      audioRef.current.addEventListener("ended", () => setPlaying(false));
    }
  }, [audioUrl]);

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
        <h4 className="text-white font-semibold text-sm">Listen: {passage}</h4>
        {playing && <span className="text-green-400 text-xs">▶ Playing</span>}
      </div>
      
      {!audioUrl && !loading && !error && (
        <button
          onClick={loadAndPlayAudio}
          className="w-full rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-yellow-400 hover:bg-yellow-400/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Play Audio
        </button>
      )}

      {loading && (
        <div className="flex justify-center items-center py-3 gap-2">
          <div className="animate-spin h-5 w-5 border-2 border-yellow-400 border-t-transparent rounded-full" />
          <span className="text-yellow-400 text-sm">Loading audio...</span>
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm py-2">{error}</div>
      )}
      
      {audioUrl && (
        <div>
          <audio 
            ref={audioRef}
            src={audioUrl} 
            controls 
            className="w-full" 
            controlsList="nodownload"
          />
          <p className="text-slate-400 text-xs mt-2 italic">ESV Audio Bible</p>
        </div>
      )}
    </div>
  );
}

function ReadingPlanContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");
  const [planProgress, setPlanProgress] = useState<PlanProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [passages, setPassages] = useState<Array<{ ref: string; text: string }>>([]);
  const [loadingPassages, setLoadingPassages] = useState(false);

  useEffect(() => {
    if (planId) {
      const savedPlan = localStorage.getItem(`reading-plan-${planId}`);
      if (savedPlan) {
        const plan = JSON.parse(savedPlan);
        setPlanProgress(plan);
        
        const schedule = readingSchedules[planId];
        const todaysReading = schedule?.find(r => r.day === plan.currentDay);
        if (todaysReading) {
          loadPassages(todaysReading.passages);
        }
      }
    }
    setLoading(false);
  }, [planId]);

  const loadPassages = async (refs: string[]) => {
    setLoadingPassages(true);
    try {
      const results = await Promise.all(
        refs.map(async (passage) => {
          const response = await fetch("/api/esv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ passage }),
          });
          const data = await response.json();
          return {
            ref: passage,
            text: data.text || "Passage not found",
          };
        })
      );
      setPassages(results);
    } catch (error) {
      console.error("Error loading passages:", error);
    }
    setLoadingPassages(false);
  };

  const markDayComplete = () => {
    if (!planProgress || !planId) return;

    const schedule = readingSchedules[planId];
    const newDay = planProgress.currentDay + 1;
    const updated = {
      ...planProgress,
      currentDay: Math.min(newDay, planProgress.duration),
      completed: newDay >= planProgress.duration,
    };

    setPlanProgress(updated);
    localStorage.setItem(`reading-plan-${planId}`, JSON.stringify(updated));

    if (!updated.completed) {
      const nextReading = schedule?.find(r => r.day === updated.currentDay);
      if (nextReading) {
        loadPassages(nextReading.passages);
      }
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse bg-slate-800/50 rounded-lg p-6 h-64"></div>
        </div>
      </main>
    );
  }

  if (!planId || !planProgress) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Reading Plans</h1>
          <p className="text-slate-400 mb-6">Choose a structured plan to guide your Bible study</p>
          <Link
            href="/reading-plans"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300"
          >
            Browse Plans →
          </Link>
        </div>
      </main>
    );
  }

  const progressPercent = Math.round((planProgress.currentDay / planProgress.duration) * 100);
  const daysRemaining = planProgress.duration - planProgress.currentDay;

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/reading-plans" className="text-yellow-400 hover:text-yellow-300 text-sm mb-4 inline-flex items-center gap-1">
            ← Back to Plans
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">{planProgress.title}</h1>
          <p className="text-slate-400">Day {planProgress.currentDay} of {planProgress.duration}</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold">Progress</span>
            <span className="text-yellow-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-3 text-sm text-slate-400">
            {daysRemaining > 0 ? `🔥 ${daysRemaining} days remaining` : "🎉 Completed!"}
          </div>
        </div>

        {/* Passages */}
        {loadingPassages ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {passages.map((p, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">{p.ref}</h2>
                
                {/* Audio Player with auto-play */}
                <div className="mb-6">
                  <AudioPlayer passage={p.ref} />
                </div>
                
                {/* Text with verse numbers */}
                <div className="prose prose-invert max-w-none">
                  <div className="text-white/90 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                    {p.text}
                  </div>
                </div>
                
                <Link
                  href={`/deep-study?passage=${encodeURIComponent(p.ref)}`}
                  className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm mt-4"
                >
                  Study in depth →
                </Link>
              </div>
            ))}

            {!planProgress.completed && (
              <button
                onClick={markDayComplete}
                className="w-full rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-4 font-semibold text-green-400 hover:bg-green-400/20 transition-colors text-lg"
              >
                ✓ Mark Day {planProgress.currentDay} Complete
              </button>
            )}

            {planProgress.completed && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-green-400 font-bold text-lg">Congratulations!</p>
                <p className="text-slate-300">You've completed {planProgress.title}!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ReadingPlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-6"><div className="animate-pulse bg-slate-800/50 rounded-lg h-64" /></div>}>
      <ReadingPlanContent />
    </Suspense>
  );
}