// components/VersePreview.tsx
"use client";

import React, { useEffect, useState } from "react";

export default function VersePreview() {
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Listen to cross-ref clicks from page.tsx
  useEffect(() => {
    const onSet = (e: Event) => {
      const ce = e as CustomEvent<{ q: string }>;
      const next = ce?.detail?.q ?? "";
      if (next) {
        setInput(next);
        setQuery(next);
      }
    };
    window.addEventListener("bp-set-preview", onSet as EventListener);
    return () => window.removeEventListener("bp-set-preview", onSet as EventListener);
  }, []);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setErr(null);
    setHtml("");
    fetch(`/api/esv?q=${encodeURIComponent(query)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((j) => setHtml(j?.content || ""))
      .catch((e) => setErr(String(e?.message || e)))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ESV passage (e.g., John 3:1–16)"
          className="input"
          autoComplete="off"
        />
        <button
          type="button"
          className="btn"
          onClick={() => input && setQuery(input)}
        >
          Preview
        </button>
      </div>

      {loading && <p className="text-sm text-white/60 mt-3">Loading passage…</p>}
      {err && <p className="text-sm text-red-400 mt-3">{err}</p>}

      {html && (
        <div
          className="prose prose-invert max-w-none mt-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}