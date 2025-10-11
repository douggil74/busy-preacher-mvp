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

  // ✅ Single source of truth for style
  const { style, hydrated } = useStudyStyle();

  // Optional passage reference chip from URL (kept)
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "";

  // Display style safely during hydration
  const displayStyle = hydrated ? style : ("…" as typeof style);
  const displayIcon =
    (hydrated && studyStyleIcons[style]) || ("✨" as string);

  // Theme / font-size bootstrapping
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
          {/* ✅ Style indicator (uses context) */}
          <Link
            href="/personalize"
            className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 px-3 h-9 hover:bg-white/10 text-sm"
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
              className="px-2 py-1 text-sm hover:bg-white/10"
              onClick={dec}
              aria-label="Decrease font size"
            >
              A−
            </button>
            <div className="w-px bg-white/10" />
            <button
              className="px-2 py-1 text-sm hover:bg-white/10"
              onClick={inc}
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>

          {/* Light/dark toggle */}
          <button
            onClick={() => setIsDark((v) => !v)}
            className="rounded-xl border border-white/10 px-3 h-9 hover:bg-white/10 text-sm flex items-center gap-1"
            title="Toggle light/dark mode"
          >
            <span suppressHydrationWarning>{isDark ? "Light" : "Dark"}</span>
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              className="text-3xl leading-none rounded-xl border border-white/10 px-3 h-9 hover:bg-white/10"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Toggle menu"
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
                  className="block rounded-lg px-3 py-2 hover:bg-white/10"
                >
                  Home
                </Link>
                <Link
                  href="/deep-study"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10"
                >
                  Deep Study
                </Link>
                <Link
                  href="/library"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10"
                >
                  My Library
                </Link>

                <Link
                  href="/test-styles"
                  className="block rounded-lg px-3 py-2 text-white font-semibold hover:bg-white/10"
                >
                  Comparison
                </Link>

                <div className="border-t border-white/10 my-1" />

                <Link
                  href="/personalize"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10"
                >
                  Personalize
                </Link>
                <Link
                  href="/about"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10"
                >
                  About
                </Link>
                <Link
                  href="/help"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10"
                >
                  Help
                </Link>
                <Link
                  href="/contact"
                  className="block rounded-lg px-3 py-2 hover:bg-white/10"
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
