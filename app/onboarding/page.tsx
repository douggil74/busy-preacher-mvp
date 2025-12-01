// app/onboarding/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { ChevronRight, ChevronLeft, BookOpen, MessageCircle, Sparkles, Heart } from "lucide-react";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const slides = [
  {
    icon: BookOpen,
    title: "Welcome to The Busy Christian",
    subtitle: "Your Personal Devotional Companion",
    description: "Daily Scripture study designed for your busy life. Grow deeper in faith, one moment at a time.",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: MessageCircle,
    title: "Your Virtual Pastor",
    subtitle: "Guidance When You Need It",
    description: "Have questions about Scripture or life? Chat with your AI pastor for biblical wisdom anytime.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Sparkles,
    title: "Personalized Devotionals",
    subtitle: "Tailored to Your Journey",
    description: "AI-powered insights that adapt to your study style - casual to deep theological.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Heart,
    title: "Ready to Begin?",
    subtitle: "Let's Personalize Your Experience",
    description: "Choose how you like to study Scripture, and we'll customize your journey.",
    color: "from-rose-500 to-rose-600",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if user has already completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
    if (hasCompletedOnboarding === "true") {
      router.replace("/home");
    }
  }, [router]);

  const nextSlide = () => {
    if (isAnimating) return;

    if (currentSlide === slides.length - 1) {
      localStorage.setItem("onboarding_completed", "true");
      router.push("/personalize");
    } else {
      setIsAnimating(true);
      setCurrentSlide((prev) => prev + 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const prevSlide = () => {
    if (isAnimating || currentSlide === 0) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => prev - 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const skipOnboarding = () => {
    localStorage.setItem("onboarding_completed", "true");
    router.push("/personalize");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <main
      className="h-screen flex flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-color)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Skip button - compact */}
      <div className="flex justify-end px-4 py-2">
        <button
          onClick={skipOnboarding}
          className="text-sm transition-colors px-3 py-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          Skip
        </button>
      </div>

      {/* Main content - pushed up */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Icon - smaller */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${slide.color} flex items-center justify-center mb-4 sm:mb-6 shadow-2xl transition-all duration-300`}
        >
          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>

        {/* Text content - compact */}
        <div className="text-center max-w-sm transition-opacity duration-300">
          <h1
            className={`${playfair.className} text-2xl sm:text-3xl font-bold mb-1`}
            style={{ color: 'var(--text-primary)' }}
          >
            {slide.title}
          </h1>
          <p className="font-medium text-sm sm:text-base mb-3" style={{ color: 'var(--accent-color)' }}>
            {slide.subtitle}
          </p>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {slide.description}
          </p>
        </div>
      </div>

      {/* Navigation - fixed at bottom */}
      <div className="px-6 pb-4 pt-2">
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => !isAnimating && setCurrentSlide(index)}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: index === currentSlide ? 'var(--accent-color)' : 'var(--text-secondary)',
                opacity: index === currentSlide ? 1 : 0.3,
                width: index === currentSlide ? '1.5rem' : '0.5rem',
              }}
            />
          ))}
        </div>

        {/* Buttons - more compact */}
        <div className="flex gap-3 max-w-sm mx-auto">
          {currentSlide > 0 && (
            <button
              onClick={prevSlide}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors"
              style={{
                border: '2px solid var(--card-border)',
                color: 'var(--text-primary)',
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={nextSlide}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all`}
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'var(--bg-color)',
              width: currentSlide === 0 ? '100%' : 'auto',
            }}
          >
            {isLastSlide ? "Get Started" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
