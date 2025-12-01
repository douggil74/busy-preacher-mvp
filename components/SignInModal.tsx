// components/SignInModal.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmationResult } from 'firebase/auth';
import { X, Mail, Phone, ArrowRight } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function SignInModal({ isOpen, onClose, message }: SignInModalProps) {
  const { signInWithEmail, signUpWithEmail, resetPassword, sendPhoneCode, verifyPhoneCode } = useAuth();

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatPhoneDisplay = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        // Mark onboarding as complete for returning users
        localStorage.setItem('bc-onboarding-complete', 'true');
        localStorage.setItem('onboarding_completed', 'true');
        onClose();
      } else if (mode === 'signup') {
        if (!firstName.trim()) {
          setError('Please enter your first name');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, firstName.trim(), firstName.trim());
        // Set onboarding complete for new users too - they don't need slides
        localStorage.setItem('bc-onboarding-complete', 'true');
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('bc-user-name', firstName.trim());
        onClose();
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccessMessage('Password reset email sent! Check your inbox.');
        setMode('signin');
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (err: any) => {
    console.error('Auth error:', err.code, err.message);
    switch (err.code) {
      case 'auth/invalid-email':
        setError('Please enter a valid email address');
        break;
      case 'auth/user-not-found':
        setError('No account found with this email');
        break;
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        setError('Invalid email or password');
        break;
      case 'auth/email-already-in-use':
        setError('An account already exists with this email');
        break;
      case 'auth/weak-password':
        setError('Password must be at least 6 characters');
        break;
      case 'auth/too-many-requests':
        setError('Too many attempts. Please try again later.');
        break;
      default:
        setError(err.message || 'Something went wrong');
    }
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!phoneFirstName.trim()) {
        setError('Please enter your first name');
        setLoading(false);
        return;
      }

      const numbers = phoneNumber.replace(/\D/g, '');
      if (numbers.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        setLoading(false);
        return;
      }

      const result = await sendPhoneCode(numbers, 'modal-recaptcha-container');
      setConfirmationResult(result);
      setPhoneStep('verify');
      setSuccessMessage('Code sent! Check your messages.');
    } catch (err: any) {
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.');
      } else {
        setError('Failed to send code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!confirmationResult) {
        setError('Session expired. Please request a new code.');
        setPhoneStep('enter');
        return;
      }

      await verifyPhoneCode(confirmationResult, verificationCode, phoneFirstName.trim());
      localStorage.setItem('bc-onboarding-complete', 'true');
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('bc-user-name', phoneFirstName.trim());
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid code');
      } else {
        setError('Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchAuthMethod = (method: 'email' | 'phone') => {
    setAuthMethod(method);
    setError(null);
    setSuccessMessage(null);
    setPhoneStep('enter');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100] p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            {message || 'Sign in to access your personalized study experience'}
          </p>
        </div>

        {/* Auth Method Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => switchAuthMethod('email')}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: authMethod === 'email'
                ? 'color-mix(in srgb, var(--accent-color) 20%, transparent)'
                : 'transparent',
              border: authMethod === 'email'
                ? '2px solid var(--accent-color)'
                : '2px solid var(--card-border)',
              color: authMethod === 'email' ? 'var(--accent-color)' : 'var(--text-secondary)',
            }}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => switchAuthMethod('phone')}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: authMethod === 'phone'
                ? 'color-mix(in srgb, var(--accent-color) 20%, transparent)'
                : 'transparent',
              border: authMethod === 'phone'
                ? '2px solid var(--accent-color)'
                : '2px solid var(--card-border)',
              color: authMethod === 'phone' ? 'var(--accent-color)' : 'var(--text-secondary)',
            }}
          >
            <Phone className="w-4 h-4" />
            Phone
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
            }}
          >
            {error}
          </div>
        )}
        {successMessage && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Phone Auth */}
        {authMethod === 'phone' && (
          <>
            {phoneStep === 'enter' ? (
              <form onSubmit={handleSendPhoneCode} className="space-y-3">
                <input
                  type="text"
                  value={phoneFirstName}
                  onChange={(e) => setPhoneFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                    border: '2px solid var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                  required
                />
                <input
                  type="tel"
                  value={formatPhoneDisplay(phoneNumber)}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="(555) 555-5555"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                    border: '2px solid var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    color: 'var(--bg-color)',
                  }}
                >
                  {loading ? 'Sending...' : 'Send Code'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-3">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl outline-none text-center text-2xl tracking-widest"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                    border: '2px solid var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                  maxLength={6}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    color: 'var(--bg-color)',
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneStep('enter')}
                  className="w-full text-sm py-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Use different number
                </button>
              </form>
            )}
          </>
        )}

        {/* Email Auth */}
        {authMethod === 'email' && (
          <>
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {mode === 'signup' && (
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                    border: '2px solid var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                  required
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                  border: '2px solid var(--card-border)',
                  color: 'var(--text-primary)',
                }}
                required
              />
              {mode !== 'reset' && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                    border: '2px solid var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                  required
                  minLength={6}
                />
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  color: 'var(--bg-color)',
                }}
              >
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="mt-4 text-center space-y-2">
              {mode === 'signin' && (
                <>
                  <button
                    onClick={() => { setMode('signup'); setError(null); }}
                    className="text-sm"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    Need an account? Sign up
                  </button>
                  <br />
                  <button
                    onClick={() => { setMode('reset'); setError(null); }}
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Forgot password?
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <button
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="text-sm"
                  style={{ color: 'var(--accent-color)' }}
                >
                  Already have an account? Sign in
                </button>
              )}
              {mode === 'reset' && (
                <button
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="text-sm"
                  style={{ color: 'var(--accent-color)' }}
                >
                  Back to sign in
                </button>
              )}
            </div>
          </>
        )}

        {/* Invisible reCAPTCHA container */}
        <div id="modal-recaptcha-container"></div>
      </div>
    </div>
  );
}
