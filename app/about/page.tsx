// app/about/page.tsx
"use client";

import Link from "next/link";

import { APP_VERSION } from "@/lib/version";
import { card, button, typography, cn } from '@/lib/ui-constants';

export default function AboutPage() {
  return (
    <main className="page-container">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--text-primary)' }}>
        About The Busy Christian
      </h1>
      <p className="text-center mb-8" style={{ color: 'var(--text-secondary)' }}>
        Your companion for deeper Bible study and spiritual growth
      </p>

      <section className="space-y-6">
        <div className={card.default}>
          <h2 className={cn(typography.h2, 'mb-3')}>What Is The Busy Christian?</h2>
          <p className="text-white/80 light:text-black/80 leading-relaxed mb-3">
            <strong className="text-white/95 light:text-black/95">The Busy Christian</strong> is a Bible study app
            designed for people who want to go deeper in God's Word but don't always have hours to spare. Whether
            you're preparing a sermon, leading a small group, or just wanting to understand Scripture better —
            we're here to help.
          </p>
          <p className="text-white/80 light:text-black/80 leading-relaxed">
            Created by <strong className="text-white/95 light:text-black/95">Cornerstone Church in Mandeville, LA</strong>,
            this app combines AI-powered study tools with timeless biblical resources to help you grow in faith.
          </p>
        </div>

        <div className={card.highlight}>
          <h2 className={cn(typography.h2, 'mb-4')}>What You Can Do</h2>
          <div className="space-y-4 text-white/80 light:text-black/80">
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">📖</span>
              <div>
                <h3 className="font-semibold text-white/90 light:text-black/90">Study Any Passage or Topic</h3>
                <p className="text-sm">Generate outlines, cross-references, and practical applications for any Bible verse or theme.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">🔍</span>
              <div>
                <h3 className="font-semibold text-white/90 light:text-black/90">Deep Dive into Scripture</h3>
                <p className="text-sm">Compare translations, explore word meanings, and read commentaries from trusted scholars.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">💬</span>
              <div>
                <h3 className="font-semibold text-white/90 light:text-black/90">Ask Spiritual Questions</h3>
                <p className="text-sm">Get biblical answers to life's questions through our Ask the Pastor feature.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">🙏</span>
              <div>
                <h3 className="font-semibold text-white/90 light:text-black/90">Pray With Community</h3>
                <p className="text-sm">Share prayer requests and lift others up. Get notified when someone prays for you.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">📚</span>
              <div>
                <h3 className="font-semibold text-white/90 light:text-black/90">Learn & Grow</h3>
                <p className="text-sm">Take courses, follow reading plans, and save your notes for future reference.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="card bg-green-500/10 border-green-500/30">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-lg font-bold text-yellow-400 mb-1">$2.99/mo</div>
              <div className="text-sm text-white/60 light:text-black/60">Annual plan - $35.88/year</div>
              <div className="text-xs text-green-400 mt-1">Best Value - Save 25%</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-lg font-bold text-white/90 light:text-black/90 mb-1">$3.99/mo</div>
              <div className="text-sm text-white/60 light:text-black/60">Monthly plan</div>
              <div className="text-xs text-white/40 light:text-black/40 mt-1">Cancel anytime</div>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-white/70 light:text-black/70">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              7-day free trial — no commitment
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Full access to all features
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Works on web and iOS
            </li>
          </ul>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">Our Heart</h2>
          <p className="text-white/80 light:text-black/80 leading-relaxed mb-3">
            We believe technology should help you study God's Word, not replace careful reading and prayerful
            meditation. Every feature is designed to save you time while deepening your understanding.
          </p>
          <p className="text-white/70 light:text-black/70 text-sm italic">
            "This app is not meant to replace diligent study and listening to the Holy Spirit. It's a tool
            to help you prepare with excellence so you can focus on what matters most."
          </p>
        </div>

        <div className={cn(card.highlight, 'text-center')}>
          <h2 className={cn(typography.h3, 'mb-2')}>Ready to dive in?</h2>
          <p className={cn(typography.small, 'text-white/70 mb-4')}>
            Start your free trial and see how The Busy Christian can help your study.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/"
              className={button.primary}
            >
              Start Studying →
            </Link>
            <Link
              href="/help"
              className={button.secondary}
            >
              View Help Guide
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-white/50 light:text-black/50">
          <p className="mb-1">Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®)</p>
          <p>© 2001 by Crossway, a publishing ministry of Good News Publishers.</p>
        </div>
      </section>

      <footer className="mt-12 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Cornerstone Church, Mandeville, LA — The Busy Christian v{APP_VERSION}
      </footer>
    </main>
  );
}
