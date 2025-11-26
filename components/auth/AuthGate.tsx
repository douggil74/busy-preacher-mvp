'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePlatform } from '@/hooks/usePlatform';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGateProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Set to false to make page public
}

/**
 * AuthGate Component
 *
 * Protects content and requires users to sign in.
 * iOS app users who paid $2.99 automatically get access.
 * Web users need to create a free account.
 *
 * Usage:
 * <AuthGate>
 *   <ProtectedContent />
 * </AuthGate>
 */
export function AuthGate({ children, requireAuth = true }: AuthGateProps) {
  const { user, loading } = useAuth();
  const { isApp, isPaid } = usePlatform();
  const router = useRouter();

  useEffect(() => {
    // If auth not required, show content
    if (!requireAuth) return;

    // If still loading, wait
    if (loading) return;

    // iOS app users who paid get automatic access
    if (isPaid && isApp) return;

    // If not logged in, redirect to login
    if (!user) {
      router.push('/login');
    }
  }, [user, loading, requireAuth, isPaid, isApp, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth not required, show content
  if (!requireAuth) {
    return <>{children}</>;
  }

  // iOS app users get automatic access (they paid $2.99)
  if (isPaid && isApp) {
    return <>{children}</>;
  }

  // Show content only if user is logged in
  if (user) {
    return <>{children}</>;
  }

  // Not logged in - will redirect to login via useEffect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
      </div>
    </div>
  );
}
