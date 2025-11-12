/**
 * Unified storage wrapper for web and native platforms
 * Uses Capacitor Preferences on native iOS, localStorage on web
 */

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const storage = {
  /**
   * Get a value from storage
   */
  async getItem(key: string): Promise<string | null> {
    if (isNative) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    return localStorage.getItem(key);
  },

  /**
   * Set a value in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    if (isNative) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },

  /**
   * Remove a value from storage
   */
  async removeItem(key: string): Promise<void> {
    if (isNative) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    if (isNative) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  },

  /**
   * Get all keys in storage
   */
  async keys(): Promise<string[]> {
    if (isNative) {
      const { keys } = await Preferences.keys();
      return keys;
    }
    return Object.keys(localStorage);
  },

  /**
   * Get a JSON value from storage
   */
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  /**
   * Set a JSON value in storage
   */
  async setJSON<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  },

  /**
   * Synchronous getItem for backward compatibility (web only)
   * @deprecated Use async getItem instead
   */
  getItemSync(key: string): string | null {
    if (isNative) {
      console.warn('getItemSync called on native platform - use async getItem instead');
      return null;
    }
    return localStorage.getItem(key);
  },

  /**
   * Synchronous setItem for backward compatibility (web only)
   * @deprecated Use async setItem instead
   */
  setItemSync(key: string, value: string): void {
    if (isNative) {
      console.warn('setItemSync called on native platform - use async setItem instead');
      return;
    }
    localStorage.setItem(key, value);
  }
};

// Export for use in components
export default storage;

// Storage key constants
export const STORAGE_KEYS = {
  USER_NAME: 'bc-user-name',
  STYLE: 'bc-style',
  SAVED_STUDIES: 'bc-saved-studies',
  NOTES: 'bc-notes',
  SUBSCRIBED: 'bc-subscribed',
  SHOW_DEVOTIONAL: 'bc-show-devotional',
  SHOW_READING_PLAN: 'bc-show-reading-plan',
  DEVOTIONAL_LAST_SHOWN: 'bc-devotional-last-shown',
  PRAYERS: 'busyChristian_prayers',
  THEME: 'theme',
  ONBOARDING_COMPLETED: 'bc-onboarding-completed',
  LAST_SYNC: 'bc-last-sync',
  READING_PLAN_PROGRESS: 'bc-reading-plan-progress',
  STUDY_STREAK: 'bc-study-streak',
  COURSES_PROGRESS: 'bc-courses-progress',
  ADMIN_PASSWORD: 'bc-admin-password'
} as const;
