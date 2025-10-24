// app/courses/page.tsx
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
    courses.forEach(course => {
      const percent = CourseTracker.getCompletionPercentage(course.id, course.totalSessions);
      progress[course.id] = percent;
    });
    setCourseProgress(progress);
  }, []); // Empty dependency array - only run once on mount

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spiritual-growth': return '🌱';
      case 'relationships': return '🤝';
      case 'difficult-times': return '💪';
      case 'doctrine': return '📖';
      case 'character': return '✨';
      case 'mission': return '🌍';
      default: return '📚';
    }
  };

  const getCategoryName = (category: string) => {
    return category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const groupedCourses = courses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = [];
    }
    acc[course.category].push(course);
    return acc;
  }, {} as Record<string, typeof courses>);

  return (
    <div className="pb-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className={`${playfair.className} text-4xl font-bold mb-3 text-white`}>
          Study Courses
        </h1>
        <p className="text-white/70">
          Structured learning paths to deepen your faith
        </p>
      </div>

      {/* Featured: Spiritual Foundations */}
      <div className="relative group mb-12">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
        <div className="relative card bg-gradient-to-br from-yellow-400/10 to-amber-400/10 border-2 border-yellow-400/30 group-hover:border-yellow-400/50 transition-all">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="text-5xl flex-shrink-0">📖</div>
            <div className="flex-1">
              <div className="text-xs font-bold text-yellow-400 mb-2">⭐ FEATURED COURSE</div>
              <h2 className={`${playfair.className} text-2xl font-bold text-white mb-2`}>
                Spiritual Foundations
              </h2>
              <p className="text-white/80 mb-4 leading-relaxed">
                Build a strong foundation in Christ through 16 essential biblical principles from Pastor Doug Gilford.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/70">📚 16 Lessons</span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/70">👨‍🏫 Pastor Doug Gilford</span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/70">⚡ Foundational</span>
              </div>
              <Link
                href="/courses/spiritual-foundations"
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 text-slate-950 px-6 py-3 font-bold hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
              >
                Start Foundation Course
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Topical Courses Header */}
      <div className="mb-10">
        <h2 className={`${playfair.className} text-3xl font-bold text-white mb-2`}>
          Topical Study Courses
        </h2>
        <p className="text-white/60">
          Deep dives into specific biblical themes and life applications
        </p>
      </div>

      {/* Course Categories */}
      <div className="space-y-12">
        {Object.entries(groupedCourses).map(([category, categoryCourses]) => (
          <div key={category}>
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{getCategoryIcon(category)}</span>
              <h3 className={`${playfair.className} text-2xl font-bold text-white`}>
                {getCategoryName(category)}
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
            </div>

            {/* Single Column Course Cards */}
            <div className="space-y-4">
              {categoryCourses.map((course) => {
                const progress = courseProgress[course.id] || 0;
                const hasStarted = progress > 0;

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="block group relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative card group-hover:border-yellow-400/50 transition-all">
                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <div className="text-4xl flex-shrink-0 w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          {getCategoryIcon(category)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h4 className={`${playfair.className} text-xl font-bold text-white group-hover:text-yellow-400 transition-colors mb-1`}>
                                {course.title}
                              </h4>
                              {course.subtitle && (
                                <p className="text-sm text-white/50">{course.subtitle}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/50 flex-shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {course.totalSessions} sessions
                              <span>•</span>
                              <span className="capitalize">{course.difficulty}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-white/70 mb-4 leading-relaxed">
                            {course.description}
                          </p>

                          {/* Progress or CTA */}
                          {hasStarted ? (
                            <div className="max-w-md">
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
                            <div className="inline-flex items-center gap-2 text-yellow-400 group-hover:gap-3 transition-all">
                              <span className="font-semibold">Begin Course</span>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Back Link */}
      <div className="text-center mt-16">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/60 hover:text-yellow-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}