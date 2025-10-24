// app/about/page.tsx
"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

import { APP_VERSION } from "@/lib/version";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-yellow-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-3 text-white/95 light:text-black/95 text-center`}>
        About The Busy Christian
      </h1>
      <p className="text-white/70 light:text-black/70 mb-8 text-center">
        Your comprehensive Bible study companion—built for pastors, teachers, and serious students
      </p>

      <section className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">Our Mission</h2>
          <p className="text-white/80 light:text-black/80 leading-relaxed mb-3">
            <strong className="text-white/95 light:text-black/95">The Busy Christian</strong> exists to help you 
            "rightly handle the word of truth" (2 Timothy 2:15) with excellence and efficiency. Created by{" "}
            <strong className="text-white/95 light:text-black/95">Douglas M. Gilford</strong>, this platform combines 
            cutting-edge AI with trusted biblical resources to reduce preparation time while deepening accuracy and insight.
          </p>
          <p className="text-white/80 light:text-black/80 leading-relaxed">
            We believe technology should assist—never replace—careful study, prayer, and the Spirit's leading. 
            Every feature is designed to help you prepare faithful, clear messages that honor God's Word.
          </p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-400/10 to-amber-500/10 border-yellow-400/30">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">✨ What Makes Us Different</h2>
          <div className="space-y-3 text-white/80 light:text-black/80">
            <p className="leading-relaxed">
              Unlike generic Bible apps, <strong>The Busy Christian</strong> is purpose-built for sermon preparation, 
              teaching, and deep theological study. We integrate AI-powered insights with time-tested resources 
              from trusted scholars and teachers.
            </p>
            <p className="leading-relaxed">
              Everything is designed for speed without sacrificing depth—from intelligent outline generation to 
              one-click PDF exports ready for the pulpit.
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">🎯 Core Features</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white/90 light:text-black/90 mb-2 flex items-center gap-2">
                <span className="text-yellow-400">📖</span>
                Smart Outline Generator
              </h3>
              <p className="text-sm text-white/70 light:text-black/70 ml-6">
                Generate sermon outlines from any passage, theme, or combination. Four personalized study 
                styles (Casual, Student, Pastor, Theologian) ensure the content matches your needs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 light:text-black/90 mb-2 flex items-center gap-2">
                <span className="text-yellow-400">🔍</span>
                Deep Study Tools
              </h3>
              <p className="text-sm text-white/70 light:text-black/70 ml-6">
                Compare multiple Bible translations (KJV, WEB, ASV, ESV) side-by-side. Access cross-references, 
                study questions, and integrated word studies—all in one place.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 light:text-black/90 mb-2 flex items-center gap-2">
                <span className="text-yellow-400">💡</span>
                AI + Classic Commentary
              </h3>
              <p className="text-sm text-white/70 light:text-black/70 ml-6">
                Get context-aware AI insights powered by GPT-4, plus time-tested wisdom from classic 
                commentaries (Matthew Henry, Adam Clarke, Albert Barnes, John Gill) scraped from BibleStudyTools.com.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 light:text-black/90 mb-2 flex items-center gap-2">
                <span className="text-yellow-400">🎥</span>
                Curated Teaching Videos
              </h3>
              <p className="text-sm text-white/70 light:text-black/70 ml-6">
                Watch passage-specific sermons and expositions from trusted Bible teachers including 
                John Piper, Michael Heiser, David Jeremiah, Voddie Baucham, Tim Keller, and more.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 light:text-black/90 mb-2 flex items-center gap-2">
                <span className="text-yellow-400">🔤</span>
                Original Language Tools
              </h3>
              <p className="text-sm text-white/70 light:text-black/70 ml-6">
                Hover over any word in the ESV text for instant Greek/Hebrew insights, including lemma forms, 
                Strong's numbers, and plain-English explanations—no seminary degree required.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 light:text-black/90 mb-2 flex items-center gap-2">
                <span className="text-yellow-400">💾</span>
                Personal Library & Notes
              </h3>
              <p className="text-sm text-white/70 light:text-black/70 ml-6">
                Save your studies, add personal notes, and build a searchable library—all stored locally 
                on your device for complete privacy.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 light:text-black/90 mb-2 flex items-center gap-2">
                <span className="text-yellow-400">📄</span>
                Professional PDF Exports
              </h3>
              <p className="text-sm text-white/70 light:text-black/70 ml-6">
                Export sermon outlines as beautifully formatted PDFs, ready for printing or sharing with 
                your congregation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 light:text-black/90 mb-2 flex items-center gap-2">
                <span className="text-yellow-400">🔗</span>
                External Study Resources
              </h3>
              <p className="text-sm text-white/70 light:text-black/70 ml-6">
                Quick links to BibleHub, Blue Letter Bible, and StudyLight for even deeper research.
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-blue-500/10 border-blue-500/30">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">🎓 Trusted Resources</h2>
          <p className="text-white/80 light:text-black/80 leading-relaxed mb-3">
            We partner with and reference content from the best in biblical scholarship:
          </p>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-white/70 light:text-black/70">
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Desiring God (John Piper)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Dr. Michael Heiser
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Turning Point (David Jeremiah)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Voddie Baucham
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Gospel Coalition (Tim Keller)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Ligonier Ministries
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              BibleStudyTools.com
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              BibleHub & Blue Letter Bible
            </li>
          </ul>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">⚙️ Technology & Privacy</h2>
          <p className="text-white/80 light:text-black/80 leading-relaxed mb-3">
            Built with Next.js 15 and TypeScript for speed and reliability. AI-powered features use OpenAI's 
            GPT-4 to generate contextually accurate insights while maintaining theological integrity.
          </p>
          <p className="text-white/80 light:text-black/80 leading-relaxed">
            <strong className="text-white/95 light:text-black/95">Your privacy matters.</strong> All saved studies, 
            notes, and preferences are stored locally in your browser—never on our servers. Your study 
            data belongs to you.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">🙏 Our Commitment</h2>
          <p className="text-white/80 light:text-black/80 leading-relaxed">
            We're committed to providing tools that honor Scripture, support faithful teaching, and help you 
            minister with confidence. The Busy Christian will never replace the work of the Holy Spirit, 
            prayerful meditation, or careful exegesis—but it will help you do those things more effectively.
          </p>
        </div>

        <div className="card border-white/20 bg-white/5">
          <p className="text-sm text-white/70 light:text-black/70 italic mb-3">
            "This app is not meant to replace diligent study and listening to the Holy Spirit. Rather, it's 
            a tool to help you prepare with excellence so you can focus on what matters most: faithfully 
            proclaiming God's Word."
          </p>
          <p className="text-xs text-white/50 light:text-black/50">
            — Douglas M. Gilford, Creator
          </p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-400/10 to-amber-500/10 border-yellow-400/30 text-center">
          <h2 className="text-lg font-semibold mb-2 text-white/90 light:text-black/90">Ready to dive deeper?</h2>
          <p className="text-sm text-white/70 light:text-black/70 mb-4">
            Start studying Scripture with confidence and clarity.
          </p>
          <Link
            href="/deep-study"
            className="inline-block rounded-lg bg-yellow-400 text-black px-6 py-2 font-semibold hover:bg-yellow-300 transition-colors"
          >
            Try Deep Study →
          </Link>
        </div>

        <div className="text-center text-xs text-white/50 light:text-black/50">
          <p className="mb-1">Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®)</p>
          <p>© 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.</p>
        </div>
      </section>

      <footer className="mt-12 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Douglas M. Gilford – The Busy Christian • v{APP_VERSION}
      </footer>
    </main>
  );
}