"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function HeaderBar() {
  const [isDark, setIsDark] = useState(true);
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);

  // Load user preferences on mount
  useEffect(() => {
    const t = localStorage.getItem("bc-theme");
    const s = localStorage.getItem("bc-font-scale");
    if (t === "light") setIsDark(false);
    if (s) setScale(Number(s));
  }, []);

  // Theme: only toggle .light-mode on body
  useEffect(() => {
    const body = document.body;
    if (isDark) {
      body.classList.remove("light-mode");
      body.classList.add("dark-mode");
      localStorage.setItem("bc-theme", "dark");
    } else {
      body.classList.add("light-mode");
      body.classList.remove("dark-mode");
      localStorage.setItem("bc-theme", "light");
    }
  }, [isDark]);

  // Font scale adjustment
  useEffect(() => {
    document.documentElement.style.setProperty("--bc-font-scale", String(scale));
    localStorage.setItem("bc-font-scale", String(scale));
  }, [scale]);

  const dec = () => setScale((s) => Math.max(0.9, Math.round((s - 0.1) * 10) / 10));
  const inc = () => setScale((s) => Math.min(1.4, Math.round((s + 0.1) * 10) / 10));

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-black/10 light:bg-white/70 border-b border-white/10 light:border-black/10">
<div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">

{/* Brand */}
        <Link href="/" className="flex items-center gap-3">
  <Image
    src="/logo.png"
    alt="The Busy Christian logo"
    width={44}
    height={44}
    className="object-contain translate-y-[1px]"
    priority
  />
  <h1
    className={`${playfair.className} font-semibold tracking-tight text-white light:text-black`}
    style={{ fontSize: "calc(1.75rem * var(--bc-font-scale))", lineHeight: "1.2" }}
  >
    <span className="italic font-medium text-[calc(1.25rem*var(--bc-font-scale))]">The</span>{" "}
    Busy Christian
  </h1>
</Link>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Font resize */}
          <div className="hidden sm:flex rounded-xl border border-white/10 light:border-black/10 overflow-hidden">
            <button
              className="px-2 py-1 text-sm hover:bg-white/10 light:hover:bg-black/5"
              onClick={dec}
              aria-label="Decrease font size"
            >
              A−
            </button>
            <div className="w-px bg-white/10 light:bg-black/10" />
            <button
              className="px-2 py-1 text-sm hover:bg-white/10 light:hover:bg-black/5"
              onClick={inc}
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>

          {/* Light/dark toggle */}
          <button
            onClick={() => setIsDark((v) => !v)}
            className="rounded-xl border border-white/10 light:border-black/10 px-3 h-9 hover:bg-white/10 light:hover:bg-black/5 text-sm flex items-center gap-1"
            title="Toggle light/dark mode"
          >
            {isDark ? "🌞 Light" : "🌙 Dark"}
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              className="rounded-xl border border-white/10 light:border-black/10 px-3 h-9 hover:bg-white/10 light:hover:bg-black/5"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              ☰
            </button>

            {open && (
  <div
    role="menu"
    className="absolute right-0 mt-2 min-w-44 rounded-2xl border border-white/10 light:border-black/10 bg-slate-900/95 light:bg-white/95 backdrop-blur p-1 shadow-lg"
    onMouseLeave={() => setOpen(false)}
  >
    <Link href="/" className="block rounded-lg px-3 py-2 hover:bg-white/10 light:hover:bg-black/5">🏠 Home</Link>
    <Link href="/deep-study" className="block rounded-lg px-3 py-2 hover:bg-white/10 light:hover:bg-black/5">📖 Deep Study</Link>
    <Link href="/library" className="block rounded-lg px-3 py-2 hover:bg-white/10 light:hover:bg-black/5">📝 My Notes</Link>

    {/* new comparison link */}
    <Link
      href="/test-styles"
      className="block rounded-lg px-3 py-2 text-white-400 font-semibold hover:bg-white/10 light:hover:bg-black/5"
    >
      🔍 Comparison 
    </Link>

    <div className="border-t border-white/10 light:border-black/10 my-1" />

    <Link href="/personalize" className="block rounded-lg px-3 py-2 hover:bg-white/10 light:hover:bg-black/5">⚙️ Personalize</Link>
    <Link href="/about" className="block rounded-lg px-3 py-2 hover:bg-white/10 light:hover:bg-black/5">ℹ️ About</Link>
    <Link href="/help" className="block rounded-lg px-3 py-2 hover:bg-white/10 light:hover:bg-black/5">🙏 Help</Link>
    <Link href="/contact" className="block rounded-lg px-3 py-2 hover:bg-white/10 light:hover:bg-black/5">✉️ Contact</Link>
  </div>
)}
          </div>
        </div>
      </div>
    </header>
  );
}
