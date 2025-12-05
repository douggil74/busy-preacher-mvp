// app/home/page.tsx
"use client";

import type { JSX } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import { Playfair_Display, Nunito_Sans } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TodaysReadingWidget from "@/components/TodaysReadingWidget";
import DailyVerseCard from "@/components/DailyVerseCard";
import { useStudyStyle } from "@/hooks/useStudyStyle";
import { useStudyJourney } from "@/hooks/useStudyJourney";
import { EnhancedOnboarding } from "@/components/EnhancedOnboarding";
import { StyleSelectorModal } from "@/components/StyleSelectorModal";
import { CheckInModal } from "@/components/CheckInModal";
import { JourneyDashboard } from "@/components/JourneyDashboard";
import { SettingsModal } from "@/components/SettingsModal";
import { CrisisModal } from "@/components/CrisisModal";
import { progressTracker } from "@/lib/progressTracker";
import { DevotionalModal } from "@/components/DevotionalModal";
import { RelatedCoursesPanel } from "@/components/RelatedCoursesPanel";
import { EncouragingBanner } from "@/components/EncouragingBanner";
import { safeStorage } from "@/utils/safeStorage";
import { KeywordSearchResults } from "@/components/KeywordSearchResults";
import WordStudyModal from "@/components/WordStudyModal";
import { getTimeBasedGreeting, getTimeGreetingPrefix, getWeatherAwareGreeting, getLoadingMessage, getPastorNote } from "@/lib/personalMessages";
import RequireAuth from '@/components/RequireAuth';
import { Paywall } from '@/components/Paywall';
import { TrialWelcomeModal } from '@/components/TrialWelcomeModal';
import { usePlatform } from '@/hooks/usePlatform';
import { useAuth } from '@/contexts/AuthContext';
import WeatherHeader from '@/components/WeatherHeader';
import InAppToast from '@/components/InAppToast';

function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Clipboard write failed:", err);
    });
  } else if (typeof window !== "undefined") {
    // Safe fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      // The execCommand warning is gone because we check browser support first
      const successful = document.execCommand?.("copy");
      if (!successful) console.warn("Fallback clipboard copy failed");
    } catch (err) {
      console.error("Fallback copy error:", err);
    }
    document.body.removeChild(textArea);
  }
}

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

import { APP_VERSION } from "@/lib/version";
const DISCLAIMER = "AI-assisted, human-directed. Always think for yourself.";
const ESV_NOTICE =
  "Scripture quotations are from The Holy Bible, English Standard Version (ESV)®. " +
  "Copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. " +
  "Used by permission. All rights reserved. ESV® is a registered trademark of Good News Publishers.";

interface SavedStudy {
  reference: string;
  timestamp: number;
  type: "passage" | "theme" | "combined";
}

interface StudyNote {
  reference: string;
  note: string;
  timestamp: number;
}

const hasText = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "" && v !== "—";

async function esvFetch(passage: string) {
  const res = await fetch("/api/esv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passage }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch ESV.");
  return data as { passage: string; text: string };
}

async function outlineFetch(input: { mode: "passage" | "theme"; passage?: string; theme?: string }) {
  const userStyle = localStorage.getItem("bc-style") || "Casual Devotional";
  const userName = localStorage.getItem("bc-user-name") || undefined;

  const res = await fetch("/api/outline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      userStyle,
      userName,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to generate outline.");
  return data as
    | {
        title: string;
        source: "passage";
        reference: string;
        points: { point: string; why: string; illustration?: string | null; crossRefs: string[] }[];
        application?: string | null;
      }
    | {
        title: string;
        source: "theme";
        topic: string;
        points: { point: string; why: string; illustration?: string | null; crossRefs: string[] }[];
        application?: string | null;
      };
}

async function outlineFetchCombined(input: { passage: string; theme: string }) {
  const userStyle = localStorage.getItem("bc-style") || "Casual Devotional";
  const userName = localStorage.getItem("bc-user-name") || undefined;

  const res = await fetch("/api/outline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "combined",
      passage: input.passage,
      theme: input.theme,
      userStyle,
      userName,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Combined outline not available.");
  return data as {
    title: string;
    source: "combined";
    reference: string;
    topic: string;
    points: { point: string; why: string; illustration?: string | null; crossRefs: string[] }[];
    application?: string | null;
  };
}

function mergeOutlines(passageO: any, themeO: any): any {
  const title =
    themeO?.title ||
    (themeO?.topic ? `The Importance of ${themeO.topic}` : passageO?.title || "Combined Study");
  const reference = passageO?.reference || "";
  const topic = themeO?.topic || "";

  const pPoints = Array.isArray(passageO?.points) ? passageO.points : [];
  const tPoints = Array.isArray(themeO?.points) ? themeO.points : [];

  const max = Math.max(pPoints.length, tPoints.length, 3);
  const points = Array.from({ length: Math.min(max, 5) }).map((_, i) => {
    const p = pPoints[i];
    const t = tPoints[i];
    const point = p && t ? `${p.point} – ${t.point}` : p?.point ?? t?.point ?? "Key Point";
    const why = p && t ? `${p.why} ${t.why}` : p?.why ?? t?.why ?? "Why this matters.";
    const illustration: string | undefined =
      (p?.illustration as string | undefined) ?? (t?.illustration as string | undefined);
    const crossRefs = Array.from(new Set([...(p?.crossRefs ?? []), ...(t?.crossRefs ?? [])]));
    return { point, why, illustration, crossRefs };
  });

  const application =
    themeO?.application && passageO?.application
      ? `${passageO.application} ${themeO.application}`
      : (passageO?.application ?? themeO?.application ?? null);

  return { title, source: "combined", reference, topic, points, application };
}

// FIXED VERSION - Replace lines 164-176 in your app/page.tsx

async function lexplainFetch(surface: string, book?: string) {
  try {
    const res = await fetch("/api/lexplain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surface, book }),
    });
    const data = await res.json();
    return (res.ok ? data : { lemma: "—", strongs: "—", plain: data?.error || "No explanation." }) as {
      lemma: string;
      strongs: string;
      plain: string;
    };
    
  } catch (error) {
    console.error("Word lookup failed:", error);
    return {
      lemma: "—",
      strongs: "—",
      plain: "Word lookup temporarily unavailable. Check console for details."
    } as {
      lemma: string;
      strongs: string;
      plain: string;
    };
  }
}
function exportOutlinePDF(args: { outlines: any[] }) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 56;
  const width = 612 - margin * 2;
  let y = margin;

  const write = (text: string, opts?: { bold?: boolean; italic?: boolean; size?: number }) => {
    const size = opts?.size ?? 12;
    const font = opts?.bold ? "Bold" : opts?.italic ? "Italic" : "Normal";
    doc.setFont("Times", font as any);
    doc.setFontSize(size);
    const lines = wrap(text, width);
    lines.forEach((ln) => {
      if (y > 742 - 64) {
        doc.addPage();
        y = margin;
      }
      doc.text(ln, margin, y);
      y += size + 4;
    });
  };

  const wrap = (text: string, maxWidth: number) => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    const measure = (t: string) => doc.getTextWidth(t);
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (measure(test) > maxWidth) {
        if (line) lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  write(DISCLAIMER, { italic: true, size: 10 });
  y += 10;

  args.outlines.forEach((o, idx) => {
    if (idx > 0) {
      y += 6;
      write("—", { italic: true, size: 10 });
      y += 6;
    }
    const title = o.title || (o.source === "passage" ? o.reference : o.topic) || "Outline";
    write(title, { bold: true, size: 14 });

    if (o.source === "passage" && o.reference) write(`Text: ${o.reference}`, { italic: true, size: 12 });
    if (o.source === "theme" && o.topic) write(`Theme: ${o.topic}`, { italic: true, size: 12 });

    y += 4;
    o.points.forEach((p: any, i: number) => {
      write(`${i + 1}. ${p.point}`, { bold: true });
      write(`Why it matters: ${p.why}`);
      y += 6;
      if (hasText(p.illustration)) write(`Illustration: ${p.illustration}`);
      if (p.crossRefs?.length) write(`Cross-refs: ${p.crossRefs.join("; ")}`);
      y += 10;
    });

    if (hasText(o.application)) write(`Modern Application: ${o.application}`);
  });

  y += 10;
  write(DISCLAIMER, { italic: true, size: 10 });
  y += 6;
  write(ESV_NOTICE, { italic: true, size: 8 });

  doc.setFont("Times", "Italic");
  doc.setFontSize(9);
  const footer = `© Cornerstone Church, Mandeville, LA – The Busy Christian • v${APP_VERSION}`;
  doc.text(footer, 612 - margin, 742, { align: "right" as any });

  const first = args.outlines[0];
  const nameBase =
    first?.source === "passage"
      ? first.reference || first.title || "Outline"
      : first?.topic || first?.title || "Outline";
  const fileSafe = String(nameBase).replace(/[^\w\-]+/g, "_");
  doc.save(`${fileSafe}_Outline_ESV.pdf`);
}

export default function Page(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { isInTrial, trialDaysRemaining, isApp, isPaid } = usePlatform();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [isIOSCapacitor, setIsIOSCapacitor] = useState(false);

  // Detect iOS Capacitor for testing (skip auth on iOS)
  useEffect(() => {
    const checkCapacitor = () => {
      try {
        return !!(window as any).Capacitor?.isNativePlatform?.();
      } catch {
        return false;
      }
    };
    setIsIOSCapacitor(checkCapacitor());
  }, []);
  const [savedStudies, setSavedStudies] = useState<SavedStudy[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [topLoading, setTopLoading] = useState(false);
  const [esvLoading, setEsvLoading] = useState(false);
  const [hoverLoading, setHoverLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusWord, setStatusWord] = useState("");
  const [passageRef, setPassageRef] = useState("");
  const [showKeywordResults, setShowKeywordResults] = useState(false);
const [searchedKeyword, setSearchedKeyword] = useState("");
  const [theme, setTheme] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [passageOutline, setPassageOutline] = useState<any | null>(null);
  const [themeOutline, setThemeOutline] = useState<any | null>(null);
  const [combinedOutline, setCombinedOutline] = useState<any | null>(null);
  const [topError, setTopError] = useState<string | null>(null);
  const [bpRef, setBpRef] = useState("");
  const [bpText, setBpText] = useState("");
  const [bpError, setBpError] = useState<string | null>(null);
  // Hover state (temporary preview)
  const [hoverWord, setHoverWord] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<{ lemma: string; strongs: string; plain: string } | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [currentBookName, setCurrentBookName] = useState<string>('');

  // Word study cache - prevents redundant API calls
  const wordCache = useRef<Map<string, { lemma: string; strongs: string; plain: string }>>(new Map());

  // Multiple pinned popovers (max 3)
  interface PinnedPopover {
    id: string;
    word: string;
    data: { lemma: string; strongs: string; plain: string } | null;
    position: { x: number; y: number };
    loading: boolean;
    zIndex: number;
  }
  const [pinnedPopovers, setPinnedPopovers] = useState<PinnedPopover[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [nextZIndex, setNextZIndex] = useState(100);
  const popoverRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // For word study modal
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [showWordStudyModal, setShowWordStudyModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState("");
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showDevotionalModal, setShowDevotionalModal] = useState(false);
  const [showReadingPlan, setShowReadingPlan] = useState(true);
  const [personalGreeting, setPersonalGreeting] = useState("");
  const [greetingPrefix, setGreetingPrefix] = useState("");
  const [weatherGreeting, setWeatherGreeting] = useState<string | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [pastorNote, setPastorNote] = useState("");
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const statusWords = ["Fetching…", "Researching…", "Synthesizing…", "Formatting…", "Ready"];

  const { style: displayStyle, hydrated } = useStudyStyle();
  const { pattern, insight, showCheckIn, dismissCheckIn, dismissInsight, refresh: refreshJourney } = useStudyJourney();

  useEffect(() => {
    if (insight && insight.priority >= 100) {
      setShowCrisisModal(true);
    }
  }, [insight]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate dynamic personal messages
  useEffect(() => {
    setGreetingPrefix(getTimeGreetingPrefix());
    setPersonalGreeting(getTimeBasedGreeting());
    setPastorNote(getPastorNote());
  }, []);

  const displayIcon = hydrated 
    ? (displayStyle === "Casual Devotional" ? "☕" 
       : displayStyle === "Bible Student" ? "📖" 
       : "👨‍🏫")
    : "✨";

  const handleStyleSelect = (style: string) => {
    localStorage.setItem("bc-style", style);
    window.location.reload();
  };

useEffect(() => {
  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  window.addEventListener('openSettings', handleOpenSettings);
  
  return () => {
    window.removeEventListener('openSettings', handleOpenSettings);
  };
}, []);

  useEffect(() => {
    const saved = localStorage.getItem("bc-saved-studies");
    if (saved) {
      try {
        setSavedStudies(JSON.parse(saved));
      } catch (e) {
        setSavedStudies([]);
      }
    }
    
    // Load reading plan visibility preference
    const readingPlanPref = localStorage.getItem("bc-show-reading-plan");
    if (readingPlanPref !== null) {
      setShowReadingPlan(readingPlanPref === "true");
    }
  }, []);
  
  // Check onboarding status - show for new users who haven't completed it
  useEffect(() => {
    // Check localStorage first
    const savedName = localStorage.getItem("bc-user-name");
    const savedStyle = localStorage.getItem("bc-style");
    const onboardingComplete = localStorage.getItem("bc-onboarding-complete");

    // If we have local preferences, use them immediately
    // Always prioritize localStorage name over Firebase name
    if ((savedName && savedStyle) || onboardingComplete === "true") {
      setUserName(savedName || "Friend");
      setIsOnboarded(true);
    } else if (user?.preferences?.onboardingComplete) {
      // If user has preferences in Firestore, skip onboarding
      // Still check localStorage first, then fall back to Firebase name
      setUserName(savedName || user.firstName || "Friend");
      setIsOnboarded(true);
    } else {
      // No local or Firestore preferences - show onboarding
      // This applies to both new users and users who haven't completed onboarding
      setShowOnboarding(true);
    }
  }, [user]);

  // Show trial welcome modal for new trial users (only on web, not iOS app)
  useEffect(() => {
    // Show modal only for trial users who aren't app users or whitelisted
    if (!user?.uid || !isInTrial || isApp) return;

    // Check if user has already seen the trial modal
    const hasSeenTrialModal = localStorage.getItem(`trial_welcome_shown_${user.uid}`);

    if (!hasSeenTrialModal) {
      // Small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setShowTrialModal(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user?.uid, isInTrial, isApp]);
  
  useEffect(() => {
    const saved = localStorage.getItem("bc-notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        setNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!topLoading) {
      setProgress(0);
      setStatusWord("");
      return;
    }
    let i = 0;
    setProgress(8);
    setStatusWord(statusWords[0]);
    const inc = setInterval(() => setProgress((p) => (p < 92 ? p + 2 : p)), 200);
    const talk = setInterval(() => {
      i = (i + 1) % statusWords.length;
      setStatusWord(statusWords[i]);
    }, 1000);
    return () => {
      clearInterval(inc);
      clearInterval(talk);
      setProgress(100);
      setTimeout(() => setProgress(0), 400);
      setStatusWord("");
    };
  }, [topLoading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const passageParam = params.get("passage");
    if (passageParam) {
      setPassageRef(passageParam);
    }
  }, []);

  useEffect(() => {
    const wantsDevotional = localStorage.getItem("bc-show-devotional") === "true";
    const isDisabled = localStorage.getItem("bc-devotional-popup-disabled") === "true";

    if (!wantsDevotional || isDisabled) return;

    const lastShown = localStorage.getItem("bc-devotional-last-shown");
    const today = new Date().toISOString().split('T')[0];

    // Disabled auto-popup to prevent modal blocking
    // if (lastShown !== today) {
    //   const timer = setTimeout(() => {
    //     setShowDevotionalModal(true);
    //   }, 1500);

    //   return () => clearTimeout(timer);
    // }
  }, [isOnboarded]);


  const currentRefNotes = useMemo(() => {
    const ref = passageRef.trim() || theme.trim();
    return notes.filter((n) => n.reference === ref);
  }, [notes, passageRef, theme]);

  const tokens = useMemo(() => {
    if (!bpText) return [];
    const rough = bpText.split(/(\s+)/);
    return rough.flatMap((t) => t.split(/(\b)/));
  }, [bpText]);

  const saveCurrentStudy = () => {
    const study: SavedStudy = {
      reference: passageRef.trim() || theme.trim(),
      timestamp: Date.now(),
      type: passageRef && theme ? "combined" : passageRef ? "passage" : "theme",
    };

    const updated = [study, ...savedStudies.filter((s) => s.reference !== study.reference)].slice(0, 20);
    setSavedStudies(updated);
    localStorage.setItem("bc-saved-studies", JSON.stringify(updated));
  };

  const loadSavedStudy = async (study: SavedStudy) => {
    if (study.type === "passage" || study.type === "combined") {
      setPassageRef(study.reference);
    }
    if (study.type === "theme") {
      setTheme(study.reference);
    }
    setShowHistory(false);
    
    await progressTracker.checkAndNotifyProgress();
  };

  const deleteSavedStudy = (timestamp: number) => {
    const updated = savedStudies.filter((s) => s.timestamp !== timestamp);
    setSavedStudies(updated);
    localStorage.setItem("bc-saved-studies", JSON.stringify(updated));
  };

  const saveNote = () => {
    if (!currentNote.trim()) return;

    const note: StudyNote = {
      reference: passageRef.trim() || theme.trim() || "General Note",
      note: currentNote.trim(),
      timestamp: Date.now(),
    };

    const updated = [note, ...notes].slice(0, 100);
    setNotes(updated);
    localStorage.setItem("bc-notes", JSON.stringify(updated));
    setCurrentNote("");
  };

  const deleteNote = (timestamp: number) => {
    const updated = notes.filter((n) => n.timestamp !== timestamp);
    setNotes(updated);
    localStorage.setItem("bc-notes", JSON.stringify(updated));
  };

  const onSubmit = async () => {
    setTopError(null);
    setCombinedOutline(null);

    const wantsPassage = !!passageRef.trim();
    const wantsTheme = !!theme.trim();
    if (!wantsPassage && !wantsTheme) {
      setTopError("Enter a Passage and/or a Theme.");
      return;
    }

    const crisisKeywords = [
      "suicide", 
      "suicidal", 
      "kill myself",
      "kill my self",
      "end my life", 
      "take my life",
      "want to die", 
      "wish i was dead",
      "wish i were dead",
      "no reason to live",
      "better off dead",
      "can't go on",
      "no point in living",
      "everyone would be better without me",
      "i want to disappear",
      "i don't want to be here",
      "i'm a burden",
      "can't do this anymore",
      "tired of living",
      "want it to stop",
      "want to sleep forever"
    ];
    const searchText = `${passageRef.toLowerCase()} ${theme.toLowerCase()}`;
    const hasCrisis = crisisKeywords.some(keyword => searchText.includes(keyword));
    
    if (hasCrisis) {
      console.log("🆘 IMMEDIATE CRISIS DETECTED:", searchText);
      setShowCrisisModal(true);
      progressTracker.sendCrisisAlert(searchText);
    }

    const studies = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem("bc-saved-studies") || "[]")
      : [];

    setTopLoading(true);
    try {
      if (wantsPassage && wantsTheme) {
        const esvTask = esvFetch(passageRef.trim()).then((r) => {
          setBpRef(passageRef.trim());
          setBpText(r.text);
        });

        try {
          const combined = await outlineFetchCombined({
            passage: passageRef.trim(),
            theme: theme.trim(),
          });
          setCombinedOutline(combined);
          await esvTask;
        } catch {
          const [po, to] = await Promise.all([
            outlineFetch({ mode: "passage", passage: passageRef.trim() }),
            outlineFetch({ mode: "theme", theme: theme.trim() }),
            esvTask,
          ]);
          setCombinedOutline(mergeOutlines(po, to));
        }

        setPassageOutline(null);
        setThemeOutline(null);
        refreshJourney();
        
        await progressTracker.checkAndNotifyProgress();
        progressTracker.trackOutlineGeneration(passageRef.trim(), theme.trim());
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const nextOutlines: { passage?: any; theme?: any } = {};
        const tasks: Promise<any>[] = [];

        if (wantsPassage) {
          tasks.push(
            outlineFetch({ mode: "passage", passage: passageRef.trim() }).then((o) => {
              nextOutlines.passage = o;
            })
          );
          tasks.push(
            esvFetch(passageRef.trim()).then((r) => {
              setBpRef(passageRef.trim());
              setBpText(r.text);
            })
          );
        }
        if (wantsTheme) {
          tasks.push(
            outlineFetch({ mode: "theme", theme: theme.trim() }).then((o) => {
              nextOutlines.theme = o;
            })
          );
        }

        await Promise.all(tasks);
        setPassageOutline(nextOutlines.passage ?? null);
        setThemeOutline(nextOutlines.theme ?? null);
        refreshJourney();
        
        await progressTracker.checkAndNotifyProgress();

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e: any) {
      setTopError(e?.message ?? "Failed to generate outline.");
    } finally {
      setTopLoading(false);
    }
  };

  const handleEmailSignup = async () => {
  setEmailSubmitting(true);
  try {
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: emailInput,
        source: "post-study-modal"
      }),
    });

    if (response.ok) {
      // ✅ MARK AS SUBSCRIBED - won't show popup again
      localStorage.setItem("bc-subscribed", "true");
      
      setEmailSuccess(true);
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccess(false);
        setEmailInput("");
      }, 2000);
    } else {
      alert("Failed to subscribe. Please try again.");
    }
  } catch (error) {
    alert("Failed to subscribe. Please try again.");
  } finally {
    setEmailSubmitting(false);
  }
};
  const onExportPDFTop = () => {
    const outlines = combinedOutline ? [combinedOutline] : ([passageOutline, themeOutline].filter(Boolean) as any[]);
    if (!outlines.length) return;
    exportOutlinePDF({ outlines });
  };

  const copyOutline = () => {
    const outlines = combinedOutline ? [combinedOutline] : ([passageOutline, themeOutline].filter(Boolean) as any[]);
    if (!outlines.length) return;

    let text = "";
    outlines.forEach((o) => {
      text += `${o.title}\n\n`;
      if (o.reference) text += `Text: ${o.reference}\n`;
      if (o.topic) text += `Topic: ${o.topic}\n`;
      text += "\n";

      o.points.forEach((p: any, i: number) => {
        text += `${i + 1}. ${p.point}\n`;
        text += `Why: ${p.why}\n`;
        if (hasText(p.illustration)) text += `Illustration: ${p.illustration}\n`;
        if (p.crossRefs?.length) text += `Cross-refs: ${p.crossRefs.join("; ")}\n`;
        text += "\n";
      });

      if (hasText(o.application)) text += `Modern Application: ${o.application}\n\n`;
    });

    copyToClipboard(text);
  };

  const onCrossRefClick = (ref: string) => {
    progressTracker.trackCrossRefClick(ref);
    setBpRef(ref);
    setEsvLoading(true);
    esvFetch(ref)
      .then((r) => {
        setBpText(r.text);
        document.getElementById("ol-study")?.scrollIntoView({ behavior: "smooth" });
      })
      .catch(() => {})
      .finally(() => setEsvLoading(false));
  };

  // Request word data for hover preview
  const requestHoverData = (surface: string) => {
    const rawBook = bpRef.trim().split(/\s+/)[0];
    const bookName = rawBook.charAt(0).toUpperCase() + rawBook.slice(1).toLowerCase();
    setCurrentBookName(bookName);

    // Create cache key combining word and book
    const cacheKey = `${surface.toLowerCase()}-${bookName}`;

    // Check cache first
    const cached = wordCache.current.get(cacheKey);
    if (cached) {
      setHoverData(cached);
      setHoverLoading(false);
      return;
    }

    setHoverLoading(true);
    lexplainFetch(surface, bookName)
      .then((d) => {
        // Store in cache
        wordCache.current.set(cacheKey, d);
        setHoverData(d);
      })
      .finally(() => setHoverLoading(false));
  };

  // Request word data for a specific pinned popover
  const requestPinnedData = (id: string, surface: string) => {
    const rawBook = bpRef.trim().split(/\s+/)[0];
    const bookName = rawBook.charAt(0).toUpperCase() + rawBook.slice(1).toLowerCase();
    setCurrentBookName(bookName);

    // Create cache key combining word and book
    const cacheKey = `${surface.toLowerCase()}-${bookName}`;

    // Check cache first
    const cached = wordCache.current.get(cacheKey);
    if (cached) {
      setPinnedPopovers(prev => prev.map(p =>
        p.id === id ? { ...p, data: cached, loading: false } : p
      ));
      return;
    }

    lexplainFetch(surface, bookName).then((d) => {
      // Store in cache
      wordCache.current.set(cacheKey, d);
      setPinnedPopovers(prev => prev.map(p =>
        p.id === id ? { ...p, data: d, loading: false } : p
      ));
    });
  };

  const calculatePosition = (e: React.MouseEvent, width = 420, height = 300) => {
    const margin = 16;
    let x = e.clientX;
    let y = e.clientY + 12;

    if (x + width > window.innerWidth - margin) {
      x = window.innerWidth - width - margin;
    }
    if (x < margin) x = margin;

    if (y + height > window.innerHeight - margin) {
      y = e.clientY - height - 12;
    }
    if (y < margin) y = margin;

    return { x, y };
  };

  const onWordEnter = (e: React.MouseEvent, w: string) => {
    // Don't show hover preview if word is already pinned
    if (pinnedPopovers.some(p => p.word === w)) return;

    setHoverWord(w);
    setHoverPos(calculatePosition(e, 360, 220));

    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => requestHoverData(w), 50);
  };

  const onWordLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoverWord(null);
    setHoverData(null);
    setHoverPos(null);
  };

  const onWordClick = (e: React.MouseEvent, w: string) => {
    e.preventDefault();

    // On mobile, open modal directly
    if (isMobile) {
      setActiveWord(w);
      requestHoverData(w);
      setTimeout(() => setShowWordStudyModal(true), 100);
      return;
    }

    // Check if word is already pinned - if so, close it
    const existingIndex = pinnedPopovers.findIndex(p => p.word === w);
    if (existingIndex !== -1) {
      setPinnedPopovers(prev => prev.filter(p => p.word !== w));
      return;
    }

    // Clear hover state
    onWordLeave();

    // Create new pinned popover
    const newPopover: PinnedPopover = {
      id: `${w}-${Date.now()}`,
      word: w,
      data: hoverData?.lemma ? hoverData : null, // Use hover data if available
      position: calculatePosition(e),
      loading: !hoverData?.lemma,
      zIndex: nextZIndex,
    };

    setNextZIndex(prev => prev + 1);

    // If already have 3, replace the oldest one
    if (pinnedPopovers.length >= 3) {
      setPinnedPopovers(prev => [...prev.slice(1), newPopover]);
    } else {
      setPinnedPopovers(prev => [...prev, newPopover]);
    }

    // Fetch data if not already loaded
    if (!hoverData?.lemma) {
      requestPinnedData(newPopover.id, w);
    }
  };

  // Close a specific pinned popover
  const closePinnedPopover = (id: string) => {
    setPinnedPopovers(prev => prev.filter(p => p.id !== id));
  };

  // Close all pinned popovers
  const closeAllPopovers = () => {
    setPinnedPopovers([]);
  };

  // Bring popover to front when clicked
  const bringToFront = (id: string) => {
    setPinnedPopovers(prev => prev.map(p =>
      p.id === id ? { ...p, zIndex: nextZIndex } : p
    ));
    setNextZIndex(prev => prev + 1);
  };

  // Drag handlers for pinned popovers
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingId(id);
    bringToFront(id);

    const popover = pinnedPopovers.find(p => p.id === id);
    if (popover) {
      setDragOffset({
        x: e.clientX - popover.position.x,
        y: e.clientY - popover.position.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingId) return;
    setPinnedPopovers(prev => prev.map(p =>
      p.id === draggingId
        ? { ...p, position: { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } }
        : p
    ));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // Open detailed word study modal from pinned popover
  const openWordStudyFromPinned = (popover: PinnedPopover) => {
    setActiveWord(popover.word);
    setHoverData(popover.data);
    setShowWordStudyModal(true);
  };

  // Add event listeners for drag
  useEffect(() => {
    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingId, dragOffset]);

  // Escape key closes all popovers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pinnedPopovers.length > 0) {
        closeAllPopovers();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinnedPopovers.length]);

  const bpFetch = async () => {
    const cleaned = bpRef.trim();
    if (!cleaned) return;
    setBpError(null);
    setEsvLoading(true);
    await progressTracker.checkAndNotifyProgress();

    esvFetch(cleaned)
      .then((out) => setBpText(out.text))
      .catch((e) => setBpError(e?.message ?? "Failed to fetch ESV."))
      .finally(() => setEsvLoading(false));
  };

  const onBottomKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") bpFetch();
  };

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveCurrentStudy();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const capitalizeName = (name: string) => {
    return name
      .trim()
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

const handleEnhancedOnboardingComplete = async (data: {
  name: string;
  studyStyle: string;
  studyGoal: string;
  weeklyFrequency: number;
  enableDevotional: boolean;
  enableReadingPlan: boolean;
  enableReminders: boolean;
  email: string;
}) => {
  // Capitalize name
  const capitalizedName = capitalizeName(data.name);

  // Save core preferences to localStorage
  localStorage.setItem("bc-user-name", capitalizedName);
  localStorage.setItem("bc-style", data.studyStyle);
  localStorage.setItem("bc-show-devotional", String(data.enableDevotional));
  localStorage.setItem("bc-show-reading-plan", String(data.enableReadingPlan));
  localStorage.setItem("bc-onboarding-complete", "true");
  localStorage.setItem("onboarding_completed", "true");

  // Save new preferences
  localStorage.setItem("bc-study-goal", data.studyGoal);
  localStorage.setItem("bc-weekly-frequency", String(data.weeklyFrequency));
  localStorage.setItem("bc-enable-reminders", String(data.enableReminders));

  // Save preferences to Firestore (so they persist across devices/sign-ins)
  if (user?.uid) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      await setDoc(
        doc(db, 'users', user.uid),
        {
          firstName: capitalizedName,
          fullName: capitalizedName,
          preferences: {
            studyStyle: data.studyStyle,
            studyGoal: data.studyGoal,
            weeklyFrequency: data.weeklyFrequency,
            enableDevotional: data.enableDevotional,
            enableReadingPlan: data.enableReadingPlan,
            enableReminders: data.enableReminders,
            onboardingComplete: true,
          }
        },
        { merge: true }
      );
      console.log('Saved preferences to Firestore');
    } catch (error) {
      console.error('Failed to save preferences to Firestore:', error);
    }
  }

  // Handle email signup if provided AND not already subscribed
  // Check both localStorage AND Firestore onboardingComplete to prevent duplicate emails
  // If user already had onboardingComplete in Firestore, they're an existing user who already subscribed
  const alreadySubscribed = localStorage.getItem("bc-subscribed") === "true" || user?.preferences?.onboardingComplete;
  if (data.email && data.email.trim() && !alreadySubscribed) {
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          source: "onboarding",
          userName: capitalizedName,
          studyStyle: data.studyStyle,
        }),
      });
      localStorage.setItem("bc-subscribed", "true");
    } catch (error) {
      console.error("Email signup failed:", error);
    }
  }

  // Update state
  setUserName(capitalizedName);
  setIsOnboarded(true);
  setShowOnboarding(false);

  // Reload to apply changes
  window.location.reload();
};
const handleKeywordSearch = () => {
  if (keywordSearch.trim()) {
    setSearchedKeyword(keywordSearch.trim());
    setShowKeywordResults(true);
  }
};

const handleKeywordResultSelect = (reference: string) => {
  // When user clicks "Read" on a search result
  setBpRef(reference);
  setEsvLoading(true);
  esvFetch(reference)
    .then((r) => {
      setBpText(r.text);
      // Scroll to the passage display section
      document.getElementById("ol-study")?.scrollIntoView({ behavior: "smooth" });
    })
    .catch(() => {})
    .finally(() => setEsvLoading(false));
};
  const handleCloseReadingPlan = () => {
    setShowReadingPlan(false);
    localStorage.setItem("bc-show-reading-plan", "false");
  };

  // Content to render (same for iOS and web)
  const pageContent = (
    <>
    <InAppToast />
    <main className="px-6 pt-10 pb-8 max-w-4xl mx-auto relative">


      {isOnboarded && !passageRef && !theme && !passageOutline && !themeOutline && !combinedOutline && (
        <section
          className="rounded-2xl mb-8 relative overflow-hidden"
          style={{
            border: '1px solid var(--card-border)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Weather-aware animated art - visible at top */}
          <div className="relative h-40 md:h-48 overflow-hidden rounded-t-2xl">
            <WeatherHeader onSceneReady={(scene, tempF) => {
              setSceneReady(true);
              const weatherMsg = getWeatherAwareGreeting(scene, tempF);
              if (weatherMsg) setWeatherGreeting(weatherMsg);
            }} />
            {/* Gradient fade to blend into content below */}
            <div
              className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, var(--card-bg) 100%)'
              }}
            />
          </div>

          {/* Content area with padding */}
          <div
            className="px-6 pb-4 relative rounded-b-2xl"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="relative text-center mb-6 pt-2" style={{ zIndex: 5 }}>
            <h2 className={`${nunitoSans.className} text-3xl md:text-4xl font-bold mb-2`} style={{ color: 'var(--text-primary)' }}>
              {greetingPrefix}, {userName}{greetingPrefix === "Late night" ? "?" : "."}
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              {weatherGreeting || personalGreeting}
            </p>
          </div>

          {/* Daily Verse Card */}
          <div className="mb-6 mt-8 relative" style={{ zIndex: 5 }}>
            <DailyVerseCard
              onStudyVerse={(reference) => {
                setPassageRef(reference);
                document.getElementById('devotion-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          </div>

          {pattern && pattern.totalStudies > 0 && (
            <div className="mb-6 relative" style={{ zIndex: 5 }}>
              <button
                onClick={() => setShowJourney(!showJourney)}
                className="flex items-center gap-2 text-sm transition-colors mb-3"
                style={{ color: 'var(--accent-color)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showJourney ? "Hide" : "View"} Your Journey
              </button>

              {showJourney && (
                <JourneyDashboard
                  totalStudies={pattern.totalStudies}
                  currentStreak={pattern.currentStreak}
                  topThemes={pattern.topThemes}
                  frequentPassages={pattern.frequentPassages}
                />
              )}
            </div>
          )}
          </div>
        </section>
      )}

      {/* SECTION 1: Explore Any Passage or Topic */}
      <div id="devotion-section" className="mb-4 scroll-mt-20">
        <h2 className={`${nunitoSans.className} text-xl font-semibold mb-1`} style={{ color: 'var(--accent-color)' }}>
          Explore Any Passage or Topic
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          AI-powered research with pastoral insights, practical applications, and cross-references
        </p>
      </div>

      <section
        className="rounded-2xl p-6 mb-8 glow-hover"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        {savedStudies.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showHistory ? "Hide" : "Show"} Recent Studies ({savedStudies.length})
            </button>
          </div>
        )}

        {showHistory && (
          <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedStudies.map((study) => (
                <div key={study.timestamp} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-white/5">
                  <button
                    onClick={() => loadSavedStudy(study)}
                    className="flex-1 text-left text-sm text-white/80 hover:text-white truncate"
                  >
                    <span className="text-xs text-white/50 mr-2">
                      {new Date(study.timestamp).toLocaleDateString()}
                    </span>
                    {study.reference}
                  </button>
                  <button
                    onClick={() => deleteSavedStudy(study.timestamp)}
                    className="text-red-400 hover:text-red-300 text-xs"
                    aria-label="Delete"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="mainPassage" className="mb-2 block text-sm text-white/80">
              Passage (ESV)
            </label>
            <input
              id="mainPassage"
              placeholder="e.g., John 11:25"
              value={passageRef}
              onChange={(e) => setPassageRef(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="theme" className="mb-2 block text-sm text-white/80">
              Topic (optional)
            </label>
            <input
              id="theme"
              placeholder="e.g., Can God dance?"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="input"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="submit-btn"
              onClick={onSubmit}
              disabled={topLoading}
              className="btn-primary"
            >
              {topLoading ? "Working…" : "Submit"}
            </button>
            {(passageRef || theme) && (
              <button
                onClick={handleSave}
                className="btn-secondary flex items-center gap-2"
                title="Save this study to your library"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {saveSuccess ? "Saved! ✓" : "Save to Library"}
              </button>
            )}
            <button
              onClick={() => {
                setPassageRef("");
                setTheme("");
                setPassageOutline(null);
                setThemeOutline(null);
                setCombinedOutline(null);
              }}
              className="ml-auto btn-secondary"
            >
              Clear
            </button>
          </div>

          <div className="mt-2">
            <div className="statusbar">
              <div
                className="statusbar-fill"
                style={{ width: `${progress}%`, animation: progress > 0 ? undefined : "none" }}
              />
            </div>
<div className="h-4 text-center text-xs text-secondary" style={{ color: 'var(--text-secondary)' }}>
              {progress > 0 ? statusWord : " "}
            </div>
          </div>

          {topError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{topError}</div>
          )}

          {combinedOutline && (
            <div className="card mt-2">
              <h3 className="text-lg font-semibold">{combinedOutline.title}</h3>
              <p className="text-sm text-white/70">
                {combinedOutline.reference ? <>Text: {combinedOutline.reference}</> : null}
                {combinedOutline.reference && combinedOutline.topic ? " • " : null}
                {combinedOutline.topic ? <>Topic: {combinedOutline.topic}</> : null}
              </p>
              <ol className="mt-3 list-decimal space-y-4 pl-5">
                {combinedOutline.points.map((p: any, i: number) => (
                  <li key={i} className="space-y-2">
                    <div className="font-semibold">{p.point}</div>
                    <div className="text-sm">
                      <span className="opacity-70">Why:</span> {p.why}
                    </div>

                    {hasText(p.illustration) && (
                      <div className="mt-2 text-sm">
                        <span className="opacity-70">Illustration:</span> {p.illustration}
                      </div>
                    )}

                    {!!p.crossRefs?.length && (
                      <div className="text-sm">
                        <span className="opacity-70">Cross-refs:</span>{" "}
                        {p.crossRefs
                          .map((r: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => onCrossRefClick(r)}
                              className="underline decoration-yellow-400 underline-offset-4"
                            >
                              {r}
                            </button>
                          ))
                          .reduce((acc: any[], el: any, idx: number) => {
                            if (idx > 0) acc.push(<span key={`sepC-${idx}`}>; </span>);
                            acc.push(el);
                            return acc;
                          }, [])}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              {hasText(combinedOutline.application) && (
                <div className="mt-4 text-sm">
                  <span className="font-semibold">Modern Application:</span> {combinedOutline.application}
                </div>
              )}
            </div>
          )}

          {!combinedOutline && passageOutline && (
            <div className="card mt-2">
              <h3 className="text-lg font-semibold">{passageOutline.title || passageOutline.reference}</h3>
              <p className="text-sm text-white/70">Text: {passageOutline.reference}</p>
              <ol className="mt-3 list-decimal space-y-4 pl-5">
                {passageOutline.points.map((p: any, i: number) => (
                  <li key={i} className="space-y-2">
                    <div className="font-semibold">{p.point}</div>
                    <div className="text-sm">
                      <span className="opacity-70">Why:</span> {p.why}
                    </div>

                    {hasText(p.illustration) && (
                      <div className="mt-2 text-sm">
                        <span className="opacity-70">Illustration:</span> {p.illustration}
                      </div>
                    )}

                    {!!p.crossRefs?.length && (
                      <div className="text-sm">
                        <span className="opacity-70">Cross-refs:</span>{" "}
                        {p.crossRefs
                          .map((r: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => onCrossRefClick(r)}
                              className="underline decoration-yellow-400 underline-offset-4"
                            >
                              {r}
                            </button>
                          ))
                          .reduce((acc: any[], el: any, idx: number) => {
                            if (idx > 0) acc.push(<span key={`sep-${idx}`}>; </span>);
                            acc.push(el);
                            return acc;
                          }, [])}
                      </div>
                    )}
                  </li>
                ))}
              </ol>

              {hasText(passageOutline.application) && (
                <div className="mt-4 text-sm">
                  <span className="font-semibold">Modern Application:</span> {passageOutline.application}
                </div>
              )}
            </div>
          )}

          {!combinedOutline && themeOutline && (
            <div className="card mt-2">
              <h3 className="text-lg font-semibold">{themeOutline.title || themeOutline.topic}</h3>
              <p className="text-sm text-white/70">Topic: {themeOutline.topic}</p>
              <ol className="mt-3 list-decimal space-y-4 pl-5">
                {themeOutline.points.map((p: any, i: number) => (
                  <li key={i} className="space-y-2">
                    <div className="font-semibold">{p.point}</div>
                    <div className="text-sm">
                      <span className="opacity-70">Why:</span> {p.why}
                    </div>

                    {hasText(p.illustration) && (
                      <div className="mt-2 text-sm">
                        <span className="opacity-70">Illustration:</span> {p.illustration}
                      </div>
                    )}

                    {!!p.crossRefs?.length && (
                      <div className="text-sm">
                        <span className="opacity-70">Cross-refs:</span>{" "}
                        {p.crossRefs
                          .map((r: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => onCrossRefClick(r)}
                              className="underline decoration-yellow-400 underline-offset-4"
                            >
                              {r}
                            </button>
                          ))
                          .reduce((acc: any[], el: any, idx: number) => {
                            if (idx > 0) acc.push(<span key={`sep2-${idx}`}>; </span>);
                            acc.push(el);
                            return acc;
                          }, [])}
                      </div>
                    )}
                  </li>
                ))}
              </ol>

              {hasText(themeOutline.application) && (
                <div className="mt-4 text-sm">
                  <span className="font-semibold">Modern Application:</span> {themeOutline.application}
                </div>
              )}
            </div>
          )}


{(combinedOutline || passageOutline || themeOutline) && (
  <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
    <button
      onClick={onExportPDFTop}
      disabled={topLoading}
      className="rounded-lg bg-yellow-400/20 border border-yellow-400 px-4 py-2 text-sm hover:bg-yellow-400/30 disabled:opacity-50 transition-colors flex items-center gap-1"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export PDF
    </button>
    <button onClick={copyOutline} className="btn flex items-center gap-1">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      {copied ? "Copied!" : "Copy"}
    </button>
  </div>
)}

{(combinedOutline || passageOutline || themeOutline) && (
  <RelatedCoursesPanel 
    passageRef={passageRef}
    theme={theme}
  />
)}          {(passageRef || theme) && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {showNotes ? "Hide" : "Add"} Notes {currentRefNotes.length > 0 && `(${currentRefNotes.length})`}
              </button>

              {showNotes && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      placeholder="Add your personal notes here..."
                      className="input min-h-[80px]"
                    />
                    <button
                      onClick={saveNote}
                      disabled={!currentNote.trim()}
                      className="rounded-lg bg-yellow-400/20 border border-yellow-400 px-4 py-2 text-sm hover:bg-yellow-400/30 disabled:opacity-50 transition-colors h-fit"
                    >
                      Save
                    </button>
                  </div>

                  {currentRefNotes.length > 0 && (
                    <div className="space-y-2">
                      {currentRefNotes.map((note) => (
                        <div key={note.timestamp} className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-white/80 flex-1">{note.note}</p>
                            <button
                              onClick={() => deleteNote(note.timestamp)}
                              className="text-red-400 hover:text-red-300 text-xs"
                              aria-label="Delete note"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-xs text-white/40 mt-1">{new Date(note.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: Keyword Search */}
      <div id="keyword-section" className="mb-4 scroll-mt-20">
        <h2 className={`${nunitoSans.className} text-xl font-semibold mb-1`} style={{ color: 'var(--accent-color)' }}>
          Keyword Search
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Search all of Scripture by topic, theme, or specific word to discover relevant passages
        </p>
      </div>

      <section className="card section-spacing">
        <div className="space-y-4">
          <div>
            <label htmlFor="keywordSearch" className="mb-2 block text-sm font-medium text-white/80">
              Enter Keyword or Topic
            </label>
            <input
              id="keywordSearch"
              type="text"
              placeholder="e.g., love, forgiveness, courage, faith"
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleKeywordSearch()}
              className="input"
            />
          </div>
          <button
            onClick={handleKeywordSearch}
            disabled={!keywordSearch.trim()}
            className="btn-primary w-full"
          >
            🔍 Search Scripture
          </button>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
  <span className="text-xs text-white/50">Quick searches:</span>
  <button
    onClick={() => { 
      setKeywordSearch("faith");
      setSearchedKeyword("faith");
      setShowKeywordResults(true);
    }}
    className="text-xs text-yellow-400 hover:text-yellow-300 underline"
  >
    Faith
  </button>
  <button
    onClick={() => { 
      setKeywordSearch("hope");
      setSearchedKeyword("hope");
      setShowKeywordResults(true);
    }}
    className="text-xs text-yellow-400 hover:text-yellow-300 underline"
  >
    Hope
  </button>
  <button
    onClick={() => { 
      setKeywordSearch("peace");
      setSearchedKeyword("peace");
      setShowKeywordResults(true);
    }}
    className="text-xs text-yellow-400 hover:text-yellow-300 underline"
  >
    Peace
  </button>
  <button
    onClick={() => { 
      setKeywordSearch("grace");
      setSearchedKeyword("grace");
      setShowKeywordResults(true);
    }}
    className="text-xs text-yellow-400 hover:text-yellow-300 underline"
  >
    Grace
  </button>
</div>
        </div>
      </section>

      {/* SECTION 3: Strong's Word Lookup */}
      <div className="mb-4">
        <h2 className={`${nunitoSans.className} text-xl font-semibold mb-1`} style={{ color: 'var(--accent-color)' }}>
          Strong's Word Lookup
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Explore Hebrew and Greek word meanings with Strong's concordance definitions
        </p>
      </div>

      <section id="ol-study" className="card section-spacing">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label htmlFor="bpPassage" className="mb-2 block text-sm text-white/80">
              Enter Bible Reference
            </label>
            <input
              id="bpPassage"
              placeholder="e.g., John 3:16, Psalm 23:1"
              value={bpRef}
              onChange={(e) => setBpRef(e.target.value)}
              onKeyDown={onBottomKey}
              className="input"
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={bpFetch} disabled={esvLoading} className="btn-primary">
              {esvLoading ? "Loading…" : "Get ESV"}
            </button>
            {bpText && (
              <button onClick={() => handleCopy(bpText)} className="btn" title="Copy text">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={() => {
                setBpRef("");
                setBpText("");
                setActiveWord(null);
                setHoverData(null);
              }}
              className="btn"
            >
              Clear
            </button>
          </div>
        </div>

        {bpError && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {bpError}
          </div>
        )}

        <div className="mt-5">
          {!bpText ? (
            <p className="text-white/60 text-sm">
              Enter a reference and click <span className="font-semibold">Get ESV</span>. Hover any word for a
              simple, plain-English original language note; click to pin/unpin.
            </p>
          ) : (
            <article className="whitespace-pre-wrap text-[1.05rem] leading-7">
              {tokens.map((t, i) => {
                const isWord = /\w/.test(t);
                if (!isWord) return <span key={i}>{t}</span>;
                return (
                  <span
                    key={i}
                    onMouseEnter={(e) => onWordEnter(e, t)}
                    onMouseLeave={onWordLeave}
                    onClick={(e) => onWordClick(e, t)}
                    className="cursor-help rounded-lg bg-transparent px-0.5 hover:bg-white/10 transition-colors"
                  >
                    {t}
                  </span>
                );
              })}
            </article>
          )}
        </div>
      </section>

{/* Hover Preview Popover (temporary, not pinned) */}
      {hoverWord && hoverPos && !isMobile && (
        <div
          className="hover-popover pointer-events-none fixed w-[360px] max-w-[90vw] rounded-2xl shadow-2xl"
          style={{
            left: hoverPos.x,
            top: hoverPos.y,
            zIndex: 50,
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
          }}
        >
          <div className="pointer-events-auto p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-serif mb-1" style={{ color: 'var(--text-primary)' }}>
                  {hoverData?.lemma ?? hoverWord}
                </h3>
                <div className="text-xs font-semibold" style={{ color: 'var(--accent-color)' }}>
                  {hoverData?.strongs ?? "Loading..."}
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)' }}>
                Click to pin
              </span>
            </div>
            <div className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
              {hoverData?.plain ?? (hoverLoading ? "Loading..." : "—")}
            </div>
          </div>
        </div>
      )}

      {/* Pinned Popovers (up to 3) */}
      {pinnedPopovers.map((popover) => (
        <div
          key={popover.id}
          ref={(el) => {
            if (el) popoverRefs.current.set(popover.id, el);
            else popoverRefs.current.delete(popover.id);
          }}
          className="fixed w-[420px] max-w-[90vw] rounded-2xl shadow-2xl"
          style={{
            left: popover.position.x,
            top: popover.position.y,
            zIndex: popover.zIndex,
            cursor: draggingId === popover.id ? 'grabbing' : 'grab',
            backgroundColor: 'var(--card-bg)',
            border: '2px solid var(--accent-color)',
          }}
          onClick={() => bringToFront(popover.id)}
        >
          <div
            className="p-6"
            onMouseDown={(e) => handleMouseDown(e, popover.id)}
          >
            {/* Header with close button */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="text-xs mb-1 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span>Drag to move</span>
                  <span className="mx-1">•</span>
                  <span className="text-xs" style={{ color: 'var(--accent-color)' }}>
                    {pinnedPopovers.length}/3 windows
                  </span>
                </div>
                <h3 className="text-2xl font-serif mb-1" style={{ color: 'var(--text-primary)' }}>
                  {popover.data?.lemma ?? popover.word}
                </h3>
                <div className="text-sm font-semibold" style={{ color: 'var(--accent-color)' }}>
                  STRONG'S: {popover.data?.strongs ?? "..."}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closePinnedPopover(popover.id);
                }}
                className="rounded-lg p-1.5 text-xs font-medium transition-colors shrink-0 hover:bg-red-500/20"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--text-primary) 10%, transparent)',
                  color: 'var(--text-secondary)',
                }}
                title="Close (or press Escape to close all)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Dictionary Definition */}
            <div className="mb-4">
              <h4
                className="text-sm font-bold mb-3 pb-2"
                style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)' }}
              >
                Dictionary Definition
              </h4>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {popover.data?.plain ?? (popover.loading ? "Loading definition..." : "—")}
              </div>
            </div>

            {/* Actions */}
            {popover.data && (
              <div className="pt-4 flex gap-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const text = `${popover.data!.lemma} (${popover.data!.strongs}): ${popover.data!.plain}`;
                    navigator.clipboard.writeText(text);
                  }}
                  className="px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--text-primary) 10%, transparent)',
                    color: 'var(--text-secondary)',
                  }}
                  title="Copy to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openWordStudyFromPinned(popover);
                  }}
                  className="flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    color: 'var(--bg-color)',
                  }}
                >
                  Learn More
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

<EnhancedOnboarding
  isOpen={showOnboarding}
  onComplete={handleEnhancedOnboardingComplete}
/>

      <StyleSelectorModal
        isOpen={showStyleModal}
        onClose={() => setShowStyleModal(false)}
        currentStyle={displayStyle}
        onStyleSelect={handleStyleSelect}
      />

      <CheckInModal
        isOpen={showCheckIn}
        userName={userName}
        recentThemes={pattern?.topThemes.map(t => t.theme) || []}
        onClose={dismissCheckIn}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userName={userName}
        currentStyle={displayStyle}
      />

      <CrisisModal
        isOpen={showCrisisModal}
        userName={userName}
        onClose={() => setShowCrisisModal(false)}
      />

      <DevotionalModal
        isOpen={showDevotionalModal}
        userName={userName}
        onClose={() => setShowDevotionalModal(false)}
      />

      <TrialWelcomeModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        trialDaysRemaining={trialDaysRemaining}
      />

      <WordStudyModal
        isOpen={showWordStudyModal}
        onClose={() => setShowWordStudyModal(false)}
        word={activeWord || ''}
        initialData={hoverData}
        bookName={currentBookName}
      />

{showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            {emailSuccess ? (
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                  You're subscribed!
                </h2>
                <p className="text-white/70">Check your email for confirmation.</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Loved this study guide?
                  </h2>
                  <p className="text-white/70">
                    Get notified when we add new features, translations, and tools!
                  </p>
                </div>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="input mb-4"
                  disabled={emailSubmitting}
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleEmailSignup}
                    disabled={emailSubmitting || !emailInput}
                    className="flex-1 rounded-lg bg-yellow-400/20 border border-yellow-400 px-4 py-3 text-sm hover:bg-yellow-400/30 disabled:opacity-50 transition-colors font-semibold"
                  >
                    {emailSubmitting ? "Subscribing..." : "Yes, keep me updated"}
                  </button>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    disabled={emailSubmitting}
                    className="flex-1 btn font-semibold"
                  >
                    No thanks
                  </button>
                </div>

                <p className="text-xs text-white/50 text-center mt-4">
                  Optional - you can still use the app anonymously. Unsubscribe anytime.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <p id="disclaimer" className="mt-10 text-center text-xs italic text-white/50">
        {DISCLAIMER}
      </p>
      <p className="mt-6 px-4 text-center text-[10px] leading-4 text-white/40">
        {ESV_NOTICE}
      </p>
      
      <div className="mt-4 text-center space-x-4">
        <button
          onClick={() => setShowSettings(true)}
          className="text-xs text-white/50 hover:text-yellow-400 underline transition-colors"
        >
          Manage Your Data & Privacy
        </button>
        <Link
          href="/privacy"
          className="text-xs text-white/50 hover:text-yellow-400 underline transition-colors"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="text-xs text-white/50 hover:text-yellow-400 underline transition-colors"
        >
          Terms of Service
        </Link>
      </div>

      <footer className="mt-8 text-center text-xs text-white/40">
        © Cornerstone Church, Mandeville, LA – The Busy Christian • v {APP_VERSION}
      </footer>

      {showKeywordResults && (
        <KeywordSearchResults
          keyword={searchedKeyword}
          onClose={() => setShowKeywordResults(false)}
          onSelectPassage={handleKeywordResultSelect}
        />
      )}
</main>
</>
  );

  // iOS Capacitor: Skip auth for testing
  if (isIOSCapacitor) {
    return pageContent;
  }

  // Web: Require authentication
  return (
    <RequireAuth>
      <Paywall>
        {pageContent}
      </Paywall>
    </RequireAuth>
  );
}