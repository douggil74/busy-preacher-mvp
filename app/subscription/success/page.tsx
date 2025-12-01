'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<'activating' | 'success' | 'error'>('activating');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const activateSubscription = async () => {
      // Wait for auth to load
      if (user === undefined) return;

      if (!user) {
        setStatus('error');
        setErrorMessage('Please sign in to activate your subscription');
        return;
      }

      const plan = searchParams.get('plan') || 'annual';
      const customerId = searchParams.get('customerId');

      try {
        const response = await fetch('/api/subscription/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            plan,
            customerId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to activate subscription');
        }

        setStatus('success');

        // Redirect to home after showing success
        setTimeout(() => {
          router.push('/home');
        }, 3000);
      } catch (error: any) {
        console.error('Activation error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Failed to activate subscription');
      }
    };

    activateSubscription();
  }, [user, searchParams, router]);

  return (
    <div className="max-w-md w-full p-8 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur text-center">
      {status === 'activating' && (
        <>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Activating Your Subscription...
          </h1>
          <p className="text-white/70">
            Please wait while we set up your account.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
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
        </>
      )}

      {status === 'error' && (
        <>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Something Went Wrong
          </h1>
          <p className="text-white/70 mb-6">
            {errorMessage || 'We couldn\'t activate your subscription. Please contact support.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-bold py-3 px-6 rounded-xl"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/home')}
              className="w-full bg-white/10 text-white py-3 px-6 rounded-xl"
            >
              Go to Home
            </button>
          </div>
          <p className="text-white/50 text-sm mt-4">
            If the problem persists, please email thebusychristianapp@gmail.com
          </p>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-md w-full p-8 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur text-center">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">
        Loading...
      </h1>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
