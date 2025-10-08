"use client";

import { useEffect, useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function HeaderBar() {
  const [isDark, setIsDark] = useState(true);
  const [scale, setScale] = useState(1);
  const [open, setOpen] = useState(false);

  // match your form card width
  const container = "mx-auto max-w-3xl w-full px-4";

  useEffect(() => {
    const t = localStorage.getItem("bc-theme");
    const s = localStorage.getItem("bc-font-scale");
    if (t === "light") setIsDark(false);
    if (s) setScale(Number(s));
  }, []);

  // theme toggle: add .dark / .light to <html>
  useEffect(() => {
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
  }, [isDark]);

  // font scale
  useEffect(() => {
    document.documentElement.style.setProperty("--bc-font-scale", String(scale));
    localStorage.setItem("bc-font-scale", String(scale));
  }, [scale]);

  const dec = () => setScale((s) => Math.max(0.9, Math.round((s - 0.1) * 10) / 10));
  const inc = () => setScale((s) => Math.min(1.4, Math.round((s + 0.1) * 10) / 10));

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-black/10 light:bg-white/60">
      <div className={`${container} py-3 flex items-center justify-between`}>
        {/* Logo-style title */}
        <a href="/" aria-label="The Busy Christian home">
          <h1 className={`${playfair.className} flex items-end gap-1 leading-none tracking-tight logo-brand`}>
            <span className="text-base md:text-lg translate-y-[1px] opacity-90">The</span>
            <span className="text-2xl md:text-3xl italic">Busy</span>
            <span className="text-2xl md:text-3xl">Christian</span>
          </h1>
        </a>

        <div className="flex items-center gap-2">
          {/* A− / A+ */}
          <div className="hidden sm:flex rounded-xl border border-white/10 light:border-black/10 overflow-hidden">
            <button className="px-2 py-1 text-sm hover:bg-white/10 light:hover:bg-black/5" onClick={dec} aria-label="Decrease font size">A−</button>
            <div className="w-px bg-white/10 light:bg-black/10" />
            <button className="px-2 py-1 text-sm hover:bg-white/10 light:hover:bg-black/5" onClick={inc} aria-label="Increase font size">A+</button>
          </div>

          {/* Dark / Light toggle */}
          <button
            className="rounded-xl border border-white/10 light:border-black/10 px-3 h-9 hover:bg-white/10 light:hover:bg-black/5"
            onClick={() => setIsDark((v) => !v)}
            aria-label="Toggle dark or light mode"
            title="Toggle dark / light"
          >
            {isDark ? "Light" : "Dark"}
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              className="rounded-xl border border-white/10 light:border-black/10 px-3 h-9 hover:bg-white/10 light:hover:bg-black/5"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              aria-label="Open menu"
            >
              ☰
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 min-w-40 rounded-2xl border border-white/10 light:border-black/10 bg-white/10 light:bg-black/5 backdrop-blur p-1 shadow-lg"
                onMouseLeave={() => setOpen(false)}
              >
                <a href="/about" className="block rounded-xl px-3 py-2 hover:bg-white/10 light:hover:bg-black/5">About</a>
                <a href="/contact" className="block rounded-xl px-3 py-2 hover:bg-white/10 light:hover:bg-black/5">Contact</a>
                <a href="/resources" className="block rounded-xl px-3 py-2 hover:bg-white/10 light:hover:bg-black/5">Resources</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* divider aligned to container */}
      <div className={container}>
        <div className="h-px w-full bg-white/10 light:bg-black/10" />
      </div>
    </header>
  );
}