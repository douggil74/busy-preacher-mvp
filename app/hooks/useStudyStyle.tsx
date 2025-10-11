// app/hooks/useStudyStyle.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type StudyStyle = "Casual Devotional" | "Bible Student" | "Pastor / Teacher";

const STORAGE_KEY = "busy:study-style";
const DEFAULT_STYLE: StudyStyle = "Bible Student";

type Ctx = {
  style: StudyStyle;
  setStyle: (s: StudyStyle) => void;   // updates state only
  saveStyle: (s: StudyStyle) => void;  // updates state + localStorage (preferred)
  hydrated: boolean;                   // UI can wait until client has loaded persisted value
};

const StudyStyleContext = createContext<Ctx | null>(null);

export function StudyStyleProvider({ children }: { children: React.ReactNode }) {
  const [style, setStyleState] = useState<StudyStyle>(DEFAULT_STYLE);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on client
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StudyStyle;
        if (parsed === "Casual Devotional" || parsed === "Bible Student" || parsed === "Pastor / Teacher") {
          setStyleState(parsed);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as StudyStyle;
          setStyleState(parsed);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setStyle = (s: StudyStyle) => setStyleState(s);

  const saveStyle = (s: StudyStyle) => {
    setStyleState(s); // update header/page immediately
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {}
  };

  const value = useMemo<Ctx>(() => ({ style, setStyle, saveStyle, hydrated }), [style, hydrated]);

  return (
    <StudyStyleContext.Provider value={value}>{children}</StudyStyleContext.Provider>
  );
}

export function useStudyStyle(): Ctx {
  const ctx = useContext(StudyStyleContext);
  if (!ctx) {
    throw new Error("useStudyStyle must be used within <StudyStyleProvider>");
  }
  return ctx;
}
