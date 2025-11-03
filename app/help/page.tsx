// app/help/page.tsx
"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

import { APP_VERSION } from "@/lib/version";

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
            prepare outlines and explore Scripture faster — while encouraging faithful, Spirit-led study 
            and pastoral care for your community.
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
                <li>• Compare 5 translations (KJV, ASV, WEB, ESV, NIV)</li>
                <li>• Read AI-powered commentary (adapts to your style!)</li>
                <li>• Access traditional commentary (Adam Clarke, Matthew Henry)</li>
                <li>• Save commentaries to your notes with one click</li>
                <li>• Links to external study tools (BibleHub, Blue Letter Bible, StudyLight)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card bg-blue-500/10 border-blue-500/30">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">🙏 Prayer Center</h2>
          <p className="text-white/80 light:text-black/80 mb-3">
            Connect with your community through prayer requests and real-time notifications:
          </p>
          <div className="space-y-3 text-white/70 light:text-black/70">
            <div>
              <h3 className="font-semibold text-white/90 mb-1">Creating Prayer Requests</h3>
              <ul className="ml-4 space-y-1 text-sm">
                <li>• Choose between <strong>Private</strong> (saved locally) or <strong>Community</strong> (shared with others)</li>
                <li>• Select a category (Health, Family, Work, Spiritual, Other)</li>
                <li>• Post anonymously if you prefer privacy</li>
                <li>• Community prayers require Google sign-in</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 mb-1">Praying for Others</h3>
              <ul className="ml-4 space-y-1 text-sm">
                <li>• Click the ❤️ "Pray" button on any community prayer</li>
                <li>• The person who posted gets a <strong>push notification</strong> with sound</li>
                <li>• Track how many people have prayed for each request</li>
                <li>• Earn prayer warrior badges as you pray faithfully</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 mb-1">Push Notifications</h3>
              <ul className="ml-4 space-y-1 text-sm">
                <li>• Get notified when someone prays for YOUR request</li>
                <li>• Hear a gentle notification sound</li>
                <li>• Works even when the app is closed (if enabled)</li>
                <li>• Manage notification preferences in your browser settings</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 mb-1">Safety Features</h3>
              <ul className="ml-4 space-y-1 text-sm">
                <li>• <strong>Crisis Detection:</strong> Prayers with concerning keywords automatically show 988 Suicide Prevention Lifeline</li>
                <li>• <strong>Spam Filtering:</strong> Inappropriate content is automatically flagged and hidden</li>
                <li>• <strong>Admin Moderation:</strong> Trained moderators review flagged content</li>
                <li>• <strong>Report Button:</strong> Flag prayers that need attention</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">📚 Courses & Learning</h2>
          <div className="space-y-2 text-white/80 light:text-black/80">
            <p>
              <strong>Spiritual Foundations Course:</strong> A 16-lesson interactive course perfect for 
              new believers or discipleship classes.
            </p>
            <ul className="ml-4 space-y-1 text-sm text-white/70 light:text-black/70">
              <li>• Track your progress through all 16 lessons</li>
              <li>• Interactive learning with scripture references</li>
              <li>• Download a PDF certificate upon completion</li>
              <li>• Based on material from Cornerstone Church, Mandeville, LA</li>
            </ul>
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
              <strong className="text-white/90 light:text-black/90">Course Certificates:</strong> Download PDF certificates 
              when you complete the Spiritual Foundations course.
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
              <span>Enable push notifications to stay connected with your prayer community</span>
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
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Pray for others regularly to earn prayer warrior badges</span>
            </li>
          </ul>
        </div>

        <div className="card bg-red-500/10 border-red-500/30">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">🛡️ Safety & Crisis Resources</h2>
          <p className="text-white/80 light:text-black/80 mb-3">
            If you or someone you know is in crisis:
          </p>
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-3">
            <p className="text-white font-semibold mb-1">988 Suicide & Crisis Lifeline</p>
            <p className="text-white/90 text-lg font-bold mb-1">Call or Text: 988</p>
            <p className="text-sm text-white/70">Available 24/7 for free, confidential support</p>
          </div>
          <p className="text-sm text-white/70 light:text-black/70">
            Our prayer system automatically provides these resources when crisis keywords are detected. 
            You are not alone, and help is always available.
          </p>
        </div>

        <div className="card bg-yellow-400/10 border-yellow-400/30">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">⚠️ Important Disclaimer</h2>
          <p className="text-white/80 light:text-black/80 italic">
            "This app is not meant to replace diligent study and listening to the Holy Spirit."
          </p>
          <p className="text-sm text-white/70 light:text-black/70 mt-2">
            AI-generated content is a helpful starting point, but should always be verified against 
            Scripture and refined through prayer and the guidance of the Holy Spirit. The Prayer Center 
            is not a substitute for professional counseling or medical care.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">⚙️ Technical Information</h2>
          <p className="text-white/80 light:text-black/80 mb-3">
            Built with modern web technologies for reliability and performance:
          </p>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-white/70 light:text-black/70">
            <li>• Next.js 15 + TypeScript</li>
            <li>• Firebase Cloud Functions</li>
            <li>• Real-time Firestore Database</li>
            <li>• Firebase Cloud Messaging</li>
            <li>• OpenAI GPT-4</li>
            <li>• ESV Bible API</li>
          </ul>
          <p className="text-sm text-white/60 light:text-black/60 mt-3">
            All running on modern, secure infrastructure with 99.9% uptime.
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
        © {new Date().getFullYear()} Cornerstone Church, Mandeville, LA — The Busy Christian • v{APP_VERSION}
      </footer>
    </main>
  );
}