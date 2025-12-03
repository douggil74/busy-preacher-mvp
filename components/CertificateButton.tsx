// components/CertificateButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { downloadCertificate } from './CourseCertificate';
import { CourseTracker } from '@/lib/courseTracker';
import { X } from 'lucide-react';

interface CertificateButtonProps {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
}

export default function CertificateButton({
  courseId,
  courseTitle,
  totalLessons,
  completedLessons
}: CertificateButtonProps) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [userName, setUserName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [completionDate, setCompletionDate] = useState('');

  const isCompleted = completedLessons === totalLessons;

  useEffect(() => {
    // Get user name from localStorage
    const name = localStorage.getItem('bc-user-name') || 'Student';
    setUserName(name);

    // Get or set completion date
    const progress = CourseTracker.getCourseProgress(courseId);
    if (progress?.completedAt) {
      setCompletionDate(new Date(progress.completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    } else {
      setCompletionDate(new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    }
  }, [courseId]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await downloadCertificate({
        studentName: userName,
        courseTitle: courseTitle,
        completionDate: completionDate,
        totalLessons: totalLessons
      });

      CourseTracker.saveStudentName(courseId, userName);
      CourseTracker.markCertificateDownloaded(courseId);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isCompleted) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowCertificate(true)}
        className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-xl">📜</span> View Your Certificate
      </button>

      {/* Certificate Preview Modal */}
      {showCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowCertificate(false)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Preview */}
            <div
              className="rounded-lg overflow-hidden shadow-2xl"
              style={{
                aspectRatio: '1.414', // A4 landscape ratio
                backgroundColor: '#ffffff'
              }}
            >
              {/* Outer Border */}
              <div
                className="h-full p-4 sm:p-6"
                style={{ border: '4px solid #2c5f2d' }}
              >
                {/* Inner Border */}
                <div
                  className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6"
                  style={{ border: '1px solid #2c5f2d' }}
                >
                  {/* Cross */}
                  <div className="text-3xl sm:text-4xl mb-2" style={{ color: '#2c5f2d' }}>✝</div>

                  {/* Title */}
                  <h1
                    className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
                    style={{ color: '#2c5f2d', fontFamily: 'serif' }}
                  >
                    Certificate of Completion
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6">
                    The Busy Christian Bible Study
                  </p>

                  {/* Presented To */}
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">
                    This certificate is presented to
                  </p>

                  {/* Name */}
                  <div
                    className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 pb-2 px-8"
                    style={{
                      color: '#2c5f2d',
                      fontFamily: 'serif',
                      borderBottom: '2px solid #2c5f2d',
                      minWidth: '60%'
                    }}
                  >
                    {userName}
                  </div>

                  {/* Completion Text */}
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4 max-w-md">
                    For successfully completing the course<br />
                    <strong>"{courseTitle}"</strong><br />
                    consisting of {totalLessons} comprehensive lessons
                  </p>

                  {/* Scripture */}
                  <p
                    className="text-xs text-gray-400 italic max-w-sm mb-4 hidden sm:block"
                  >
                    "Study to shew thyself approved unto God, a workman that needeth not
                    to be ashamed, rightly dividing the word of truth." — 2 Timothy 2:15
                  </p>

                  {/* Date */}
                  <p className="text-xs text-gray-500">
                    Completed on {completionDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full mt-4 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
