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

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "2.1";

export default function ContactPage() {
  const [lightMode, setLightMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("bc-theme");
    if (savedTheme === "dark") {
      setLightMode(false);
    } else {
      setLightMode(true);
    }
  }, []);

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add("light-mode");
      localStorage.setItem("bc-theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("bc-theme", "dark");
    }
  }, [lightMode]);

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
      <div className="mx-auto mb-6 max-w-3xl px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors"
              aria-label="Back to Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
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
              onClick={() => setLightMode((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 focus:outline-none"
              aria-label={lightMode ? "Switch to dark mode" : "Switch to light mode"}
            >
              {lightMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
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

      <section className="mx-auto max-w-3xl px-4 leading-relaxed text-white/90 space-y-8">
        <h1 className={`${playfair.className} text-3xl font-semibold`}>Contact</h1>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/80 mb-4">
            Questions, ideas, or bug reports? I'd love to hear from you.
          </p>
          <p>
            <a
              href="mailto:thebusychristian@gmail.com"
              className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 underline underline-offset-4 decoration-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              thebusychristian@gmail.com
            </a>
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-3">Get in Touch About:</h2>
          <ul className="list-disc ml-5 space-y-2 text-white/80">
            <li>Bug reports or technical issues</li>
            <li>Feature suggestions</li>
            <li>Partnership opportunities</li>
            <li>General feedback</li>
          </ul>
        </div>
      </section>

      <footer className="mx-auto mt-10 max-w-3xl px-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="opacity-80">The Busy Christian</span>
              <span className="mx-2">•</span>
              <span>v{APP_VERSION}</span>
            </div>
            <nav className="space-x-3">
              <Link href="/privacy" className="hover:underline decoration-yellow-400 underline-offset-4">Privacy</Link>
              <span className="opacity-50">•</span>
              <Link href="/about" className="hover:underline decoration-yellow-400 underline-offset-4">About</Link>
              <span className="opacity-50">•</span>
              <Link href="/help" className="hover:underline decoration-yellow-400 underline-offset-4">Help</Link>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}