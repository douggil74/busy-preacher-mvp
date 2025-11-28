// app/hooks/useStudyJourney.ts
"use client";

import { useEffect, useState } from "react";

interface StudyEntry {
  passage?: string;
  theme?: string;
  timestamp: number;
  type: "passage" | "theme" | "combined";
}

interface StudyPattern {
  topThemes: { theme: string; count: number }[];
  recentTopics: string[];
  totalStudies: number;
  daysSinceLastStudy: number;
  currentStreak: number;
  lastStudyDate: number | null;
  frequentPassages: { passage: string; count: number }[];
}

interface PastoralInsight {
  type: "welcome_back" | "pattern_recognition" | "encouragement" | "check_in" | "milestone";
  message: string;
  emoji: string;
  priority: number; // Higher = more important to show
}

// Keywords that indicate specific life situations or themes
const THEME_KEYWORDS = {
  anxiety: ["anxiety", "anxious", "worry", "fear", "afraid", "philippians 4"],
  grief: ["grief", "sorrow", "loss", "comfort", "mourn", "psalm 23", "comfort", "suicide", "suicidal", "death", "despair"],
  joy: ["joy", "rejoice", "gladness", "celebrate", "happiness"],
  leadership: ["leadership", "lead", "shepherd", "elder", "pastor"],
  marriage: ["marriage", "husband", "wife", "spouse", "ephesians 5"],
  parenting: ["parent", "children", "child", "proverbs 22", "train"],
  forgiveness: ["forgive", "forgiveness", "mercy", "grace", "matthew 18"],
  prayer: ["prayer", "pray", "petition", "intercession"],
  faithfulness: ["faithful", "perseverance", "endurance", "steadfast"],
  suffering: ["suffering", "trial", "persecution", "hardship", "james 1", "pain", "hurt"],
  hope: ["hope", "promise", "future", "expectation"],
  love: ["love", "charity", "agape", "1 corinthians 13"],
  faith: ["faith", "believe", "trust", "hebrews 11"],
  wisdom: ["wisdom", "discernment", "understanding", "proverbs"],
  salvation: ["salvation", "saved", "gospel", "cross", "romans"],
};

export function useStudyJourney() {
  const [pattern, setPattern] = useState<StudyPattern | null>(null);
  const [insight, setInsight] = useState<PastoralInsight | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [insightDismissed, setInsightDismissed] = useState(false);

  useEffect(() => {
    // Check if insight was dismissed today
    const dismissedDate = localStorage.getItem("bc-insight-dismissed");
    const today = new Date().toDateString();
    if (dismissedDate === today) {
      setInsightDismissed(true);
    }
    analyzeJourney();
  }, []);

  const analyzeJourney = () => {
    // Get study history
    const historyRaw = localStorage.getItem("bc-saved-studies");
    const history: StudyEntry[] = historyRaw ? JSON.parse(historyRaw) : [];

    if (history.length === 0) {
      setPattern(null);
      return;
    }

    // Analyze patterns
    const now = Date.now();
    const lastStudy = history[0]?.timestamp || null;
    const daysSince = lastStudy ? Math.floor((now - lastStudy) / (1000 * 60 * 60 * 24)) : 999;

    // Extract themes and passages
    const allTopics = history.map(h => (h.passage || h.theme || "").toLowerCase());
    
    // Count theme frequencies
    const themeCounts: Record<string, number> = {};
    allTopics.forEach(topic => {
      Object.entries(THEME_KEYWORDS).forEach(([themeName, keywords]) => {
        if (keywords.some(kw => topic.includes(kw.toLowerCase()))) {
          themeCounts[themeName] = (themeCounts[themeName] || 0) + 1;
        }
      });
    });

    const topThemes = Object.entries(themeCounts)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Frequent passages
    const passageCounts: Record<string, number> = {};
    history.forEach(h => {
      if (h.passage) {
        const normalized = h.passage.trim().toLowerCase();
        passageCounts[normalized] = (passageCounts[normalized] || 0) + 1;
      }
    });

    const frequentPassages = Object.entries(passageCounts)
      .filter(([_, count]) => count >= 2)
      .map(([passage, count]) => ({ passage, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Calculate streak
    const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);
    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (const entry of sortedHistory) {
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

    const studyPattern: StudyPattern = {
      topThemes,
      recentTopics: allTopics.slice(0, 5),
      totalStudies: history.length,
      daysSinceLastStudy: daysSince,
      currentStreak,
      lastStudyDate: lastStudy,
      frequentPassages,
    };

    setPattern(studyPattern);

    // Generate pastoral insight
    const pastoralInsight = generateInsight(studyPattern);
    setInsight(pastoralInsight);

    // Show check-in occasionally
    const lastCheckIn = localStorage.getItem("bc-last-check-in");
    const daysSinceCheckIn = lastCheckIn 
      ? Math.floor((now - parseInt(lastCheckIn)) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (daysSinceCheckIn >= 7 && history.length >= 3) {
      setShowCheckIn(true);
    }
  };

  const generateInsight = (p: StudyPattern): PastoralInsight | null => {
    const userName = localStorage.getItem("bc-user-name") || "friend";

    // CRITICAL: Check for crisis keywords in recent studies
    const recentStudies = p.recentTopics.join(" ").toLowerCase();
    const crisisKeywords = ["suicide", "suicidal", "kill myself", "end my life", "don't want to live"];
    const hasCrisisKeyword = crisisKeywords.some(keyword => recentStudies.includes(keyword));

    if (hasCrisisKeyword) {
      return {
        type: "pattern_recognition",
        message: `${userName}, if you're in crisis, please reach out immediately. National Suicide Prevention Lifeline: 988 (call or text). You are deeply loved by God and not alone. Please talk to someone today. 💜`,
        emoji: "🆘",
        priority: 100, // Highest priority
      };
    }

    // Welcome back after absence
    if (p.daysSinceLastStudy >= 7) {
      return {
        type: "welcome_back",
        message: `Welcome back, ${userName}! It's been ${p.daysSinceLastStudy} days. Ready to dive back into Scripture? 🙏`,
        emoji: "👋",
        priority: 10,
      };
    }

    // Milestone celebrations
    if (p.totalStudies === 10) {
      return {
        type: "milestone",
        message: `${userName}, you've completed 10 studies! Your dedication to God's Word is inspiring. Keep growing! 🎉`,
        emoji: "🎉",
        priority: 9,
      };
    }

    if (p.totalStudies === 25) {
      return {
        type: "milestone",
        message: `Amazing, ${userName}! 25 studies completed. You're building a beautiful habit of seeking God's wisdom. 📚`,
        emoji: "📚",
        priority: 9,
      };
    }

    if (p.currentStreak >= 7) {
      return {
        type: "milestone",
        message: `${userName}, you're on a ${p.currentStreak}-day streak! Your consistency is bearing fruit. 🌱`,
        emoji: "🔥",
        priority: 8,
      };
    }

    // Pattern recognition - pastoral care based on themes
    if (p.topThemes.length > 0) {
      const topTheme = p.topThemes[0];
      
      if (topTheme.count >= 3) {
        switch (topTheme.theme) {
          case "anxiety":
            return {
              type: "pattern_recognition",
              message: `${userName}, I've noticed you've been exploring passages about anxiety and worry. May God's perfect peace guard your heart and mind today. You're not walking through this alone. 💙`,
              emoji: "🕊️",
              priority: 9,
            };

          case "grief":
            return {
              type: "pattern_recognition",
              message: `${userName}, I see you've been studying comfort and loss. May the God of all comfort hold you especially close during this season. He is near to the brokenhearted. 💜`,
              emoji: "🕊️",
              priority: 10,
            };

          case "suffering":
            return {
              type: "pattern_recognition",
              message: `${userName}, you've been studying trials and suffering. Remember: God is refining you, not abandoning you. Your perseverance is producing character. 💪`,
              emoji: "⛰️",
              priority: 9,
            };

          case "forgiveness":
            return {
              type: "pattern_recognition",
              message: `${userName}, I notice you're exploring forgiveness. This is holy work. May God give you the grace to extend the mercy you've received. 🙏`,
              emoji: "🤲",
              priority: 8,
            };

          case "leadership":
            return {
              type: "pattern_recognition",
              message: `${userName}, you've been studying leadership recently. May God give you wisdom as you shepherd others in His name. Lead well! 👨‍🏫`,
              emoji: "🧭",
              priority: 7,
            };

          case "marriage":
            return {
              type: "pattern_recognition",
              message: `${userName}, I see you're investing in your marriage through Scripture. What a beautiful way to strengthen your relationship! 💑`,
              emoji: "💕",
              priority: 7,
            };

          case "parenting":
            return {
              type: "pattern_recognition",
              message: `${userName}, you're seeking wisdom for parenting. God sees your heart to raise your children well. You're doing a great job! 👨‍👩‍👧‍👦`,
              emoji: "❤️",
              priority: 7,
            };
        }
      }
    }

    // Frequent passage returns
    if (p.frequentPassages.length > 0 && p.frequentPassages[0].count >= 3) {
      return {
        type: "pattern_recognition",
        message: `${userName}, I notice you keep coming back to ${p.frequentPassages[0].passage}. God must be teaching you something special through this passage. Keep digging! ⛏️`,
        emoji: "📖",
        priority: 6,
      };
    }

    // General encouragement for consistent study
    if (p.daysSinceLastStudy <= 2 && p.totalStudies >= 5) {
      return {
        type: "encouragement",
        message: `Great to see you back, ${userName}! Your consistency in studying God's Word is beautiful. 📖`,
        emoji: "☕",
        priority: 5,
      };
    }

    return null;
  };

  const dismissCheckIn = () => {
    setShowCheckIn(false);
    localStorage.setItem("bc-last-check-in", Date.now().toString());
  };

  const dismissInsight = () => {
    setInsightDismissed(true);
    localStorage.setItem("bc-insight-dismissed", new Date().toDateString());
  };

  const recordStudy = (passage?: string, theme?: string, type: "passage" | "theme" | "combined" = "passage") => {
    // This will be called after a study is generated
    analyzeJourney();
  };

  return {
    pattern,
    insight: insightDismissed ? null : insight,
    showCheckIn,
    dismissCheckIn,
    dismissInsight,
    recordStudy,
    refresh: analyzeJourney,
  };
}