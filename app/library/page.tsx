// app/library/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PastorNote } from '@/components/PastorNote';
import { getEmptyStateMessage } from '@/lib/personalMessages';
import { card, button, input, typography, cn } from '@/lib/ui-constants';

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface SavedStudy {
  reference: string;
  timestamp: number;
  type?: 'passage' | 'theme' | 'combined';
}

interface StudyNote {
  reference: string;
  note: string;
  timestamp: number;
}

export default function LibraryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"studies" | "notes">("studies");
  const [savedStudies, setSavedStudies] = useState<SavedStudy[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedStudiesData = localStorage.getItem("bc-saved-studies");
    if (savedStudiesData) {
      try {
        const parsed = JSON.parse(savedStudiesData);
        console.log("Loaded saved studies:", parsed);
        setSavedStudies(parsed);
      } catch (e) {
        console.error("Error loading saved studies:", e);
      }
    }

    const notesData = localStorage.getItem("bc-notes");
    if (notesData) {
      try {
        const parsed = JSON.parse(notesData);
        console.log("Loaded notes from localStorage:", parsed);
        setNotes(parsed);
      } catch (e) {
        console.error("Error loading notes:", e);
      }
    }
  }, []);

  const deleteStudy = (e: React.MouseEvent, timestamp: number) => {
    e.stopPropagation(); // Prevent card click
    if (confirm("Delete this saved study?")) {
      const updated = savedStudies.filter(s => s.timestamp !== timestamp);
      setSavedStudies(updated);
      localStorage.setItem("bc-saved-studies", JSON.stringify(updated));
    }
  };

  const openStudy = (e: React.MouseEvent, reference: string) => {
    e.stopPropagation(); // Prevent any parent clicks
    router.push(`/?passage=${encodeURIComponent(reference)}`);
  };

  const deleteNote = (e: React.MouseEvent, timestamp: number) => {
    e.stopPropagation(); // Prevent card click
    if (confirm("Delete this note?")) {
      const updated = notes.filter(n => n.timestamp !== timestamp);
      setNotes(updated);
      localStorage.setItem("bc-notes", JSON.stringify(updated));
    }
  };

  const toggleNote = (timestamp: number) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(timestamp)) {
      newExpanded.delete(timestamp);
    } else {
      newExpanded.add(timestamp);
    }
    setExpandedNotes(newExpanded);
  };

  const copyToClipboard = (text: string, timestamp: number) => {
    navigator.clipboard.writeText(text);
    setCopied(timestamp);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportNotes = () => {
    const text = notes.map(note => 
      `${note.reference}\n${new Date(note.timestamp).toLocaleString()}\n${'='.repeat(50)}\n${note.note}\n\n`
    ).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bible-notes-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const printNotes = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const content = notes.map(note => 
      `<div style="margin-bottom: 30px; page-break-inside: avoid;">
        <h2 style="margin: 0; color: #1e293b;">${note.reference}</h2>
        <p style="margin: 5px 0; color: #64748b; font-size: 14px;">${new Date(note.timestamp).toLocaleString()}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 10px 0;">
        <p style="white-space: pre-wrap; line-height: 1.6;">${note.note}</p>
      </div>`
    ).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>My Bible Study Notes</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { text-align: center; margin-bottom: 40px; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>My Bible Study Notes</h1>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const clearAll = () => {
    if (activeTab === "studies") {
      if (confirm("Delete all saved studies? This cannot be undone.")) {
        setSavedStudies([]);
        localStorage.removeItem("bc-saved-studies");
      }
    } else {
      if (confirm("Delete all notes? This cannot be undone.")) {
        setNotes([]);
        localStorage.removeItem("bc-notes");
      }
    }
  };

  const filteredStudies = savedStudies.filter(study =>
    study.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotes = notes.filter(note =>
    note.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.note.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/60 hover:text-yellow-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      <h1 className={cn(playfair.className, typography.h1, 'text-center mb-3 text-slate-900 dark:text-white')}>
        Your Library
      </h1>
      <p className={cn(typography.body, 'text-center text-slate-600 dark:text-white/70 mb-4')}>
        Everything you've been learning and discovering
      </p>
      <div className="max-w-2xl mx-auto mb-8">
        <PastorNote />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab("studies")}
          className={`px-6 py-3 font-medium transition ${
            activeTab === "studies"
              ? "text-yellow-400 border-b-2 border-yellow-400"
              : "text-slate-500 dark:text-white/60 hover:text-slate-700 dark:hover:text-white/80"
          }`}
        >
          Saved Studies ({savedStudies.length})
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`px-6 py-3 font-medium transition ${
            activeTab === "notes"
              ? "text-yellow-400 border-b-2 border-yellow-400"
              : "text-slate-500 dark:text-white/60 hover:text-slate-700 dark:hover:text-white/80"
          }`}
        >
          My Notes ({notes.length})
        </button>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder={activeTab === "studies" ? "Search studies..." : "Search notes..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
        />
        {activeTab === "notes" && notes.length > 0 && (
          <>
            <button
              onClick={printNotes}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white/90 hover:bg-slate-200 dark:hover:bg-white/10 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print All
            </button>
            <button
              onClick={exportNotes}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white/90 hover:bg-slate-200 dark:hover:bg-white/10 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export All
            </button>
          </>
        )}
        {((activeTab === "studies" && savedStudies.length > 0) || (activeTab === "notes" && notes.length > 0)) && (
          <button
            onClick={clearAll}
            className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === "studies" && (
        <div>
          {filteredStudies.length === 0 ? (
            <div className="card text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p className="text-slate-600 dark:text-white/60 mb-2">
                {searchQuery ? "No studies match your search" : "Nothing saved yet? That's okay!"}
              </p>
              <p className="text-slate-500 dark:text-white/40 text-sm">
                {!searchQuery && getEmptyStateMessage('library')}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredStudies.map((study) => (
                <div
                  key={study.timestamp}
                  className="card hover:bg-slate-200 dark:hover:bg-white/[0.07] transition cursor-pointer"
                  onClick={(e) => {
                    // Only open if not clicking delete button
                    if (!(e.target as HTMLElement).closest('button[aria-label="Delete study"]')) {
                      openStudy(e, study.reference);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white/90 mb-1 truncate">
                        {study.reference}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-white/50 mb-3">
                        {new Date(study.timestamp).toLocaleDateString()} • {study.type || 'study'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm text-yellow-400 group-hover:text-yellow-300 transition">
                        Open Study
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                    <button
                      onClick={(e) => deleteStudy(e, study.timestamp)}
                      className="text-red-400 hover:text-red-300 text-xl leading-none transition"
                      aria-label="Delete study"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div>
          {filteredNotes.length === 0 ? (
            <div className="card text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-slate-600 dark:text-white/60 mb-2">
                {searchQuery ? "No notes match your search" : "No notes yet? No worries!"}
              </p>
              <p className="text-slate-500 dark:text-white/40 text-sm">
                {!searchQuery && getEmptyStateMessage('notes')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map((note) => {
                const isExpanded = expandedNotes.has(note.timestamp);
                const notePreview = note.note.length > 150 ? note.note.slice(0, 150) + "..." : note.note;

                return (
                  <div
                    key={note.timestamp}
                    className="card cursor-pointer hover:bg-slate-200 dark:hover:bg-white/[0.07] transition"
                    onClick={() => toggleNote(note.timestamp)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white/90 mb-1">
                          {note.reference}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-white/40">
                          {new Date(note.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(note.note, note.timestamp);
                          }}
                          className="text-slate-600 dark:text-white/60 hover:text-yellow-400 transition"
                          aria-label="Copy note"
                        >
                          {copied === note.timestamp ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={(e) => deleteNote(e, note.timestamp)}
                          className="text-red-400 hover:text-red-300 text-xl leading-none transition"
                          aria-label="Delete note"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-white/70 whitespace-pre-wrap">
                      {isExpanded ? note.note : notePreview}
                    </p>
                    {note.note.length > 150 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNote(note.timestamp);
                        }}
                        className="mt-2 text-sm text-yellow-400 hover:text-yellow-300"
                      >
                        {isExpanded ? "Show Less" : "Read Full Note"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}