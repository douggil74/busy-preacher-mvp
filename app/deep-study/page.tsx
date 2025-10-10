// app/deep-study/page.tsx
"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";



const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface SavedStudy {
  reference: string;
  timestamp: number;
}

interface StudyNote {
  reference: string;
  note: string;
  timestamp: number;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "2.1";

export default function DeepStudyPage() {
  const mdComponents = {
    p: ({ children }: any) => (
      <p className="text-white/90 leading-relaxed mb-3">{children}</p>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic text-white/90">{children}</em>,
    ul: ({ children }: any) => (
      <ul className="list-disc list-outside ml-5 space-y-1 text-white/90 mb-3">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-outside ml-5 space-y-1 text-white/90 mb-3">
        {children}
      </ol>
    ),
    li: ({ children }: any) => <li className="marker:text-white/60">{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-white/20 pl-4 text-white/80 italic mb-3">
        {children}
      </blockquote>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-white/90 font-semibold text-lg mt-4 mb-2">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-white/80 font-semibold mt-3 mb-2">{children}</h4>
    ),
    a: ({ href, children }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-yellow-400 hover:text-yellow-300 underline decoration-yellow-400/40 underline-offset-2"
      >
        {children}
      </a>
    ),
    br: () => <br />,
  };
  const [reference, setReference] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"translations" | "commentary" | "tools">("translations");
  const [aiLoading, setAiLoading] = useState(false);

  const [progress, setProgress] = useState(0);
  const [statusWord, setStatusWord] = useState("");
  const statusWords = ["Fetching…", "Researching…", "Synthesizing…", "Formatting…", "Almost there…", "Done!"];

  const [savedStudies, setSavedStudies] = useState<SavedStudy[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [currentNote, setCurrentNote] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    saveCurrentStudy();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  useEffect(() => {
    const saved = localStorage.getItem("bc-saved-studies");
    if (saved) {
      try {
        setSavedStudies(JSON.parse(saved));
      } catch (e) {
        setSavedStudies([]);
      }
    }

    const savedNotes = localStorage.getItem("bc-notes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        setNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!(loading || aiLoading)) {
      setProgress(0);
      setStatusWord("");
      return;
    }

    let i = 0;
    setProgress(8);
    setStatusWord(statusWords[0]);

    // Slower progress bar
    const inc = setInterval(() => setProgress((p) => (p < 95 ? p + 1 : p)), 300);
    
    // Slower word cycling - 2.5 seconds per word instead of 1 second
    const cycle = setInterval(() => {
      i = i + 1;
      if (i < statusWords.length) {
        setStatusWord(statusWords[i]);
      }
    }, 2500);

    return () => {
      clearInterval(inc);
      clearInterval(cycle);
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        setStatusWord("");
      }, 400);
    };
  }, [loading, aiLoading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const passageParam = params.get("passage");
    if (passageParam) {
      setReference(passageParam);
      setTimeout(() => {
        const btn = document.getElementById("fetch-btn");
        if (btn) btn.click();
      }, 300);
    }
  }, []);

  const saveCurrentStudy = () => {
    const study: SavedStudy = {
      reference: reference.trim(),
      timestamp: Date.now(),
    };
    
    const updated = [study, ...savedStudies.filter(s => s.reference !== study.reference)].slice(0, 20);
    setSavedStudies(updated);
    localStorage.setItem("bc-saved-studies", JSON.stringify(updated));
  };

  const loadSavedStudy = (study: SavedStudy) => {
    setReference(study.reference);
    setShowHistory(false);
    setTimeout(() => {
      const btn = document.getElementById("fetch-btn");
      if (btn) btn.click();
    }, 100);
  };

  const deleteSavedStudy = (timestamp: number) => {
    const updated = savedStudies.filter(s => s.timestamp !== timestamp);
    setSavedStudies(updated);
    localStorage.setItem("bc-saved-studies", JSON.stringify(updated));
  };

  const saveNote = () => {
    if (!currentNote.trim()) return;
    
    const note: StudyNote = {
      reference: reference.trim() || "General Note",
      note: currentNote.trim(),
      timestamp: Date.now()
    };
    
    const updated = [note, ...notes].slice(0, 100);
    setNotes(updated);
    localStorage.setItem("bc-notes", JSON.stringify(updated));
    setCurrentNote("");
  };

  const deleteNote = (timestamp: number) => {
    const updated = notes.filter(n => n.timestamp !== timestamp);
    setNotes(updated);
    localStorage.setItem("bc-notes", JSON.stringify(updated));
  };

  const currentRefNotes = useMemo(() => {
    const ref = reference.trim();
    return notes.filter(n => n.reference === ref);
  }, [notes, reference]);

  const fetchBibleData = async () => {
    if (!reference.trim()) {
      setError("Please enter a Bible reference");
      return;
    }

    setError(null);
    setLoading(true);
    setAiLoading(true);
    setData(null);

    try {
      const url = `/api/deep-study?reference=${encodeURIComponent(reference.trim())}`;
      console.log("Fetching deep study:", url);
      
      const response = await fetch(url);
      const result = await response.json();

      console.log("Deep study result:", result);

      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch (err: any) {
      console.error("Deep study error:", err);
      setError(err.message || "Failed to fetch Bible data. Please try again.");
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchBibleData();
    }
  };

  const quickRefs = [
    "John 3:16",
    "Psalm 23:1-6",
    "Romans 8:28-30",
    "Philippians 4:13",
    "1 Corinthians 13:4-8",
  ];

  const referencesToShow = savedStudies.length > 0 
    ? savedStudies.slice(0, 5).map(s => s.reference)
    : quickRefs;

  const handleQuickRef = (ref: string) => {
    setReference(ref);
    setTimeout(() => {
      const btn = document.getElementById("fetch-btn");
      if (btn) btn.click();
    }, 100);
  };

  const handleCopy = (text: string, id: string) => {
    copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveCommentaryAsNote = (commentary: string, type: string) => {
    const note = {
      reference: reference.trim(),
      note: `${type} Commentary:\n\n${commentary}`,
      timestamp: Date.now()
    };
    
    const existingNotes = localStorage.getItem("bc-notes");
    const notes = existingNotes ? JSON.parse(existingNotes) : [];
    notes.unshift(note);
    localStorage.setItem("bc-notes", JSON.stringify(notes));
    
    alert(`${type} commentary saved to your notes!`);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-3 text-white/95 text-center`}>
        Deep Study
      </h1>
      <p className="text-white/70 mb-8 text-center">
        Compare translations, read commentary, and explore study tools
      </p>

      <section className="card mb-6">
        {savedStudies.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="mb-4 flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showHistory ? "Hide" : "Show"} Recent Studies ({savedStudies.length})
          </button>
        )}

        {showHistory && (
          <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedStudies.map((study) => (
                <div key={study.timestamp} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-white/5">
                  <button
                    onClick={() => loadSavedStudy(study)}
                    className="flex-1 text-left text-sm text-white/80 hover:text-white truncate"
                  >
                    <span className="text-xs text-white/50 mr-2">
                      {new Date(study.timestamp).toLocaleDateString()}
                    </span>
                    {study.reference}
                  </button>
                  <button
                    onClick={() => deleteSavedStudy(study.timestamp)}
                    className="text-red-400 hover:text-red-300 text-xs"
                    aria-label="Delete"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="reference" className="mb-2 block text-sm text-white/80">
            Enter a Bible Reference
          </label>
          <input
            id="reference"
            type="text"
            placeholder="e.g., John 3:16, Psalms 51, Romans 8:28-30"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            onKeyDown={handleKeyPress}
            className="input"
          />
          <p className="text-xs text-white/50 mt-1">
            💡 Supports single verses (John 3:16), verse ranges (John 3:16-18), or entire chapters (Psalms 51)
          </p>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/60">
              {savedStudies.length > 0 ? "Your Saved Passages:" : "Quick References:"}
            </p>
            {savedStudies.length > 0 && (
              <Link 
                href="/library#studies" 
                className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                View All →
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {referencesToShow.map((ref) => (
              <button
                key={ref}
                onClick={() => handleQuickRef(ref)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm hover:bg-white/10 transition-colors"
              >
                {ref}
              </button>
            ))}
            {savedStudies.length === 0 && (
              <p className="text-xs text-white/40 mt-1 w-full">
                💡 Tip: Save passages to see your own quick links here!
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            id="fetch-btn"
            onClick={() => fetchBibleData()}
            disabled={loading || !reference.trim()}
            className="rounded-lg bg-yellow-400/20 border border-yellow-400 px-6 py-2 text-sm hover:bg-yellow-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Loading…" : "Study"}
          </button>
          {reference.trim() && (
            <button
              onClick={handleSave}
              className="btn flex items-center gap-1"
              title="Save this study to your library"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {saveSuccess ? "Saved! ✓" : "Save to Library"}
            </button>
          )}
          <button
            onClick={() => {
              setReference("");
              setData(null);
              setError(null);
            }}
            className="btn"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}
      </section>

      {(loading || aiLoading) && (
        <div className="mx-auto mb-6">
          <div className="statusbar">
            <div
              className="statusbar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="h-4 text-center text-xs text-white/60">
            {progress > 0 ? statusWord : " "}
          </div>
        </div>
      )}

      {data && (
        <>
          {data.parsed && data.isChapter && (
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-white/90">
                {data.reference}
                <span className="text-white/60 text-lg ml-2">(Entire Chapter)</span>
              </h2>
            </div>
          )}

          <div className="flex gap-4 mb-4 border-b border-white/10 pb-2 max-w-3xl mx-auto">
            <button
              onClick={() => setActiveTab("translations")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "translations"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-white/60 hover:text-white/90"
              }`}
            >
              Translations
            </button>
            <button
              onClick={() => setActiveTab("commentary")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "commentary"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-white/60 hover:text-white/90"
              }`}
            >
              Commentary
            </button>
            <button
              onClick={() => setActiveTab("tools")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "tools"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-white/60 hover:text-white/90"
              }`}
            >
              Study Tools
            </button>
          </div>

          {activeTab === "translations" && (
            <div className="space-y-4">
              {Object.entries(data.translations || {}).map(
                ([version, versionData]: [string, any]) =>
                  !versionData.error &&
                  versionData.text && (
                    <div key={version} className="card">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`${playfair.className} text-xl font-semibold`}>
                          {version.toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="badge">
                            {versionData.book || "Scripture"}
                          </span>
                          <button
                            onClick={() => handleCopy(versionData.text, version)}
                            className="btn text-xs px-2 py-1"
                            title="Copy text"
                          >
                            {copied === version ? "✓" : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-white/90 text-lg leading-relaxed whitespace-pre-wrap">
                        {versionData.text}
                      </p>
                    </div>
                  )
              )}
            </div>
          )}

          {activeTab === "commentary" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 to-amber-500/10 p-6 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-400/20 border border-yellow-400/50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className={`${playfair.className} text-xl font-semibold mb-1 text-white/90`}>
                      AI Commentary
                    </h3>
                    <p className="text-yellow-400/80 text-xs">
                      Generated by GPT-4 • Context-aware insights
                    </p>
                  </div>
                  {data?.commentaries?.ai && (
                    <>
                      <button
                        onClick={() => handleCopy(data.commentaries.ai.commentary, 'ai-commentary')}
                        className="btn text-xs px-2 py-1"
                        title="Copy commentary"
                      >
                        {copied === 'ai-commentary' ? "✓" : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => saveCommentaryAsNote(data.commentaries.ai.commentary, "AI")}
                        className="rounded-lg bg-yellow-400/20 border border-yellow-400 px-3 py-1.5 text-xs hover:bg-yellow-400/30 transition-colors flex items-center gap-1"
                        title="Save to notes"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Save
                      </button>
                    </>
                  )}
                </div>

                {aiLoading ? (
  <div className="flex items-center gap-3 py-8">
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-400 border-t-transparent"></div>
    <p className="text-white/70">Generating AI commentary...</p>
  </div>
) : data?.commentaries?.ai ? (
<div className="prose prose-invert max-w-none">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={mdComponents as any}
  >
    {data.commentaries.ai.commentary || ""}
  </ReactMarkdown>
</div>
) : (
  <p className="text-white/60 py-4">No AI commentary available.</p>
)}
              </div>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-4">
              <div className="card">
                <h3 className={`${playfair.className} text-2xl font-semibold mb-2`}>
                  External Study Resources
                </h3>
                <p className="text-white/70 text-sm mb-6">
                  Explore {data.reference} with these trusted Bible study tools
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <a
                    href={data.studyLinks?.bibleHub}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all hover:border-yellow-400/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white/90 group-hover:text-yellow-400 transition-colors">
                          BibleHub
                        </h4>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm mb-3">
                      Verse-by-verse commentaries, cross-references, original languages, and interlinear tools
                    </p>
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                      <span>Open Study Tools</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>

                  <a
                    href={data.studyLinks?.blueLetterBible}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all hover:border-yellow-400/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white/90 group-hover:text-yellow-400 transition-colors">
                          Blue Letter Bible
                        </h4>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm mb-3">
                      In-depth Greek & Hebrew word studies, lexicons, and original language tools
                    </p>
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                      <span>Explore Word Studies</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>

                  <a
                    href={data.studyLinks?.studyLight}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all hover:border-yellow-400/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white/90 group-hover:text-yellow-400 transition-colors">
                          StudyLight
                        </h4>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm mb-3">
                      Comprehensive Bible dictionaries, encyclopedias, and reference materials
                    </p>
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                      <span>Access Resources</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
                  <p className="text-yellow-400 text-sm">
                    💡 <strong>Tip:</strong> These resources open in new tabs so you can easily compare different study tools
                  </p>
                </div>
              </div>
            </div>
          )}

          {reference && (
            <div className="card mt-6">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {showNotes ? "Hide" : "Add"} Notes {currentRefNotes.length > 0 && `(${currentRefNotes.length})`}
              </button>

              {showNotes && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      placeholder="Add your personal notes here..."
                      className="input min-h-[80px]"
                    />
                    <button
                      onClick={saveNote}
                      disabled={!currentNote.trim()}
                      className="rounded-lg bg-yellow-400/20 border border-yellow-400 px-4 py-2 text-sm hover:bg-yellow-400/30 disabled:opacity-50 transition-colors h-fit"
                    >
                      Save
                    </button>
                  </div>

                  {currentRefNotes.length > 0 && (
                    <div className="space-y-2">
                      {currentRefNotes.map((note) => (
                        <div key={note.timestamp} className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-white/80 flex-1">{note.note}</p>
                            <button
                              onClick={() => deleteNote(note.timestamp)}
                              className="text-red-400 hover:text-red-300 text-xs"
                              aria-label="Delete note"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-xs text-white/40 mt-1">
                            {new Date(note.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!data && !loading && !error && (
        <div className="card p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 mx-auto mb-4 text-white/20">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <p className="text-white/60 mb-2">Enter a verse reference to begin your study</p>
          <p className="text-white/40 text-sm">
            Compare translations • Read commentary • Access study tools
          </p>
        </div>
      )}

      <div className="mt-12 grid md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold text-white/90 mb-2">Translations</h3>
          <ul className="text-white/60 space-y-1">
            <li>• King James Version (KJV)</li>
            <li>• World English Bible (WEB)</li>
            <li>• American Standard Version (ASV)</li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold text-white/90 mb-2">Commentary</h3>
          <p className="text-white/60">
            AI-powered insights using GPT-4 for historical context and modern application
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold text-white/90 mb-2">Study Tools</h3>
          <p className="text-white/60">
            Links to BibleHub, Blue Letter Bible, and StudyLight for comprehensive research
          </p>
        </div>
      </div>

      <footer className="mt-12 text-center text-xs text-white/40">
        © Douglas M. Gilford – The Busy Christian • v{APP_VERSION}
      </footer>
    </main>
  );
}