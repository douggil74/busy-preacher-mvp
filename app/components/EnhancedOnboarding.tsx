// app/components/EnhancedOnboarding.tsx
"use client";

import { useState, useEffect } from "react";
import { Playfair_Display, Nunito_Sans } from "next/font/google";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user, signInWithGoogle, signInWithApple } = useAuth();
  const [step, setStep] = useState(0); // Start at 0 for sign-in
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInMethod, setSignInMethod] = useState<'apple' | 'google' | null>(null);
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
      // Pre-fill name and email from Google account
      setData(prev => ({
        ...prev,
        name: user.firstName || "",
        email: user.email || ""
      }));
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
    // Can't go back to sign-in step (step 0) once authenticated
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    // Save to localStorage
    localStorage.setItem('bc-study-style', data.studyStyle);
    localStorage.setItem('bc-onboarding-complete', 'true');

    // Save all preferences
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

    console.log('✅ Onboarding complete! Preferences saved locally.');

    onComplete(data);
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!user; // Must be signed in to proceed
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
        return true; // Email is optional
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
          {/* Step 0: Sign In */}
          {step === 0 && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-4">🙏</div>
              <h2 className={`${playfair.className} text-3xl font-bold text-yellow-400 mb-3`}>
                Sign In to Continue
              </h2>
              <p className="text-lg text-white/80 leading-relaxed mb-6">
                Join our prayer community and connect with others
              </p>

              <div className="mt-8 max-w-md mx-auto space-y-3">
                {/* Sign in with Apple - MUST be first per Apple guidelines */}
                <button
                  onClick={async () => {
                    setIsSigningIn(true);
                    setSignInMethod('apple');
                    try {
                      await signInWithApple();
                      // Auto-advance is handled by useEffect
                    } catch (error) {
                      console.error('Apple sign in error:', error);
                      setIsSigningIn(false);
                      setSignInMethod(null);
                    }
                  }}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black hover:bg-gray-900 text-white rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
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

                {/* Google Sign-In */}
                <button
                  onClick={async () => {
                    setIsSigningIn(true);
                    setSignInMethod('google');
                    try {
                      await signInWithGoogle();
                      // Auto-advance is handled by useEffect
                    } catch (error) {
                      console.error('Google sign in error:', error);
                      setIsSigningIn(false);
                      setSignInMethod(null);
                    }
                  }}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-slate-900 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

                <p className="text-sm text-white/50 mt-4">
                  We'll only display your first name publicly for your privacy
                </p>

                <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-blue-300 text-left">
                    <strong>Why sign in?</strong>
                    <br />
                    • Access pastoral guidance and AI-powered counseling
                    <br />
                    • Join the prayer community and share requests
                    <br />
                    • Save your preferences and progress
                  </p>
                </div>
              </div>
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

                <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-blue-300">
                    💡 <strong>Tip:</strong> Even 10 minutes a day can transform your faith journey!
                  </p>
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
                    description: "Start each day with a fresh devotional from Our Daily Bread",
                  },
                  {
                    key: "enableReadingPlan" as const,
                    emoji: "📖",
                    title: "Reading Plan Widget",
                    description: "Track your progress through structured Bible reading plans",
                  },
                  {
                    key: "enableReminders" as const,
                    emoji: "🔔",
                    title: "Study Reminders",
                    description: "Gentle encouragement when you haven't studied in a while",
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

          {/* Step 6: Email (Optional) */}
          {step === 6 && (
            <div className="space-y-6 text-center">
              <div className="text-5xl mb-4">💌</div>
              <h2 className={`${playfair.className} text-2xl font-bold text-yellow-400 mb-3`}>
                Stay Connected (Optional)
              </h2>

              <div className="max-w-md mx-auto">
                <p className="text-white/70 mb-6">
                  Get notified about new features, study resources, and occasional encouragement.
                </p>

                <div className="text-left mb-6">
                  <label className="block text-sm text-white/80 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => updateData({ email: e.target.value })}
                    placeholder="your@email.com (optional)"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50"
                  />
                  <p className="text-xs text-white/50 mt-2">
                    We'll never spam you. Unsubscribe anytime.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border border-yellow-400/30">
                  <h3 className={`${playfair.className} text-xl font-bold text-yellow-400 mb-2`}>
                    All Set, {data.name}! 🎉
                  </h3>
                  <p className="text-white/70 text-sm">
                    Your personalized Bible study experience is ready!
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="max-w-md mx-auto mt-8 p-6 rounded-xl bg-white/5 border border-white/10 text-left">
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
                Start Studying! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
