// app/test-styles/page.tsx
// This is a TEST PAGE to compare all 4 styles side-by-side
// Visit: http://localhost:3000/test-styles

"use client";

import { useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const styles = ["Casual Devotional", "Bible Student", "Pastor / Teacher", "Theologian"];

export default function StyleTesterPage() {
  const [passage, setPassage] = useState("John 3:16");
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  const testStyle = async (style: string) => {
    setLoading(style);
    try {
      const response = await fetch("/api/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "passage",
          passage,
          userStyle: style,
        }),
      });

      const data = await response.json();
      setResults((prev: any) => ({ ...prev, [style]: data }));
    } catch (error) {
      console.error(`Error testing ${style}:`, error);
      setResults((prev: any) => ({ ...prev, [style]: { error: "Failed to load" } }));
    } finally {
      setLoading(null);
    }
  };

  const testAllStyles = async () => {
    setResults({});
    for (const style of styles) {
      await testStyle(style);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className={`${playfair.className} text-4xl font-bold mb-2 text-white/95 light:text-black/95 text-center`}>
        AI Style Comparison Tester
      </h1>
      <p className="text-white/70 light:text-black/70 mb-8 text-center text-sm">
        Test how the same passage generates different outputs based on study style
      </p>

      <div className="card mb-8 max-w-2xl">
        <label htmlFor="testPassage" className="mb-2 block text-sm text-white/80 light:text-black/80">
          Enter a Bible Passage to Test
        </label>
        <input
          id="testPassage"
          type="text"
          placeholder="e.g., John 3:16, Romans 8:28"
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          className="input mb-4"
        />
        
        <button
          onClick={testAllStyles}
          disabled={loading !== null || !passage.trim()}
          className="rounded-lg bg-yellow-400/20 border-2 border-yellow-400 px-6 py-3 text-sm font-semibold hover:bg-yellow-400/30 disabled:opacity-50 transition-colors"
        >
          {loading ? `Testing ${loading}...` : "Test All 4 Styles"}
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {styles.map((style) => {
            const result = results[style];
            if (!result) return null;

            return (
              <div key={style} className="card">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">
                    {style === "Casual Devotional" && "☕"}
                    {style === "Bible Student" && "📖"}
                    {style === "Pastor / Teacher" && "👨‍🏫"}
                    {style === "Theologian" && "🎓"}
                  </span>
                  <h2 className={`${playfair.className} text-xl font-semibold`}>
                    {style}
                  </h2>
                </div>

                {result.error ? (
                  <p className="text-red-400">{result.error}</p>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg mb-3 text-white/90 light:text-black/90">
                      {result.title}
                    </h3>

                    <div className="space-y-4">
                      {result.points?.slice(0, 1).map((point: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-yellow-400 pl-4">
                          <p className="font-semibold mb-1">{point.point}</p>
                          <p className="text-sm text-white/80 light:text-black/80 mb-2">
                            <span className="text-white/60 light:text-black/60">Why:</span> {point.why}
                          </p>
                          {point.illustration && (
                            <p className="text-sm text-white/70 light:text-black/70 italic">
                              {point.illustration.substring(0, 150)}...
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {result.points?.length > 1 && (
                      <p className="text-xs text-white/50 light:text-black/50 mt-3">
                        + {result.points.length - 1} more points
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {Object.keys(results).length === 0 && (
        <div className="card text-center py-12">
          <p className="text-white/60 light:text-black/60">
            Enter a Bible passage above and click "Test All 4 Styles" to see the differences
          </p>
        </div>
      )}

      <div className="mt-8 card">
        <h3 className="font-semibold mb-3">What to Look For:</h3>
        <ul className="text-sm text-white/80 light:text-black/80 space-y-2">
          <li>☕ <strong>Casual Devotional:</strong> Warm, short, practical, uses "you/we"</li>
          <li>📖 <strong>Bible Student:</strong> Explains terms, includes context, balanced</li>
          <li>👨‍🏫 <strong>Pastor / Teacher:</strong> Structured, memorable, sermon-ready</li>
          <li>🎓 <strong>Theologian:</strong> Greek/Hebrew words, academic, in-depth</li>
        </ul>
      </div>

      <div className="mt-4 text-center">
        <a
          href="/"
          className="text-yellow-400 hover:text-yellow-300 text-sm"
        >
          ← Back to Home
        </a>
      </div>
    </main>
  );
}