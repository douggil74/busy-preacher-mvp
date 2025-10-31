"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ReadingProgress {
  planId: string;
  planName: string;
  currentDay: number;
  totalDays: number;
  lastRead: string;
  hidden?: boolean;
}

export default function TodaysReadingWidget() {
  const router = useRouter();
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bc-reading-progress");
      const hidden = localStorage.getItem("bc-reading-hidden") === "true";

      if (hidden) {
        setProgress({
          planId: "",
          planName: "",
          currentDay: 0,
          totalDays: 0,
          lastRead: "",
          hidden: true,
        });
        setLoading(false);
        return;
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        setProgress(parsed);
      }
    } catch (error) {
      console.error("Error loading reading progress:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleHide = () => {
    localStorage.setItem("bc-reading-hidden", "true");
    setProgress(prev =>
      prev
        ? { ...prev, hidden: true }
        : { planId: "", planName: "", currentDay: 0, totalDays: 0, lastRead: "", hidden: true }
    );
  };

  const handleShowAgain = () => {
    localStorage.removeItem("bc-reading-hidden");
    setProgress(prev => (prev ? { ...prev, hidden: false } : null));
  };

  const handleStartPlan = () => {
    router.push("/reading-plans"); // ✅ fixed route
  };

  const handleContinue = () => {
    if (progress?.planId) {
      router.push(`/reading-plan?plan=${progress.planId}`); // ✅ correct plan redirect
    } else {
      router.push("/reading-plans");
    }
  };

  if (loading) return null;

  // 🧩 Handle when widget is hidden
  if (progress?.hidden) {
    return (
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
        <p className="text-slate-400 text-sm mb-3">Reading widget hidden</p>
        <button
          onClick={handleShowAgain}
          className="rounded-2xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-xs text-yellow-400 hover:bg-yellow-400/20 transition-all"
        >
          Show Again
        </button>
      </div>
    );
  }

  const hasPlan = !!progress?.planName;

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-yellow-400/30 transition-all shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-yellow-400 font-bold text-lg mb-1">
            {hasPlan ? "Continue Your Reading Plan" : "Start a Reading Plan"}
          </h3>
          <p className="text-slate-400 text-sm">
            {hasPlan
              ? `Last read: ${new Date(progress!.lastRead).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`
              : "Stay consistent with your spiritual growth"}
          </p>
        </div>
        <div className="text-2xl">📖</div>
      </div>

      {hasPlan ? (
        <>
          <p className="text-white font-medium mb-2">{progress!.planName}</p>

          <div className="w-full bg-slate-700/50 rounded-full h-2 mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 to-amber-400 h-2 rounded-full transition-all"
              style={{
                width: `${(progress!.currentDay / progress!.totalDays) * 100}%`,
              }}
            />
          </div>

          <p className="text-slate-400 text-xs mb-4">
            Day {progress!.currentDay} of {progress!.totalDays}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleContinue}
              className="flex-1 rounded-2xl border-2 border-yellow-400 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-400 hover:bg-yellow-400/20 transition-all"
            >
              Continue Reading
            </button>
            <button
              onClick={handleHide}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 hover:bg-white/10 transition-all"
            >
              Hide
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/80 text-sm">
            Choose a reading plan to begin your journey.
          </p>
          <button
            onClick={handleStartPlan}
            className="rounded-2xl border-2 border-yellow-400 bg-yellow-400/10 px-5 py-2 text-sm font-semibold text-yellow-400 hover:bg-yellow-400/20 transition-all"
          >
            + Start a Plan
          </button>
        </div>
      )}
    </div>
  );
}
