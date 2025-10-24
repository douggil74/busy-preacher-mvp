// lib/courseTypes.ts

export interface LessonContent {
  introduction: string;
  sections: Section[];
  keyTakeaways: string[];
  reflectionQuestions: string[];
}

export interface Section {
  title: string;
  content?: string;
  scripture?: string;
  subsections?: Subsection[];
  points?: string[];
  warning?: string;
  practicalSteps?: string[];
  majorAreas?: string[];
  howToResist?: string[];
  howToOvercome?: string[];
  howItWorks?: string;
  threeAreas?: string[];
  threeWalls?: ThreeWall[];
}

export interface Subsection {
  title: string;
  content: string;
  scripture?: string;
}

export interface ThreeWall {
  title: string;
  content: string;
}

export interface Lesson {
  number: number;
  title: string;
  keyPassages: string[];
  questions: string[];
  application: string;
  estimatedMinutes: number;
  content?: LessonContent; // Optional detailed teaching content
}
// lib/courseTypes.ts

// Add this new interface at the top or bottom of the file:
export interface CourseProgress {
  courseId: string;
  startedAt: number;
  lastAccessedAt: number;
  completedLessons: number[];
  notes: string;
}

// ... rest of your existing code (LessonContent, Section, etc.)

export interface TopicalCourse {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  description: string;
  coveragePassages: string[];
  themes: string[];
  lessons: Lesson[];
  totalSessions: number;
  source: string;
  sourceUrl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
export interface CourseProgress {
  courseId: string;
  startedAt: number;
  lastAccessedAt: number;
  completedLessons: number[];
  notes: string;
  studentName?: string; // Add this
  certificateDownloaded?: boolean; // Add this
}