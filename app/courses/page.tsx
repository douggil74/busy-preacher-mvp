"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { getAllCourses } from "@/lib/courseDatabase";
import { CourseTracker } from "@/lib/courseTracker";
import { useEffect, useState, useMemo } from "react";
import { typography, cn } from '@/lib/ui-constants';
import { PastorNote } from '@/components/PastorNote';
import RequireAuth from '@/components/RequireAuth';
// import { Paywall } from '@/components/Paywall'; // Paused

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Category definitions with icons and labels
const CATEGORIES = {
  'all': { icon: '📚', label: 'All Courses' },
  'spiritual-growth': { icon: '🌱', label: 'Spiritual Growth' },
  'doctrine': { icon: '📖', label: 'Bible & Doctrine' },
  'character': { icon: '✨', label: 'Character' },
  'relationships': { icon: '🤝', label: 'Relationships' },
  'difficult-times': { icon: '💪', label: 'Difficult Times' },
  'mission': { icon: '🌍', label: 'Mission' },
};

export default function CoursesPage() {
  const courses = useMemo(() => getAllCourses(), []);
  const [courseProgress, setCourseProgress] = useState<{ [key: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showInProgress, setShowInProgress] = useState(false);

  useEffect(() => {
    const progress: { [key: string]: number } = {};
    courses.forEach((course) => {
      const percent = CourseTracker.getCompletionPercentage(course.id, course.totalSessions);
      progress[course.id] = percent;
    });
    setCourseProgress(progress);
  }, [courses]);

  // Filter courses based on selected category and progress
  const filteredCourses = useMemo(() => {
    let result = courses;

    if (selectedCategory !== 'all') {
      result = result.filter(course => course.category === selectedCategory);
    }

    if (showInProgress) {
      result = result.filter(course => {
        const progress = courseProgress[course.id] || 0;
        return progress > 0 && progress < 100;
      });
    }

    return result;
  }, [courses, selectedCategory, showInProgress, courseProgress]);

  // Get unique categories from courses
  const availableCategories = useMemo(() => {
    const cats = new Set(courses.map(c => c.category));
    return ['all', ...Array.from(cats)];
  }, [courses]);

  // Count courses in progress
  const inProgressCount = useMemo(() => {
    return courses.filter(course => {
      const progress = courseProgress[course.id] || 0;
      return progress > 0 && progress < 100;
    }).length;
  }, [courses, courseProgress]);

  const getCategoryIcon = (category: string) => {
    return CATEGORIES[category as keyof typeof CATEGORIES]?.icon || '📚';
  };

  const getCategoryName = (category: string) => {
    return CATEGORIES[category as keyof typeof CATEGORIES]?.label ||
      category.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <RequireAuth>
    <div className="min-h-screen text-slate-900 dark:text-white" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
        {/* PAGE HEADER */}
        <div className="text-center sm:text-left mb-8">
          <h1 className={cn(playfair.className, typography.h1, 'mb-4')} style={{ color: 'var(--text-primary)' }}>
            Study Courses
          </h1>
          <div className="h-[2px] w-24 bg-gradient-to-r from-yellow-400 to-amber-400 mx-auto sm:mx-0 mb-4"></div>
          <p className={cn(typography.bodyLarge, 'italic mb-6')} style={{ color: 'var(--text-secondary)' }}>
            {courses.length} courses to deepen your faith - pick one that speaks to where you are right now
          </p>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {availableCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = cat === 'all'
                ? courses.length
                : courses.filter(c => c.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    flex items-center gap-2
                    ${isSelected
                      ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/30'
                      : 'hover:bg-white/10'
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? undefined : 'var(--card-bg)',
                    border: `1px solid ${isSelected ? 'transparent' : 'var(--card-border)'}`,
                    color: isSelected ? undefined : 'var(--text-primary)',
                  }}
                >
                  <span>{getCategoryIcon(cat)}</span>
                  <span>{getCategoryName(cat)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-slate-900/20' : 'bg-white/10'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* In Progress Toggle */}
          {inProgressCount > 0 && (
            <button
              onClick={() => setShowInProgress(!showInProgress)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                flex items-center gap-2
              `}
              style={{
                backgroundColor: showInProgress ? 'rgba(234, 179, 8, 0.2)' : 'var(--card-bg)',
                border: `1px solid ${showInProgress ? 'rgba(234, 179, 8, 0.5)' : 'var(--card-border)'}`,
                color: showInProgress ? '#eab308' : 'var(--text-secondary)',
              }}
            >
              <span>📝</span>
              <span>In Progress</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-400/20">
                {inProgressCount}
              </span>
            </button>
          )}
        </div>

        {/* COURSE COUNT */}
        <div className="mb-6">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
            {selectedCategory !== 'all' && ` in ${getCategoryName(selectedCategory)}`}
            {showInProgress && ' (in progress)'}
          </p>
        </div>

        {/* COURSE GRID */}
        {filteredCourses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const progress = courseProgress[course.id] || 0;
              const hasStarted = progress > 0;
              const isComplete = progress === 100;

              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="relative group rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  {/* Completion Badge */}
                  {isComplete && (
                    <div className="absolute top-3 right-3 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      ✓ Complete
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Category & Difficulty */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{getCategoryIcon(course.category)}</span>
                      <span
                        className="text-xs px-2 py-1 rounded-full capitalize"
                        style={{
                          backgroundColor: course.difficulty === 'beginner' ? 'rgba(34, 197, 94, 0.2)' :
                                          course.difficulty === 'intermediate' ? 'rgba(234, 179, 8, 0.2)' :
                                          'rgba(239, 68, 68, 0.2)',
                          color: course.difficulty === 'beginner' ? '#22c55e' :
                                 course.difficulty === 'intermediate' ? '#eab308' :
                                 '#ef4444',
                        }}
                      >
                        {course.difficulty}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <h3
                      className={`${playfair.className} text-lg font-bold mb-1 group-hover:text-yellow-400 transition-colors line-clamp-2`}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {course.title}
                    </h3>
                    {course.subtitle && (
                      <p className="text-xs mb-2 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                        {course.subtitle}
                      </p>
                    )}

                    {/* Description */}
                    <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {course.description}
                    </p>

                    {/* Sessions Count */}
                    <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                      <span>📘 {course.totalSessions} sessions</span>
                      <span>•</span>
                      <span>~{Math.round(course.lessons.reduce((acc, l) => acc + l.estimatedMinutes, 0) / 60)}h total</span>
                    </div>

                    {/* Progress or CTA */}
                    {hasStarted ? (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {isComplete ? 'Completed' : 'In Progress'}
                          </span>
                          <span className="text-yellow-400 font-bold">{progress}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-border)' }}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-yellow-400 to-orange-400'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-yellow-400 font-semibold group-hover:gap-3 transition-all text-sm">
                        <span>Start Course</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <p className="text-lg mb-2" style={{ color: 'var(--text-primary)' }}>No courses found</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {showInProgress
                ? "You haven't started any courses yet. Pick one above to begin!"
                : "Try selecting a different category."}
            </p>
            {(selectedCategory !== 'all' || showInProgress) && (
              <button
                onClick={() => { setSelectedCategory('all'); setShowInProgress(false); }}
                className="mt-4 px-4 py-2 rounded-full text-sm font-medium bg-yellow-400 text-slate-900"
              >
                Show All Courses
              </button>
            )}
          </div>
        )}

        {/* PASTOR NOTE */}
        <div className="mt-12 max-w-2xl mx-auto sm:mx-0">
          <PastorNote />
        </div>

        {/* BACK LINK */}
        <div className="text-center mt-12">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 transition-colors hover:text-yellow-400"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
