# 0) safety: new branch + backups
git init >/dev/null 2>&1 || true
...
# 0) safety: new branch + backups
git init >/dev/null 2>&1 || true
git add -A && git commit -m "before polish" >/dev/null 2>&1 || true
git checkout -b polish/busy-christian >/dev/null 2>&1 || true

mkdir -p .backup-patch
cp app/layout.tsx .backup-patch/layout.tsx.bak 2>/dev/null || true
cp app/globals.css .backup-patch/globals.css.bak 2>/dev/null || true
cp app/page.tsx .backup-patch/page.tsx.bak 2>/dev/null || true

################################################################################
# 1) layout.tsx — keep title/description, unify theme via <html class="dark|light">
################################################################################
cat > app/layout.tsx <<'TSX'
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
  // Unify theme on <html> (persisted in bc-theme)
  useEffect(() => {
    const saved = (localStorage.getItem("bc-theme") as "dark" | "light" | null) ?? "dark";
    const theme = saved === "light" || saved === "dark" ? saved : "dark";
    const html = document.documentElement;
    html.classList.add(theme);
    html.classList.remove(theme === "dark" ? "light" : "dark");
    localStorage.setItem("bc-theme", theme);
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
TSX

################################################################################
# 2) globals.css — switch light overrides from body.light-mode → html.light
################################################################################
cat > app/globals.css <<'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }

html, body, #__next { height: 100%; }

body {
  @apply bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100;
}

/* Light mode (toggle via <html class="light">) */
html.light body { @apply bg-white text-slate-900; }
html.light .card, html.light section { @apply bg-white/90 text-slate-900 border-slate-200; }
html.light .card input, html.light section input { @apply text-slate-900 placeholder:text-slate-500 border-yellow-500; }
html.light .card button, html.light section button { @apply text-slate-900; }
html.light .text-white\/70, html.light .text-white\/80, html.light .text-white\/60 { @apply text-slate-700; }
html.light .opacity-70 { @apply opacity-100; }
html.light .hover-popover { @apply bg-white/95 text-slate-900 border-slate-300; }
html.light .hover-popover .text-white\/60 { @apply text-slate-600; }

/* Better wrapping for long headings on mobile */
h1, h2, h3 { text-wrap: balance; hyphens: auto; }

/* INPUTS — gold border */
.input { @apply w-full rounded-2xl border-2 border-[#FFD966] bg-transparent px-4 py-3 text-base outline-none text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#FFD966]/50 focus:border-[#FFD966] transition; }

/* BUTTONS */
.btn { @apply inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-medium backdrop-blur hover:bg-white/15 active:scale-[0.99] transition; }

.card {
  @apply w-full max-w-none sm:max-w-2xl
         rounded-none sm:rounded-3xl
         border border-white/10 bg-card/60
         p-4 sm:p-6
         shadow-soft backdrop-blur-xl;
}

.badge { @apply inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/70; }

/* Status bar (indeterminate) */
@keyframes bp-indeterminate {
  0% { left: -35%; right: 100%; }
  60% { left: 100%; right: -90%; }
  100% { left: 100%; right: -90%; }
}
.statusbar { position: relative; width: 100%; height: 6px; border-radius: 9999px; background: rgba(255,255,255,0.08); overflow: hidden; }
.statusbar-fill { position: absolute; height: 100%; border-radius: 9999px; background: rgba(255,255,255,0.45); animation: bp-indeterminate 1.4s ease-in-out infinite; }

@layer utilities {
  .px-safe {
    padding-left: max(0.75rem, env(safe-area-inset-left));
    padding-right: max(0.75rem, env(safe-area-inset-right));
  }
}
CSS

################################################################################
# 3) app/page.tsx — fix disclaimer string; footer name; add PDF metadata + page #s
################################################################################

# 3a) Replace the DISCLAIMER constant with the exact required wording
sed -i 's|const DISCLAIMER = "This app[^"]*";|const DISCLAIMER = "This app is not meant to replace diligent study and listening to the Holy Spirit.";|' app/page.tsx

# 3b) Fix footer credit: “© Doug Gilford — The Busy Christian • v${APP_VERSION}”
sed -i 's|const footer = `©[^`]*`;|const footer = `© Doug Gilford — The Busy Christian • v${APP_VERSION}`;|' app/page.tsx

# 3c) Add doc metadata right after jsPDF constructor (idempotent-safe insertion)
awk '{
  print $0
  if ($0 ~ /new jsPDF\(\{ unit: "pt", format: "letter" \}\);/ && seen!=1) {
    print "  // PDF metadata (brand, author, etc.)"
    print "  doc.setProperties({"
    print "    title: \"The Busy Christian — Outline\","
    print "    subject: \"Bible study outline\","
    print "    author: \"Doug Gilford\","
    print "    creator: \"The Busy Christian\","
    print "    keywords: \"Bible, ESV, sermon, study, outline\","
    print "  });"
    seen=1
  }
}' app/page.tsx > app/page.tsx.__tmp__ && mv app/page.tsx.__tmp__ app/page.tsx

# 3d) Add centered page numbers before we save the PDF (insert before doc.save(...)
awk '{
  if ($0 ~ /doc.save\(/ && injected!=1) {
    print "  // Centered page numbers"
    print "  {"
    print "    const pageCount = (doc as any).internal.getNumberOfPages?.() ?? (doc as any).getNumberOfPages?.() ?? 1;"
    print "    for (let i = 1; i <= pageCount; i++) {"
    print "      (doc as any).setPage(i);"
    print "      doc.setFontSize(9);"
    print "      doc.text(String(i), 612 / 2, 742, { align: \"center\" as any });"
    print "    }"
    print "  }"
    injected=1
  }
  print $0
}' app/page.tsx > app/page.tsx.__tmp__ && mv app/page.tsx.__tmp__ app/page.tsx

################################################################################
# 4) done — show a quick diff summary and build
################################################################################
git add -A
git commit -m "Polish: brand=The Busy Christian; disclaimer/footer; PDF metadata+pages; theme unify" >/dev/null 2>&1 || true

echo
echo "✅ Applied polish. Summary:"
git --no-pager diff --name-only HEAD~1 HEAD || true

echo
echo "Now run your app:"
echo "  npm run dev"

