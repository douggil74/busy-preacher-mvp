"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getCourseById } from '@/lib/courseDatabase';
import { CourseTracker } from '@/lib/courseTracker';
import { TopicalCourse } from '@/lib/courseTypes';

// Lazy load heavy dependencies for better performance
// jsPDF is imported dynamically in exportAnsweredQuestions() function
const CertificateButton = dynamic(() => import('@/components/CertificateButton'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-10 w-48 rounded"></div>,
  ssr: false
});

async function esvFetch(passage: string) {
  const res = await fetch("/api/esv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passage }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch ESV.");
  return data as { passage: string; text: string };
}

async function lexplainFetch(surface: string, book?: string) {
  const res = await fetch("/api/lexplain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ surface, book }),
  });
  const data = await res.json();
  return (res.ok ? data : { lemma: "—", strongs: "—", plain: data?.error || "No explanation." }) as {
    lemma: string;
    strongs: string;
    plain: string;
  };
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {});
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<TopicalCourse | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number>(1);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  
  // 📱 Mobile lesson selector state
  const [showMobileLessons, setShowMobileLessons] = useState(false);
  
  // 📝 Q&A state
  const [questionAnswers, setQuestionAnswers] = useState<{[lessonNumber: number]: {[questionIndex: number]: string}}>({});
  const [expandedQuestions, setExpandedQuestions] = useState<{[key: string]: boolean}>({});
  
  // ESV Section State
  const [bpRef, setBpRef] = useState("");
  const [bpText, setBpText] = useState("");
  const [bpError, setBpError] = useState<string | null>(null);
  const [esvLoading, setEsvLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Passage Preview Hover State
  const [previewPassage, setPreviewPassage] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);
  const previewTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Hover/Lexicon State
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<{ lemma: string; strongs: string; plain: string } | null>(null);
  const [popoverPinned, setPopoverPinned] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverLoading, setHoverLoading] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const foundCourse = getCourseById(courseId);
    if (!foundCourse) {
      router.push('/courses');
      return;
    }
    
    setCourse(foundCourse);
    
    if (!CourseTracker.isCourseStarted(courseId)) {
      CourseTracker.startCourse(courseId);
    }
    
    const progress = CourseTracker.getCourseProgress(courseId);
    if (progress) {
      setCompletedLessons(progress.completedLessons);
      setNotes(progress.notes);
    }
  }, [courseId, router]);

  // Load saved Q&A answers
  useEffect(() => {
    if (!courseId) return;
    
    const savedAnswers = localStorage.getItem(`bc-course-${courseId}-answers`);
    if (savedAnswers) {
      try {
        setQuestionAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error('Failed to load answers:', e);
      }
    }
  }, [courseId]);

  const tokens = useMemo(() => {
    if (!bpText) return [];
    const rough = bpText.split(/(\s+)/);
    return rough.flatMap((t) => t.split(/(\b)/));
  }, [bpText]);

  if (!course) {
    return (
      <div className="container py-20 text-center">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-white/60">Loading course...</p>
      </div>
    );
  }

  const currentLesson = course.lessons.find(l => l.number === selectedLesson);
  const completionPercentage = CourseTracker.getCompletionPercentage(courseId, course.totalSessions);

  const handleLessonComplete = () => {
    CourseTracker.completeLesson(courseId, selectedLesson);
    setCompletedLessons(prev => {
      if (!prev.includes(selectedLesson)) {
        return [...prev, selectedLesson].sort((a, b) => a - b);
      }
      return prev;
    });

    if (selectedLesson < course.lessons.length) {
      setSelectedLesson(selectedLesson + 1);
    }
  };

  const handleSaveNotes = () => {
    CourseTracker.saveNotes(courseId, notes);
    alert('Notes saved!');
  };

  const handleSaveAnswer = (lessonNumber: number, questionIndex: number, answer: string) => {
    const updated = {
      ...questionAnswers,
      [lessonNumber]: {
        ...(questionAnswers[lessonNumber] || {}),
        [questionIndex]: answer
      }
    };
    
    setQuestionAnswers(updated);
    localStorage.setItem(`bc-course-${courseId}-answers`, JSON.stringify(updated));
  };

  const toggleQuestion = (lessonNumber: number, questionIndex: number) => {
    const key = `${lessonNumber}-${questionIndex}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const exportAnsweredQuestions = async () => {
    // Dynamically import jsPDF only when needed
    const { default: jsPDFModule } = await import('jspdf');
    const doc = new jsPDFModule({ unit: "pt", format: "letter" });
    const margin = 56;
    const width = 612 - margin * 2;
    let y = margin;

    const write = (text: string, opts?: { bold?: boolean; italic?: boolean; size?: number }) => {
      const size = opts?.size ?? 12;
      const font = opts?.bold ? "Bold" : opts?.italic ? "Italic" : "Normal";
      doc.setFont("Times", font as any);
      doc.setFontSize(size);
      const lines = wrap(text, width);
      lines.forEach((ln) => {
        if (y > 742 - 64) {
          doc.addPage();
          y = margin;
        }
        doc.text(ln, margin, y);
        y += size + 4;
      });
    };

    const wrap = (text: string, maxWidth: number) => {
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let line = "";
      const measure = (t: string) => doc.getTextWidth(t);
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (measure(test) > maxWidth) {
          if (line) lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    // Title
    write(`${course.title} - Study Questions & Answers`, { bold: true, size: 18 });
    y += 10;
    write(new Date().toLocaleDateString(), { italic: true, size: 10 });
    y += 15;

    // Count answered questions
    let totalAnswered = 0;
    Object.values(questionAnswers).forEach(lessonAnswers => {
      Object.values(lessonAnswers).forEach(answer => {
        if (answer && answer.trim()) totalAnswered++;
      });
    });

    write(`Total Questions Answered: ${totalAnswered}`, { size: 12 });
    y += 20;

    // Export each lesson's Q&A
    course.lessons.forEach((lesson) => {
      const lessonAnswers = questionAnswers[lesson.number] || {};
      const hasAnswers = Object.values(lessonAnswers).some(a => a && a.trim());
      
      if (!hasAnswers) return;

      write(`Lesson ${lesson.number}: ${lesson.title}`, { bold: true, size: 14 });
      y += 6;

      lesson.questions.forEach((question, idx) => {
        const answer = lessonAnswers[idx];
        if (!answer || !answer.trim()) return;

        write(`Q${idx + 1}: ${question}`, { bold: true, size: 11 });
        y += 4;
        write(`Answer: ${answer}`, { size: 11 });
        y += 12;
      });

      y += 10;
    });

    // Footer
    y += 10;
    write('Generated by The Busy Christian', { italic: true, size: 9 });

    // Save
    const fileName = `${course.title.replace(/[^\w\s]/g, '').replace(/\s+/g, '_')}_Study_Answers.pdf`;
    doc.save(fileName);
  };

  const handlePassageClick = (passage: string) => {
    setBpRef(passage);
    setEsvLoading(true);
    esvFetch(passage)
      .then((r) => {
        setBpText(r.text);
        setBpError(null);
        document.getElementById("passage-study")?.scrollIntoView({ behavior: "smooth" });
      })
      .catch((e) => setBpError(e?.message ?? "Failed to fetch ESV."))
      .finally(() => setEsvLoading(false));
  };

  const handlePassageHoverEnter = (e: React.MouseEvent, passage: string) => {
    setPreviewPassage(passage);
    
    const calculatePosition = () => {
      const popoverWidth = 400;
      const popoverHeight = 300;
      const margin = 16;

      let x = e.clientX;
      let y = e.clientY + 12;

      if (x + popoverWidth > window.innerWidth - margin) {
        x = window.innerWidth - popoverWidth - margin;
      }

      if (x < margin) {
        x = margin;
      }

      if (y + popoverHeight > window.innerHeight - margin) {
        y = e.clientY - popoverHeight - 12;
      }

      if (y < margin) {
        y = margin;
      }

      return { x, y };
    };

    setPreviewPos(calculatePosition());
    
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      setPreviewLoading(true);
      esvFetch(passage)
        .then((r) => setPreviewText(r.text))
        .catch(() => setPreviewText('Failed to load preview'))
        .finally(() => setPreviewLoading(false));
    }, 300);
  };

  const handlePassageHoverLeave = () => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    setPreviewPassage(null);
    setPreviewText('');
    setPreviewPos(null);
    setPreviewLoading(false);
  };

  const bpFetch = async () => {
    const cleaned = bpRef.trim();
    if (!cleaned) return;
    setBpError(null);
    setEsvLoading(true);

    esvFetch(cleaned)
      .then((out) => setBpText(out.text))
      .catch((e) => setBpError(e?.message ?? "Failed to fetch ESV."))
      .finally(() => setEsvLoading(false));
  };

  const onBottomKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") bpFetch();
  };

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const requestHover = (surface: string) => {
    setHoverLoading(true);
    
    const rawBook = bpRef.trim().split(/\s+/)[0];
    const bookName = rawBook.charAt(0).toUpperCase() + rawBook.slice(1).toLowerCase();
    
    lexplainFetch(surface, bookName)
      .then((d) => setHoverData(d))
      .finally(() => setHoverLoading(false));
  };

  const onWordEnter = (e: React.MouseEvent, w: string) => {
    if (popoverPinned) return;
    setActiveWord(w);

    const calculatePosition = () => {
      const popoverWidth = 360;
      const popoverHeight = 220;
      const margin = 16;

      let x = e.clientX;
      let y = e.clientY + 12;

      if (x + popoverWidth > window.innerWidth - margin) {
        x = window.innerWidth - popoverWidth - margin;
      }

      if (x < margin) {
        x = margin;
      }

      if (y + popoverHeight > window.innerHeight - margin) {
        y = e.clientY - popoverHeight - 12;
      }

      if (y < margin) {
        y = margin;
      }

      return { x, y };
    };

    setPopoverPos(calculatePosition());
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => requestHover(w), 50);
  };

  const onWordLeave = () => {
    if (popoverPinned) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setActiveWord(null);
    setHoverData(null);
    setPopoverPos(null);
  };

  const onWordClick = (e: React.MouseEvent, w: string) => {
    e.preventDefault();
    if (popoverPinned && activeWord === w) {
      setPopoverPinned(false);
      onWordLeave();
    } else {
      setPopoverPinned(true);
      setActiveWord(w);

      const calculatePosition = () => {
        const popoverWidth = 360;
        const popoverHeight = 220;
        const margin = 16;

        let x = e.clientX;
        let y = e.clientY + 12;

        if (x + popoverWidth > window.innerWidth - margin) {
          x = window.innerWidth - popoverWidth - margin;
        }

        if (x < margin) {
          x = margin;
        }

        if (y + popoverHeight > window.innerHeight - margin) {
          y = e.clientY - popoverHeight - 12;
        }

        if (y < margin) {
          y = margin;
        }

        return { x, y };
      };

      setPopoverPos(calculatePosition());
      requestHover(w);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/courses"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Courses
          </Link>

          <div className="card">
            <div className="flex items-start gap-4">
              <div className="text-5xl">{getCategoryIcon(course.category)}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                {course.subtitle && (
                  <p className="text-lg text-white/70 mb-3">{course.subtitle}</p>
                )}
                <p className="text-white/60 mb-4">{course.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.totalSessions} sessions
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {course.coveragePassages.length} passages covered
                  </span>
                  <span className="inline-flex items-center gap-1 capitalize">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {course.difficulty}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                    <span>Course Progress</span>
                    <span>{completionPercentage}% Complete</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 📱 MOBILE LESSON SELECTOR */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileLessons(!showMobileLessons)}
            className="w-full card flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-400 font-bold">{selectedLesson}</span>
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs text-white/50">Current Lesson</div>
                <div className="font-semibold text-white truncate">{currentLesson?.title}</div>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-yellow-400 transition-transform flex-shrink-0 ${showMobileLessons ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMobileLessons && (
            <div className="mt-3 card space-y-2 max-h-[60vh] overflow-y-auto">
              {course.lessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.number);
                const isCurrent = selectedLesson === lesson.number;
                
                return (
                  <button
                    key={`lesson-mobile-${lesson.number}`}
                    onClick={() => {
                      setSelectedLesson(lesson.number);
                      setShowMobileLessons(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isCurrent
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : isCompleted
                        ? 'border-green-400/30 bg-green-400/5'
                        : 'border-white/10 bg-white/5 active:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${
                        isCurrent ? 'text-yellow-400' : isCompleted ? 'text-green-400' : 'text-white/60'
                      }`}>
                        Lesson {lesson.number}
                      </span>
                      {isCompleted && (
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className={`text-sm ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                      {lesson.title}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* 🖥️ DESKTOP LESSON LIST SIDEBAR */}
          <div className="hidden lg:block card h-fit">
            <h2 className="text-lg font-semibold mb-4 text-white">Lessons</h2>
            <div className="space-y-2">
              {course.lessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.number);
                const isCurrent = selectedLesson === lesson.number;
                
                return (
                  <button
                    key={`lesson-${lesson.number}`}
                    onClick={() => setSelectedLesson(lesson.number)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isCurrent
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : isCompleted
                        ? 'border-green-400/30 bg-green-400/5'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${
                        isCurrent ? 'text-yellow-400' : isCompleted ? 'text-green-400' : 'text-white/60'
                      }`}>
                        Lesson {lesson.number}
                      </span>
                      {isCompleted && (
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className={`text-sm ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                      {lesson.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lesson Content */}
          {currentLesson && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm text-yellow-400 font-semibold">Lesson {currentLesson.number}</span>
                    <h2 className="text-2xl font-bold text-white mt-1">{currentLesson.title}</h2>
                  </div>
                  <span className="text-sm text-white/60">
                    ~{currentLesson.estimatedMinutes} min
                  </span>
                </div>

                {/* Key Passages */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Key Passages</h3>
                  <p className="text-sm text-white/50 mb-3">Hover to preview • Click to study below</p>
                  <div className="flex flex-wrap gap-2">
                    {currentLesson.keyPassages.map((passage, idx) => (
                      <button
                        key={`passage-${idx}`}
                        onClick={() => handlePassageClick(passage)}
                        onMouseEnter={(e) => handlePassageHoverEnter(e, passage)}
                        onMouseLeave={handlePassageHoverLeave}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-400/20 border border-blue-400/30 text-sm text-blue-300 hover:bg-blue-400/30 active:bg-blue-400/40 transition-colors cursor-pointer"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {passage}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 📝 STUDY QUESTIONS WITH Q&A */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Study Questions</h3>
                    {Object.keys(questionAnswers).length > 0 && (
                      <button
                        onClick={exportAnsweredQuestions}
                        className="text-sm px-3 py-1.5 rounded-lg bg-green-400/20 border border-green-400/30 text-green-300 hover:bg-green-400/30 transition-colors flex items-center gap-1"
                        title="Export your answers as PDF"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Answers
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {currentLesson.questions.map((question, idx) => {
                      const questionKey = `${currentLesson.number}-${idx}`;
                      const isExpanded = expandedQuestions[questionKey];
                      const currentAnswer = questionAnswers[currentLesson.number]?.[idx] || '';
                      const hasAnswer = currentAnswer.trim().length > 0;

                      return (
                        <div 
                          key={`question-${idx}`} 
                          className={`rounded-lg border transition-all ${
                            hasAnswer 
                              ? 'border-green-400/30 bg-green-400/5' 
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <button
                            onClick={() => toggleQuestion(currentLesson.number, idx)}
                            className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                          >
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full text-sm font-semibold flex items-center justify-center ${
                              hasAnswer 
                                ? 'bg-green-400/20 text-green-400' 
                                : 'bg-yellow-400/20 text-yellow-400'
                            }`}>
                              {idx + 1}
                            </span>
                            <p className="text-white/80 flex-1 pr-2">{question}</p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {hasAnswer && (
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              <svg 
                                className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4">
                              <textarea
                                value={currentAnswer}
                                onChange={(e) => handleSaveAnswer(currentLesson.number, idx, e.target.value)}
                                placeholder="Write your answer here..."
                                className="input min-h-[100px] text-sm"
                                autoFocus
                              />
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-white/40">
                                  {currentAnswer.trim().length > 0 ? '✓ Answer saved automatically' : 'Start typing to save your answer'}
                                </p>
                                {currentAnswer.trim().length > 0 && (
                                  <button
                                    onClick={() => handleSaveAnswer(currentLesson.number, idx, '')}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    Clear Answer
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-4 p-3 rounded-lg bg-blue-400/10 border border-blue-400/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-300">
                        {Object.keys(questionAnswers[currentLesson.number] || {}).filter(k => {
                          const answer = questionAnswers[currentLesson.number][parseInt(k)];
                          return answer && answer.trim().length > 0;
                        }).length} of {currentLesson.questions.length} questions answered
                      </span>
                      {Object.keys(questionAnswers[currentLesson.number] || {}).filter(k => {
                        const answer = questionAnswers[currentLesson.number][parseInt(k)];
                        return answer && answer.trim().length > 0;
                      }).length === currentLesson.questions.length && (
                        <span className="text-green-400 font-semibold flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          All answered!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Application */}
                <div className="mb-6 p-4 rounded-lg bg-green-400/10 border border-green-400/30">
                  <h3 className="text-lg font-semibold text-green-300 mb-2">Application</h3>
                  <p className="text-white/80">{currentLesson.application}</p>
                </div>

                {/* Complete Button */}
                {!completedLessons.includes(currentLesson.number) && (
                  <button
                    onClick={handleLessonComplete}
                    className="w-full rounded-lg bg-yellow-400 text-slate-900 px-6 py-3 font-semibold hover:bg-yellow-300 active:bg-yellow-500 transition-colors"
                  >
                    Mark Lesson as Complete
                  </button>
                )}
                {completedLessons.includes(currentLesson.number) && (
                  <div className="flex items-center justify-center gap-2 text-green-400 py-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold">Lesson Complete</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Certificate Section */}
        {completionPercentage === 100 && (
          <section className="mt-8">
            <CertificateButton
              courseId={courseId}
              courseTitle={course.title}
              totalLessons={course.lessons.length}
              completedLessons={completedLessons.length}
            />
          </section>
        )}

        {/* ESV Passage Study Section */}
        <section id="passage-study" className="card mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Read Passage (ESV)</h2>
          
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label htmlFor="bpPassage" className="mb-2 block text-sm text-white/80">
                Passage (ESV)
              </label>
              <input
                id="bpPassage"
                placeholder="e.g., John 11:25"
                value={bpRef}
                onChange={(e) => setBpRef(e.target.value)}
                onKeyDown={onBottomKey}
                className="input"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={bpFetch} disabled={esvLoading} className="btn">
                {esvLoading ? "Loading…" : "Get ESV"}
              </button>
              {bpText && (
                <button onClick={() => handleCopy(bpText)} className="btn" title="Copy text">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={() => {
                  setBpRef("");
                  setBpText("");
                  setActiveWord(null);
                  setHoverData(null);
                }}
                className="btn"
              >
                Clear
              </button>
            </div>
          </div>

          {bpError && (
            <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {bpError}
            </div>
          )}

          <div className="mt-5">
            {!bpText ? (
              <p className="text-white/60 text-sm">
                Click a passage above or enter a reference and click <span className="font-semibold">Get ESV</span>. Hover any word for a
                simple, plain-English original language note; click to pin/unpin.
              </p>
            ) : (
              <article className="whitespace-pre-wrap text-[1.05rem] leading-7">
                {tokens.map((t, i) => {
                  const isWord = /\w/.test(t);
                  if (!isWord) return <span key={`token-${i}`}>{t}</span>;
                  return (
                    <span
                      key={`token-${i}`}
                      onMouseEnter={(e) => onWordEnter(e, t)}
                      onMouseLeave={onWordLeave}
                      onClick={(e) => onWordClick(e, t)}
                      className="cursor-help rounded-sm bg-transparent px-0.5 hover:bg-white/10 transition-colors"
                    >
                      {t}
                    </span>
                  );
                })}
              </article>
            )}
          </div>
        </section>

        {/* Course Notes Section */}
        <section className="card mt-8">
          <h3 className="text-lg font-semibold text-white mb-3">Course Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your thoughts, reflections, and insights here..."
            className="input min-h-[150px] mb-3"
          />
          <button
            onClick={handleSaveNotes}
            className="btn"
          >
            Save Notes
          </button>
        </section>

      </div>

      {/* Passage Preview Popover */}
      {previewPassage && previewPos && (
        <div
          className="pointer-events-none fixed z-50 w-[400px] max-w-[90vw] rounded-lg border border-blue-400/30 bg-slate-950/98 p-4 shadow-2xl backdrop-blur"
          style={{ left: previewPos.x, top: previewPos.y }}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-blue-300">{previewPassage}</div>
            <div className="text-xs text-white/50">ESV</div>
          </div>
          <div className="max-h-[250px] overflow-y-auto text-sm leading-relaxed text-white/90">
            {previewLoading ? (
              <div className="flex items-center gap-2 text-white/50">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Loading...
              </div>
            ) : previewText ? (
              <p className="whitespace-pre-wrap">{previewText}</p>
            ) : (
              <p className="text-white/50">Failed to load</p>
            )}
          </div>
          <div className="mt-3 border-t border-white/10 pt-2 text-xs text-white/40">
            Click to study with word lookup below
          </div>
        </div>
      )}

      {/* Word Hover Popover */}
      {activeWord && popoverPos && (
        <div
          className="hover-popover pointer-events-none fixed z-50 w-[360px] max-w-[90vw] rounded-lg border border-white/15 bg-slate-950/95 p-3 text-sm shadow-xl backdrop-blur"
          style={{ left: popoverPos.x, top: popoverPos.y }}
        >
          <div className="pointer-events-auto">
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="text-xs uppercase tracking-wide text-white/60">Word for Today</div>
              <button onClick={() => setPopoverPinned((p) => !p)} className="btn text-xs px-2 py-1">
                {popoverPinned ? "Unpin" : "Pin"}
              </button>
            </div>

            <div className="text-base font-semibold">{activeWord}</div>
            <div className="mt-1 grid grid-cols-[80px_1fr] gap-x-3 gap-y-1">
              <div className="text-xs text-white/60">Lemma</div>
              <div className="text-sm">{hoverData?.lemma ?? "…"}</div>
              <div className="text-xs text-white/60">Strong's #</div>
              <div className="text-sm">{hoverData?.strongs ?? "…"}</div>
            </div>

            <div className="mt-2 border-t border-white/10 pt-2 text-sm leading-6">
              {hoverData?.plain ?? (hoverLoading ? "Thinking…" : "—")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}