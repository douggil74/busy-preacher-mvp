"use client";

import Link from "next/link";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { useEffect, useState, useRef } from "react";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Dynamic app version
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "2.1";

export default function PrivacyPage() {
  const [lightMode, setLightMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("bc-theme");
    if (savedTheme === "dark") {
      setLightMode(false);
    } else {
      setLightMode(true);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (lightMode) {
      document.body.classList.add("light-mode");
      localStorage.setItem("bc-theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("bc-theme", "dark");
    }
  }, [lightMode]);

  // Close menu on outside click or escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <main className="py-8">
      {/* Header */}
      <div className="mx-auto mb-6 max-w-3xl px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors"
              aria-label="Back to Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round"
                   className="h-4 w-4">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </Link>

            <Link href="/" className="group flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="The Busy Christian"
                width={40}
                height={40}
                priority
                className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
              />
              <span className={`${playfair.className} hidden sm:inline text-xl font-semibold leading-tight text-white/90`}>
                <span className="italic text-lg align-baseline">The</span> Busy Christian
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLightMode(v => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 focus:outline-none"
              aria-label={lightMode ? "Switch to dark mode" : "Switch to light mode"}
            >
              {lightMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round"
                     className="h-5 w-5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round"
                     className="h-5 w-5">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-9 w-10 flex-col items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                <span aria-hidden="true" className={`block h-0.5 w-5 bg-white/85 transition-transform duration-200 ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`}></span>
                <span aria-hidden="true" className={`mt-1 block h-0.5 w-5 bg-white/85 transition-opacity duration-150 ${menuOpen ? "opacity-0" : "opacity-100"}`}></span>
                <span aria-hidden="true" className={`mt-1 block h-0.5 w-5 bg-white/85 transition-transform duration-200 ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`}></span>
              </button>

              {menuOpen && (
                <div role="menu" className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-md border border-white/15 bg-slate-900/95 p-1 shadow-lg backdrop-blur-md">
                  <Link href="/" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4 font-semibold">
                    🏠 Home
                  </Link>
                  <Link href="/deep-study" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4">
                    📖 Deep Study
                  </Link>
                  <Link href="/library" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4 font-semibold">
                    📚 My Notes
                  </Link>
                  <div className="my-1 h-px bg-white/10"></div>
                  <Link href="/about" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4">
                    About
                  </Link>
                  <Link href="/help" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4">
                    Help
                  </Link>
                  <Link href="/contact" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4">
                    Contact
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 h-px w-full bg-white/15" />
      </div>

      {/* Body */}
      <section className="mx-auto max-w-3xl px-4 leading-relaxed text-white/90 space-y-8">
        <h1 className={`${playfair.className} text-3xl font-semibold`}>Privacy Policy</h1>
        <p className="text-white/80">
          We care about your privacy. This policy explains what The Busy Christian collects,
          how we use it, and the choices you have. By using the app, you agree to this policy.
        </p>

        <h2 className="text-xl font-semibold">What We Store On Your Device</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Saved Studies & Notes:</strong> Stored locally in your browser's <em>localStorage</em>. We don't receive or sync this data.</li>
          <li><strong>Preferences:</strong> Theme (light/dark) and font scale, also saved locally.</li>
        </ul>

        <h2 className="text-xl font-semibold">What Our Server May Receive</h2>
        <p>
          When you request an outline or ESV text, the following may be sent to our server in order to process the request:
        </p>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Query content:</strong> Passage references and/or topical prompts you enter.</li>
          <li><strong>Technical details:</strong> Standard request logs (e.g., IP address, timestamp, user agent) maintained by the hosting provider for security and reliability.</li>
        </ul>
        <p className="text-white/70 text-sm">
          We do <strong>not</strong> create user accounts in this version and do <strong>not</strong> sell personal information.
        </p>

        <h2 className="text-xl font-semibold">Third-Party Services</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>ESV® Scripture Text:</strong> Used by permission from Crossway to display Bible text within the app.</li>
          <li><strong>AI Outline/Study Generation:</strong> Requests may be processed by OpenAI services to generate outlines and lexical notes from your prompts.</li>
          <li><strong>Hosting & Infrastructure:</strong> Our hosting provider may log requests for security, performance, and abuse prevention.</li>
        </ul>

        <h2 className="text-xl font-semibold">Cookies & Tracking</h2>
        <p>
          We don't use advertising trackers. Preferences may be stored locally.
          If analytics are enabled in the future, we'll update this page to describe what's collected and why.
        </p>

        <h2 className="text-xl font-semibold">Data Retention</h2>
        <p>
          Local data (studies, notes, preferences) remains on your device until you clear it.
          Use <Link href="/library" className="underline decoration-yellow-400 underline-offset-4">Library</Link> to export or remove your notes,
          or clear app storage in your browser settings.
        </p>

        <h2 className="text-xl font-semibold">Children's Privacy</h2>
        <p>
          The app is intended for adults and mature students of Scripture. If you believe a minor has submitted personal information,
          please <Link href="/contact" className="underline decoration-yellow-400 underline-offset-4">contact us</Link>.
        </p>

        <h2 className="text-xl font-semibold">Your Choices</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>Use the app without saving data to Library/Notes.</li>
          <li>Delete saved studies/notes at any time from <Link href="/library" className="underline decoration-yellow-400 underline-offset-4">Library</Link>.</li>
          <li>Clear site data from your browser settings to remove local storage.</li>
        </ul>

        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          Questions or requests? Reach out on the <Link href="/contact" className="underline decoration-yellow-400 underline-offset-4">Contact</Link> page.
        </p>

        <div className="border-t border-white/10 pt-8 text-sm text-white/60">
          <p>This app is not meant to replace diligent study and listening to the Holy Spirit.</p>
          <p className="mt-1">ESV® text used by permission. © Crossway.</p>
        </div>
      </section>

      {/* Small footer banner */}
      <footer className="mx-auto mt-10 max-w-3xl px-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="opacity-80">The Busy Christian</span>
              <span className="mx-2">•</span>
              <span>v{APP_VERSION}</span>
            </div>
            <nav className="space-x-3">
              <Link href="/help" className="hover:underline decoration-yellow-400 underline-offset-4">Help</Link>
              <span className="opacity-50">•</span>
              <Link href="/about" className="hover:underline decoration-yellow-400 underline-offset-4">About</Link>
              <span className="opacity-50">•</span>
              <Link href="/contact" className="hover:underline decoration-yellow-400 underline-offset-4">Contact</Link>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}