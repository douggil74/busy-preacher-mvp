'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Playfair_Display } from 'next/font/google';
import { usePlatform } from '@/hooks/usePlatform';
import { isWhitelisted } from '@/lib/whitelist';
import { ConfirmationResult } from 'firebase/auth';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, isLoading, signInWithEmail, signUpWithEmail, resetPassword, sendPhoneCode, verifyPhoneCode } = useAuth();
  const { isPaid, isApp, isLoading: platformLoading } = usePlatform();
  const router = useRouter();

  // Auth method toggle
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Email auth state
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');

  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneStep, setPhoneStep] = useState<'enter' | 'verify'>('enter');
  const [phoneFirstName, setPhoneFirstName] = useState('');

  // Common state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Whitelisted users get automatic access
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

  // Format phone number as user types
  const formatPhoneDisplay = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else if (mode === 'signup') {
        if (!firstName.trim()) {
          setError('Please enter your first name');
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, firstName.trim(), firstName.trim());
      } else if (mode === 'reset') {
        await resetPassword(email);
        setMessage('Password reset email sent! Check your inbox.');
        setMode('signin');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Please enter a valid email address');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email. Try signing up!');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Try again or reset your password.');
          break;
        case 'auth/email-already-in-use':
          setError('An account already exists with this email. Try signing in!');
          break;
        case 'auth/weak-password':
          setError('Password must be at least 6 characters');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later.');
          break;
        default:
          setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (!phoneFirstName.trim()) {
        setError('Please enter your first name');
        setIsSubmitting(false);
        return;
      }

      const numbers = phoneNumber.replace(/\D/g, '');
      if (numbers.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        setIsSubmitting(false);
        return;
      }

      const result = await sendPhoneCode(numbers, 'recaptcha-container');
      setConfirmationResult(result);
      setPhoneStep('verify');
      setMessage('Verification code sent! Check your text messages.');
    } catch (err: any) {
      console.error('Phone auth error:', err);
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Please check and try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.message || 'Failed to send code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (!confirmationResult) {
        setError('Session expired. Please request a new code.');
        setPhoneStep('enter');
        return;
      }

      if (verificationCode.length !== 6) {
        setError('Please enter the 6-digit code');
        setIsSubmitting(false);
        return;
      }

      await verifyPhoneCode(confirmationResult, verificationCode, phoneFirstName.trim());
    } catch (err: any) {
      console.error('Verification error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid code. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('Code expired. Please request a new one.');
        setPhoneStep('enter');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchAuthMethod = (method: 'email' | 'phone') => {
    setAuthMethod(method);
    setError(null);
    setMessage(null);
    setPhoneStep('enter');
    setVerificationCode('');
    setConfirmationResult(null);
  };

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className={`${playfair.className} text-3xl font-bold text-white text-center mb-3`}>
              {authMethod === 'phone'
                ? (phoneStep === 'verify' ? 'Enter Code' : 'Sign In')
                : (mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password')}
            </h1>
            <p className="text-white/70 text-center mb-6">
              {authMethod === 'phone'
                ? (phoneStep === 'verify' ? 'Enter the code sent to your phone' : 'Sign in with your phone number')
                : (mode === 'signin'
                  ? 'Sign in to access all features'
                  : mode === 'signup'
                  ? 'Join our community today'
                  : 'Enter your email to reset your password')}
            </p>

            {/* Auth Method Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => switchAuthMethod('email')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  authMethod === 'email'
                    ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => switchAuthMethod('phone')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  authMethod === 'phone'
                    ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                Phone
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                {message}
              </div>
            )}

            {/* Phone Auth Form */}
            {authMethod === 'phone' && (
              <>
                {phoneStep === 'enter' ? (
                  <form onSubmit={handleSendPhoneCode} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={phoneFirstName}
                        onChange={(e) => setPhoneFirstName(e.target.value)}
                        placeholder="Your first name"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formatPhoneDisplay(phoneNumber)}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="(555) 555-5555"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50 transition-colors"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Verification Code'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50 transition-colors text-center text-2xl tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPhoneStep('enter'); setMessage(null); }}
                      className="w-full text-white/50 hover:text-white/70 text-sm transition-colors"
                    >
                      Use a different number
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Email Auth Form */}
            {authMethod === 'email' && (
              <>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Your first name"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50 transition-colors"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50 transition-colors"
                      required
                    />
                  </div>

                  {mode !== 'reset' && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50 transition-colors"
                        required
                        minLength={6}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? 'Please wait...'
                      : mode === 'signin'
                      ? 'Sign In'
                      : mode === 'signup'
                      ? 'Create Account'
                      : 'Send Reset Email'}
                  </button>
                </form>

                {/* Email Mode Switcher */}
                <div className="mt-6 text-center space-y-2">
                  {mode === 'signin' && (
                    <>
                      <button
                        onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
                        className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
                      >
                        Don't have an account? Sign up
                      </button>
                      <br />
                      <button
                        onClick={() => { setMode('reset'); setError(null); setMessage(null); }}
                        className="text-white/50 hover:text-white/70 text-sm transition-colors"
                      >
                        Forgot password?
                      </button>
                    </>
                  )}
                  {mode === 'signup' && (
                    <button
                      onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
                    >
                      Already have an account? Sign in
                    </button>
                  )}
                  {mode === 'reset' && (
                    <button
                      onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
                    >
                      Back to sign in
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Invisible reCAPTCHA container */}
            <div id="recaptcha-container"></div>

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
