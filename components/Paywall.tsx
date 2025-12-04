'use client';

import { usePlatform } from '@/hooks/usePlatform';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { isFromIOSApp } from '@/lib/platform-detector';
import { X, Check, CreditCard, Sparkles } from 'lucide-react';

// Haptic feedback helper for iOS
async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  if (!isFromIOSApp()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({
      style: style === 'heavy' ? ImpactStyle.Heavy :
             style === 'light' ? ImpactStyle.Light :
             ImpactStyle.Medium
    });
  } catch (error) {
    // Silently fail
  }
}

async function triggerNotificationHaptic(type: 'success' | 'warning' | 'error' = 'success') {
  if (!isFromIOSApp()) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({
      type: type === 'error' ? NotificationType.Error :
            type === 'warning' ? NotificationType.Warning :
            NotificationType.Success
    });
  } catch (error) {
    // Silently fail
  }
}

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
      <div
        className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      >
        <div
          className="max-w-lg w-full p-8 rounded-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto scrollbar-hide"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
          }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent-color) 15%, transparent)',
                border: '2px solid var(--accent-color)',
              }}
            >
              <Sparkles className="w-8 h-8" style={{ color: 'var(--accent-color)' }} />
            </div>
          </div>

          <h2
            className="text-3xl font-bold text-center mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Continue Your Journey
          </h2>
          <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
            Your free trial has ended. Subscribe to keep growing in faith with full access to all features.
          </p>

          {/* Features */}
          <div className="space-y-2 mb-6">
            {[
              'Daily devotionals & personalized Bible study',
              'Prayer community & spiritual support',
              'Ask the Pastor - compassionate AI guidance',
              'Deep study tools, courses & sermons',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Promo Code Section */}
          <div
            className="mb-6 p-4 rounded-xl"
            style={{
              background: 'linear-gradient(to right, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <p className="text-sm font-medium mb-3 text-green-500">Have a promo code?</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-4 py-2.5 rounded-lg text-sm uppercase outline-none transition-all"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                  border: '2px solid var(--card-border)',
                  color: 'var(--text-primary)',
                }}
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
              <p className="text-red-500 text-sm mt-2">{promoError}</p>
            )}
          </div>

          {/* iOS Native Paywall - RevenueCat */}
          {isNative ? (
            <>
              {isLoadingPackages ? (
                <div className="flex justify-center py-8">
                  <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: 'var(--accent-color)' }}
                  />
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-4">
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Unable to load subscription options.</p>
                  <button
                    onClick={loadRevenueCatPackages}
                    className="underline"
                    style={{ color: 'var(--accent-color)' }}
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
                        onClick={() => { triggerHaptic('light'); setSelectedPlan('annual'); }}
                        className="w-full p-4 rounded-xl transition-all text-left relative"
                        style={{
                          backgroundColor: selectedPlan === 'annual'
                            ? 'color-mix(in srgb, var(--accent-color) 15%, transparent)'
                            : 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                          border: selectedPlan === 'annual'
                            ? '2px solid var(--accent-color)'
                            : '2px solid var(--card-border)',
                        }}
                      >
                        {selectedPlan === 'annual' && (
                          <div
                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--accent-color)' }}
                          >
                            <Check className="w-4 h-4" style={{ color: 'var(--bg-color)' }} />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Annual</span>
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full font-semibold">
                                BEST VALUE
                              </span>
                            </div>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Billed annually</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold" style={{ color: 'var(--accent-color)' }}>{formatPrice(annualPackage)}</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>/year</div>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Monthly Plan */}
                    {monthlyPackage && (
                      <button
                        type="button"
                        onClick={() => { triggerHaptic('light'); setSelectedPlan('monthly'); }}
                        className="w-full p-4 rounded-xl transition-all text-left relative"
                        style={{
                          backgroundColor: selectedPlan === 'monthly'
                            ? 'color-mix(in srgb, var(--accent-color) 15%, transparent)'
                            : 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                          border: selectedPlan === 'monthly'
                            ? '2px solid var(--accent-color)'
                            : '2px solid var(--card-border)',
                        }}
                      >
                        {selectedPlan === 'monthly' && (
                          <div
                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--accent-color)' }}
                          >
                            <Check className="w-4 h-4" style={{ color: 'var(--bg-color)' }} />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Monthly</span>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cancel anytime</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatPrice(monthlyPackage)}</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>/month</div>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Subscribe button - iOS */}
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      const pkg = selectedPlan === 'annual' ? annualPackage : monthlyPackage;
                      if (pkg) handleIOSPurchase(pkg);
                    }}
                    disabled={isCheckingOut}
                    className="w-full font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
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
                      <span>Subscribe Now</span>
                    )}
                  </button>

                  {/* Restore purchases button */}
                  <button
                    onClick={() => { triggerHaptic('light'); handleRestorePurchases(); }}
                    disabled={isRestoring}
                    className="w-full text-sm py-2 transition-colors mb-4"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {isRestoring ? 'Restoring...' : 'Restore Purchases'}
                  </button>
                </>
              )}

              {/* iOS disclaimers */}
              <div className="space-y-3 text-center">
                <p className="text-xs leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
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
                  className="w-full p-4 rounded-xl transition-all text-left relative"
                  style={{
                    backgroundColor: selectedPlan === 'annual'
                      ? 'color-mix(in srgb, var(--accent-color) 15%, transparent)'
                      : 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                    border: selectedPlan === 'annual'
                      ? '2px solid var(--accent-color)'
                      : '2px solid var(--card-border)',
                  }}
                >
                  {selectedPlan === 'annual' && (
                    <div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    >
                      <Check className="w-4 h-4" style={{ color: 'var(--bg-color)' }} />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Annual</span>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full font-semibold">
                          SAVE 25%
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>$35.88 billed annually</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: 'var(--accent-color)' }}>$2.99</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>/month</div>
                    </div>
                  </div>
                </button>

                {/* Monthly Plan */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('monthly')}
                  className="w-full p-4 rounded-xl transition-all text-left relative"
                  style={{
                    backgroundColor: selectedPlan === 'monthly'
                      ? 'color-mix(in srgb, var(--accent-color) 15%, transparent)'
                      : 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                    border: selectedPlan === 'monthly'
                      ? '2px solid var(--accent-color)'
                      : '2px solid var(--card-border)',
                  }}
                >
                  {selectedPlan === 'monthly' && (
                    <div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    >
                      <Check className="w-4 h-4" style={{ color: 'var(--bg-color)' }} />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Monthly</span>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Flexible, cancel anytime</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>$3.99</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>/month</div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Subscribe button - Web */}
              <button
                onClick={() => handleSubscribe(selectedPlan)}
                disabled={isCheckingOut}
                className="w-full font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  color: 'var(--bg-color)',
                }}
              >
                {isCheckingOut ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--bg-color)' }} />
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
                <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <CreditCard className="w-4 h-4" />
                  Secure payment via Square
                </div>
                <div className="flex items-center justify-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span>Credit/Debit Cards</span>
                  <span>•</span>
                  <span>Apple Pay</span>
                  <span>•</span>
                  <span>Google Pay</span>
                </div>
                <p className="text-xs leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
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
