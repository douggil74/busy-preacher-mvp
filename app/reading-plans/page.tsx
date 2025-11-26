// app/reading-plans/page.tsx
"use client";

import { Playfair_Display } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RequireAuth from '@/components/RequireAuth';

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

interface ReadingPlan {
  id: string;
  title: string;
  difficulty: "easy" | "moderate" | "hard";
  duration: number;
  description: string;
  tags: string[];
}

const readingPlans: ReadingPlan[] = [
  {
    id: "bible-in-year",
    title: "Bible in a Year",
    difficulty: "moderate",
    duration: 365,
    description:
      "Read through the entire Bible in 365 days with a mix of Old Testament, New Testament, Psalms, and Proverbs each day.",
    tags: ["Complete Bible", "Popular", "Balanced"],
  },
  {
    id: "nt-90-days",
    title: "New Testament in 90 Days",
    difficulty: "easy",
    duration: 90,
    description:
      "Read the entire New Testament in just 3 months. Perfect for deepening your understanding of Jesus and the early church.",
    tags: ["New Testament", "Quick", "Jesus-focused"],
  },
  {
    id: "gospels-30-days",
    title: "Gospels in 30 Days",
    difficulty: "easy",
    duration: 30,
    description:
      "Focus on the life and teachings of Jesus by reading all four Gospels in one month.",
    tags: ["Gospels", "Jesus", "Quick Start"],
  },
  {
    id: "psalms-proverbs",
    title: "Psalms & Proverbs in a Month",
    difficulty: "easy",
    duration: 31,
    description:
      "Read through Psalms and Proverbs in 31 days. Perfect for daily wisdom and worship.",
    tags: ["Wisdom", "Worship", "Short Readings"],
  },
  {
    id: "pauls-letters",
    title: "Paul's Letters in 30 Days",
    difficulty: "moderate",
    duration: 30,
    description:
      "Study all of Paul's epistles in one month. Dive deep into Christian doctrine and practical living.",
    tags: ["Paul", "Doctrine", "Epistles"],
  },
];

const difficultyColors = {
  easy: { color: "rgb(74, 222, 128)", borderColor: "rgba(74, 222, 128, 0.2)", bg: "rgba(74, 222, 128, 0.1)" },
  moderate: { color: "var(--accent-color)", borderColor: "color-mix(in srgb, var(--accent-color) 20%, transparent)", bg: "color-mix(in srgb, var(--accent-color) 10%, transparent)" },
  hard: { color: "rgb(248, 113, 113)", borderColor: "rgba(248, 113, 113, 0.2)", bg: "rgba(248, 113, 113, 0.1)" },
};

export default function ReadingPlansPage() {
  const router = useRouter();
  const [starting, setStarting] = useState<string | null>(null);

  const handleStartPlan = (plan: ReadingPlan) => {
    setStarting(plan.id);

    const planData = {
      id: plan.id,
      title: plan.title,
      startDate: new Date().toISOString(),
      currentDay: 1,
      duration: plan.duration,
      completed: false,
    };

    localStorage.setItem(`reading-plan-${plan.id}`, JSON.stringify(planData));
    localStorage.setItem("bc-reading-progress", JSON.stringify(planData));

    const activePlans = JSON.parse(localStorage.getItem("active-reading-plans") || "[]");
    if (!activePlans.includes(plan.id)) {
      activePlans.push(plan.id);
      localStorage.setItem("active-reading-plans", JSON.stringify(activePlans));
    }

    setTimeout(() => {
      router.push(`/reading-plan?plan=${plan.id}`);
    }, 300);
  };

  return (
    <RequireAuth>
    <main className="min-h-screen px-4 pb-16 pt-8" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className={`${playfair.className} mb-4 text-4xl font-bold md:text-5xl`} style={{ color: 'var(--text-primary)' }}>
            Reading Plans
          </h1>
          <p className="mx-auto max-w-2xl text-lg" style={{ color: 'var(--text-secondary)' }}>
            Stay consistent in God's Word with structured reading plans designed for busy Christians.
          </p>
        </header>

        {/* Plans Grid - 2 COLUMNS */}
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          {readingPlans.map((plan) => {
            const colors = difficultyColors[plan.difficulty];
            return (
              <div
                key={plan.id}
                className="flex flex-col rounded-2xl p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--card-border)'
                }}
              >
                {/* Header */}
                <div className="mb-5">
                  <h3 className={`${playfair.className} mb-3 text-2xl font-bold`} style={{ color: 'var(--text-primary)' }}>
                    {plan.title}
                  </h3>

                  {/* Badges */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                      style={{
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: colors.borderColor,
                        backgroundColor: colors.bg,
                        color: colors.color
                      }}
                    >
                      {plan.difficulty}
                    </span>
                    <span 
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--card-border)',
                        backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {plan.duration} days
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-primary)', opacity: 0.8 }}>
                    {plan.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {plan.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md px-2 py-1 text-xs"
                        style={{
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: 'var(--card-border)',
                          backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={() => handleStartPlan(plan)}
                  disabled={starting === plan.id}
                  className="mt-auto rounded-lg px-4 py-3 font-semibold transition-colors disabled:cursor-wait disabled:opacity-50"
                  style={{
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--accent-color)',
                    backgroundColor: 'color-mix(in srgb, var(--accent-color) 20%, transparent)',
                    color: 'var(--accent-color)'
                  }}
                >
                  {starting === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Starting...
                    </span>
                  ) : (
                    "Start Plan"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div 
          className="rounded-2xl p-8 backdrop-blur"
          style={{
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(59, 130, 246, 0.2)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }}
        >
          <h3 className={`${playfair.className} mb-6 text-2xl font-bold`} style={{ color: 'var(--text-primary)' }}>
            How Reading Plans Work
          </h3>
          <ul className="space-y-3" style={{ color: 'var(--text-primary)', opacity: 0.8 }}>
            <li className="flex gap-3">
              <span style={{ color: 'var(--accent-color)' }}>•</span>
              <span>Choose a plan and start reading today</span>
            </li>
            <li className="flex gap-3">
              <span style={{ color: 'var(--accent-color)' }}>•</span>
              <span>Check off each day's reading as you complete it</span>
            </li>
            <li className="flex gap-3">
              <span style={{ color: 'var(--accent-color)' }}>•</span>
              <span>Track your progress and build reading streaks</span>
            </li>
            <li className="flex gap-3">
              <span style={{ color: 'var(--accent-color)' }}>•</span>
              <span>
                Click any passage to study it in depth with AI commentary and insights
              </span>
            </li>
            <li className="flex gap-3">
              <span style={{ color: 'var(--accent-color)' }}>•</span>
              <span>All progress is saved locally on your device</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
    </RequireAuth>
  );
}