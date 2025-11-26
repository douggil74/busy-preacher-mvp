'use client';

import { usePlatform } from '@/hooks/usePlatform';

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

  // While loading, show nothing to avoid flash
  if (isLoading) {
    return null;
  }

  // iOS app users get full access (they already paid $2.99)
  if (isPaid || !showPaywall) {
    return <>{children}</>;
  }

  // Web users see the paywall
  return (
    <div className="relative">
      {/* Optional preview of content */}
      {showPreview && (
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
      )}

      {/* Paywall overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900 backdrop-blur-sm">
        <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Premium Content
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Get full access to all features, daily devotionals, and the prayer community.
          </p>

          <div className="space-y-4">
            {/* Download iOS app button */}
            <a
              href="https://apps.apple.com/app/the-busy-christian-app/YOUR_APP_ID"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Download iOS App - $2.99
            </a>

            {/* Future: Add web subscription option here */}
            <button
              onClick={() => alert('Web subscription coming soon!')}
              className="block w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Subscribe on Web - Coming Soon
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            One-time purchase on iOS. Cancel anytime on web.
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
