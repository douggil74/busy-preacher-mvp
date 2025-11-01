// app/components/RelatedCoursesPanel.tsx
"use client";

import { useState, useEffect } from 'react';
import { TopicalCourse } from '@/lib/courseTypes';
import { findCoursesForPassage, findCoursesByTheme } from '@/lib/courseDatabase';
import { CourseTracker } from '@/lib/courseTracker';
import Link from 'next/link';

interface RelatedCoursesPanelProps {
  passageRef?: string;
  theme?: string;
  onCourseClick?: (courseId: string) => void;
}

export function RelatedCoursesPanel({ passageRef, theme, onCourseClick }: RelatedCoursesPanelProps) {
  const [courses, setCourses] = useState<TopicalCourse[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Find relevant courses based on passage or theme
    let foundCourses: TopicalCourse[] = [];
    
    if (passageRef) {
      foundCourses = findCoursesForPassage(passageRef);
    }
    
    if (theme && foundCourses.length === 0) {
      foundCourses = findCoursesByTheme(theme);
    }

    setCourses(foundCourses);

    // Track that we showed these recommendations
    if (foundCourses.length > 0 && passageRef) {
      foundCourses.forEach(course => {
        CourseTracker.trackCourseView(course.id, passageRef);
      });
    }
  }, [passageRef, theme]);

  if (courses.length === 0) {
    return null;
  }

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-orange-400';
      default: return 'text-white/60';
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">📚</div>
          <div>
            <h3 className="text-lg font-semibold text-blue-300">Study Even Deeper</h3>
            <p className="text-sm text-white/70">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'} related to{' '}
              {passageRef ? `"${passageRef}"` : `"${theme}"`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg 
            className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {courses.map((course) => {
            const progress = CourseTracker.getCourseProgress(course.id);
            const completionPercentage = CourseTracker.getCompletionPercentage(
              course.id, 
              course.totalSessions
            );
            const isStarted = progress !== null;

            return (
              <div 
                key={course.id}
                className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getCategoryIcon(course.category)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{course.title}</h4>
                        {course.subtitle && (
                          <p className="text-sm text-white/60">{course.subtitle}</p>
                        )}
                      </div>
                      <span className={`text-xs uppercase tracking-wide ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>

                    <p className="text-sm text-white/70 mb-3">{course.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs text-white/60">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {course.totalSessions} sessions
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-white/60">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {course.coveragePassages.length} passages
                      </span>
                    </div>

                    {isStarted && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                          <span>Progress</span>
                          <span>{completionPercentage}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-400 transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/courses/${course.id}`}
                        onClick={() => {
                          CourseTracker.trackCourseStart(course.id, passageRef ? 'passage-lookup' : 'theme-search');
                          if (onCourseClick) onCourseClick(course.id);
                        }}
                        className="flex-1 rounded-lg bg-blue-400/20 border border-blue-400 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-400/30 transition-colors text-center"
                      >
                        {isStarted ? 'Continue Course' : 'Start Course'}
                      </Link>
                      {course.sourceUrl && (
                        <a
                          href={course.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/10 transition-colors"
                          title="View original source"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Click to view courses →
        </button>
      )}
    </div>
  );
}