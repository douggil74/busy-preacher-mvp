// app/utils/safeStorage.ts
"use client";

export const safeStorage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      console.warn("SafeStorage: write blocked", key);
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn("SafeStorage: remove blocked", key);
    }
  },
};
