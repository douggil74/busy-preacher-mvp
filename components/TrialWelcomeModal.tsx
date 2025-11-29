'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Playfair_Display } from 'next/font/google';
import { isFromIOSApp } from '@/lib/platform-detector';

// RevenueCat types - define inline to avoid import issues on web
interface RevenueCatPackage {
  product: {
    identifier: string;
    priceString: string;
  };
}

const playfair = Playfair_Display({
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

interface TrialWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialDaysRemaining: number;
}

export function TrialWelcomeModal({ isOpen, onClose, trialDaysRemaining }: TrialWelcomeModalProps) {
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [isNative, setIsNative] = useState(false);
  const [packages, setPackages] = useState<RevenueCatPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  // Detect if running on iOS native and load RevenueCat packages
  useEffect(() => {
    const native = isFromIOSApp();
    setIsNative(native);

    if (native && isOpen) {
      loadRevenueCatPackages();
    }
  }, [isOpen]);

  const loadRevenueCatPackages = async () => {
    setIsLoadingPackages(true);
    try {
      // Dynamic import to avoid loading RevenueCat on web
      const { initializeRevenueCat, getOfferings } = await import('@/lib/revenuecat');
      await initializeRevenueCat(user?.uid);
      const offerings = await getOfferings();
      setPackages(offerings as RevenueCatPackage[]);
    } catch (error) {
      console.error('Failed to load RevenueCat packages:', error);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const handleIOSPurchase = async (pkg: RevenueCatPackage) => {
    setIsCheckingOut(true);
    try {
      const { purchasePackage } = await import('@/lib/revenuecat');
      const customerInfo = await purchasePackage(pkg as any);
      if (customerInfo) {
        window.location.reload();
      }
    } catch (error) {
      console.error('iOS purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Helper functions for RevenueCat packages
  const getPackageType = (pkg: RevenueCatPackage): 'annual' | 'monthly' | 'unknown' => {
    const productId = pkg.product.identifier;
    if (productId.includes('annual')) return 'annual';
    if (productId.includes('monthly')) return 'monthly';
    return 'unknown';
  };

  const formatPrice = (pkg: RevenueCatPackage): string => pkg.product.priceString;

  // Helper to get packages
  const annualPackage = packages.find(p => getPackageType(p) === 'annual');
  const monthlyPackage = packages.find(p => getPackageType(p) === 'monthly');

  if (!isOpen) return null;

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
          plan: selectedPlan,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const handleContinueTrial = () => {
    // Mark that user has seen the trial modal
    if (user?.uid) {
      localStorage.setItem(`trial_welcome_shown_${user.uid}`, 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl border-2 border-yellow-400/30 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">7</div>
          <h2 className={`${playfair.className} text-2xl font-bold text-yellow-400 mb-2`}>
            Welcome to Your Free Trial!
          </h2>
          <p className="text-white/70">
            You have <span className="text-yellow-400 font-bold">{trialDaysRemaining} days</span> of full access.
          </p>
        </div>

        {/* Features */}
        <div className="px-8 pb-6">
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-white font-semibold mb-3">During your trial, enjoy:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Daily devotionals & personalized Bible study</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Ask the Pastor - compassionate AI guidance</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Deep study tools, courses & sermons</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Prayer community & spiritual support</span>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border border-yellow-400/30 rounded-xl p-4 mb-6">
            <h3 className="text-yellow-400 font-semibold mb-2">
              {isNative ? 'Subscribe Now' : 'Add Payment Method (Optional)'}
            </h3>
            <p className="text-white/70 text-sm mb-4">
              {isNative
                ? 'Subscribe to continue using all premium features.'
                : 'Subscribe now and you won\'t be charged until your trial ends. Cancel anytime during the trial at no cost!'}
            </p>

            {/* iOS Native - RevenueCat */}
            {isNative ? (
              <>
                {isLoadingPackages ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                  </div>
                ) : packages.length === 0 ? (
                  <div className="text-center py-2">
                    <p className="text-white/60 text-sm mb-2">Unable to load subscription options.</p>
                    <button onClick={loadRevenueCatPackages} className="text-yellow-400 text-sm underline">Retry</button>
                  </div>
                ) : (
                  <>
                    {/* Plan Selection - iOS */}
                    <div className="space-y-2 mb-4">
                      {annualPackage && (
                        <button
                          type="button"
                          onClick={() => setSelectedPlan('annual')}
                          className={`w-full p-3 rounded-lg border transition-all text-left cursor-pointer ${
                            selectedPlan === 'annual'
                              ? 'border-yellow-400 bg-yellow-400/10'
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">Annual</span>
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                BEST VALUE
                              </span>
                            </div>
                            <span className="text-yellow-400 font-bold">{formatPrice(annualPackage)}/yr</span>
                          </div>
                        </button>
                      )}

                      {monthlyPackage && (
                        <button
                          type="button"
                          onClick={() => setSelectedPlan('monthly')}
                          className={`w-full p-3 rounded-lg border transition-all text-left cursor-pointer ${
                            selectedPlan === 'monthly'
                              ? 'border-yellow-400 bg-yellow-400/10'
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">Monthly</span>
                            <span className="text-white font-bold">{formatPrice(monthlyPackage)}/mo</span>
                          </div>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        const pkg = selectedPlan === 'annual' ? annualPackage : monthlyPackage;
                        if (pkg) handleIOSPurchase(pkg);
                      }}
                      disabled={isCheckingOut}
                      className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 font-bold py-3 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCheckingOut ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                          Processing...
                        </span>
                      ) : (
                        'Subscribe Now'
                      )}
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Web - Square */}
                {/* Plan Selection */}
                <div className="space-y-2 mb-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedPlan('annual');
                    }}
                    className={`w-full p-3 rounded-lg border transition-all text-left cursor-pointer ${
                      selectedPlan === 'annual'
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Annual</span>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          SAVE 25%
                        </span>
                      </div>
                      <span className="text-yellow-400 font-bold">$2.99/mo</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedPlan('monthly');
                    }}
                    className={`w-full p-3 rounded-lg border transition-all text-left cursor-pointer ${
                      selectedPlan === 'monthly'
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between pointer-events-none">
                      <span className="font-semibold text-white">Monthly</span>
                      <span className="text-white font-bold">$3.99/mo</span>
                    </div>
                  </button>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={isCheckingOut}
                  className="w-full py-3 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                  style={{
                    background: 'linear-gradient(to right, #facc15, #f59e0b)',
                    color: '#0f172a',
                  }}
                >
                  {isCheckingOut ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                      Loading...
                    </span>
                  ) : (
                    'Start Subscription - Pay After Trial'
                  )}
                </button>
              </>
            )}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinueTrial}
            className="w-full py-3 text-white/60 hover:text-white transition-colors text-sm"
          >
            Continue with trial (decide later)
          </button>

          {/* Disclaimer */}
          <p className="text-white/40 text-xs text-center mt-4">
            By adding payment, you agree to be charged after your trial ends. Cancel anytime from your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
