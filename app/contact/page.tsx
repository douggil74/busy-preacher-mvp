// app/contact/page.tsx
"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

import { APP_VERSION } from "@/lib/version";

export default function ContactPage() {
  return (
    <main className="page-container">
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
        Contact
      </h1>
      <p className="text-white/70 light:text-black/70 mb-8 text-center">
        Questions, ideas, or bug reports? We'd love to hear from you.
      </p>

      <section className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">Get in Touch</h2>
          <p className="text-white/80 light:text-black/80 mb-4">
            Questions, ideas, or bug reports? I'd love to hear from you.
          </p>
          <a
            href="mailto:thebusychristianapp@gmail.com"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 underline underline-offset-4 decoration-2 transition-colors text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            thebusychristianapp@gmail.com
          </a>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white/90 light:text-black/90">What to Reach Out About:</h2>
          <ul className="space-y-2 text-white/80 light:text-black/80">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Bug reports or technical issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Feature suggestions and ideas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Partnership opportunities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>General feedback about the app</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Questions about how to use features</span>
            </li>
          </ul>
        </div>

        <div className="card bg-yellow-400/10 border-yellow-400/30">
          <p className="text-sm text-white/80 light:text-black/80">
            <strong className="text-yellow-400">Response Time:</strong> I typically respond within 24-48 hours. 
            Thanks for your patience!
          </p>
        </div>
      </section>

      <footer className="mt-12 text-center text-xs text-white/40">
        © Cornerstone Church, Mandeville, LA – The Busy Christian • v{APP_VERSION}
      </footer>
    </main>
  );
}