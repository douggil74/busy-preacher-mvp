// app/layout.tsx
"use client";

import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display } from "next/font/google";
import { useEffect } from "react";

const brand = Playfair_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-brand",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Global theme handler - runs once on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem("bc-theme");
    
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      // Default to light mode
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
      localStorage.setItem("bc-theme", "light");
    }
  }, []);

  return (
    <html lang="en" className={brand.variable}>
      <head>
        <title>The Busy Christian</title>
        <meta name="description" content="A warm, accurate Bible study helper." />
      </head>
      <body className="min-h-screen bg-slate-950 text-white antialiased">
                <main className="mx-auto max-w-4xl px-4">{children}</main>
      </body>
    </html>
  );
}