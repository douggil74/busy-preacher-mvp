"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { getAllCourses } from "@/lib/courseDatabase";
import { CourseTracker } from "@/lib/courseTracker";
import { useEffect, useState, useMemo } from "react";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function CoursesPage() {
  const courses = useMemo(() => getAllCourses(), []);
  const [courseProgress, setCourseProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const progress: { [key: string]: number } = {};
    courses.forEach((course) => {
      const percent = CourseTracker.getCompletionPercentage(course.id, course.totalSessions);
      progress[course.id] = percent;
    });
    setCourseProgress(progress);
  }, [courses]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "spiritual-growth": return "🌱";
      case "relationships": return "🤝";
      case "difficult-times": return "💪";
      case "doctrine": return "📖";
      case "character": return "✨";
      case "mission": return "🌍";
      default: return "📚";
    }
  };

  const getCategoryName = (category: string) =>
    category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const groupedCourses = courses.reduce((acc, course) => {
    if (!acc[course.category]) acc[course.category] = [];
    acc[course.category].push(course);
    return acc;
  }, {} as Record<string, typeof courses>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* PAGE HEADER */}
        <div className="text-center sm:text-left mb-16">
          <h1
            className={`${playfair.className} text-5xl sm:text-6xl font-bold mb-4 text-white tracking-tight`}
          >
            Study Courses
          </h1>
          <div className="h-[2px] w-24 bg-gradient-to-r from-yellow-400 to-amber-400 mx-auto sm:mx-0 mb-4"></div>
          <p className="text-white/70 text-lg italic">
            Structured learning paths to deepen your faith
          </p>
        </div>

        {/* COURSE CATEGORIES */}
        <div className="space-y-16">
          {Object.entries(groupedCourses).map(([category, categoryCourses]) => (
            <div key={category}>
              {/* CATEGORY HEADER */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl">{getCategoryIcon(category)}</span>
                <h2
                  className={`${playfair.className} text-3xl sm:text-4xl font-bold text-white`}
                >
                  {getCategoryName(category)}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
              </div>

              {/* COURSE CARDS */}
              <div className="grid sm:grid-cols-2 gap-6">
                {categoryCourses.map((course) => {
                  const progress = courseProgress[course.id] || 0;
                  const hasStarted = progress > 0;

                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="relative group rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm hover:border-yellow-400/40 transition-all duration-300 shadow-lg"
                    >
                      {/* Glow Border on Hover */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition duration-500 blur-md" />

                      {/* Inner Content */}
                      <div className="relative p-6">
                        <div className="flex items-start gap-5 mb-4">
                          <div className="text-4xl flex-shrink-0 w-14 h-14 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                            {getCategoryIcon(category)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              className={`${playfair.className} text-xl font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors`}
                            >
                              {course.title}
                            </h3>
                            {course.subtitle && (
                              <p className="text-sm text-white/50">{course.subtitle}</p>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-white/70 leading-relaxed mb-4">
                          {course.description}
                        </p>

                        {/* Course Meta */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 mb-4">
                          <span>📘 {course.totalSessions} sessions</span>
                          <span>•</span>
                          <span className="capitalize">{course.difficulty}</span>
                        </div>

                        {/* Progress or CTA */}
                        {hasStarted ? (
                          <div>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-white/60 font-medium">In Progress</span>
                              <span className="text-yellow-400 font-bold">{progress}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 text-yellow-400 font-semibold group-hover:gap-3 transition-all">
                            <span>Begin Course</span>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* BACK LINK */}
        <div className="text-center mt-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-yellow-400 transition-colors"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
