"use client";

import { useState } from "react";

type Outline = {
  title: string;
  bigIdea: string;
  passageSummary: string;
  points: { heading: string; explanation: string; references: string[] }[];
  historicalContext: string;
  modernApplication: string;
};

function looksLikeHTML(text: string) {
  const t = text.trim().toLowerCase();
  return t.startsWith("<!doctype") || t.startsWith("<html") || t.includes("<body");
}

export default function Page() {
  const [scripture, setScripture] = useState("");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Outline | null>(null);

  const canSubmit = scripture.trim().length > 0 || theme.trim().length > 0;

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setData(null);

    const s = scripture.trim();
    const t = theme.trim();
    if (!s && !t) {
      setError("Enter a scripture, a theme, or both.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scripture: s, theme: t }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(
          looksLikeHTML(text)
            ? "The server returned an error page. Most likely your OPENAI_API_KEY is missing/invalid. Add it to .env.local and restart."
            : text || `Request failed: ${res.status}`
        );
        return;
      }

      const json = (await res.json()) as { outline: Outline };
      setData(json.outline);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Busy Preacher</h1>
            <p className="text-sm text-white/60 mt-1">
              Enter a Scripture or a Theme. We’ll draft a quick outline with points, context, and application.
            </p>
          </div>
          <span className="badge">MVP</span>
        </div>

        <form onSubmit={onGenerate} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Scripture (e.g., John 3:16 or Psalm 23)</label>
            <input
              className="input"
              placeholder="John 3:16; James 1:2–4; etc."
              value={scripture}
              onChange={(e) => setScripture(e.target.value)}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Theme (e.g., God’s Love, Perseverance, Generosity)</label>
            <input
              className="input"
              placeholder="Grace under pressure"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              maxLength={150}
            />
          </div>

          <button disabled={!canSubmit || loading} className="btn w-full disabled:opacity-50">
            {loading ? "Generating…" : "Generate Outline"}
          </button>
        </form>

        {error && <p className="mt-4 text-red-300 text-sm">{error}</p>}

        {data && (
          <div className="mt-8 space-y-6">
            <div className="border-t border-white/10 pt-6">
              <h2 className="text-xl font-semibold">{data.title}</h2>
              <p className="mt-2 text-white/70"><span className="font-medium">Big Idea:</span> {data.bigIdea}</p>
              <p className="mt-2 text-white/70"><span className="font-medium">Passage Summary:</span> {data.passageSummary}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Main Points</h3>
              <ol className="list-decimal pl-5 space-y-3">
                {data.points.map((p, i) => (
                  <li key={i}>
                    <p className="font-medium">{p.heading}</p>
                    <p className="text-white/70">{p.explanation}</p>
                    {p.references.length > 0 && (
                      <p className="text-white/50 text-sm mt-1">Refs: {p.references.join(", ")}</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Historical Context</h3>
              <p className="text-white/70 mt-1 whitespace-pre-line">{data.historicalContext}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Modern Application</h3>
              <p className="text-white/70 mt-1 whitespace-pre-line">{data.modernApplication}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
