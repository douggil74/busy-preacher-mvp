"use client";

import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";

type Outline = {
  title: string;
  bigIdea: string;
  passageSummary: string;
  points: { heading: string; explanation: string; references: string[] }[];
  historicalContext: string;
  modernApplication: string;
};

const DISCLAIMER =
  "This tool is not meant to replace diligent study and listening to the Holy Spirit.";

function looksLikeHTML(text: string) {
  const t = text.trim().toLowerCase();
  return t.startsWith("<!doctype") || t.startsWith("<html") || t.includes("<body");
}

// Title -> safe file slug
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 80);
}

// Title case for nice headings
function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

export default function Page() {
  const [scripture, setScripture] = useState("");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Outline | null>(null);

  const canSubmit = scripture.trim().length > 0 || theme.trim().length > 0;

  const headerTitle = "The Busy Preacher";

  const filename = useMemo(() => {
    const parts = [
      data?.title ? slugify(data.title) : "",
      scripture ? slugify(scripture) : "",
      theme ? slugify(theme) : "",
    ].filter(Boolean);
    const base = parts.join("-") || "outline";
    const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `${base}-${stamp}.pdf`;
  }, [data?.title, scripture, theme]);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setData(null);

    const s = scripture.trim();
    const t = theme.trim();
    if (!s && !t) {
      setError("Enter a Scripture, a Theme, or both.");
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

  function onClear() {
    setScripture("");
    setTheme("");
    setError(null);
    setData(null);
  }

  /** Clean PDF with margins, consistent fonts, section spacing & page breaks */
  function exportPdf() {
    if (!data) return;

    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const M = { x: 56, y: 60, w: 500 }; // left margin & text width
    const L = 16; // line height
    let y = M.y;

    // Helpers
    const line = () => {
      doc.setDrawColor(220);
      doc.line(M.x, y + 6, M.x + M.w, y + 6);
      y += 16;
    };
    const ensure = (extra = 0) => {
      if (y + extra > 760) {
        doc.addPage();
        y = M.y;
      }
    };
    const writeBlock = (text: string, font = "normal", size = 11, indent = 0) => {
      doc.setFont("helvetica", font as any);
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, M.w - indent);
      for (const ln of lines) {
        ensure(L);
        doc.text(ln, M.x + indent, y);
        y += L;
      }
    };
    const labelValue = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const labelText = `${label}: `;
      const labelWidth = doc.getTextWidth(labelText);
      ensure(L);
      doc.text(labelText, M.x, y);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(value, M.w - labelWidth);
      if (lines.length) {
        doc.text(lines[0], M.x + labelWidth, y);
        y += L;
        for (let i = 1; i < lines.length; i++) {
          ensure(L);
          doc.text(lines[i], M.x, y);
          y += L;
        }
      }
      y += 6;
    };

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`${headerTitle} — Outline`, M.x, y); y += 24;

    // Disclaimer (top)
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    writeBlock(DISCLAIMER);
    y += 6;
    line();

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    writeBlock(data.title ? toTitleCase(data.title) : "Untitled");
    y += 2;

    // Scripture/Theme summary row (if provided)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const metaBits = [
      scripture ? `Scripture: ${scripture}` : "",
      theme ? `Theme: ${theme}` : "",
      `Generated: ${new Date().toLocaleString()}`,
    ].filter(Boolean);
    if (metaBits.length) {
      writeBlock(metaBits.join("  •  "));
      y += 4;
    }

    // Big Idea / Passage Summary
    labelValue("Big Idea", data.bigIdea);
    labelValue("Passage Summary", data.passageSummary);
    line();

    // Points
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    writeBlock("Main Points");
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    data.points.forEach((p, i) => {
      ensure(L * 4);
      writeBlock(`${i + 1}. ${p.heading}`, "bold");
      writeBlock(p.explanation, "normal", 11, 16);
      if (p.references?.length) {
        writeBlock(`Refs: ${p.references.join(", ")}`, "normal", 10, 16);
      }
      y += 4;
    });

    line();

    // Historical Context
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    writeBlock("Historical Context");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    writeBlock(data.historicalContext);

    y += 6;
    line();

    // Modern Application
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    writeBlock("Modern Application");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    writeBlock(data.modernApplication);

    // Footer (each page)
    const footer = "© Douglas M. Gilford — The Busy Preacher";
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(footer, M.x, 770);
      doc.text(DISCLAIMER, M.x, 756);
    }

    doc.save(filename);
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="card w-full max-w-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{headerTitle}</h1>
            <p className="text-sm text-white/60 mt-1">
              Enter a Scripture or a Theme. We’ll draft a quick outline with points, context, and application.
            </p>
          </div>
          <span className="badge">MVP</span>
        </div>

        {/* Status bar when thinking */}
        {loading && (
          <div className="mb-4">
            <div className="statusbar">
              <div className="statusbar-fill" />
            </div>
            <p className="mt-2 text-xs text-white/60">Thinking… generating outline</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onGenerate} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Scripture (e.g., John 3:16 or Psalm 23)</label>
            <input
              className="input"
              placeholder="John 3:16; James 1:2–4; etc."
              value={scripture}
              onChange={(e) => setScripture(e.target.value)}
              maxLength={200}
              inputMode="text"
              autoCapitalize="none"
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
              inputMode="text"
              autoCapitalize="none"
            />
          </div>

          <div className="flex gap-3">
            <button disabled={!canSubmit || loading} className="btn w-full disabled:opacity-50">
              {loading ? "Generating…" : "Generate Outline"}
            </button>
            <button type="button" onClick={onClear} className="btn w-36 disabled:opacity-50">
              Clear
            </button>
          </div>
        </form>

        {error && <p className="mt-4 text-red-300 text-sm">{error}</p>}

        {/* Results + actions */}
        {data && (
          <div className="mt-8 space-y-6">
            {/* Disclaimer (top of outline) */}
            <div className="text-xs text-white/50 italic">{DISCLAIMER}</div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{toTitleCase(data.title || "Untitled")}</h2>
                <p className="mt-2 text-white/70">
                  <span className="font-medium">Big Idea:</span> {data.bigIdea}
                </p>
                <p className="mt-2 text-white/70">
                  <span className="font-medium">Passage Summary:</span> {data.passageSummary}
                </p>
                {/* Small meta row */}
                <p className="mt-2 text-xs text-white/50">
                  {[scripture && `Scripture: ${scripture}`, theme && `Theme: ${theme}`]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
              <div className="shrink-0 flex gap-2">
                <button type="button" onClick={exportPdf} className="btn">
                  Export PDF
                </button>
              </div>
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

            {/* Disclaimer (bottom of outline) */}
            <div className="text-xs text-white/50 italic">{DISCLAIMER}</div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-white/40">
          © Douglas M. Gilford — The Busy Preacher
        </footer>
      </div>
    </main>
  );
}
