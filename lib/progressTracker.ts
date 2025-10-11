// lib/progressTracker.ts
"use client";

interface ProgressMilestone {
  level: number;
  name: string;
  requiredStudies: number;
  description: string;
}

const MILESTONES: ProgressMilestone[] = [
  { level: 1, name: "First Steps", requiredStudies: 1, description: "Completed first study" },
  { level: 2, name: "Getting Started", requiredStudies: 5, description: "Completed 5 studies" },
  { level: 3, name: "Building Momentum", requiredStudies: 10, description: "Completed 10 studies" },
  { level: 4, name: "Devoted Seeker", requiredStudies: 25, description: "Completed 25 studies" },
  { level: 5, name: "Faithful Student", requiredStudies: 50, description: "Completed 50 studies" },
  { level: 6, name: "Scripture Scholar", requiredStudies: 100, description: "Completed 100 studies" },
  { level: 7, name: "Master Teacher", requiredStudies: 250, description: "Completed 250 studies" },
];

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

class ProgressTracker {
  async checkAndNotifyProgress() {
    if (typeof window === 'undefined') return;
    
    const studies = this.getStudyHistory();
    const totalStudies = studies.length;
    
    if (totalStudies === 0) return;

    const anonymousId = this.getOrCreateAnonymousId();
    const lastNotifiedMilestones = this.getNotifiedMilestones();

    for (const milestone of MILESTONES) {
      const key = `level-${milestone.level}`;
      if (totalStudies >= milestone.requiredStudies && !lastNotifiedMilestones.has(key)) {
        await this.sendProgressNotification({
          type: "milestone",
          anonymousId,
          milestone: milestone.name,
          level: milestone.level,
          description: milestone.description,
          totalStudies,
        });
        this.saveNotifiedMilestone(key, lastNotifiedMilestones);
      }
    }

    const currentStreak = this.calculateStreak(studies);
    for (const streakDay of STREAK_MILESTONES) {
      const key = `streak-${streakDay}`;
      if (currentStreak >= streakDay && !lastNotifiedMilestones.has(key)) {
        await this.sendProgressNotification({
          type: "streak",
          anonymousId,
          streakDays: streakDay,
          description: `Maintained ${streakDay}-day study streak`,
          totalStudies,
        });
        this.saveNotifiedMilestone(key, lastNotifiedMilestones);
      }
    }

    const uniqueThemes = this.countUniqueThemes(studies);
    const themeKey = `themes-${uniqueThemes}`;
    if (uniqueThemes >= 5 && !lastNotifiedMilestones.has(themeKey)) {
      await this.sendProgressNotification({
        type: "exploration",
        anonymousId,
        uniqueThemes,
        description: `Explored ${uniqueThemes} different biblical themes`,
        totalStudies,
      });
      this.saveNotifiedMilestone(themeKey, lastNotifiedMilestones);
    }

    const deepDives = this.findDeepDives(studies);
    for (const [passage, count] of Object.entries(deepDives)) {
      const key = `deep-dive-${passage}`;
      if (count >= 5 && !lastNotifiedMilestones.has(key)) {
        await this.sendProgressNotification({
          type: "deep-dive",
          anonymousId,
          passage,
          studyCount: count,
          description: `Studied ${passage} ${count} times`,
          totalStudies,
        });
        this.saveNotifiedMilestone(key, lastNotifiedMilestones);
      }
    }
  }

  async sendCrisisAlert(searchText: string) {
    if (typeof window === 'undefined') return;
    
    const anonymousId = this.getOrCreateAnonymousId();
    
    // Check if we already sent a crisis alert for this user today
    const lastAlertKey = 'bc-last-crisis-alert';
    const lastAlert = localStorage.getItem(lastAlertKey);
    const now = Date.now();
    
    if (lastAlert) {
      const hoursSince = (now - parseInt(lastAlert)) / (1000 * 60 * 60);
      // Only send one alert per 24 hours per user
      if (hoursSince < 24) {
        console.log('Crisis alert already sent in last 24 hours');
        return;
      }
    }
    
    try {
      await fetch("/api/progress-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "crisis",
          anonymousId,
          searchText: searchText.substring(0, 100), // Limit length for privacy
          timestamp: new Date().toISOString(),
          appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "2.1",
        }),
      });
      
      // Mark that we sent an alert
      localStorage.setItem(lastAlertKey, now.toString());
      console.log('🆘 Crisis alert sent to developer');
    } catch (error) {
      console.error("Failed to send crisis alert:", error);
    }
  }

  private getOrCreateAnonymousId(): string {
    if (typeof window === 'undefined') return "";
    
    let id = localStorage.getItem("bc-anonymous-id");
    if (!id) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      id = `Cloaked-User-${randomNum}`;
      localStorage.setItem("bc-anonymous-id", id);
    }
    return id;
  }

  private getNotifiedMilestones(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    
    const stored = localStorage.getItem("bc-notified-milestones");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  }

  private saveNotifiedMilestone(key: string, milestones: Set<string>) {
    if (typeof window === 'undefined') return;
    
    milestones.add(key);
    localStorage.setItem(
      "bc-notified-milestones",
      JSON.stringify([...milestones])
    );
  }

  private getStudyHistory(): any[] {
    if (typeof window === 'undefined') return [];
    
    const saved = localStorage.getItem("bc-saved-studies");
    return saved ? JSON.parse(saved) : [];
  }

  private calculateStreak(studies: any[]): number {
    if (studies.length === 0) return 0;
    const sorted = [...studies].sort((a, b) => b.timestamp - a.timestamp);
    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (const entry of sorted) {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor((checkDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff <= 1) {
        currentStreak++;
        checkDate = new Date(entryDate.getTime() - 1000 * 60 * 60 * 24);
      } else {
        break;
      }
    }
    return currentStreak;
  }

  private countUniqueThemes(studies: any[]): number {
    const themes = new Set();
    const THEME_KEYWORDS = [
      "anxiety", "grief", "joy", "leadership", "marriage", "parenting",
      "forgiveness", "prayer", "suffering", "hope", "love", "faith", "wisdom"
    ];

    studies.forEach(study => {
      const ref = (study.reference || "").toLowerCase();
      THEME_KEYWORDS.forEach(theme => {
        if (ref.includes(theme)) themes.add(theme);
      });
    });

    return themes.size;
  }

  private findDeepDives(studies: any[]): Record<string, number> {
    const passageCounts: Record<string, number> = {};
    studies.forEach(study => {
      if (study.type === "passage" && study.reference) {
        const normalized = study.reference.trim().toLowerCase();
        passageCounts[normalized] = (passageCounts[normalized] || 0) + 1;
      }
    });
    return Object.fromEntries(
      Object.entries(passageCounts).filter(([_, count]) => count >= 5)
    );
  }

  private async sendProgressNotification(data: any) {
    if (typeof window === 'undefined') return;
    
    try {
      await fetch("/api/progress-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "2.1",
        }),
      });
    } catch (error) {
      console.error("Failed to send progress notification:", error);
    }
  }
}

// Export a singleton instance
let instance: ProgressTracker | null = null;

export const progressTracker = {
  checkAndNotifyProgress: () => {
    if (typeof window === 'undefined') return Promise.resolve();
    if (!instance) {
      instance = new ProgressTracker();
    }
    return instance.checkAndNotifyProgress();
  },
  sendCrisisAlert: (searchText: string) => {
    if (typeof window === 'undefined') return Promise.resolve();
    if (!instance) {
      instance = new ProgressTracker();
    }
    return instance.sendCrisisAlert(searchText);
  }
};