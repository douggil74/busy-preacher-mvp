// utils/verseCache.ts
import { useState, useEffect } from 'react';

/**
 * ESV Verse Cache Utility
 * 
 * BEFORE:
 * - Every page load = new API call to ESV API
 * - Slow, wastes API quota, costs money
 * - User sees John 3:16 100 times = 100 API calls
 * 
 * AFTER:
 * - Cache verses in localStorage for 24 hours
 * - First load = API call, subsequent = instant from cache
 * - Same verse = 1 API call per day maximum
 * - Saves ~90% of API calls
 */

interface CachedVerse {
  passage: string;
  translation: string;
  text: string;
  timestamp: number;
}

const CACHE_KEY_PREFIX = 'verse_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class VerseCache {
  /**
   * Generate a unique cache key for a passage
   */
  private static getCacheKey(passage: string, translation: string): string {
    const normalized = passage.toLowerCase().trim().replace(/\s+/g, '');
    return `${CACHE_KEY_PREFIX}${translation}_${normalized}`;
  }

  /**
   * Check if cached verse is still valid (not expired)
   */
  private static isValid(cachedVerse: CachedVerse): boolean {
    const now = Date.now();
    const age = now - cachedVerse.timestamp;
    return age < CACHE_DURATION;
  }

  /**
   * Get verse from cache if available and valid
   */
  static get(passage: string, translation: string = 'ESV'): string | null {
    try {
      const key = this.getCacheKey(passage, translation);
      const cached = localStorage.getItem(key);
      
      if (!cached) return null;

      const cachedVerse: CachedVerse = JSON.parse(cached);
      
      if (!this.isValid(cachedVerse)) {
        // Expired, remove from cache
        this.remove(passage, translation);
        return null;
      }

      console.log(`[VerseCache] Cache HIT for ${passage} (${translation})`);
      return cachedVerse.text;
    } catch (error) {
      console.error('[VerseCache] Error reading cache:', error);
      return null;
    }
  }

  /**
   * Store verse in cache
   */
  static set(passage: string, translation: string, text: string): void {
    try {
      const key = this.getCacheKey(passage, translation);
      const cachedVerse: CachedVerse = {
        passage,
        translation,
        text,
        timestamp: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify(cachedVerse));
      console.log(`[VerseCache] Cached ${passage} (${translation})`);
    } catch (error) {
      console.error('[VerseCache] Error writing cache:', error);
      // localStorage might be full, try to clean old entries
      this.cleanup();
    }
  }

  /**
   * Remove specific verse from cache
   */
  static remove(passage: string, translation: string): void {
    try {
      const key = this.getCacheKey(passage, translation);
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[VerseCache] Error removing cache:', error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  static cleanup(): void {
    try {
      const keys = Object.keys(localStorage);
      let removedCount = 0;

      for (const key of keys) {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          const cached = localStorage.getItem(key);
          if (!cached) continue;

          try {
            const cachedVerse: CachedVerse = JSON.parse(cached);
            if (!this.isValid(cachedVerse)) {
              localStorage.removeItem(key);
              removedCount++;
            }
          } catch {
            // Invalid JSON, remove it
            localStorage.removeItem(key);
            removedCount++;
          }
        }
      }

      if (removedCount > 0) {
        console.log(`[VerseCache] Cleaned up ${removedCount} expired entries`);
      }
    } catch (error) {
      console.error('[VerseCache] Error during cleanup:', error);
    }
  }

  /**
   * Clear all verse cache
   */
  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
      console.log('[VerseCache] All cache cleared');
    } catch (error) {
      console.error('[VerseCache] Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): { total: number; valid: number; expired: number } {
    let total = 0;
    let valid = 0;
    let expired = 0;

    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          total++;
          const cached = localStorage.getItem(key);
          if (cached) {
            try {
              const cachedVerse: CachedVerse = JSON.parse(cached);
              if (this.isValid(cachedVerse)) {
                valid++;
              } else {
                expired++;
              }
            } catch {
              expired++;
            }
          }
        }
      }
    } catch (error) {
      console.error('[VerseCache] Error getting stats:', error);
    }

    return { total, valid, expired };
  }
}

/**
 * React Hook for using verse cache with API calls
 */
export function useCachedVerse(passage: string, translation: string = 'ESV') {
  const [verseText, setVerseText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!passage) return;

    const fetchVerse = async () => {
      // Try cache first
      const cached = VerseCache.get(passage, translation);
      if (cached) {
        setVerseText(cached);
        return;
      }

      // Not in cache, fetch from API
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/verse?passage=${encodeURIComponent(passage)}&translation=${translation}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch verse');
        }

        const data = await response.json();
        const text = data.text || data.passages?.[0] || '';

        // Cache the result
        VerseCache.set(passage, translation, text);
        setVerseText(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('[useCachedVerse] Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerse();
  }, [passage, translation]);

  return { verseText, isLoading, error };
}

// USAGE EXAMPLES:

// 1. Direct cache usage:
// const cachedText = VerseCache.get('John 3:16', 'ESV');
// if (cachedText) {
//   console.log('From cache:', cachedText);
// } else {
//   const freshText = await fetchFromAPI('John 3:16');
//   VerseCache.set('John 3:16', 'ESV', freshText);
// }

// 2. Using the React hook:
// function VerseDisplay({ passage }: { passage: string }) {
//   const { verseText, isLoading, error } = useCachedVerse(passage, 'ESV');
//
//   if (isLoading) return <LoadingSpinner />;
//   if (error) return <ErrorMessage>{error}</ErrorMessage>;
//   return <p>{verseText}</p>;
// }

// 3. Cleanup old entries (run on app startup):
// useEffect(() => {
//   VerseCache.cleanup();
// }, []);

// 4. Cache statistics (for debugging):
// const stats = VerseCache.getStats();
// console.log(`Cache: ${stats.valid} valid, ${stats.expired} expired`);