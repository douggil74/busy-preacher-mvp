'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Playfair_Display } from 'next/font/google';
import { usePlatform } from '@/hooks/usePlatform';
import { isWhitelisted } from '@/lib/whitelist';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, isLoading, signInWithGoogle, signInWithApple } = useAuth();
  const { isPaid, isApp, isLoading: platformLoading } = usePlatform();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInMethod, setSignInMethod] = useState<'apple' | 'google' | null>(null);

  // Whitelisted users (admin + friends) get automatic access
  if (user?.email && isWhitelisted(user.email)) {
    return <>{children}</>;
  }

  // iOS app users (who paid $2.99) get automatic access
  if (isPaid && isApp && !platformLoading) {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (isLoading || platformLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full">
                <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className={`${playfair.className} text-3xl font-bold text-white text-center mb-3`}>
              Sign In Required
            </h1>
            <p className="text-white/70 text-center mb-6">
              Create a free account to access all features
            </p>
            <p className="text-white/50 text-sm text-center mb-8">
              iOS app users already have access ✓
            </p>

            {/* Sign In Buttons */}
            <div className="space-y-3">
              {/* Apple Sign In - MUST be first per Apple guidelines */}
              <button
                onClick={async () => {
                  setIsSigningIn(true);
                  setSignInMethod('apple');
                  try {
                    await signInWithApple();
                  } catch (error) {
                    console.error('Apple sign in error:', error);
                    setIsSigningIn(false);
                    setSignInMethod(null);
                  }
                }}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
              >
                {isSigningIn && signInMethod === 'apple' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <span>Continue with Apple</span>
                  </>
                )}
              </button>

              {/* Google Sign In */}
              <button
                onClick={async () => {
                  setIsSigningIn(true);
                  setSignInMethod('google');
                  try {
                    await signInWithGoogle();
                  } catch (error) {
                    console.error('Google sign in error:', error);
                    setIsSigningIn(false);
                    setSignInMethod(null);
                  }
                }}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-slate-900 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn && signInMethod === 'google' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Back to Home */}
            <button
              onClick={() => router.push('/')}
              className="w-full mt-4 px-6 py-3 text-white/70 hover:text-white transition-colors text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
