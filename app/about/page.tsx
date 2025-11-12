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
        Modern Bible study tools combining cutting-edge technology with pastoral care—built for pastors, teachers, and serious students
      </p>

      <section className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">Our Mission</h2>
          <p className="text-white/80 light:text-black/80 leading-relaxed mb-3">
            <strong className="text-white/95 light:text-black/95">The Busy Christian</strong> exists to help you 
            "rightly handle the word of truth" (2 Timothy 2:15) with excellence and efficiency. Developed by{" "}
            <strong className="text-white/95 light:text-black/95">Cornerstone Church in Mandeville, LA</strong>, this platform combines 
            cutting-edge technology with pastoral care to reduce preparation time while deepening accuracy and spiritual insight.
          </p>
          <p className="text-white/80 light:text-black/80 leading-relaxed">
            We believe technology should assist—never replace—careful study, prayer, and the Spirit's leading. 
            Every feature is designed to help you prepare faithful, clear messages that honor God's Word while 
            caring for the spiritual needs of your community.
          </p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-400/10 to-amber-500/10 border-yellow-400/30">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">✨ What Makes Us Different</h2>
          <div className="space-y-3 text-white/80 light:text-black/80">
            <p className="leading-relaxed">
              Unlike generic Bible apps, <strong>The Busy Christian</strong> is purpose-built for sermon preparation,
              teaching, and deep theological study—with integrated pastoral care tools. We combine AI-powered insights
              with time-tested resources from trusted scholars and teachers.
            </p>
            <p className="leading-relaxed">
              Our revolutionary <strong>Pastoral Guidance</strong> feature uses AI to provide biblically-grounded counsel
              rooted in YOUR church's actual teachings. Upload your sermon archive and watch as the AI cites your own
              messages when answering spiritual questions—making pastoral care scalable and personalized.
            </p>
            <p className="leading-relaxed">
              Our <strong>Prayer Center</strong> connects your community in real-time with push notifications,
              crisis detection, and support resources—because ministry is about more than just Sunday sermons.
            </p>
            <p className="leading-relaxed">
              Everything is designed for speed without sacrificing depth—from intelligent outline generation to
              one-click PDF exports ready for the pulpit. Available as a <strong>web app</strong> and <strong>native iOS app</strong>
              for seamless ministry on the go.
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
                styles (Casual, Student, Pastor,) ensure the content matches your needs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 light:text-black/90 mb-2 flex items-center gap-2">
                <span className="text-yellow-400">🙏</span>
                Prayer Center with Pastoral Care
              </h3>
              <p className="text-sm text-white/70 light:text-black/70 ml-6">
                Real-time community prayer requests with push notifications when someone prays for you.
                Built-in crisis detection automatically flags concerning prayers and provides 988 Suicide Prevention
                Lifeline resources. Track prayer warriors with badges, and moderate content with admin tools.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 light:text-black/90 mb-2 flex items-center gap-2">
                <span className="text-yellow-400">💬</span>
                Pastoral Guidance (AI + Your Sermons)
              </h3>
              <p className="text-sm text-white/70 light:text-black/70 ml-6">
                Revolutionary AI-powered pastoral counseling that cites YOUR actual sermons. Upload your sermon archive
                and watch as Claude AI provides guidance rooted in 25 years of your ministry. Every answer includes
                citations to specific sermons, making your wisdom accessible 24/7.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white/90 light:text-black/90 mb-2 flex items-center gap-2">
                <span className="text-yellow-400">🔍</span>
                Deep Study Tools
              </h3>
              <p className="text-sm text-white/70 light:text-black/70 ml-6">
                Compare multiple Bible translations (KJV, WEB, ASV, ESV, NIV) side-by-side. Access cross-references, 
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
                <span className="text-yellow-400">📚</span>
                Spiritual Foundations Course
              </h3>
              <p className="text-sm text-white/70 light:text-black/70 ml-6">
                Interactive 16-lesson course with progress tracking and downloadable PDF certificates upon completion. 
                Perfect for new believers or discipleship classes.
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
                Export sermon outlines, course certificates, and study notes as beautifully formatted PDFs, 
                ready for printing or sharing with your congregation.
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
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">⚙️ Modern Technology Stack</h2>
          <p className="text-white/80 light:text-black/80 leading-relaxed mb-3">
            Built with cutting-edge technologies for speed, reliability, and scale:
          </p>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-white/70 light:text-black/70 mb-3">
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Next.js 15 + TypeScript
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Firebase Cloud Functions
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Firebase Authentication
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Firestore Real-time Database
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Firebase Cloud Messaging
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Anthropic Claude AI (Sonnet 4.5)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              OpenAI Embeddings API
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Supabase + pgvector
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              ESV Bible API
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              React PDF Renderer
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              Capacitor (iOS Native)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              OneDrive API Integration
            </li>
          </ul>
          <p className="text-white/80 light:text-black/80 leading-relaxed mb-2">
            <strong className="text-white/95 light:text-black/95">Your privacy matters.</strong> Study notes and
            preferences are stored locally on your device. Prayer requests use Firebase with proper security rules.
            Push notifications are optional and can be disabled anytime.
          </p>
          <p className="text-white/80 light:text-black/80 leading-relaxed">
            <strong className="text-white/95 light:text-black/95">iOS Ready:</strong> Available as a native iOS app
            with offline support, push notifications, and native storage. Works seamlessly on iPhone and iPad.
          </p>
        </div>

        <div className="card bg-red-500/10 border-red-500/30">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">🛡️ Pastoral Care & Safety</h2>
          <p className="text-white/80 light:text-black/80 leading-relaxed mb-3">
            Our Prayer Center and Pastoral Guidance include sophisticated pastoral care features:
          </p>
          <ul className="space-y-2 text-sm text-white/70 light:text-black/70">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span><strong>Crisis Detection:</strong> Automatic flagging of prayers with concerning keywords,
              with immediate display of 988 Suicide Prevention Lifeline</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span><strong>Spam Filtering:</strong> Automatic detection and blocking of inappropriate content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span><strong>Admin Moderation:</strong> Tools for reviewing flagged content and managing community safety</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span><strong>Pastoral Guidance Monitoring:</strong> Admin logs track all guidance questions with automatic
              flagging of abusive, spam, or off-topic content for review</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span><strong>Real-time Notifications:</strong> Instant push notifications when someone prays for your request
              (works on both web and iOS)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span><strong>Prayer Warrior Stats:</strong> Badge system to encourage faithful intercessors</span>
            </li>
          </ul>
          <p className="text-sm text-white/60 light:text-black/60 mt-3 italic">
            All running affordably with Firebase's free tier and Supabase's generous limits.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-white/90 light:text-black/90">🙌 Our Commitment</h2>
          <p className="text-white/80 light:text-black/80 leading-relaxed">
            We're committed to providing tools that honor Scripture, support faithful teaching, care for hurting people, 
            and help you minister with confidence. The Busy Christian will never replace the work of the Holy Spirit, 
            prayerful meditation, or careful exegesis—but it will help you do those things more effectively while 
            staying connected to your community's spiritual needs.
          </p>
        </div>

        <div className="card border-white/20 bg-white/5">
          <p className="text-sm text-white/70 light:text-black/70 italic mb-3">
            "This app is not meant to replace diligent study and listening to the Holy Spirit. Rather, it's 
            a tool to help you prepare with excellence and care for your community so you can focus on what 
            matters most: faithfully proclaiming God's Word and shepherding His people."
          </p>
          <p className="text-xs text-white/50 light:text-black/50">
            — Cornerstone Church, Mandeville, LA
          </p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-400/10 to-amber-500/10 border-yellow-400/30 text-center">
          <h2 className="text-lg font-semibold mb-2 text-white/90 light:text-black/90">Ready to dive deeper?</h2>
          <p className="text-sm text-white/70 light:text-black/70 mb-4">
            Start studying Scripture with confidence, clarity, and community support.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/deep-study"
              className="inline-block rounded-lg bg-yellow-400 text-black px-6 py-2 font-semibold hover:bg-yellow-300 transition-colors"
            >
              Try Deep Study →
            </Link>
            <Link
              href="/pastoral-guidance"
              className="inline-block rounded-lg border border-amber-400 bg-amber-400/20 text-amber-400 px-6 py-2 font-semibold hover:bg-amber-400/30 transition-colors"
            >
              Get Pastoral Guidance
            </Link>
            <Link
              href="/prayer"
              className="inline-block rounded-lg border border-yellow-400 bg-yellow-400/20 text-yellow-400 px-6 py-2 font-semibold hover:bg-yellow-400/30 transition-colors"
            >
              Visit Prayer Center
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-white/50 light:text-black/50">
          <p className="mb-1">Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®)</p>
          <p>© 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.</p>
        </div>
      </section>

      <footer className="mt-12 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Cornerstone Church, Mandeville, LA — The Busy Christian • v{APP_VERSION}
      </footer>
    </main>
  );
}