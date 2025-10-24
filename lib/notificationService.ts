// lib/notificationService.ts
"use client";

export interface NotificationPreferences {
  enabled: boolean;
  browserNotifications: boolean;
  reminderTime?: string;
  reminderDays: number[];
  inactivityDays: number;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  browserNotifications: false,
  reminderTime: "09:00",
  reminderDays: [1, 2, 3, 4, 5],
  inactivityDays: 2,
};

export class NotificationService {
  private static STORAGE_KEY = "bc-notification-prefs";
  private static LAST_STUDY_KEY = "bc-last-study-date";
  private static LAST_REMINDER_KEY = "bc-last-reminder-shown";

  static getPreferences(): NotificationPreferences {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    
    try {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  static savePreferences(prefs: Partial<NotificationPreferences>): void {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  static async requestBrowserPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  static updateLastStudyDate(): void {
    localStorage.setItem(this.LAST_STUDY_KEY, new Date().toISOString());
  }

  static getLastStudyDate(): Date | null {
    const stored = localStorage.getItem(this.LAST_STUDY_KEY);
    if (!stored) return null;
    return new Date(stored);
  }

  static getDaysSinceLastStudy(): number {
    const lastStudy = this.getLastStudyDate();
    if (!lastStudy) return 0; // Return 0 for new users instead of 999
    
    const now = new Date();
    const diffMs = now.getTime() - lastStudy.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  static shouldShowReminder(): boolean {
    const prefs = this.getPreferences();
    if (!prefs.enabled) return false;

    const lastStudy = this.getLastStudyDate();
    
    // Don't show reminder for brand new users (no study history)
    if (!lastStudy) return false;

    const daysSince = this.getDaysSinceLastStudy();
    if (daysSince < prefs.inactivityDays) return false;

    const lastReminder = localStorage.getItem(this.LAST_REMINDER_KEY);
    if (lastReminder) {
      const lastDate = new Date(lastReminder).toDateString();
      const today = new Date().toDateString();
      if (lastDate === today) return false;
    }

    return true;
  }

  static markReminderShown(): void {
    localStorage.setItem(this.LAST_REMINDER_KEY, new Date().toISOString());
  }

  static sendBrowserNotification(title: string, body: string): void {
    const prefs = this.getPreferences();
    
    if (!prefs.browserNotifications) {
      console.log("Browser notifications are disabled");
      return;
    }
    
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }
    
    if (Notification.permission !== "granted") {
      console.log("Notification permission not granted");
      return;
    }

    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: "bible-study-reminder",
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }
}