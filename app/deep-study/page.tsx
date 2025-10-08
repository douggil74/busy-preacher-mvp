// app/deep-study/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { useEffect, useState, useMemo, useRef } from "react";

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

export default function DeepStudyPage() {
  const [lightMode, setLightMode] = useState(true);
  const [reference, setReference] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "translations" | "commentary" | "tools"
  >("translations");
  const [aiLoading, setAiLoading] = useState(false);

  const [progress, setProgress] = useState(0);
  const [statusWord, setStatusWord] = useState("");
  const statusWords = ["Fetching…", "Researching…", "Synthesizing…", "Formatting…", "Done"];

  const [savedStudies, setSavedStudies] = useState<SavedStudy[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [currentNote, setCurrentNote] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleSave = () => {
    saveCurrentStudy();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Load saved theme on mount - default to light if nothing saved
  useEffect(() => {
    const savedTheme = localStorage.getItem("bc-theme");
    if (savedTheme === "dark") {
      setLightMode(false);
      document.body.classList.remove("light-mode");
    } else {
      // Default to light mode
      setLightMode(true);
      document.body.classList.add("light-mode");
      localStorage.setItem("bc-theme", "light");
    }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

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

    const inc = setInterval(() => setProgress((p) => (p < 92 ? p + 2 : p)), 200);
    const cycle = setInterval(() => {
      i = (i + 1) % statusWords.length;
      setStatusWord(statusWords[i]);
    }, 1000);

    return () => {
      clearInterval(inc);
      clearInterval(cycle);
      setProgress(100);
      setTimeout(() => setProgress(0), 400);
      setStatusWord("");
    };
  }, [loading, aiLoading]);

  // Apply theme changes when toggle is clicked
  useEffect(() => {
    if (lightMode) {
      document.body.classList.add("light-mode");
      localStorage.setItem("bc-theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("bc-theme", "dark");
    }
  }, [lightMode]);

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
      const url = `/api/deep-study?reference=${encodeURIComponent(
        reference.trim()
      )}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch (err: any) {
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

  return (
    <main className="py-8">
      <div className="mx-auto mb-6 max-w-5xl px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors"
              aria-label="Back to Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </Link>

            <Link href="/" className="group flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="The Busy Christian"
                width={40}
                height={40}
                priority
                className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
              />
              <span className={`${playfair.className} hidden sm:inline text-xl font-semibold leading-tight text-white/90`}>
                <span className="italic text-lg align-baseline">The</span> Busy Christian
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLightMode((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 focus:outline-none transition-colors"
              aria-label={lightMode ? "Switch to dark mode" : "Switch to light mode"}
            >
              {lightMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-9 w-10 flex-col items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                <span aria-hidden="true" className={`block h-0.5 w-5 bg-white/85 transition-transform duration-200 ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`}></span>
                <span aria-hidden="true" className={`mt-1 block h-0.5 w-5 bg-white/85 transition-opacity duration-150 ${menuOpen ? "opacity-0" : "opacity-100"}`}></span>
                <span aria-hidden="true" className={`mt-1 block h-0.5 w-5 bg-white/85 transition-transform duration-200 ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`}></span>
              </button>

              {menuOpen && (
                <div role="menu" className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-md border border-white/15 bg-slate-900/95 p-1 shadow-lg backdrop-blur-md">
                  <Link href="/" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4 font-semibold">
                    🏠 Home
                  </Link>
                  <Link href="/deep-study" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4 font-semibold">
                    📖 Deep Study
                  </Link>
                  <Link href="/library" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4 font-semibold">
                    📚 My Notes
                  </Link>
                  <div className="my-1 h-px bg-white/10"></div>
                  <Link href="/about" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4">
                    About
                  </Link>
                  <Link href="/help" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4">
                    Help
                  </Link>
                  <Link href="/contact" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4">
                    Contact
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 h-px w-full bg-white/15" />
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <h1 className={`${playfair.className} text-3xl font-bold mb-2`}>
          Deep Study
        </h1>
        <p className="text-white/70 mb-6">
          Compare translations, read commentary, and explore study tools
        </p>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm mb-6">
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
              placeholder="e.g., John 3:16, Romans 8:28-30, Psalm 23:1-6"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full rounded-lg border border-yellow-400/80 bg-transparent px-3 py-2 outline-none ring-0 placeholder:text-white/40"
            />
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
                className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15 transition-colors flex items-center gap-1"
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
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15 transition-colors"
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
          <div className="mx-auto mb-6 max-w-3xl px-1">
            <div className="relative mb-2 h-[6px] w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-yellow-400/80 transition-[width] duration-150"
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
            <div className="flex gap-4 mb-4 border-b border-white/10 pb-2">
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
                      <div
                        key={version}
                        className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`${playfair.className} text-xl font-semibold`}>
                            {version.toUpperCase()}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full border border-yellow-400/50 bg-yellow-400/10 text-yellow-400">
                              {versionData.book || "Scripture"}
                            </span>
                            <button
                              onClick={() => handleCopy(versionData.text, version)}
                              className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/15 transition-colors"
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
                        <p className="text-white/90 text-lg leading-relaxed">
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
                      <button
                        onClick={() => handleCopy(data.commentaries.ai.commentary, 'ai-commentary')}
                        className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/15 transition-colors"
                        title="Copy commentary"
                      >
                        {copied === 'ai-commentary' ? "✓" : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>

                  {aiLoading ? (
                    <div className="flex items-center gap-3 py-8">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-400 border-t-transparent"></div>
                      <p className="text-white/70">Generating AI commentary...</p>
                    </div>
                  ) : data?.commentaries?.ai ? (
                    <p className="text-white/90 leading-relaxed whitespace-pre-line">
                      {data.commentaries.ai.commentary}
                    </p>
                  ) : (
                    <p className="text-white/60 py-4">No AI commentary available.</p>
                  )}
                </div>

                {data?.commentaries?.adamClarke && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className={`${playfair.className} text-xl font-semibold mb-1 text-white/90`}>
                          Traditional Commentary
                        </h3>
                        <p className="text-white/60 text-xs">
                          {data.commentaries.adamClarke.commentarySource}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(data.commentaries.adamClarke.commentary, 'clarke')}
                        className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/15 transition-colors"
                        title="Copy commentary"
                      >
                        {copied === 'clarke' ? "✓" : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-white/90 leading-relaxed whitespace-pre-line">
                      {data.commentaries.adamClarke.commentary}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "tools" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
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
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
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
                        className="flex-1 rounded-lg border border-yellow-400/80 bg-transparent px-3 py-2 outline-none ring-0 placeholder:text-white/40 min-h-[80px]"
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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
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
              <li>• American Standard Version (ASV)</li>
              <li>• World English Bible (WEB)</li>
              <li>• New International Version (NIV)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold text-white/90 mb-2">Commentary</h3>
            <p className="text-white/60">
              Adam Clarke Commentary plus AI-powered insights using GPT-4 for modern context
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold text-white/90 mb-2">Study Tools</h3>
            <p className="text-white/60">
              Links to BibleHub, Blue Letter Bible, and StudyLight for comprehensive research
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}