// lib/progressTracker.ts
"use client";

export interface StudyAction {
  type: 
    | "outline_generated"
    | "passage_lookup"
    | "cross_ref_click"
    | "note_created"
    | "note_deleted"
    | "deep_study_visit"
    | "word_lookup"
    | "pdf_export"
    | "study_loaded"
    | "study_saved"
    | "devotional_viewed";
  reference?: string;
  theme?: string;
  details?: string;
  timestamp: number;
}

export interface UserProgress {
  totalActions: number;
  lastStudyDate: string;
  studyStreak: number;
  actions: StudyAction[];
}

class ProgressTracker {
  private STORAGE_KEY = "bc-study-actions";
  private MAX_ACTIONS = 500; // Keep last 500 actions

  // Track outline generation
  trackOutlineGeneration(reference?: string, theme?: string): void {
    this.addAction({
      type: "outline_generated",
      reference,
      theme,
      timestamp: Date.now(),
    });
    this.updateLastStudyDate();
  }

  // Track manual passage lookup
  trackPassageLookup(reference: string): void {
    this.addAction({
      type: "passage_lookup",
      reference,
      timestamp: Date.now(),
    });
  }

  // Track cross-reference clicks
  trackCrossRefClick(reference: string): void {
    this.addAction({
      type: "cross_ref_click",
      reference,
      timestamp: Date.now(),
    });
  }

  // Track note creation
  trackNoteCreated(reference: string, noteLength: number): void {
    this.addAction({
      type: "note_created",
      reference,
      details: `${noteLength} characters`,
      timestamp: Date.now(),
    });
  }

  // Track note deletion
  trackNoteDeleted(reference: string): void {
    this.addAction({
      type: "note_deleted",
      reference,
      timestamp: Date.now(),
    });
  }

  // Track deep study page visits
  trackDeepStudyVisit(reference: string): void {
    this.addAction({
      type: "deep_study_visit",
      reference,
      timestamp: Date.now(),
    });
  }

  // Track word lookups (hover/click)
  trackWordLookup(word: string, book?: string): void {
    this.addAction({
      type: "word_lookup",
      details: `${word}${book ? ` in ${book}` : ""}`,
      timestamp: Date.now(),
    });
  }

  // Track PDF exports
  trackPDFExport(reference?: string, theme?: string): void {
    this.addAction({
      type: "pdf_export",
      reference,
      theme,
      timestamp: Date.now(),
    });
  }

  // Track loading saved studies
  trackStudyLoaded(reference: string): void {
    this.addAction({
      type: "study_loaded",
      reference,
      timestamp: Date.now(),
    });
  }

  // Track saving studies
  trackStudySaved(reference: string): void {
    this.addAction({
      type: "study_saved",
      reference,
      timestamp: Date.now(),
    });
  }

  // Track devotional views
  trackDevotionalViewed(): void {
    this.addAction({
      type: "devotional_viewed",
      timestamp: Date.now(),
    });
  }

  // Add action to storage
  private addAction(action: StudyAction): void {
    if (typeof window === "undefined") return;

    const actions = this.getAllActions();
    actions.unshift(action); // Add to beginning

    // Keep only last MAX_ACTIONS
    const trimmed = actions.slice(0, this.MAX_ACTIONS);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
  }

  // Get all actions
  getAllActions(): StudyAction[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  // Get actions by type
  getActionsByType(type: StudyAction["type"]): StudyAction[] {
    return this.getAllActions().filter((a) => a.type === type);
  }

  // Get actions from last N days
  getRecentActions(days: number = 7): StudyAction[] {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.getAllActions().filter((a) => a.timestamp > cutoff);
  }

  // Get most looked up passages
  getMostStudiedPassages(limit: number = 10): { reference: string; count: number }[] {
    const actions = this.getAllActions();
    const passageCounts: Record<string, number> = {};

    actions.forEach((action) => {
      if (action.reference && 
          (action.type === "outline_generated" || 
           action.type === "passage_lookup" || 
           action.type === "cross_ref_click")) {
        passageCounts[action.reference] = (passageCounts[action.reference] || 0) + 1;
      }
    });

    return Object.entries(passageCounts)
      .map(([reference, count]) => ({ reference, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Get study statistics
  getStatistics() {
    const actions = this.getAllActions();
    const last7Days = this.getRecentActions(7);
    const last30Days = this.getRecentActions(30);

    return {
      totalActions: actions.length,
      totalOutlines: this.getActionsByType("outline_generated").length,
      totalPassageLookups: this.getActionsByType("passage_lookup").length,
      totalNotes: this.getActionsByType("note_created").length,
      totalWordLookups: this.getActionsByType("word_lookup").length,
      totalPDFExports: this.getActionsByType("pdf_export").length,
      totalDeepStudies: this.getActionsByType("deep_study_visit").length,
      actionsLast7Days: last7Days.length,
      actionsLast30Days: last30Days.length,
      mostStudiedPassages: this.getMostStudiedPassages(5),
      lastActivity: actions[0]?.timestamp || null,
    };
  }

  // Update last study date for streak tracking
  private updateLastStudyDate(): void {
    localStorage.setItem("bc-last-study-date", new Date().toISOString());
  }

  // Check for progress milestones and show notifications
  async checkAndNotifyProgress(): Promise<void> {
    const stats = this.getStatistics();

    // Check for milestones
    if (stats.totalOutlines === 1) {
      console.log("🎉 First outline generated!");
    } else if (stats.totalOutlines === 10) {
      console.log("🎉 10 outlines milestone!");
    } else if (stats.totalOutlines === 50) {
      console.log("🎉 50 outlines milestone!");
    } else if (stats.totalOutlines === 100) {
      console.log("🎉 100 outlines milestone!");
    }

    if (stats.totalNotes === 10) {
      console.log("📝 10 notes milestone!");
    }

    if (stats.totalWordLookups === 50) {
      console.log("📖 50 word lookups milestone!");
    }
  }

  // Send crisis alert (for safety features)
  sendCrisisAlert(searchText: string): void {
    console.warn("🆘 CRISIS ALERT:", searchText);
    // In production, this could send to a monitoring service
  }

  // Clear all tracking data
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export const progressTracker = new ProgressTracker();