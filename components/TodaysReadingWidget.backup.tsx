"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ReadingPlan {
  date: string;
  reference: string;
  book: string;
  chapters: string;
}

export default function TodaysReadingWidget() {
  const [todaysReading, setTodaysReading] = useState<ReadingPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTodaysReading = () => {
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const dayOfYear = Math.floor(
        (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
      );

      const readings = [
        { book: "Genesis", chapters: "1-2", reference: "Genesis 1" },
        { book: "Psalm", chapters: "1", reference: "Psalm 1" },
        { book: "Matthew", chapters: "5-7", reference: "Matthew 5" },
        { book: "John", chapters: "3", reference: "John 3" },
        { book: "Romans", chapters: "8", reference: "Romans 8" },
        { book: "Ephesians", chapters: "1-2", reference: "Ephesians 1" },
        { book: "Philippians", chapters: "2", reference: "Philippians 2" }
      ];

      const reading = readings[dayOfYear % readings.length];

      setTodaysReading({
        date: today.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric"
        }),
        reference: reading.reference,
        book: reading.book,
        chapters: reading.chapters
      });
      setLoading(false);
    };

    getTodaysReading();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>
          <div className="h-8 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-yellow-400/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-slate-400 text-sm mb-1">{todaysReading?.date}</p>
          <h3 className="text-yellow-400 font-bold text-lg">Today&apos;s Reading</h3>
        </div>
        <div className="text-2xl">📖</div>
      </div>

      <div className="mb-4">
        <p className="text-white text-2xl font-serif mb-1">
          {todaysReading?.book} {todaysReading?.chapters}
        </p>
      </div>

      <Link
        href={`/deep-study?passage=${encodeURIComponent(
          todaysReading?.reference || ""
        )}`}
        className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors text-sm font-medium"
      >
        Start Studying
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>

      <p className="text-slate-500 text-xs mt-4 italic">
        &quot;Your word is a lamp to my feet and a light to my path.&quot; - Psalm 119:105
      </p>
    </div>
  );
}
