'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { Playfair_Display } from 'next/font/google';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  formatPrice,
  getPackageType,
} from '@/lib/revenuecat';

const playfair = Playfair_Display({
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

interface IOSPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
  trialDaysRemaining?: number;
}

export function IOSPaywall({ isOpen, onClose, onPurchaseComplete, trialDaysRemaining }: IOSPaywallProps) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load offerings when modal opens
  useEffect(() => {
    if (isOpen && Capacitor.isNativePlatform()) {
      loadOfferings();
    }
  }, [isOpen]);

  const loadOfferings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const availablePackages = await getOfferings();
      setPackages(availablePackages);

      // Select annual by default
      const annualPkg = availablePackages.find(p => getPackageType(p) === 'annual');
      if (annualPkg) {
        setSelectedPackage(annualPkg);
      } else if (availablePackages.length > 0) {
        setSelectedPackage(availablePackages[0]);
      }
    } catch (err) {
      setError('Failed to load subscription options. Please try again.');
      console.error('Failed to load offerings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setIsPurchasing(true);
    setError(null);

    try {
      const customerInfo = await purchasePackage(selectedPackage);
      if (customerInfo) {
        // Purchase successful
        onPurchaseComplete();
        onClose();
      }
    } catch (err) {
      setError('Purchase failed. Please try again.');
      console.error('Purchase error:', err);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setError(null);

    try {
      const customerInfo = await restorePurchases();
      if (customerInfo?.entitlements.active['premium']) {
        // Has active subscription
        onPurchaseComplete();
        onClose();
      } else {
        setError('No active subscription found to restore.');
      }
    } catch (err) {
      setError('Failed to restore purchases. Please try again.');
      console.error('Restore error:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  // Only show on native platform
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-slate-900 rounded-2xl border-2 border-yellow-400/30 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 text-center border-b border-white/10">
          <div className="text-5xl mb-3">✨</div>
          <h2 className={`${playfair.className} text-2xl font-bold text-yellow-400 mb-2`}>
            Unlock Full Access
          </h2>
          {trialDaysRemaining !== undefined && trialDaysRemaining > 0 && (
            <p className="text-white/70 text-sm">
              Your trial ends in <span className="text-yellow-400 font-bold">{trialDaysRemaining} days</span>
            </p>
          )}
        </div>

        {/* Features */}
        <div className="p-6">
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-white font-semibold mb-3">Premium Features:</h3>
            <div className="space-y-2">
              {[
                'Daily devotionals & Bible study',
                'Ask the Pastor - AI guidance',
                'Deep study tools & courses',
                'Prayer community & support',
                'Offline access',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Subscription Options */}
          {!isLoading && packages.length > 0 && (
            <div className="space-y-3 mb-6">
              {packages.map((pkg) => {
                const pkgType = getPackageType(pkg);
                const isSelected = selectedPackage?.identifier === pkg.identifier;
                const isAnnual = pkgType === 'annual';

                return (
                  <button
                    key={pkg.identifier}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedPackage(pkg);
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-yellow-400 bg-yellow-400' : 'border-white/40'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-slate-900" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {isAnnual ? 'Annual' : 'Monthly'}
                            </span>
                            {isAnnual && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                BEST VALUE
                              </span>
                            )}
                          </div>
                          <p className="text-white/50 text-xs">
                            {isAnnual ? 'Billed annually' : 'Billed monthly'}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold ${isAnnual ? 'text-yellow-400' : 'text-white'}`}>
                        {formatPrice(pkg)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No Packages Available */}
          {!isLoading && packages.length === 0 && !error && (
            <div className="text-center py-6">
              <p className="text-white/60">No subscription options available at this time.</p>
            </div>
          )}

          {/* Subscribe Button */}
          {!isLoading && packages.length > 0 && (
            <button
              type="button"
              onClick={handlePurchase}
              disabled={isPurchasing || !selectedPackage}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isPurchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                  Processing...
                </span>
              ) : (
                'Subscribe Now'
              )}
            </button>
          )}

          {/* Restore Purchases */}
          <button
            type="button"
            onClick={handleRestore}
            disabled={isRestoring}
            className="w-full py-3 text-white/60 hover:text-white transition-colors text-sm"
          >
            {isRestoring ? 'Restoring...' : 'Restore Purchases'}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-white/40 hover:text-white/60 transition-colors text-sm mt-2"
          >
            Maybe Later
          </button>

          {/* Terms */}
          <p className="text-white/30 text-xs text-center mt-4 px-4">
            Subscriptions will be charged to your Apple ID. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
          </p>
        </div>
      </div>
    </div>
  );
}
