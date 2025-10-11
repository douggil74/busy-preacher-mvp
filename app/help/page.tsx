// app/help/page.tsx
"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "2.1";

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <button
  onClick={() => window.history.back()}
  className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
  Back
</button>
      <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-3 text-white/95 light:text-black/95 text-center`}>
        Help & Guide
      </h1>
      <p className="text-white/70 light:text-black/70 mb-8 text-center">
        Everything you need to know to get the most out of The Busy Christian
      </p>

      <section className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">Getting Started</h2>
          <p className="text-white/80 light:text-black/80 mb-4">
            <strong>The Busy Christian</strong> helps preachers, teachers, and devoted students 
            prepare outlines and explore Scripture faster — while encouraging faithful, Spirit-led study.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">🎨 Personalize Your Experience</h2>
          <p className="text-white/80 light:text-black/80 mb-3">
            Choose your preferred study style from the menu → <strong>Personalize</strong>:
          </p>
          <ul className="space-y-2 text-white/70 light:text-black/70 ml-4">
            <li><strong className="text-yellow-400">☕ Casual Devotional:</strong> Warm, conversational, practical</li>
            <li><strong className="text-yellow-400">📖 Bible Student:</strong> Balanced depth with accessibility</li>
            <li><strong className="text-yellow-400">👨‍🏫 Pastor/Teacher:</strong> Sermon-ready with illustrations</li>
            <li><strong className="text-yellow-400">🎓 Theologian:</strong> Academic with Greek/Hebrew terms</li>
          </ul>
          <p className="text-sm text-white/60 light:text-black/60 mt-3">
            💡 Your AI-generated outlines will match your selected style!
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">📖 Main Study Tools</h2>
          <div className="space-y-4 text-white/80 light:text-black/80">
            <div>
              <h3 className="font-semibold text-white light:text-black mb-2">Outline Generator (Home Page)</h3>
              <ul className="ml-4 mt-1 space-y-1 text-sm text-white/70 light:text-black/70">
                <li>• Enter a <strong>Passage</strong> for passage-based outlines</li>
                <li>• Enter a <strong>Topic</strong> for thematic studies</li>
                <li>• Fill both for a combined study connecting text to theme</li>
                <li>• Get sermon-ready points, illustrations, cross-refs, and applications</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white light:text-black mb-2">ESV Text Lookup</h3>
              <ul className="ml-4 mt-1 space-y-1 text-sm text-white/70 light:text-black/70">
                <li>• Hover any word for Greek/Hebrew insights with Strong's numbers</li>
                <li>• Click to pin the lexical note</li>
                <li>• Click "Study Deeper" to access commentary and translations</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white light:text-black mb-2">Deep Study Page</h3>
              <ul className="ml-4 mt-1 space-y-1 text-sm text-white/70 light:text-black/70">
                <li>• Compare 4 translations (KJV, ASV, WEB, NIV)</li>
                <li>• Read AI-powered commentary (adapts to your style!)</li>
                <li>• Access traditional commentary (Adam Clarke)</li>
                <li>• Save commentaries to your notes with one click</li>
                <li>• Links to external study tools (BibleHub, Blue Letter Bible, StudyLight)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">📝 Notes & Library</h2>
          <div className="space-y-2 text-white/80 light:text-black/80">
            <p>
              <strong>Add Notes:</strong> Click "Add Notes" on any study to save personal insights. 
              Notes are automatically tied to the Bible reference.
            </p>
            <p>
              <strong>Save Studies:</strong> Click "Save to Library" to bookmark passages for later.
            </p>
            <p>
              <strong>Library Page:</strong> Access all your saved studies and notes. You can:
            </p>
            <ul className="ml-4 space-y-1 text-sm text-white/70 light:text-black/70">
              <li>• View and search all your notes</li>
              <li>• Click any note to expand/collapse the full text</li>
              <li>• Copy individual notes</li>
              <li>• Export all notes as a professional PDF</li>
              <li>• Print all notes</li>
              <li>• Reopen saved studies</li>
            </ul>
            <p className="text-sm text-white/60 light:text-black/60 mt-3">
              💾 Everything is stored locally on your device - complete privacy!
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">📄 Export Features</h2>
          <ul className="space-y-2 text-white/80 light:text-black/80">
            <li>
              <strong className="text-white/90 light:text-black/90">Export Outline PDF:</strong> Clean, formatted PDF with 
              all your study points, references, and application notes. Perfect for printing or 
              sharing with your teaching team.
            </li>
            <li>
              <strong className="text-white/90 light:text-black/90">Export Notes PDF:</strong> All your personal notes 
              in a professional document, organized by reference with dates.
            </li>
            <li>
              <strong className="text-white/90 light:text-black/90">Copy Functions:</strong> Quickly copy outlines, 
              commentaries, or individual notes to paste into your sermon prep software.
            </li>
          </ul>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">💡 Pro Tips</h2>
          <ul className="space-y-2 text-white/70 light:text-black/70">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Toggle Light/Dark mode anytime - your preference is saved</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Adjust font size with A- and A+ buttons in the header</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Click cross-references in outlines to instantly load them in the ESV reader</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Use the "Show Recent Studies" button on the home page for quick access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Save AI commentaries directly from Deep Study - great for research!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Search your notes in the Library to find specific topics quickly</span>
            </li>
          </ul>
        </div>

        <div className="card bg-yellow-400/10 border-yellow-400/30">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">⚠️ Important Disclaimer</h2>
          <p className="text-white/80 light:text-black/80 italic">
            "This app is not meant to replace diligent study and listening to the Holy Spirit."
          </p>
          <p className="text-sm text-white/70 light:text-black/70 mt-2">
            AI-generated content is a helpful starting point, but should always be verified against 
            Scripture and refined through prayer and the guidance of the Holy Spirit.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">Need More Help?</h2>
          <p className="text-white/80 light:text-black/80">
            Have questions or feedback?{" "}
            <Link href="/contact" className="text-yellow-400 hover:text-yellow-300 underline underline-offset-4">
              Contact us
            </Link>{" "}
            — we'd love to hear from you!
          </p>
        </div>
      </section>

      <footer className="mt-12 text-center text-xs text-white/40">
        © Douglas M. Gilford — The Busy Christian • v{APP_VERSION}
      </footer>
    </main>
  );
}