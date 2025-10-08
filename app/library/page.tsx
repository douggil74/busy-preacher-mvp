"use client";

import Link from "next/link";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { useEffect, useState, useRef } from "react";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface SavedStudy {
  reference: string;
  timestamp: number;
  type?: string;
}

interface StudyNote {
  reference: string;
  note: string;
  timestamp: number;
}

export default function LibraryPage() {
  const [lightMode, setLightMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedStudies, setSavedStudies] = useState<SavedStudy[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [activeTab, setActiveTab] = useState<"studies" | "notes">("studies");
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("bc-theme");
    if (savedTheme === "dark") {
      setLightMode(false);
    } else {
      setLightMode(true);
    }
  }, []);

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

  const deleteSavedStudy = (timestamp: number) => {
    const updated = savedStudies.filter(s => s.timestamp !== timestamp);
    setSavedStudies(updated);
    localStorage.setItem("bc-saved-studies", JSON.stringify(updated));
  };

  const deleteNote = (timestamp: number) => {
    const updated = notes.filter(n => n.timestamp !== timestamp);
    setNotes(updated);
    localStorage.setItem("bc-notes", JSON.stringify(updated));
  };

  const exportAllNotes = () => {
    let text = "MY BIBLE STUDY NOTES\n";
    text += "=".repeat(50) + "\n\n";
    
    notes.forEach((note) => {
      text += `${note.reference}\n`;
      text += `Date: ${new Date(note.timestamp).toLocaleString()}\n`;
      text += "-".repeat(50) + "\n";
      text += note.note + "\n\n";
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bible_Study_Notes_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (confirm("Are you sure you want to delete ALL saved studies and notes? This cannot be undone.")) {
      localStorage.removeItem("bc-saved-studies");
      localStorage.removeItem("bc-notes");
      setSavedStudies([]);
      setNotes([]);
    }
  };

  const filteredStudies = savedStudies.filter(s => 
    s.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotes = notes.filter(n => 
    n.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.note.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="py-8">
      {/* Header */}
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
              onClick={() => {
                console.log("Toggle clicked! Current lightMode:", lightMode);
                setLightMode((v) => !v);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 focus:outline-none"
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
                  <Link href="/deep-study" role="menuitem" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:underline decoration-yellow-400 underline-offset-4">
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
          My Library
        </h1>
        <p className="text-white/70 mb-6">
          Your saved studies and personal notes
        </p>

        {/* Search and Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search studies or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-yellow-400/80 bg-transparent px-3 py-2 outline-none ring-0 placeholder:text-white/40"
          />
          {notes.length > 0 && (
            <button
              onClick={exportAllNotes}
              className="rounded-lg bg-yellow-400/20 border border-yellow-400 px-4 py-2 text-sm hover:bg-yellow-400/30 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export All Notes
            </button>
          )}
          {(savedStudies.length > 0 || notes.length > 0) && (
            <button
              onClick={clearAllData}
              className="rounded-lg bg-red-500/20 border border-red-500 px-4 py-2 text-sm hover:bg-red-500/30 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("studies")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "studies"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-white/60 hover:text-white/90"
            }`}
          >
            Saved Studies ({savedStudies.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "notes"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-white/60 hover:text-white/90"
            }`}
          >
            My Notes ({notes.length})
          </button>
        </div>

        {/* Saved Studies Tab */}
        {activeTab === "studies" && (
          <div className="space-y-3">
            {filteredStudies.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="text-white/60 mb-2">
                  {searchTerm ? "No studies match your search" : "No saved studies yet"}
                </p>
                <p className="text-white/40 text-sm">
                  Click the "Save" button on any study to bookmark it
                </p>
              </div>
            ) : (
              filteredStudies.map((study) => (
                <div
                  key={study.timestamp}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link
                        href={`/?ref=${encodeURIComponent(study.reference)}`}
                        className="text-lg font-semibold text-white/90 hover:text-yellow-400 transition-colors"
                      >
                        {study.reference}
                      </Link>
                      <p className="text-xs text-white/50 mt-1">
                        Saved on {new Date(study.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/?ref=${encodeURIComponent(study.reference)}`}
                        className="rounded-lg bg-white/10 px-3 py-1 text-sm hover:bg-white/15 transition-colors"
                      >
                        Open
                      </Link>
                      <button
                        onClick={() => deleteSavedStudy(study.timestamp)}
                        className="text-red-400 hover:text-red-300 px-2"
                        aria-label="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            {filteredNotes.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-white/60 mb-2">
                  {searchTerm ? "No notes match your search" : "No notes yet"}
                </p>
                <p className="text-white/40 text-sm">
                  Add personal notes to any passage to remember your insights
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.timestamp}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/?ref=${encodeURIComponent(note.reference)}`}
                          className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          {note.reference}
                        </Link>
                        <span className="text-xs text-white/40">
                          • {new Date(note.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white/80 leading-relaxed">{note.note}</p>
                    </div>
                    <button
                      onClick={() => deleteNote(note.timestamp)}
                      className="text-red-400 hover:text-red-300 px-2"
                      aria-label="Delete note"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}