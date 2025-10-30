// app/reading-plans/page.tsx
"use client";

import { Playfair_Display } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
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
  {
    id: "spiritual-foundations",
    title: "Spiritual Foundations (16 Lessons)",
    difficulty: "moderate",
    duration: 32,
    description:
      "Complete the Cornerstone Church Spiritual Foundations course with daily Bible readings aligned to each lesson.",
    tags: ["Course", "Foundations", "Cornerstone"],
  },
];

const difficultyColors = {
  easy: "text-green-400 border-green-400/20 bg-green-400/10",
  moderate: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",
  hard: "text-red-400 border-red-400/20 bg-red-400/10",
};

export default function ReadingPlansPage() {
  const router = useRouter();
  const [starting, setStarting] = useState<string | null>(null);

  const handleStartPlan = (plan: ReadingPlan) => {
    setStarting(plan.id);

    // Save the plan to localStorage
    const planData = {
      id: plan.id,
      title: plan.title,
      startDate: new Date().toISOString(),
      currentDay: 1,
      duration: plan.duration,
      completed: false,
    };

    // Store in localStorage
    localStorage.setItem(`reading-plan-${plan.id}`, JSON.stringify(planData));

    // Also add to active plans list
    const activePlans = JSON.parse(
      localStorage.getItem("active-reading-plans") || "[]"
    );
    if (!activePlans.includes(plan.id)) {
      activePlans.push(plan.id);
      localStorage.setItem("active-reading-plans", JSON.stringify(activePlans));
    }

    // Navigate to the plan tracker after a brief moment
    setTimeout(() => {
      // For now, go to /reading-plan with the plan ID
      // We'll create a dedicated tracker page next
      router.push(`/reading-plan?plan=${plan.id}`);
    }, 300);
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="container max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1
            className={`${playfair.className} text-4xl md:text-5xl font-bold text-white mb-4`}
          >
            Reading Plans
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Stay consistent in God's Word with structured reading plans designed
            for busy Christians.
          </p>
        </header>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {readingPlans.map((plan) => (
            <div
              key={plan.id}
              className="card hover:border-[#FFD966]/20 transition-all"
            >
              {/* Card Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <h3
                    className={`${playfair.className} text-xl font-bold text-white`}
                  >
                    {plan.title}
                  </h3>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                      difficultyColors[plan.difficulty]
                    }`}
                  >
                    {plan.difficulty}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-white/70">
                    {plan.duration} days
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                {plan.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {plan.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/60 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Start Button */}
              <button
                onClick={() => handleStartPlan(plan)}
                disabled={starting === plan.id}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
              >
                {starting === plan.id ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Starting...
                  </>
                ) : (
                  "Start Plan"
                )}
              </button>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="card mt-12 bg-blue-500/10 border-blue-500/20">
          <h3
            className={`${playfair.className} text-xl font-bold text-white mb-3`}
          >
            How Reading Plans Work
          </h3>
          <ul className="space-y-2 text-white/80">
            <li className="flex gap-3">
              <span className="text-[#FFD966]">•</span>
              <span>Choose a plan and start reading today</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FFD966]">•</span>
              <span>Check off each day's reading as you complete it</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FFD966]">•</span>
              <span>Track your progress and build reading streaks</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FFD966]">•</span>
              <span>
                Click any passage to study it in depth with commentaries and
                word studies
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FFD966]">•</span>
              <span>All progress is saved locally on your device</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}