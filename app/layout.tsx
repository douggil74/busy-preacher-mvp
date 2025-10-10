"use client";

import "./globals.css";
import HeaderBar from "./HeaderBar";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-brand",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={playfair.variable}>
      <head>
        <title>The Busy Christian</title>
        <meta
          name="description"
          content="The Busy Christian — a personal and accurate Bible study helper."
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-white antialiased transition-colors duration-300">
        <HeaderBar />
        {/* Consistent page title under header */}
        <div className="text-center mt-6 mb-8">
         
        </div>
        <main className="mx-auto max-w-4xl px-4">{children}</main>
      </body>
    </html>
  );
}
