// lib/courseTracker.ts
import { CourseProgress } from './courseTypes';

const STORAGE_KEY = 'bc-course-progress';

export class CourseTracker {
  // Get all course progress
  static getAllProgress(): CourseProgress[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  // Get progress for a specific course
  static getCourseProgress(courseId: string): CourseProgress | null {
    const allProgress = this.getAllProgress();
    return allProgress.find(p => p.courseId === courseId) || null;
  }

  // Start a new course
  static startCourse(courseId: string): void {
    const allProgress = this.getAllProgress();
    const existing = allProgress.find(p => p.courseId === courseId);
    
    if (!existing) {
      const newProgress: CourseProgress = {
        courseId,
        startedAt: Date.now(),
        lastAccessedAt: Date.now(),
        completedLessons: [],
        notes: ''
      };
      allProgress.push(newProgress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    } else {
      // Update last accessed
      existing.lastAccessedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    }
  }

  // Mark a lesson as complete
  static completeLesson(courseId: string, lessonNumber: number): void {
    const allProgress = this.getAllProgress();
    const courseProgress = allProgress.find(p => p.courseId === courseId);
    
    if (courseProgress) {
      if (!courseProgress.completedLessons.includes(lessonNumber)) {
        courseProgress.completedLessons.push(lessonNumber);
        courseProgress.completedLessons.sort((a, b) => a - b);
      }
      courseProgress.lastAccessedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    }
  }

  // Save notes for a course
  static saveNotes(courseId: string, notes: string): void {
    const allProgress = this.getAllProgress();
    const courseProgress = allProgress.find(p => p.courseId === courseId);
    
    if (courseProgress) {
      courseProgress.notes = notes;
      courseProgress.lastAccessedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    }
  }

  // Check if a course is started
  static isCourseStarted(courseId: string): boolean {
    return this.getCourseProgress(courseId) !== null;
  }

  // Get completion percentage
  static getCompletionPercentage(courseId: string, totalLessons: number): number {
    const progress = this.getCourseProgress(courseId);
    if (!progress || totalLessons === 0) return 0;
    return Math.round((progress.completedLessons.length / totalLessons) * 100);
  }

  // Get all courses in progress
  static getCoursesInProgress(): CourseProgress[] {
    return this.getAllProgress().filter(p => p.completedLessons.length > 0);
  }

  // Track when user views a course recommendation
  static trackCourseView(courseId: string, passageRef: string): void {
    // This integrates with your existing progressTracker
    if (typeof window !== 'undefined') {
      const event = {
        type: 'course_viewed',
        courseId,
        passageRef,
        timestamp: Date.now()
      };
      
      // Store in analytics
      const key = 'bc-course-analytics';
      const stored = localStorage.getItem(key);
      const analytics = stored ? JSON.parse(stored) : [];
      analytics.push(event);
      
      // Keep last 100 events
      if (analytics.length > 100) analytics.shift();
      localStorage.setItem(key, JSON.stringify(analytics));
    }
  }

  // Track when user clicks to start a course
  static trackCourseStart(courseId: string, source: 'passage-lookup' | 'theme-search' | 'browse'): void {
    if (typeof window !== 'undefined') {
      const event = {
        type: 'course_started',
        courseId,
        source,
        timestamp: Date.now()
      };
      
      const key = 'bc-course-analytics';
      const stored = localStorage.getItem(key);
      const analytics = stored ? JSON.parse(stored) : [];
      analytics.push(event);
      
      if (analytics.length > 100) analytics.shift();
      localStorage.setItem(key, JSON.stringify(analytics));
    }
  }// Add these methods to the CourseTracker class

static saveStudentName(courseId: string, name: string): void {
  const allProgress = this.getAllProgress();
  const courseProgress = allProgress.find(p => p.courseId === courseId);
  
  if (courseProgress) {
    courseProgress.studentName = name;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  }
}

static markCertificateDownloaded(courseId: string): void {
  const allProgress = this.getAllProgress();
  const courseProgress = allProgress.find(p => p.courseId === courseId);
  
  if (courseProgress) {
    courseProgress.certificateDownloaded = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  }
}
}