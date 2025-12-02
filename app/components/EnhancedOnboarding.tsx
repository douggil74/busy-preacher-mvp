// app/components/EnhancedOnboarding.tsx
"use client";

import { useState, useEffect } from "react";
import { Playfair_Display, Nunito_Sans } from "next/font/google";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmationResult } from "firebase/auth";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface OnboardingData {
  name: string;
  studyStyle: "Casual Devotional" | "Bible Student" | "Pastor/Teacher";
  studyGoal: string;
  weeklyFrequency: number;
  enableDevotional: boolean;
  enableReadingPlan: boolean;
  enableReminders: boolean;
  email: string;
}

interface EnhancedOnboardingProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void;
}

export function EnhancedOnboarding({ isOpen, onComplete }: EnhancedOnboardingProps) {
  const { user, signInWithEmail, signUpWithEmail, resetPassword, updateUserPhone, sendPhoneCode, verifyPhoneCode } = useAuth();
  const [step, setStep] = useState(0);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signup');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Email auth form fields
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authPhone, setAuthPhone] = useState('');

  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneFirstName, setPhoneFirstName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneStep, setPhoneStep] = useState<'enter' | 'verify'>('enter');

  const [data, setData] = useState<OnboardingData>({
    name: "",
    studyStyle: "Casual Devotional",
    studyGoal: "",
    weeklyFrequency: 3,
    enableDevotional: true,
    enableReadingPlan: true,
    enableReminders: true,
    email: "",
  });

  // Terms agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Check if user has onboarded before
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('bc-study-style');
    if (hasOnboarded) {
      const savedData = localStorage.getItem('bc-onboarding-data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.name) {
          setData(prev => ({ ...prev, name: parsed.name }));
        }
      }
    }
  }, []);

  // Auto-advance from sign-in step when user signs in
  useEffect(() => {
    if (user && step === 0) {
      setData(prev => ({
        ...prev,
        name: user.firstName || "",
        email: user.email || ""
      }));
      setIsSubmitting(false);
      setStep(1);
    }
  }, [user, step]);

  if (!isOpen) return null;

  const totalSteps = 6;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData({ ...data, ...updates });
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'signin') {
        await signInWithEmail(authEmail, authPassword);
      } else if (authMode === 'signup') {
        // Use email prefix as temp name - real name collected in Step 1
        const tempName = authEmail.split('@')[0] || 'User';
        await signUpWithEmail(authEmail, authPassword, tempName, tempName);
      } else if (authMode === 'reset') {
        await resetPassword(authEmail);
        setAuthMessage('Password reset email sent! Check your inbox.');
        setAuthMode('signin');
        setIsSubmitting(false);
        return;
      }
    } catch (err: any) {
      console.error('Auth error:', err.code, err.message);
      switch (err.code) {
        case 'auth/invalid-email':
          setAuthError('Please enter a valid email address');
          break;
        case 'auth/user-not-found':
          setAuthError('No account found. Try signing up!');
          break;
        case 'auth/wrong-password':
          setAuthError('Incorrect password');
          break;
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
          setAuthError('Invalid email or password. Please try again.');
          break;
        case 'auth/email-already-in-use':
          setAuthError('This email is already registered. Switching to sign in...');
          setTimeout(() => setAuthMode('signin'), 1500);
          break;
        case 'auth/weak-password':
          setAuthError('Password must be at least 6 characters');
          break;
        case 'auth/too-many-requests':
          setAuthError('Too many attempts. Please try again later.');
          break;
        default:
          setAuthError(err.message || 'Something went wrong');
      }
      setIsSubmitting(false);
    }
  };

  // Format phone number as user types
  const formatPhoneDisplay = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setIsSubmitting(true);

    try {
      if (!phoneFirstName.trim()) {
        setAuthError('Please enter your first name');
        setIsSubmitting(false);
        return;
      }

      const numbers = phoneNumber.replace(/\D/g, '');
      if (numbers.length !== 10) {
        setAuthError('Please enter a valid 10-digit phone number');
        setIsSubmitting(false);
        return;
      }

      const result = await sendPhoneCode(numbers, 'onboarding-recaptcha-container');
      setConfirmationResult(result);
      setPhoneStep('verify');
      setAuthMessage('Verification code sent! Check your text messages.');
    } catch (err: any) {
      console.error('Phone auth error:', err);
      if (err.code === 'auth/invalid-phone-number') {
        setAuthError('Invalid phone number. Please check and try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Too many attempts. Please try again later.');
      } else {
        setAuthError(err.message || 'Failed to send code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setIsSubmitting(true);

    try {
      if (!confirmationResult) {
        setAuthError('Session expired. Please request a new code.');
        setPhoneStep('enter');
        return;
      }

      if (verificationCode.length !== 6) {
        setAuthError('Please enter the 6-digit code');
        setIsSubmitting(false);
        return;
      }

      await verifyPhoneCode(confirmationResult, verificationCode, phoneFirstName.trim());
    } catch (err: any) {
      console.error('Verification error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setAuthError('Invalid code. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setAuthError('Code expired. Please request a new one.');
        setPhoneStep('enter');
      } else {
        setAuthError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchAuthMethod = (method: 'email' | 'phone') => {
    setAuthMethod(method);
    setAuthError(null);
    setAuthMessage(null);
    setPhoneStep('enter');
    setVerificationCode('');
    setConfirmationResult(null);
  };

  const handleComplete = async () => {
    localStorage.setItem('bc-study-style', data.studyStyle);
    localStorage.setItem('bc-onboarding-complete', 'true');
    localStorage.setItem('bc-onboarding-data', JSON.stringify({
      name: data.name,
      studyGoal: data.studyGoal,
      weeklyFrequency: data.weeklyFrequency,
      enableDevotional: data.enableDevotional,
      enableReadingPlan: data.enableReadingPlan,
      enableReminders: data.enableReminders,
      email: data.email,
      completedAt: new Date().toISOString(),
    }));
    onComplete(data);
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!user;
      case 1:
        return data.name.trim().length > 0;
      case 2:
        return true;
      case 3:
        return data.studyGoal.trim().length > 0;
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl border-2 border-yellow-400/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Progress Bar */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur px-8 pt-6 pb-4 border-b border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">Step {step} of {totalSteps}</span>
            <span className="text-sm text-white/60">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 0: Sign In/Up */}
          {step === 0 && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h2 className={`${playfair.className} text-3xl font-bold text-yellow-400 mb-3`}>
                {authMethod === 'phone'
                  ? (phoneStep === 'verify' ? 'Enter Code' : 'Sign In with Phone')
                  : (authMode === 'signup' ? 'Start Your Free Trial' : authMode === 'signin' ? 'Welcome Back' : 'Reset Password')}
              </h2>
              <p className="text-lg text-white/80 leading-relaxed mb-2">
                {authMethod === 'phone'
                  ? (phoneStep === 'verify' ? 'Enter the code sent to your phone' : 'Quick sign in with your phone number')
                  : (authMode === 'signup'
                    ? 'Join thousands of believers deepening their faith'
                    : authMode === 'signin'
                    ? 'Sign in to continue your journey'
                    : 'Enter your email to reset password')}
              </p>
              {authMethod === 'email' && authMode === 'signup' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm">
                  <span>7 days free</span>
                  <span className="text-white/40">•</span>
                  <span>Then just $2.99/mo</span>
                </div>
              )}

              {/* Auth Method Toggle - More Prominent */}
              <div className="flex gap-3 max-w-md mx-auto mb-2">
                <button
                  onClick={() => switchAuthMethod('email')}
                  className={`flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${
                    authMethod === 'email'
                      ? 'bg-yellow-400/20 border-2 border-yellow-400 text-yellow-400 shadow-lg shadow-yellow-400/20'
                      : 'bg-white/5 border-2 border-white/20 text-white/70 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </button>
                <button
                  onClick={() => switchAuthMethod('phone')}
                  className={`flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${
                    authMethod === 'phone'
                      ? 'bg-yellow-400/20 border-2 border-yellow-400 text-yellow-400 shadow-lg shadow-yellow-400/20'
                      : 'bg-white/5 border-2 border-white/20 text-white/70 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Phone
                </button>
              </div>
              <p className="text-white/50 text-xs max-w-md mx-auto">
                {authMethod === 'phone' ? 'Quick sign in - no password needed!' : 'Sign in with your email and password'}
              </p>

              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {authError}
                </div>
              )}

              {authMessage && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  {authMessage}
                </div>
              )}

              {/* Phone Auth Form */}
              {authMethod === 'phone' && (
                <>
                  {phoneStep === 'enter' ? (
                    <form onSubmit={handleSendPhoneCode} className="max-w-md mx-auto space-y-4">
                      <input
                        type="text"
                        value={phoneFirstName}
                        onChange={(e) => setPhoneFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50"
                        required
                      />
                      <input
                        type="tel"
                        value={formatPhoneDisplay(phoneNumber)}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="(555) 555-5555"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Verification Code'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyCode} className="max-w-md mx-auto space-y-4">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50 text-center text-2xl tracking-widest"
                        maxLength={6}
                        required
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? 'Verifying...' : 'Verify Code'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPhoneStep('enter'); setAuthMessage(null); }}
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
                  <form onSubmit={handleAuthSubmit} className="max-w-md mx-auto space-y-4">
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50"
                      required
                    />

                    {authMode !== 'reset' && (
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Password (min 6 characters)"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50"
                        required
                        minLength={6}
                      />
                    )}

                    {authMode === 'signup' && (
                      <label className="flex items-start gap-3 text-left cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-white/30 bg-white/5 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                          I agree to the{' '}
                          <a href="/terms" target="_blank" className="text-yellow-400 hover:text-yellow-300 underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="/privacy" target="_blank" className="text-yellow-400 hover:text-yellow-300 underline">
                            Privacy Policy
                          </a>
                        </span>
                      </label>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || (authMode === 'signup' && !agreedToTerms)}
                      className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? 'Please wait...'
                        : authMode === 'signup'
                        ? 'Start My Free Trial'
                        : authMode === 'signin'
                        ? 'Sign In'
                        : 'Send Reset Email'}
                    </button>
                    {authMode === 'signup' && (
                      <div className="space-y-3 mt-4">
                        <p className="text-white/50 text-xs">
                          No credit card required to start your free trial.
                        </p>
                        <div className="pt-3 border-t border-white/10 space-y-2">
                          <div className="flex items-center justify-center gap-2 text-white/50 text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Secure payment via Square after trial
                          </div>
                          <div className="flex items-center justify-center gap-3 text-white/40 text-xs">
                            <span>Credit/Debit</span>
                            <span>•</span>
                            <span>Apple Pay</span>
                            <span>•</span>
                            <span>Google Pay</span>
                          </div>
                          <p className="text-white/40 text-xs leading-relaxed">
                            After your 7-day trial, subscription auto-renews at $2.99/mo or $35.88/yr.
                            Cancel anytime.
                          </p>
                        </div>
                      </div>
                    )}
                  </form>

                  <div className="space-y-2">
                    {authMode === 'signup' && (
                      <button
                        onClick={() => { setAuthMode('signin'); setAuthError(null); setAuthMessage(null); }}
                        className="text-yellow-400 hover:text-yellow-300 text-sm"
                      >
                        Already have an account? Sign in
                      </button>
                    )}
                    {authMode === 'signin' && (
                      <>
                        <button
                          onClick={() => { setAuthMode('signup'); setAuthError(null); setAuthMessage(null); }}
                          className="text-yellow-400 hover:text-yellow-300 text-sm"
                        >
                          Need an account? Sign up
                        </button>
                        <br />
                        <button
                          onClick={() => { setAuthMode('reset'); setAuthError(null); setAuthMessage(null); }}
                          className="text-white/50 hover:text-white/70 text-sm"
                        >
                          Forgot password?
                        </button>
                      </>
                    )}
                    {authMode === 'reset' && (
                      <button
                        onClick={() => { setAuthMode('signin'); setAuthError(null); setAuthMessage(null); }}
                        className="text-yellow-400 hover:text-yellow-300 text-sm"
                      >
                        Back to sign in
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Invisible reCAPTCHA container */}
              <div id="onboarding-recaptcha-container"></div>
            </div>
          )}

          {/* Step 1: Welcome & Name */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h2 className={`${playfair.className} text-3xl font-bold text-yellow-400 mb-3`}>
                Welcome to The Busy Christian
              </h2>
              <p className="text-lg text-white/80 leading-relaxed mb-6">
                We're here to help you engage meaningfully with Scripture, no matter how busy life gets.
              </p>

              <div className="mt-8 space-y-4 max-w-md mx-auto">
                <div className="text-left">
                  <label className="block text-lg font-semibold text-white mb-3">
                    What's your first name?
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => updateData({ name: e.target.value })}
                    placeholder="Enter your first name"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50 transition-colors"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Study Style */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className={`${playfair.className} text-2xl font-bold text-yellow-400 mb-3`}>
                  Choose Your Study Style
                </h2>
                <p className="text-white/70">
                  This helps us personalize the depth and tone of your Bible studies
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    style: "Casual Devotional" as const,
                    emoji: "☕",
                    description: "Quick, encouraging insights for daily reflection",
                    details: "5-10 minute studies • Practical applications • Conversational tone",
                  },
                  {
                    style: "Bible Student" as const,
                    emoji: "📖",
                    description: "Deeper exploration with cross-references and context",
                    details: "15-20 minute studies • Word studies • Historical background",
                  },
                  {
                    style: "Pastor/Teacher" as const,
                    emoji: "👨‍🏫",
                    description: "Comprehensive analysis for teaching and preaching",
                    details: "20-30 minute studies • Exegesis • Sermon prep resources",
                  },
                ].map((option) => (
                  <button
                    key={option.style}
                    onClick={() => updateData({ studyStyle: option.style })}
                    className={`w-full text-left rounded-xl border-2 p-5 transition-all ${
                      data.studyStyle === option.style
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{option.emoji}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{option.style}</h3>
                        <p className="text-white/70 text-sm mb-2">{option.description}</p>
                        <p className="text-white/50 text-xs">{option.details}</p>
                      </div>
                      {data.studyStyle === option.style && (
                        <div className="text-yellow-400 text-2xl">✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Study Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🎯</div>
                <h2 className={`${playfair.className} text-2xl font-bold text-yellow-400 mb-3`}>
                  What's Your Study Goal?
                </h2>
                <p className="text-white/70">
                  We'll help keep you focused and encouraged
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Grow closer to God through daily Scripture",
                  "Understand the Bible more deeply",
                  "Prepare sermons and teachings",
                  "Find answers to life's questions",
                  "Build a consistent Bible reading habit",
                  "Other",
                ].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => updateData({ studyGoal: goal })}
                    className={`w-full text-left rounded-lg border p-4 transition-all ${
                      data.studyGoal === goal
                        ? "border-yellow-400 bg-yellow-400/10 text-white"
                        : "border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{goal}</span>
                      {data.studyGoal === goal && (
                        <span className="text-yellow-400">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {data.studyGoal === "Other" && (
                <textarea
                  placeholder="Tell us your specific goal..."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50 min-h-[100px]"
                  onChange={(e) => updateData({ studyGoal: e.target.value })}
                />
              )}
            </div>
          )}

          {/* Step 4: Frequency */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">📅</div>
                <h2 className={`${playfair.className} text-2xl font-bold text-yellow-400 mb-3`}>
                  How Often Will You Study?
                </h2>
                <p className="text-white/70">
                  Set a realistic goal - you can always adjust later
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-yellow-400 mb-2">
                    {data.weeklyFrequency}
                  </div>
                  <div className="text-white/70">
                    {data.weeklyFrequency === 1 ? "time" : "times"} per week
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="7"
                  value={data.weeklyFrequency}
                  onChange={(e) => updateData({ weeklyFrequency: parseInt(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />

                <div className="flex justify-between text-xs text-white/50 mt-2">
                  <span>1x/week</span>
                  <span>Daily</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Feature Preferences */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">⚙️</div>
                <h2 className={`${playfair.className} text-2xl font-bold text-yellow-400 mb-3`}>
                  Customize Your Experience
                </h2>
                <p className="text-white/70">
                  Enable the features that work best for you
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "enableDevotional" as const,
                    emoji: "🌅",
                    title: "Daily Devotional",
                    description: "Start each day with a fresh devotional",
                  },
                  {
                    key: "enableReadingPlan" as const,
                    emoji: "📖",
                    title: "Reading Plan Widget",
                    description: "Track your progress through Bible reading plans",
                  },
                  {
                    key: "enableReminders" as const,
                    emoji: "🔔",
                    title: "Study Reminders",
                    description: "Gentle encouragement when you haven't studied",
                  },
                ].map((feature) => (
                  <button
                    key={feature.key}
                    onClick={() => updateData({ [feature.key]: !data[feature.key] })}
                    className={`w-full text-left rounded-xl border-2 p-5 transition-all ${
                      data[feature.key]
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{feature.emoji}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                        <p className="text-white/70 text-sm">{feature.description}</p>
                      </div>
                      <div
                        className={`w-12 h-6 rounded-full transition-all relative ${
                          data[feature.key] ? "bg-yellow-400" : "bg-white/20"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                            data[feature.key] ? "left-7" : "left-1"
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Confirmation */}
          {step === 6 && (
            <div className="space-y-6 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className={`${playfair.className} text-2xl font-bold text-yellow-400 mb-3`}>
                All Set, {data.name}!
              </h2>

              <div className="max-w-md mx-auto p-6 rounded-xl bg-white/5 border border-white/10 text-left">
                <h3 className="font-semibold text-lg mb-3 text-yellow-400">Your Preferences:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Study Style:</span>
                    <span className="font-semibold">{data.studyStyle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Goal:</span>
                    <span className="font-semibold">{data.studyGoal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Frequency:</span>
                    <span className="font-semibold">{data.weeklyFrequency}x per week</span>
                  </div>
                </div>
              </div>

              <p className="text-white/70">
                Your personalized Bible study experience is ready!
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur px-8 py-6 border-t border-white/10">
          <div className="flex gap-4">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                ← Back
              </button>
            )}

            {step < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1 px-6 py-3 rounded-lg bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex-1 px-6 py-3 rounded-lg bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300 transition-colors"
              >
                Start Studying!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
