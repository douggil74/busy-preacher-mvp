// app/help/page.tsx
"use client";

import Link from "next/link";

import { APP_VERSION } from "@/lib/version";
import { card, button, typography, cn } from '@/lib/ui-constants';

export default function HelpPage() {
  return (
    <main className="page-container">
      <button
        onClick={() => window.history.back()}
        className="mb-6 flex items-center gap-2 text-sm transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--text-primary)' }}>
        Help Guide
      </h1>
      <p className="text-center mb-8" style={{ color: 'var(--text-secondary)' }}>
        Get the most out of The Busy Christian
      </p>

      <section className="space-y-6">
        {/* Quick Start */}
        <div className={card.highlight}>
          <h2 className={cn(typography.h2, 'mb-4')}>🚀 Quick Start</h2>
          <div className="space-y-3 text-white/80 light:text-black/80">
            <p>
              <strong>The Busy Christian</strong> helps you study the Bible deeper, faster.
              Here's how to get started:
            </p>
            <ol className="ml-4 space-y-2 text-sm">
              <li><strong>1.</strong> Enter a Bible passage or topic on the home page</li>
              <li><strong>2.</strong> Get an outline with key points, cross-references, and applications</li>
              <li><strong>3.</strong> Click any verse to dig deeper with translations and commentary</li>
              <li><strong>4.</strong> Save your favorites to the library for later</li>
            </ol>
          </div>
        </div>

        {/* Main Features */}
        <div className={card.default}>
          <h2 className={cn(typography.h2, 'mb-4')}>📖 Study Tools</h2>
          <div className="space-y-4 text-white/80 light:text-black/80">
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-lg">📝</span>
              <div>
                <h3 className="font-semibold text-white/90 light:text-black/90">Outline Generator</h3>
                <p className="text-sm text-white/70 light:text-black/70">
                  Enter a passage, topic, or both. Get sermon-ready outlines with illustrations and practical applications.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-lg">🔍</span>
              <div>
                <h3 className="font-semibold text-white/90 light:text-black/90">Deep Study</h3>
                <p className="text-sm text-white/70 light:text-black/70">
                  Compare 5 translations, read commentaries, and explore word meanings with Greek/Hebrew insights.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-lg">💬</span>
              <div>
                <h3 className="font-semibold text-white/90 light:text-black/90">Ask the Pastor</h3>
                <p className="text-sm text-white/70 light:text-black/70">
                  Get biblically-grounded answers to your spiritual questions, available 24/7.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-lg">🙏</span>
              <div>
                <h3 className="font-semibold text-white/90 light:text-black/90">Prayer Center</h3>
                <p className="text-sm text-white/70 light:text-black/70">
                  Share prayer requests and pray for others. Get notified when someone prays for you.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-lg">📚</span>
              <div>
                <h3 className="font-semibold text-white/90 light:text-black/90">Library & Notes</h3>
                <p className="text-sm text-white/70 light:text-black/70">
                  Save studies, add personal notes, and export everything as PDF when you need it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personalization */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">🎨 Personalize Your Experience</h2>
          <p className="text-white/80 light:text-black/80 mb-3">
            Choose your study style in Settings:
          </p>
          <ul className="space-y-2 text-white/70 light:text-black/70 ml-4">
            <li><strong className="text-yellow-400">☕ Casual:</strong> Warm and conversational</li>
            <li><strong className="text-yellow-400">📖 Bible Student:</strong> Balanced depth</li>
            <li><strong className="text-yellow-400">👨‍🏫 Pastor/Teacher:</strong> Sermon-ready with illustrations</li>
          </ul>
          <p className="text-sm text-white/60 light:text-black/60 mt-3">
            Your AI-generated outlines will adapt to match your style.
          </p>
        </div>

        {/* Subscription & Billing */}
        <div className="card bg-green-500/10 border-green-500/30">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">💳 Subscription</h2>
          <div className="space-y-3 text-white/80 light:text-black/80">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="font-bold text-yellow-400">$2.99/mo</div>
                <div className="text-xs text-white/60 light:text-black/60">Annual ($35.88/yr)</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="font-bold text-white/90 light:text-black/90">$3.99/mo</div>
                <div className="text-xs text-white/60 light:text-black/60">Monthly</div>
              </div>
            </div>
            <ul className="text-sm text-white/70 light:text-black/70 space-y-1">
              <li>• 7-day free trial for new users</li>
              <li>• Have a promo code? Enter it on the paywall or Account page</li>
              <li>• Manage your subscription anytime from Account</li>
            </ul>
          </div>
        </div>

        {/* Tips */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">💡 Tips & Tricks</h2>
          <ul className="space-y-2 text-white/70 light:text-black/70 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Hover over words in the ESV text for Greek/Hebrew insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Click cross-references in outlines to jump straight to that passage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Use the A-/A+ buttons to adjust text size</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Enable notifications to know when someone prays for you</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Export your outline as PDF for sermon prep or sharing</span>
            </li>
          </ul>
        </div>

        {/* Crisis Resources */}
        <div className="card bg-red-500/10 border-red-500/30">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">🛡️ Crisis Resources</h2>
          <p className="text-white/80 light:text-black/80 mb-3">
            If you or someone you know needs immediate help:
          </p>
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-3">
            <p className="text-white font-semibold mb-1">988 Suicide & Crisis Lifeline</p>
            <p className="text-white/90 text-lg font-bold mb-1">Call or Text: 988</p>
            <p className="text-sm text-white/70">Free, confidential support 24/7</p>
          </div>
          <p className="text-sm text-white/70 light:text-black/70">
            You're not alone. Help is always available.
          </p>
        </div>

        {/* Important Note */}
        <div className="card bg-yellow-400/10 border-yellow-400/30">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">📌 A Note About AI</h2>
          <p className="text-white/80 light:text-black/80 italic mb-2">
            "This app is not meant to replace diligent study and listening to the Holy Spirit."
          </p>
          <p className="text-sm text-white/70 light:text-black/70">
            AI is a helpful starting point, but always verify against Scripture and seek guidance
            through prayer. For serious concerns, please consult your pastor or a professional counselor.
          </p>
        </div>

        {/* Contact */}
        <div className={cn(card.default, 'text-center')}>
          <h2 className={cn(typography.h3, 'mb-2')}>Need More Help?</h2>
          <p className={cn(typography.small, 'text-white/70 mb-4')}>
            We'd love to hear from you — questions, feedback, or just to say hi.
          </p>
          <Link
            href="/contact"
            className={button.primary}
          >
            Contact Us
          </Link>
        </div>
      </section>

      <footer className="mt-12 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Cornerstone Church, Mandeville, LA — The Busy Christian v{APP_VERSION}
      </footer>
    </main>
  );
}
