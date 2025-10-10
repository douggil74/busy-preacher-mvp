// app/about/page.tsx
"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "2.1";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-3 text-white/95 text-center`}>
        About This App
      </h1>
      <p className="text-white/70 mb-8 text-center">
        Built to help you study Scripture faster and more accurately
      </p>

      <section className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-white/90">Our Mission</h2>
          <p className="text-white/80 leading-relaxed">
            <strong className="text-white/95">The Busy Christian</strong> is crafted by{" "}
            <strong className="text-white/95">Douglas M. Gilford</strong> to help pastors, teachers, 
            and serious students prepare faithful, clear messages with less friction. AI is used to 
            assist synthesis – never to replace careful study or the Spirit's leading.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white/90">Core Features</h2>
          <ul className="space-y-2 text-white/80">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">📖</span>
              <span>Smart outline generator (passage, theme, or combined)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">🎨</span>
              <span>4 personalized study styles (Casual, Student, Pastor, Theologian)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">📚</span>
              <span>Integrated ESV® text (used by permission)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">🔤</span>
              <span>Plain-English lexical notes for Greek/Hebrew with Strong's numbers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">💾</span>
              <span>Local library for saved studies and personal notes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">📄</span>
              <span>Professional PDF exports for teaching/preaching</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">🔍</span>
              <span>Deep study tools with multiple translations and commentaries</span>
            </li>
          </ul>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-white/90">Our Vision</h2>
          <p className="text-white/80 leading-relaxed">
            To equip busy believers to "rightly handle the word of truth" (2 Tim. 2:15) – 
            saving time while deepening accuracy, clarity, and devotion. We believe technology 
            should assist, not replace, the work of faithful Bible study.
          </p>
        </div>

        <div className="card bg-blue-500/10 border-blue-500/30">
          <h2 className="text-xl font-semibold mb-3 text-white/90">Technology</h2>
          <p className="text-white/80 leading-relaxed">
            Built with Next.js, powered by GPT-4 for intelligent content generation, 
            and designed with a focus on speed, accuracy, and user experience. All notes 
            and preferences are stored locally on your device for complete privacy.
          </p>
        </div>

        <div className="card border-white/20">
          <p className="text-sm text-white/70 italic">
            "This app is not meant to replace diligent study and listening to the Holy Spirit."
          </p>
          <p className="text-xs text-white/50 mt-2">
            © Douglas M. Gilford • The Busy Christian
          </p>
        </div>
      </section>

      <footer className="mt-12 text-center text-xs text-white/40">
        © Douglas M. Gilford – The Busy Christian • v{APP_VERSION}
      </footer>
    </main>
  );
}