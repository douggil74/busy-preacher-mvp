// app/components/EnhancedOnboarding.tsx
"use client";

import { useState, useEffect } from "react";
import { Playfair_Display, Nunito_Sans } from "next/font/google";
import { useAuth } from "@/contexts/AuthContext";
import { SignInPrompt } from "@/components/SignInPrompt";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [showSignIn, setShowSignIn] = useState(false);
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

  // If user is authenticated AND has already onboarded before, use their display name and skip to step 2
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('bc-study-style');
    if (isAuthenticated && user?.displayName && hasOnboarded) {
      setData(prev => ({ ...prev, name: user.displayName || "" }));
      setStep(2); // Skip name question only if they've onboarded before
    }
  }, [isAuthenticated, user]);

  if (!isOpen) return null;

  const totalSteps = 7;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData({ ...data, ...updates });
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    // Save to localStorage (always)
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

    // If user is signed in, also save to Firestore
    if (isAuthenticated && user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          userId: user.uid,
          displayName: user.displayName || data.name,
          email: user.email || data.email,
          name: data.name,
          studyStyle: data.studyStyle,
          studyGoal: data.studyGoal,
          weeklyFrequency: data.weeklyFrequency,
          enableDevotional: data.enableDevotional,
          enableReadingPlan: data.enableReadingPlan,
          enableReminders: data.enableReminders,
          completedOnboarding: true,
          onboardedAt: new Date().toISOString(),
        }, { merge: true });
        
        console.log('✅ Preferences saved to cloud!');
      } catch (error) {
        console.error('Error saving to Firestore:', error);
      }
    }

    onComplete(data);
  };

  const canProceed = () => {
    switch (step) {
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
        return true; // Sign-in is optional
      case 7:
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
          {/* Step 1: Welcome & Sign In or Guest */}
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
                {/* Get Started - Primary */}
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-slate-900 text-white/40 text-xs">or sign in for cloud sync</span>
                  </div>
                </div>

                {/* Sign In Button - Secondary */}
                <button
                  onClick={() => setShowSignIn(true)}
                  className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In with Google</span>
                </button>
                <p className="text-center text-xs text-white/40">
                  Sign in to sync your progress and access all features
                </p>
              </div>

              {/* Sign In Modal */}
              <SignInPrompt
                isOpen={showSignIn}
                onClose={() => setShowSignIn(false)}
                message="Sign in to unlock all features including Ask the Pastor, Deep Study, and Prayer Community"
              />
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

          {/* Step 6: Sign In (Optional) - MOVED HERE */}
          {step === 6 && (
            <div className="space-y-6 text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h2 className={`${playfair.className} text-2xl font-bold text-yellow-400 mb-3`}>
                Save Your Progress
              </h2>
              <p className="text-white/70 max-w-md mx-auto">
                {isAuthenticated 
                  ? `Great! You're signed in as ${user?.displayName}. Your preferences will be saved to your account.`
                  : 'Sign in with Google to save your preferences and access them on any device.'
                }
              </p>

              {/* Show user info if signed in */}
              {isAuthenticated && user && (
                <div className="max-w-md mx-auto bg-green-900/20 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 justify-center">
                    {user.photoURL && (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-12 h-12 rounded-full border-2 border-green-400/30"
                      />
                    )}
                    <div className="text-left">
                      <p className="font-semibold text-green-400">{user.displayName}</p>
                      <p className="text-sm text-white/60">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sign-in option if not signed in */}
              {!isAuthenticated && (
                <div className="max-w-md mx-auto">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="font-semibold text-lg mb-3">Benefits of signing in:</h3>
                    <ul className="space-y-2 text-sm text-white/70 text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">✓</span>
                        <span>Sync preferences across all your devices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">✓</span>
                        <span>Join the prayer community</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">✓</span>
                        <span>Track your study progress</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">✓</span>
                        <span>Never lose your notes and highlights</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowSignIn(true)}
                    className="w-full bg-white hover:bg-neutral-100 text-neutral-900 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg mb-3"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                      <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                      <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
                      <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                  </button>

                  <p className="text-xs text-white/50">
                    You can also skip this and sign in later
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 7: Email (Optional) - NOW CONDITIONAL */}
          {step === 7 && (
            <div className="space-y-6 text-center">
              <div className="text-5xl mb-4">💌</div>
              <h2 className={`${playfair.className} text-2xl font-bold text-yellow-400 mb-3`}>
                {isAuthenticated && user?.email ? "You're All Set!" : "Stay Connected (Optional)"}
              </h2>
              
              {isAuthenticated && user?.email ? (
                <div className="max-w-md mx-auto space-y-6">
                  <p className="text-white/70">
                    We'll use <strong className="text-yellow-400">{user.email}</strong> to send you updates and encouragement.
                  </p>
                  
                  <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border border-yellow-400/30">
                    <h3 className={`${playfair.className} text-xl font-bold text-yellow-400 mb-2`}>
                      All Set, {data.name}! 🎉
                    </h3>
                    <p className="text-white/70 text-sm">
                      Your personalized Bible study experience is ready. Click "Start Studying" to begin!
                    </p>
                  </div>
                </div>
              ) : (
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
              )}

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
                  {isAuthenticated && (
                    <div className="flex justify-between text-green-400">
                      <span>Status:</span>
                      <span className="font-semibold">✓ Signed In</span>
                    </div>
                  )}
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
                {step === 6 && !isAuthenticated ? 'Skip for Now →' : 'Continue →'}
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

        {/* Sign-In Modal */}
        <SignInPrompt
          isOpen={showSignIn}
          onClose={() => setShowSignIn(false)}
          message="Sign in to sync your preferences and join the prayer community"
        />
      </div>
    </div>
  );
}