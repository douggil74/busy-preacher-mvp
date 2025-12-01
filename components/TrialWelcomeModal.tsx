'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isFromIOSApp } from '@/lib/platform-detector';
import { Check, Gift, X } from 'lucide-react';

// RevenueCat types - define inline to avoid import issues on web
interface RevenueCatPackage {
  product: {
    identifier: string;
    priceString: string;
  };
}

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
        }}
      >
        {/* Header */}
        <div className="p-8 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-color) 15%, transparent)',
              border: '2px solid var(--accent-color)',
            }}
          >
            <Gift className="w-10 h-10" style={{ color: 'var(--accent-color)' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-color)' }}>
            Welcome to Your Free Trial!
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            You have <span className="font-bold" style={{ color: 'var(--accent-color)' }}>{trialDaysRemaining} days</span> of full access.
          </p>
        </div>

        {/* Features */}
        <div className="px-8 pb-6">
          <div
            className="rounded-xl p-4 mb-6"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>During your trial, enjoy:</h3>
            <div className="space-y-2">
              {[
                'Daily devotionals & personalized Bible study',
                'Ask the Pastor - compassionate AI guidance',
                'Deep study tools, courses & sermons',
                'Prayer community & spiritual support',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Info */}
          <div
            className="rounded-xl p-4 mb-6"
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 12%, transparent) 0%, transparent 100%)',
              border: '1px solid color-mix(in srgb, var(--accent-color) 30%, transparent)',
            }}
          >
            <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-color)' }}>
              {isNative ? 'Subscribe Now' : 'Add Payment Method (Optional)'}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {isNative
                ? 'Subscribe to continue using all premium features.'
                : 'Subscribe now and you won\'t be charged until your trial ends. Cancel anytime during the trial at no cost!'}
            </p>

            {/* iOS Native - RevenueCat */}
            {isNative ? (
              <>
                {isLoadingPackages ? (
                  <div className="flex justify-center py-4">
                    <div
                      className="animate-spin rounded-full h-6 w-6 border-b-2"
                      style={{ borderColor: 'var(--accent-color)' }}
                    />
                  </div>
                ) : packages.length === 0 ? (
                  <div className="text-center py-2">
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Unable to load subscription options.</p>
                    <button onClick={loadRevenueCatPackages} className="text-sm underline" style={{ color: 'var(--accent-color)' }}>Retry</button>
                  </div>
                ) : (
                  <>
                    {/* Plan Selection - iOS */}
                    <div className="space-y-2 mb-4">
                      {annualPackage && (
                        <button
                          type="button"
                          onClick={() => setSelectedPlan('annual')}
                          className="w-full p-3 rounded-lg transition-all text-left"
                          style={{
                            backgroundColor: selectedPlan === 'annual'
                              ? 'color-mix(in srgb, var(--accent-color) 15%, transparent)'
                              : 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                            border: selectedPlan === 'annual'
                              ? '2px solid var(--accent-color)'
                              : '2px solid var(--card-border)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Annual</span>
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">
                                BEST VALUE
                              </span>
                            </div>
                            <span className="font-bold" style={{ color: 'var(--accent-color)' }}>{formatPrice(annualPackage)}/yr</span>
                          </div>
                        </button>
                      )}

                      {monthlyPackage && (
                        <button
                          type="button"
                          onClick={() => setSelectedPlan('monthly')}
                          className="w-full p-3 rounded-lg transition-all text-left"
                          style={{
                            backgroundColor: selectedPlan === 'monthly'
                              ? 'color-mix(in srgb, var(--accent-color) 15%, transparent)'
                              : 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                            border: selectedPlan === 'monthly'
                              ? '2px solid var(--accent-color)'
                              : '2px solid var(--card-border)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Monthly</span>
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatPrice(monthlyPackage)}/mo</span>
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
                      className="w-full font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: 'var(--accent-color)',
                        color: 'var(--bg-color)',
                      }}
                    >
                      {isCheckingOut ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--bg-color)' }} />
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
                    className="w-full p-3 rounded-lg transition-all text-left"
                    style={{
                      backgroundColor: selectedPlan === 'annual'
                        ? 'color-mix(in srgb, var(--accent-color) 15%, transparent)'
                        : 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                      border: selectedPlan === 'annual'
                        ? '2px solid var(--accent-color)'
                        : '2px solid var(--card-border)',
                    }}
                  >
                    <div className="flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Annual</span>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">
                          SAVE 25%
                        </span>
                      </div>
                      <span className="font-bold" style={{ color: 'var(--accent-color)' }}>$2.99/mo</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedPlan('monthly');
                    }}
                    className="w-full p-3 rounded-lg transition-all text-left"
                    style={{
                      backgroundColor: selectedPlan === 'monthly'
                        ? 'color-mix(in srgb, var(--accent-color) 15%, transparent)'
                        : 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                      border: selectedPlan === 'monthly'
                        ? '2px solid var(--accent-color)'
                        : '2px solid var(--card-border)',
                    }}
                  >
                    <div className="flex items-center justify-between pointer-events-none">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Monthly</span>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>$3.99/mo</span>
                    </div>
                  </button>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={isCheckingOut}
                  className="w-full py-3 px-6 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    color: 'var(--bg-color)',
                  }}
                >
                  {isCheckingOut ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--bg-color)' }} />
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
            className="w-full py-3 transition-colors text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Continue with trial (decide later)
          </button>

          {/* Disclaimer */}
          <p className="text-xs text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
            By adding payment, you agree to be charged after your trial ends. Cancel anytime from your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
