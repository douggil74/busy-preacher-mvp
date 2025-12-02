// components/CertificateButton.tsx
'use client';

import { useState } from 'react';
import { downloadCertificate } from './CourseCertificate';
import { CourseTracker } from '@/lib/courseTracker';

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
  const [showNameInput, setShowNameInput] = useState(false);
  const [name, setName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const isCompleted = completedLessons === totalLessons;
  const progress = CourseTracker.getCourseProgress(courseId);

  const handleDownload = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsGenerating(true);
    try {
      await downloadCertificate({
        studentName: name,
        courseTitle: courseTitle,
        completionDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        totalLessons: totalLessons
      });

      // Save the name in progress
      CourseTracker.saveStudentName(courseId, name);
      CourseTracker.markCertificateDownloaded(courseId);
      
      setShowNameInput(false);
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

  if (showNameInput) {
    return (
      <div
        className="p-6 border-2 border-green-500 rounded-lg backdrop-blur"
        style={{ backgroundColor: 'color-mix(in srgb, var(--card-bg) 90%, #22c55e 10%)' }}
      >
        <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
          🎉 Congratulations on completing the course!
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Enter your name to download your certificate:
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="input w-full mb-3"
          onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
        />
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating PDF...' : 'Download Certificate'}
          </button>
          <button
            onClick={() => setShowNameInput(false)}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              border: '1px solid var(--card-border)',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        if (progress?.studentName) {
          setName(progress.studentName);
        }
        setShowNameInput(true);
      }}
      className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
    >
      📜 {progress?.certificateDownloaded ? 'Download Certificate Again' : 'Get Your Certificate'}
    </button>
  );
}