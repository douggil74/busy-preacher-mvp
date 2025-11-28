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
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  // While loading, show nothing to avoid flash
  if (isLoading) {
    return null;
  }

  // iOS app users get full access (they already paid $2.99)
  if (isPaid || !showPaywall) {
    return <>{children}</>;
  }

  const handleSubscribe = async (plan: 'annual' | 'monthly') => {
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
          plan,
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
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 overflow-y-auto">
        <div className="max-w-lg w-full p-8 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur my-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="text-5xl">📖</div>
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-2">
            Continue Your Journey
          </h2>
          <p className="text-white/70 text-center mb-6">
            Your free trial has ended. Subscribe to keep growing in faith with full access to all features.
          </p>

          {/* Features */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Daily devotionals & personalized Bible study</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Prayer community & spiritual support</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Ask the Pastor - compassionate AI guidance</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Deep study tools, courses & sermons</span>
            </div>
          </div>

          {/* Pricing Options */}
          <div className="space-y-3 mb-6">
            {/* Annual Plan */}
            <button
              onClick={() => setSelectedPlan('annual')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedPlan === 'annual'
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">Annual</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">
                      SAVE 25%
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">$35.88 billed annually</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-400">$2.99</div>
                  <div className="text-white/50 text-sm">/month</div>
                </div>
              </div>
            </button>

            {/* Monthly Plan */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedPlan === 'monthly'
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-lg">Monthly</span>
                  <p className="text-white/60 text-sm">Flexible, cancel anytime</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">$3.99</div>
                  <div className="text-white/50 text-sm">/month</div>
                </div>
              </div>
            </button>
          </div>

          {/* Subscribe button */}
          <button
            onClick={() => handleSubscribe(selectedPlan)}
            disabled={isCheckingOut}
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isCheckingOut ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                Loading checkout...
              </span>
            ) : (
              <span>
                {selectedPlan === 'annual' ? 'Subscribe & Save - $35.88/year' : 'Subscribe - $3.99/month'}
              </span>
            )}
          </button>

          <p className="text-white/50 text-sm text-center">
            Secure payment via Square. Cancel anytime.
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
