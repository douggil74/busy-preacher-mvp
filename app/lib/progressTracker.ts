// app/lib/progressTracker.ts
"use client";

export const progressTracker = {
  markProgress: (id: string) => {
    try {
      localStorage.setItem(`progress_${id}`, new Date().toISOString());
    } catch {}
  },
  getProgress: (id: string) => {
    try {
      return localStorage.getItem(`progress_${id}`);
    } catch {
      return null;
    }
  },
};
