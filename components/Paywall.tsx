'use client';

import { usePlatform } from '@/hooks/usePlatform';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { isFromIOSApp } from '@/lib/platform-detector';

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
// RevenueCat types - define inline to avoid import issues on web
interface RevenueCatPackage {
  product: {
    identifier: string;
    priceString: string;
  };
}

export function Paywall({ children, showPreview = false }: PaywallProps) {
  const { isPaid, showPaywall, isLoading } = usePlatform();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [isNative, setIsNative] = useState(false);
  const [packages, setPackages] = useState<RevenueCatPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Detect if running on iOS native and load RevenueCat packages
  useEffect(() => {
    const native = isFromIOSApp();
    setIsNative(native);

    if (native && showPaywall && !isPaid) {
      loadRevenueCatPackages();
    }
  }, [showPaywall, isPaid]);

  const loadRevenueCatPackages = async () => {
    setIsLoadingPackages(true);
    try {
      // Dynamic import to avoid loading RevenueCat on web
      const { initializeRevenueCat, getOfferings } = await import('@/lib/revenuecat');
      await initializeRevenueCat(user?.uid);
      const offerings = await getOfferings();
      setPackages(offerings as RevenueCatPackage[]);
      console.log('RevenueCat packages loaded:', offerings.length);
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

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const { restorePurchases } = await import('@/lib/revenuecat');
      const customerInfo = await restorePurchases();
      if (customerInfo?.entitlements.active['premium']) {
        alert('Purchases restored successfully!');
        window.location.reload();
      } else {
        alert('No previous purchases found.');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Failed to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim() || !user) {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    setPromoError('');

    try {
      const response = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPromoError(data.error || 'Invalid promo code');
        return;
      }

      // Success - reload to apply access
      alert(data.promo?.hasForeverAccess
        ? 'Promo code applied! You now have lifetime access.'
        : 'Promo code applied successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Promo code error:', error);
      setPromoError('Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

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

  // Helper functions for RevenueCat packages
  const getPackageType = (pkg: RevenueCatPackage): 'annual' | 'monthly' | 'unknown' => {
    const productId = pkg.product.identifier;
    if (productId.includes('annual')) return 'annual';
    if (productId.includes('monthly')) return 'monthly';
    return 'unknown';
  };

  const formatPrice = (pkg: RevenueCatPackage): string => pkg.product.priceString;

  // Helper to get annual and monthly packages from RevenueCat
  const annualPackage = packages.find(p => getPackageType(p) === 'annual');
  const monthlyPackage = packages.find(p => getPackageType(p) === 'monthly');

  // Show paywall - iOS uses RevenueCat, Web uses Square
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

          {/* Promo Code Section - Prominent placement */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
            <p className="text-sm text-green-400 font-medium mb-3">Have a promo code?</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:border-green-400 focus:outline-none text-sm uppercase"
                disabled={promoLoading}
                onKeyDown={(e) => e.key === 'Enter' && handlePromoCode()}
              />
              <button
                onClick={handlePromoCode}
                disabled={promoLoading || !promoCode.trim()}
                className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {promoLoading ? '...' : 'Apply'}
              </button>
            </div>
            {promoError && (
              <p className="text-red-400 text-sm mt-2">{promoError}</p>
            )}
          </div>

          {/* iOS Native Paywall - RevenueCat */}
          {isNative ? (
            <>
              {isLoadingPackages ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-white/60 mb-4">Unable to load subscription options.</p>
                  <button
                    onClick={loadRevenueCatPackages}
                    className="text-yellow-400 underline"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {/* Pricing Options - RevenueCat */}
                  <div className="space-y-3 mb-6">
                    {/* Annual Plan */}
                    {annualPackage && (
                      <button
                        type="button"
                        onClick={() => setSelectedPlan('annual')}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                          selectedPlan === 'annual'
                            ? 'border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400/50'
                            : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                        }`}
                      >
                        {selectedPlan === 'annual' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-lg">Annual</span>
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">
                                BEST VALUE
                              </span>
                            </div>
                            <p className="text-white/60 text-sm">Billed annually</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-400">{formatPrice(annualPackage)}</div>
                            <div className="text-white/50 text-sm">/year</div>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Monthly Plan */}
                    {monthlyPackage && (
                      <button
                        type="button"
                        onClick={() => setSelectedPlan('monthly')}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                          selectedPlan === 'monthly'
                            ? 'border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400/50'
                            : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                        }`}
                      >
                        {selectedPlan === 'monthly' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white text-lg">Monthly</span>
                            <p className="text-white/60 text-sm">Cancel anytime</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{formatPrice(monthlyPackage)}</div>
                            <div className="text-white/50 text-sm">/month</div>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Subscribe button - iOS */}
                  <button
                    onClick={() => {
                      const pkg = selectedPlan === 'annual' ? annualPackage : monthlyPackage;
                      if (pkg) handleIOSPurchase(pkg);
                    }}
                    disabled={isCheckingOut}
                    className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {isCheckingOut ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                        Processing...
                      </span>
                    ) : (
                      <span>Subscribe Now</span>
                    )}
                  </button>

                  {/* Restore purchases button */}
                  <button
                    onClick={handleRestorePurchases}
                    disabled={isRestoring}
                    className="w-full text-white/60 hover:text-white text-sm py-2 transition-colors mb-4"
                  >
                    {isRestoring ? 'Restoring...' : 'Restore Purchases'}
                  </button>
                </>
              )}

              {/* iOS disclaimers */}
              <div className="space-y-3 text-center">
                <p className="text-white/40 text-xs leading-relaxed max-w-sm mx-auto">
                  Payment will be charged to your Apple ID account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Web Paywall - Square */}
              {/* Pricing Options */}
              <div className="space-y-3 mb-6">
                {/* Annual Plan */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('annual')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                    selectedPlan === 'annual'
                      ? 'border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400/50'
                      : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  {selectedPlan === 'annual' && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
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
                  type="button"
                  onClick={() => setSelectedPlan('monthly')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                    selectedPlan === 'monthly'
                      ? 'border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400/50'
                      : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  {selectedPlan === 'monthly' && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
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

              {/* Subscribe button - Web */}
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

              {/* Payment info & disclaimers - Web */}
              <div className="space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure payment via Square
                </div>
                <div className="flex items-center justify-center gap-4 text-white/40">
                  <span className="text-xs">Credit/Debit Cards</span>
                  <span>•</span>
                  <span className="text-xs">Apple Pay</span>
                  <span>•</span>
                  <span className="text-xs">Google Pay</span>
                </div>
                <p className="text-white/40 text-xs leading-relaxed max-w-sm mx-auto">
                  Your subscription will auto-renew. Cancel anytime from your account settings.
                  No refunds for partial billing periods. By subscribing, you agree to our Terms of Service.
                </p>
              </div>
            </>
          )}

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
