// app/test-styles/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Playfair_Display } from "next/font/google";
import { useSearchParams } from "next/navigation";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

type OutlinePoint = {
  point: string;
  why: string;
  illustration?: string;
  crossRefs?: string[];
};

type OutlineResult =
  | { error: string }
  | {
      title: string;
      source: "passage" | "theme" | "combined";
      reference?: string;
      topic?: string;
      points: OutlinePoint[];
      application?: string;
    };

const styles = ["Casual Devotional", "Bible Student", "Pastor / Teacher"] as const;
type Mode = "passage" | "theme";

function StyleTesterContent() {
  const params = useSearchParams();

  // pick up inputs from URL: ?mode=theme&theme=... OR ?passage=...
  const urlMode = (params.get("mode") as Mode) || (params.get("theme") ? "theme" : "passage");
  const urlPassage = params.get("passage") || "";
  const urlTheme = params.get("theme") || "";

  const [mode, setMode] = useState<Mode>(urlMode);
  const [passage, setPassage] = useState<string>(urlPassage);
  const [theme, setTheme] = useState<string>(urlTheme);

  const [results, setResults] = useState<Record<string, OutlineResult | undefined>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [openStyle, setOpenStyle] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // keep URL in sync (nice for sharing)
  const shareHref = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("mode", mode);
    if (mode === "passage") {
      if (passage.trim()) sp.set("passage", passage.trim());
    } else {
      if (theme.trim()) sp.set("theme", theme.trim());
    }
    return `/test-styles?${sp.toString()}`;
  }, [mode, passage, theme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", shareHref);
    }
  }, [shareHref]);

  const testStyle = async (style: string) => {
    setLoading(style);
    try {
      const body =
        mode === "passage"
          ? { mode: "passage", passage: passage.trim(), userStyle: style }
          : { mode: "theme", theme: theme.trim(), userStyle: style };

      const response = await fetch("/api/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as OutlineResult;
      setResults((prev) => ({ ...prev, [style]: data }));
    } catch (error) {
      console.error(`Error testing ${style}:`, error);
      setResults((prev) => ({ ...prev, [style]: { error: "Failed to load" } }));
    } finally {
      setLoading(null);
    }
  };

  const testAllStyles = async () => {
    setResults({});
    for (const style of styles) {
      await testStyle(style);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  // close modal on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenStyle(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const iconFor = (style: string) =>
    style === "Casual Devotional" ? "☕" :
    style === "Bible Student" ? "📖" :
    style === "Pastor / Teacher" ? "👨‍🏫" : "🎓";

  const CardPreview = ({ style }: { style: string }) => {
    const result = results[style];
    if (!result) return null;

    const isErr = "error" in result;
    const first = !isErr ? result.points?.[0] : undefined;

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpenStyle(style)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpenStyle(style)}
        className="card cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60"
        aria-label={`Open full ${style} outline`}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{iconFor(style)}</span>
          <h2 className={`${playfair.className} text-xl font-semibold`}>{style}</h2>
          <div className="ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenStyle(style);
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs hover:bg-white/10 underline decoration-yellow-400/60 underline-offset-4"
            >
              View full
            </button>
          </div>
        </div>

        {isErr ? (
          <p className="text-red-400">{result.error}</p>
        ) : (
          <>
            <h3 className="font-semibold text-lg mb-3 text-white/90">{result.title}</h3>
            <div className="space-y-4">
              {first && (
                <div className="border-l-2 border-yellow-400 pl-4">
                  <p className="font-semibold mb-1">{first.point}</p>
                  <p className="text-sm text-white/80 mb-2">
                    <span className="text-white/60">Why:</span> {first.why}
                  </p>
                  {first.illustration && (
                    <p className="text-sm text-white/70 italic">
                      {first.illustration.length > 200 ? `${first.illustration.substring(0, 200)}…` : first.illustration}
                    </p>
                  )}
                </div>
              )}
            </div>

            {!isErr && result.points?.length > 1 && (
              <p className="text-xs text-white/50 mt-3">
                + {result.points.length - 1} more point{result.points.length > 2 ? "s" : ""} (click to view)
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  const Modal = ({ style }: { style: string }) => {
    if (!style) return null;
    const result = results[style];
    if (!result) return null;

    const isErr = "error" in result;
    const close = () => setOpenStyle(null);

    return (
      <div
        ref={dialogRef}
        className="fixed inset-0 z-50"
        aria-modal="true"
        role="dialog"
        aria-labelledby="outline-title"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative mx-auto mt-8 max-w-3xl rounded-2xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{iconFor(style)}</span>
            <h2 id="outline-title" className={`${playfair.className} text-2xl font-semibold text-white/95`}>
              {style} — Full Outline
            </h2>
            <button
              onClick={close}
              className="ml-auto rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm hover:bg-white/10"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <div className="mt-4 max-h-[70vh] overflow-auto pr-1">
            {isErr ? (
              <p className="text-red-400">{result.error}</p>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white/90">{result.title}</h3>
                <p className="text-sm text-white/70">
                  {result.reference ? <>Text: {result.reference}</> : null}
                  {result.reference && result.topic ? " • " : null}
                  {result.topic ? <>Theme: {result.topic}</> : null}
                </p>

                <ol className="mt-3 list-decimal space-y-4 pl-5">
                  {result.points?.map((p, i) => (
                    <li key={i} className="space-y-2">
                      <div className="font-semibold">{p.point}</div>
                      <div className="text-sm">
                        <span className="opacity-70">Why:</span> {p.why}
                      </div>
                      {p.illustration && (
                        <div className="mt-2 text-sm">
                          <span className="opacity-70">Illustration:</span> {p.illustration}
                        </div>
                      )}
                      {!!p.crossRefs?.length && (
                        <div className="text-sm">
                          <span className="opacity-70">Cross-refs:</span>{" "}
                          {p.crossRefs
                            ?.map((r, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className="underline decoration-yellow-400 underline-offset-4 hover:opacity-90"
                                onClick={() => {
                                  navigator.clipboard?.writeText(r).catch(() => {});
                                }}
                                title="Copy reference"
                              >
                                {r}
                              </button>
                            ))
                            .reduce<JSX.Element[]>((acc, el, idx) => {
                              if (idx > 0) acc.push(<span key={`sep-${idx}`}>; </span>);
                              acc.push(el);
                              return acc;
                            }, [])}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>

                {result.application && (
                  <div className="mt-4 text-sm">
                    <span className="font-semibold">Modern Application:</span> {result.application}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const canRun = mode === "passage" ? passage.trim().length > 0 : theme.trim().length > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
        <button
  onClick={() => window.history.back()}
  className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
  Back
</button>
      <h1 className={`${playfair.className} text-4xl font-bold mb-2 text-white/95 text-center`}>
        Compare All Tones of Output
      </h1>
      <p className="text-white/70 mb-8 text-center text-sm">
        See how the same {mode === "passage" ? "passage" : "theme"} generates different results across 4 styles
      </p>

      {/* Mode toggle */}
      <div className="mx-auto mb-4 flex max-w-2xl items-center justify-center gap-2">
        <button
          className={`rounded-lg px-3 py-1 text-sm border ${
            mode === "passage"
              ? "border-yellow-400 bg-yellow-400/20 font-semibold"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
          onClick={() => setMode("passage")}
        >
          Passage
        </button>
        <button
          className={`rounded-lg px-3 py-1 text-sm border ${
            mode === "theme"
              ? "border-yellow-400 bg-yellow-400/20 font-semibold"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
          onClick={() => setMode("theme")}
        >
          Theme
        </button>
      </div>

      {/* Input card */}
      <div className="card mb-8 max-w-2xl">
        {mode === "passage" ? (
          <>
            <label htmlFor="testPassage" className="mb-2 block text-sm text-white/80">
              Enter a Bible Passage (ESV)
            </label>
            <input
              id="testPassage"
              type="text"
              placeholder="Example: John 3:16 or Romans 8:28"
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              className="input mb-4"
            />
          </>
        ) : (
          <>
            <label htmlFor="testTheme" className="mb-2 block text-sm text-white/80">
              Enter a Theme/Topic
            </label>
            <input
              id="testTheme"
              type="text"
              placeholder="Example: Gods faithfulness, forgiveness, discipleship"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="input mb-4"
            />
          </>
        )}

        <button
          onClick={testAllStyles}
          disabled={loading !== null || !canRun}
          className="rounded-lg bg-yellow-400/20 border-2 border-yellow-400 px-6 py-3 text-sm font-semibold hover:bg-yellow-400/30 disabled:opacity-50 transition-colors"
        >
          {loading ? `Testing ${loading}...` : "Test All 4 Styles"}
        </button>

        {loading && (
          <div className="mt-4">
            <div className="statusbar">
              <div className="statusbar-fill" />
            </div>
            <p className="text-center text-xs text-white/60 mt-2">
              Testing {loading}... (this takes ~5–10 seconds per style)
            </p>
          </div>
        )}
      </div>

      {Object.keys(results).length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {styles.map((style) => {
            const hasResult = results[style];
            if (!hasResult) return null;
            return <CardPreview key={style} style={style} />;
          })}
        </div>
      )}

      {Object.keys(results).length === 0 && (
        <div className="card text-center py-12 max-w-3xl">
          <p className="text-white/60 mb-4">
            Enter a {mode === "passage" ? "passage" : "theme"} above and click{" "}
            <span className="font-semibold">"Test All 4 Styles"</span> to compare the tones
          </p>
          <div className="text-left max-w-md mx-auto">
            <h3 className="font-semibold mb-3 text-white/90">What to Look For:</h3>
            <ul className="text-sm text-white/70 space-y-2">
              <li><strong className="text-white/90">Casual Devotional:</strong> Warm, short, practical</li>
              <li><strong className="text-white/90">Bible Student:</strong> Terms defined, context-aware</li>
              <li><strong className="text-white/90">Pastor / Teacher:</strong> Structured, sermon-ready</li>
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <a
          href="/"
          className="text-yellow-400 hover:text-yellow-300 text-sm underline decoration-yellow-400/50 underline-offset-4"
        >
          ← Back to Home
        </a>
      </div>

      {openStyle && <Modal style={openStyle} />}
    </main>
  );
}

export default function StyleTesterPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-8 text-center">
        <p className="text-white/60">Loading...</p>
      </div>
    }>
      <StyleTesterContent />
    </Suspense>
  );
}