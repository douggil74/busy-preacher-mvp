// app/HeaderBar.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { useStudyStyle } from "./hooks/useStudyStyle";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const studyStyleIcons = {
  "Casual Devotional": "☕",
  "Bible Student": "📖",
  "Pastor / Teacher": "👨‍🏫",
} as const;

function HeaderBarContent() {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  const { style, hydrated } = useStudyStyle();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "";

  const displayStyle = hydrated ? style : ("…" as typeof style);
  const displayIcon = (hydrated && studyStyleIcons[style]) || ("✨" as string);

  useEffect(() => {
    setMounted(true);
    const t = (localStorage.getItem("bc-theme") as "dark" | "light") || "dark";
    const s = Number(localStorage.getItem("bc-font-scale") || 1);

    setIsDark(t !== "light");
    if (Number.isFinite(s) && s > 0) setScale(s);

    const html = document.documentElement;
    if (t === "light") {
      html.classList.remove("dark");
      html.classList.add("light");
    } else {
      html.classList.add("dark");
      html.classList.remove("light");
    }
    html.style.setProperty(
      "--bc-font-scale",
      String(Number.isFinite(s) && s > 0 ? s : 1)
    );
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
      html.classList.remove("light");
      localStorage.setItem("bc-theme", "dark");
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
      localStorage.setItem("bc-theme", "light");
    }
  }, [isDark, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.style.setProperty("--bc-font-scale", String(scale));
    localStorage.setItem("bc-font-scale", String(scale));
  }, [scale, mounted]);

  const dec = () =>
    setScale((s) => Math.max(0.9, Math.round((s - 0.1) * 10) / 10));
  const inc = () =>
    setScale((s) => Math.min(1.4, Math.round((s + 0.1) * 10) / 10));

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    
    // Dispatch custom event that pages can listen to
    window.dispatchEvent(new CustomEvent('openSettings'));
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-black/10 border-b border-white/10">
      <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="The Busy Christian logo"
            width={44}
            height={44}
            className="object-contain translate-y-[1px] no-invert"
            priority
          />
          <h1
            className={`${playfair.className} font-semibold tracking-tight text-white`}
            style={{
              fontSize: "calc(1.75rem * var(--bc-font-scale))",
              lineHeight: "1.2",
            }}
          >
            <span className="italic font-medium text-[calc(1.25rem*var(--bc-font-scale))]">
              The
            </span>{" "}
            Busy Christian
            {reference && (
              <span className="ml-2 text-white/70 text-[calc(1.05rem*var(--bc-font-scale))]">
                · {reference}
              </span>
            )}
          </h1>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Style indicator */}
          <Link
            href="/personalize"
            className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 px-3 h-9 hover:bg-white/10 text-sm transition-colors"
            title={`Current style: ${displayStyle}; Click to change.`}
          >
            <span className="text-base">{displayIcon}</span>
            <span className="text-white/80" suppressHydrationWarning>
              {displayStyle}
            </span>
          </Link>

          {/* Font resize */}
          <div className="hidden sm:flex rounded-xl border border-white/10 overflow-hidden">
            <button
              className="px-2 py-1 text-sm hover:bg-white/10 transition-colors"
              onClick={dec}
              aria-label="Decrease font size"
            >
              A−
            </button>
            <div className="w-px bg-white/10" />
            <button
              className="px-2 py-1 text-sm hover:bg-white/10 transition-colors"
              onClick={inc}
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>

          {/* Light/dark toggle */}
          <button
            onClick={() => setIsDark((v) => !v)}
            className="rounded-xl border border-white/10 px-3 h-9 hover:bg-white/10 text-sm flex items-center gap-1 transition-colors"
            title="Toggle light/dark mode"
          >
            <span suppressHydrationWarning>{isDark ? "Light" : "Dark"}</span>
          </button>

          {/* Settings gear icon */}
          <button
            onClick={handleSettingsClick}
            className="rounded-xl border border-white/10 px-3 h-9 hover:bg-white/10 transition-colors"
            title="Settings & Privacy"
          >
            <svg 
              className="w-5 h-5 text-white/60" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </button>

          {/* Navigation Menu */}
          <div className="relative">
            <button
              className="text-3xl leading-none rounded-xl border border-white/10 px-3 h-9 hover:bg-white/10 transition-colors"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Toggle navigation menu"
            >
              {open ? "×" : "☰"}
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 min-w-44 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur p-1 shadow-lg"
                onMouseLeave={() => setOpen(false)}
              >
                <Link
                  href="/"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/deep-study"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Deep Study
                </Link>
                          <Link
            href="/reading-plans"
            className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
            onClick={() => setOpen(false)}
          >
           Reading Plan
          </Link>
                <Link
                  href="/library"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  onClick={() => setOpen(false)}
              
                >
                  My Library
                </Link>
                <Link
                  href="/courses"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Study Courses
                </Link>
<Link
  href="/prayer-journal"
  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
  onClick={() => setOpen(false)}
>
  🙏 Prayer Journal
</Link>
                <div className="border-t border-white/10 my-1" />

                <Link
                  href="/test-styles"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Comparison
                </Link>
                <Link
                  href="/personalize"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Personalize
                </Link>
                
                <div className="border-t border-white/10 my-1" />
                
                <Link
                  href="/about"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/help"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Help
                </Link>
                <Link
                  href="/contact"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Contact
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function HeaderBar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 backdrop-blur bg-black/10 border-b border-white/10">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="h-11 animate-pulse bg-white/5 rounded-lg" />
          </div>
        </header>
      }
    >
      <HeaderBarContent />
    </Suspense>
  );
}