'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { Check, Sparkles, X } from 'lucide-react';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  formatPrice,
  getPackageType,
} from '@/lib/revenuecat';

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

      // Select monthly by default (most common option)
      // Annual will show automatically when configured in App Store Connect
      const monthlyPkg = availablePackages.find(p => getPackageType(p) === 'monthly');
      if (monthlyPkg) {
        setSelectedPackage(monthlyPkg);
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
        <div
          className="p-6 text-center"
          style={{ borderBottom: '1px solid var(--card-border)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-color) 15%, transparent)',
              border: '2px solid var(--accent-color)',
            }}
          >
            <Sparkles className="w-8 h-8" style={{ color: 'var(--accent-color)' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-color)' }}>
            Unlock Full Access
          </h2>
          {trialDaysRemaining !== undefined && trialDaysRemaining > 0 && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your trial ends in <span className="font-bold" style={{ color: 'var(--accent-color)' }}>{trialDaysRemaining} days</span>
            </p>
          )}
        </div>

        {/* Features */}
        <div className="p-6">
          <div
            className="rounded-xl p-4 mb-6"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Premium Features:</h3>
            <div className="space-y-2">
              {[
                'Daily devotionals & Bible study',
                'Ask the Pastor - AI guidance',
                'Deep study tools & courses',
                'Prayer community & support',
                'Offline access',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: 'var(--accent-color)' }}
              />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div
              className="rounded-lg p-3 mb-4"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <p className="text-red-500 text-sm text-center">{error}</p>
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
                    className="w-full p-4 rounded-xl transition-all text-left"
                    style={{
                      backgroundColor: isSelected
                        ? 'color-mix(in srgb, var(--accent-color) 15%, transparent)'
                        : 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                      border: isSelected
                        ? '2px solid var(--accent-color)'
                        : '2px solid var(--card-border)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            border: isSelected ? '2px solid var(--accent-color)' : '2px solid var(--card-border)',
                            backgroundColor: isSelected ? 'var(--accent-color)' : 'transparent',
                          }}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--bg-color)' }} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {isAnnual ? 'Annual' : 'Monthly'}
                            </span>
                            {isAnnual && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">
                                BEST VALUE
                              </span>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {isAnnual ? 'Billed annually' : 'Billed monthly'}
                          </p>
                        </div>
                      </div>
                      <span
                        className="font-bold"
                        style={{ color: isAnnual ? 'var(--accent-color)' : 'var(--text-primary)' }}
                      >
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
              <p style={{ color: 'var(--text-secondary)' }}>No subscription options available at this time.</p>
            </div>
          )}

          {/* Subscribe Button */}
          {!isLoading && packages.length > 0 && (
            <button
              type="button"
              onClick={handlePurchase}
              disabled={isPurchasing || !selectedPackage}
              className="w-full font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              style={{
                backgroundColor: 'var(--accent-color)',
                color: 'var(--bg-color)',
              }}
            >
              {isPurchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--bg-color)' }} />
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
            className="w-full py-3 transition-colors text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isRestoring ? 'Restoring...' : 'Restore Purchases'}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 transition-colors text-sm mt-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Maybe Later
          </button>

          {/* Terms */}
          <p className="text-xs text-center mt-4 px-4" style={{ color: 'var(--text-secondary)' }}>
            Subscriptions will be charged to your Apple ID. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
          </p>
        </div>
      </div>
    </div>
  );
}
