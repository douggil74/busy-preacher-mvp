// app/HeaderBar.tsx
"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { useSearchParams } from "next/navigation";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

function HeaderBarContent() {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Load initial theme
  useEffect(() => {
    setMounted(true);
    const mode = localStorage.getItem("bc-theme-mode") || "light";
    const s = Number(localStorage.getItem("bc-font-scale") || 1);

    setIsDark(mode === "dark");
    if (Number.isFinite(s) && s > 0) setScale(s);

    document.documentElement.style.setProperty(
      "--bc-font-scale",
      String(Number.isFinite(s) && s > 0 ? s : 1)
    );
  }, []);

  // Apply theme when toggled
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    if (isDark) {
      // Beautiful Blue Dark
      root.style.setProperty('--bg-color', '#0f1729');
      root.style.setProperty('--card-bg', '#1a2332');
      root.style.setProperty('--card-border', '#2d3f5f');
      root.style.setProperty('--text-primary', '#e8f2f8');
      root.style.setProperty('--text-secondary', '#b8d4e6');
      root.style.setProperty('--accent-color', '#3b82f6');
      localStorage.setItem("bc-theme-mode", "dark");
    } else {
      // Papyrus Light
      root.style.setProperty('--bg-color', '#f5f1e8');
      root.style.setProperty('--card-bg', '#ebe5d9');
      root.style.setProperty('--card-border', '#d4c9b3');
      root.style.setProperty('--text-primary', '#2d2520');
      root.style.setProperty('--text-secondary', '#5a4f46');
      root.style.setProperty('--accent-color', '#b8860b');
      localStorage.setItem("bc-theme-mode", "light");
    }

    // Mark that user has manually set their preference
    localStorage.setItem("bc-theme-user-set", "true");
  }, [isDark, mounted]);

  // Update font scale
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
    window.dispatchEvent(new CustomEvent('openSettings'));
  };

  return (
    <header 
      className="sticky top-0 z-40 backdrop-blur border-b" 
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--bg-color) 90%, transparent)',
        borderColor: 'var(--card-border)'
      }}
    >
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
            className={`${playfair.className} font-semibold tracking-tight`}
            style={{
              fontSize: "calc(1.75rem * var(--bc-font-scale))",
              lineHeight: "1.2",
              color: 'var(--text-primary)'
            }}
          >
            <span className="italic font-medium text-[calc(1.25rem*var(--bc-font-scale))]">
              The
            </span>{" "}
            Busy Christian
            {reference && (
              <span className="ml-2 text-[calc(1.05rem*var(--bc-font-scale))]" style={{ color: 'var(--text-secondary)' }}>
                · {reference}
              </span>
            )}
          </h1>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Font resize */}
          <div 
            className="hidden sm:flex rounded-xl overflow-hidden"
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--card-border)'
            }}
          >
            <button
              className="px-2 py-1 text-sm hover:bg-white/10 transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onClick={dec}
              aria-label="Decrease font size"
            >
              A−
            </button>
            <div className="w-px" style={{ backgroundColor: 'var(--card-border)' }} />
            <button
              className="px-2 py-1 text-sm hover:bg-white/10 transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onClick={inc}
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>

          {/* Light/Dark toggle */}
          <button
            onClick={() => setIsDark((v) => !v)}
            className="rounded-xl px-3 h-9 hover:bg-white/10 text-sm flex items-center gap-1 transition-colors"
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--card-border)',
              color: 'var(--text-primary)'
            }}
            title={isDark ? "Switch to Papyrus Light" : "Switch to Blue Dark"}
          >
            <span suppressHydrationWarning>{isDark ? "☀️ Light" : "🌙 Dark"}</span>
          </button>

          {/* Settings gear icon */}
          <button
            onClick={handleSettingsClick}
            className="rounded-xl px-3 h-9 hover:bg-white/10 transition-colors"
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--card-border)'
            }}
            title="Settings & Privacy"
          >
            <svg
              className="w-5 h-5"
              style={{ color: 'var(--text-secondary)' }}
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

          {/* Navigation Menu (Hamburger) */}
          <div className="relative" ref={menuRef}>
            <button
              className="text-3xl leading-none rounded-xl px-3 h-9 hover:bg-white/10 transition-colors"
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--card-border)',
                color: 'var(--text-primary)'
              }}
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
                className="absolute right-0 mt-2 min-w-44 rounded-2xl p-1 shadow-lg"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--card-border)'
                }}
              >
                <Link
                  href="/"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/deep-study"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => setOpen(false)}
                >
                  Deep Study
                </Link>
                <Link
                  href="/reading-plans"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => setOpen(false)}
                >
                  Reading Plan
                </Link>
                <Link
                  href="/library"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => setOpen(false)}
                >
                  My Library
                </Link>
                <Link
                  href="/courses"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => setOpen(false)}
                >
                  Study Courses
                </Link>
                <Link
                  href="/prayer"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => setOpen(false)}
                >
                  Prayer Center
                </Link>
                <Link
                  href="/pastoral-guidance"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => setOpen(false)}
                >
                  Ask the Pastor
                </Link>
                <div className="border-t my-1" style={{ borderColor: 'var(--card-border)' }} />
                <Link
                  href="/about"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => setOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/help"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => setOpen(false)}
                >
                  Help
                </Link>
                <Link
                  href="/contact"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
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
        <header 
          className="sticky top-0 z-40 backdrop-blur border-b"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--bg-color) 90%, transparent)',
            borderColor: 'var(--card-border)'
          }}
        >
          <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="h-11 animate-pulse rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)' }} />
          </div>
        </header>
      }
    >
      <HeaderBarContent />
    </Suspense>
  );
}