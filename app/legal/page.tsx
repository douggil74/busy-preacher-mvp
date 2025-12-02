'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md" style={{ backgroundColor: 'rgba(var(--card-bg-rgb), 0.9)', borderBottom: '1px solid var(--card-border)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </Link>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Legal</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>The Busy Christian App</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {/* Privacy Policy */}
          <Link
            href="/privacy"
            className="block p-6 rounded-xl transition-all hover:scale-[1.01]"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  How we collect, use, and protect your information
                </p>
              </div>
              <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Terms of Service */}
          <Link
            href="/terms"
            className="block p-6 rounded-xl transition-all hover:scale-[1.01]"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Terms of Service</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Rules and guidelines for using our app
                </p>
              </div>
              <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Crisis & Safety Information */}
          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Crisis & Safety</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Our pastoral guidance feature is not a substitute for professional mental health care or emergency services.
                </p>
                <div className="mt-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-sm font-medium text-red-500">If you're in crisis:</p>
                  <ul className="mt-2 space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• Call <strong>911</strong> for immediate danger</li>
                    <li>• Call <strong>988</strong> (Suicide & Crisis Lifeline)</li>
                    <li>• Text HOME to <strong>741741</strong> (Crisis Text Line)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Questions?</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Contact us at <a href="mailto:developer@ilovecornerstone.com" className="text-blue-500 hover:underline">developer@ilovecornerstone.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
          The Busy Christian App is a ministry of Cornerstone Church, Mandeville, Louisiana.
        </p>
      </div>
    </div>
  );
}
