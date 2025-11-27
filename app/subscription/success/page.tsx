'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after 3 seconds
    const timer = setTimeout(() => {
      router.push('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          Welcome to The Busy Christian!
        </h1>

        <p className="text-white/80 text-lg mb-6">
          Your subscription is now active. You have full access to all features!
        </p>

        <div className="space-y-2 mb-8 text-left">
          <div className="flex items-center gap-2 text-white/70">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Daily devotionals & Bible study</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Prayer community & support</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Ask the Pastor - AI guidance</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>All study tools & courses</span>
          </div>
        </div>

        <p className="text-white/50 text-sm">
          Redirecting you to the app...
        </p>
      </div>
    </div>
  );
}
