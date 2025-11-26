'use client';

import { usePlatform } from '@/hooks/usePlatform';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface PaywallProps {
  children: React.ReactNode;
  showPreview?: boolean; // Show a preview before the paywall
}

/**
 * Paywall Component
 *
 * Wraps content that should be behind a paywall for web users.
 * iOS app users (who paid $2.99) automatically bypass this.
 *
 * Usage:
 * <Paywall>
 *   <PremiumContent />
 * </Paywall>
 */
export function Paywall({ children, showPreview = false }: PaywallProps) {
  const { isPaid, showPaywall, isLoading } = usePlatform();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // While loading, show nothing to avoid flash
  if (isLoading) {
    return null;
  }

  // iOS app users get full access (they already paid $2.99)
  if (isPaid || !showPaywall) {
    return <>{children}</>;
  }

  const handleSubscribe = async () => {
    if (!user) {
      alert('Please sign in first');
      return;
    }

    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout/square', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to Square Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  // Web users see the paywall
  return (
    <div className="relative min-h-screen">
      {/* Optional preview of content */}
      {showPreview && (
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
      )}

      {/* Paywall overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="max-w-md w-full p-8 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full">
              <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-3">
            Premium Access
          </h2>
          <p className="text-white/70 text-center mb-6">
            Get full access to all features, daily devotionals, and the prayer community.
          </p>

          {/* Features */}
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Daily devotionals & Bible study</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Prayer community & support</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Ask the Pastor - AI guidance</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>All study tools & courses</span>
            </div>
          </div>

          {/* Subscribe button */}
          <button
            onClick={handleSubscribe}
            disabled={isCheckingOut}
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 font-bold py-4 px-6 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isCheckingOut ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                Loading checkout...
              </span>
            ) : (
              <span>Subscribe - $2.99/month</span>
            )}
          </button>

          <p className="text-white/50 text-sm text-center">
            Cancel anytime. Already have iOS app? You're all set! ✓
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple paywall check without UI
 * Returns true if user has access
 */
export function useHasAccess(): boolean {
  const { isPaid, showPaywall } = usePlatform();
  return isPaid || !showPaywall;
}
