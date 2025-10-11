// app/page.tsx
"use client";

import type { JSX } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import { useStudyStyle } from "./hooks/useStudyStyle";
import { useStudyJourney } from "./hooks/useStudyJourney";
import OnboardingModal from "./components/OnboardingModal";
import { StyleSelectorModal } from "./components/StyleSelectorModal";
import { PastoralInsightBanner } from "./components/PastoralInsightBanner";
import { CheckInModal } from "./components/CheckInModal";
import { JourneyDashboard } from "./components/JourneyDashboard";
import { SettingsModal } from "./components/SettingsModal";
import { CrisisModal } from "./components/CrisisModal";
import { progressTracker } from '@/lib/progressTracker';

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "2.1";
const DISCLAIMER = "AI-assisted, human-directed. Always think for yourself.";
const ESV_NOTICE =
  "Scripture quotations are from The Holy Bible, English Standard Version (ESV)®. " +
  "Copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. " +
  "Used by permission. All rights reserved. ESV® is a registered trademark of Good News Publishers.";

const [showEmailModal, setShowEmailModal] = useState(false);
const [emailInput, setEmailInput] = useState("");
const [emailSubmitting, setEmailSubmitting] = useState(false);
const [emailSuccess, setEmailSuccess] = useState(false);
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

async function lexplainFetch(surface: string, book?: string) {
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
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {});
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
  const footer = `© Douglas M. Gilford – The Busy Christian • v${APP_VERSION}`;
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
  const [savedStudies, setSavedStudies] = useState<SavedStudy[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [currentNote, setCurrentNote] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [topLoading, setTopLoading] = useState(false);
  const [esvLoading, setEsvLoading] = useState(false);
  const [hoverLoading, setHoverLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusWord, setStatusWord] = useState("");
  const [passageRef, setPassageRef] = useState("");
  const [theme, setTheme] = useState("");
  const [passageOutline, setPassageOutline] = useState<any | null>(null);
  const [themeOutline, setThemeOutline] = useState<any | null>(null);
  const [combinedOutline, setCombinedOutline] = useState<any | null>(null);
  const [topError, setTopError] = useState<string | null>(null);
  const [bpRef, setBpRef] = useState("");
  const [bpText, setBpText] = useState("");
  const [bpError, setBpError] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<{ lemma: string; strongs: string; plain: string } | null>(null);
  const [popoverPinned, setPopoverPinned] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState("");
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const statusWords = ["Fetching…", "Researching…", "Synthesizing…", "Formatting…", "Ready"];

  const { style: displayStyle, hydrated } = useStudyStyle();
  const { pattern, insight, showCheckIn, dismissCheckIn, refresh: refreshJourney } = useStudyJourney();

  useEffect(() => {
    if (insight && insight.priority >= 100) {
      setShowCrisisModal(true);
    }
  }, [insight]);

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
    const saved = localStorage.getItem("bc-saved-studies");
    if (saved) {
      try {
        setSavedStudies(JSON.parse(saved));
      } catch (e) {
        setSavedStudies([]);
      }
    }
  }, []);
  
  useEffect(() => {
    const savedName = localStorage.getItem("bc-user-name");
    const savedStyle = localStorage.getItem("bc-style");
    
    if (savedName && savedStyle) {
      setUserName(savedName);
      setIsOnboarded(true);
    } else {
      setShowOnboarding(true);
    }
  }, []);
  
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

  const loadSavedStudy = (study: SavedStudy) => {
    if (study.type === "passage" || study.type === "combined") {
      setPassageRef(study.reference);
    }
    if (study.type === "theme") {
      setTheme(study.reference);
    }
    setShowHistory(false);
    
    // ✅ Track progress when loading saved studies
    progressTracker.checkAndNotifyProgress();
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
  
}; // End of onSubmit

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

return (
  // ... your JSX starts here
    // Add this function after onSubmit and before the return statement

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
        if (response.ok) {
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
  // After progress tracking, check if first study
const studies = typeof window !== 'undefined' 
? JSON.parse(localStorage.getItem("bc-saved-studies") || "[]")
: [];

if (studies.length === 1) {
// Show email modal after first study
setTimeout(() => setShowEmailModal(true), 2000);
}
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
        return;
      }
  
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
    } catch (e: any) {
      setTopError(e?.message ?? "Failed to generate outline.");
    } finally {
      setTopLoading(false);
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

  const requestHover = (surface: string) => {
    setHoverLoading(true);
    
    const rawBook = bpRef.trim().split(/\s+/)[0];
    const bookName = rawBook.charAt(0).toUpperCase() + rawBook.slice(1).toLowerCase();
    
    lexplainFetch(surface, bookName)
      .then((d) => setHoverData(d))
      .finally(() => setHoverLoading(false));
  };

  const onWordEnter = (e: React.MouseEvent, w: string) => {
    if (popoverPinned) return;
    setActiveWord(w);

    const calculatePosition = () => {
      const popoverWidth = 360;
      const popoverHeight = 220;
      const margin = 16;

      let x = e.clientX;
      let y = e.clientY + 12;

      if (x + popoverWidth > window.innerWidth - margin) {
        x = window.innerWidth - popoverWidth - margin;
      }

      if (x < margin) {
        x = margin;
      }

      if (y + popoverHeight > window.innerHeight - margin) {
        y = e.clientY - popoverHeight - 12;
      }

      if (y < margin) {
        y = margin;
      }

      return { x, y };
    };

    setPopoverPos(calculatePosition());
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => requestHover(w), 50);
  };

  const onWordLeave = () => {
    if (popoverPinned) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setActiveWord(null);
    setHoverData(null);
    setPopoverPos(null);
  };

  const onWordClick = (e: React.MouseEvent, w: string) => {
    e.preventDefault();
    if (popoverPinned && activeWord === w) {
      setPopoverPinned(false);
      onWordLeave();
    } else {
      setPopoverPinned(true);
      setActiveWord(w);

      const calculatePosition = () => {
        const popoverWidth = 360;
        const popoverHeight = 220;
        const margin = 16;

        let x = e.clientX;
        let y = e.clientY + 12;

        if (x + popoverWidth > window.innerWidth - margin) {
          x = window.innerWidth - popoverWidth - margin;
        }

        if (x < margin) {
          x = margin;
        }

        if (y + popoverHeight > window.innerHeight - margin) {
          y = e.clientY - popoverHeight - 12;
        }

        if (y < margin) {
          y = margin;
        }

        return { x, y };
      };

      setPopoverPos(calculatePosition());
      requestHover(w);
    }
  };

  const bpFetch = () => {
    const cleaned = bpRef.trim();
    if (!cleaned) return;
    setBpError(null);
    setEsvLoading(true);
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

  const handleOnboardingComplete = (name: string, style: string) => {
    localStorage.setItem("bc-user-name", name);
    localStorage.setItem("bc-style", style);
    setUserName(name);
    setIsOnboarded(true);
    setShowOnboarding(false);
    window.location.reload();
  };

  return (
    <main className="container">
      {insight && insight.priority < 100 && !passageOutline && !themeOutline && !combinedOutline && (
        <PastoralInsightBanner
          message={insight.message}
          emoji={insight.emoji}
          type={insight.type}
          onDismiss={() => refreshJourney()}
        />
      )}

      {isOnboarded && !passageRef && !theme && !passageOutline && !themeOutline && !combinedOutline && (
        <section className="card mb-8 border-2 border-yellow-400/30">
          <div className="text-center mb-6">
            <h2 className={`${playfair.className} text-3xl font-semibold mb-2 text-yellow-400`}>
              Welcome back, {userName}! 👋
            </h2>
            <p className="text-white/80 text-lg">
              Ready to dive into Scripture today?
            </p>
          </div>

          {pattern && pattern.totalStudies > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowJourney(!showJourney)}
                className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-3"
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
        </section>
      )}

      <section className="card mb-8">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
          <div className="flex-1">
            <p className="text-sm text-white/70">What passage, topic or question can we research today?</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStyleModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400/20 transition-colors group"
              title="Change your study style"
            >
              <span className="text-base">{displayIcon}</span>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wide text-yellow-400/70">Your Style</div>
                <div className="text-sm font-medium text-yellow-400 group-hover:text-yellow-300" suppressHydrationWarning>
                  {displayStyle}
                </div>
              </div>
              <svg className="w-4 h-4 text-yellow-400/50 group-hover:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="Settings & Privacy"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

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
            <button id="submit-btn" onClick={onSubmit} disabled={topLoading} className="btn">
              {topLoading ? "Working…" : "Submit"}
            </button>
            {(passageRef || theme) && (
              <button
                onClick={handleSave}
                className="rounded-lg bg-yellow-400/20 border border-yellow-400 px-4 py-2 text-sm hover:bg-yellow-400/30 transition-colors flex items-center gap-1"
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
              className="ml-auto btn"
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
            <div className="h-4 text-center text-xs text-white/60">
              {progress > 0 ? statusWord : " "}
            </div>
          </div>

          {topError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{topError}</div>
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

          {(passageRef || theme) && (
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

      <section id="ol-study" className="card">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label htmlFor="bpPassage" className="mb-2 block text-sm text-white/80">
              Passage (ESV)
            </label>
            <input
              id="bpPassage"
              placeholder="e.g., John 11:25"
              value={bpRef}
              onChange={(e) => setBpRef(e.target.value)}
              onKeyDown={onBottomKey}
              className="input"
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={bpFetch} disabled={esvLoading} className="btn">
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
            <Link
              href={`/deep-study?passage=${encodeURIComponent(bpRef.trim())}`}
              className={`rounded-lg bg-yellow-400/20 border border-yellow-400 px-4 py-2 text-sm hover:bg-yellow-400/30 transition-colors ${!bpRef.trim() ? "opacity-50 pointer-events-none" : ""}`}
            >
              Study Deeper
            </Link>
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
          <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {bpError}
          </div>
        )}

        <div className="mt-5">
          {!bpText ? (
            <p className="text-white/60 text-sm">
              Enter a reference and click <span className="font-semibold">Get ESV</span>. Hover any word for a
              simple, plain-English original language note; click to pin/unpin. Use{" "}
              <span className="font-semibold">Study Deeper</span> for commentaries and cross-references.
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
                    className="cursor-help rounded-sm bg-transparent px-0.5 hover:bg-white/10 transition-colors"
                  >
                    {t}
                  </span>
                );
              })}
            </article>
          )}
        </div>
      </section>

      {activeWord && popoverPos && (
        <div
          className="hover-popover pointer-events-none fixed z-50 w-[360px] max-w-[90vw] rounded-lg border border-white/15 bg-slate-950/95 p-3 text-sm shadow-xl backdrop-blur"
          style={{ left: popoverPos.x, top: popoverPos.y }}
        >
          <div className="pointer-events-auto">
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="text-xs uppercase tracking-wide text-white/60">Word for Today</div>
              <button onClick={() => setPopoverPinned((p) => !p)} className="btn text-xs px-2 py-1">
                {popoverPinned ? "Unpin" : "Pin"}
              </button>
            </div>

            <div className="text-base font-semibold">{activeWord}</div>
            <div className="mt-1 grid grid-cols-[80px_1fr] gap-x-3 gap-y-1">
              <div className="text-xs text-white/60">Lemma</div>
              <div className="text-sm">{hoverData?.lemma ?? "…"}</div>
              <div className="text-xs text-white/60">Strong's #</div>
              <div className="text-sm">{hoverData?.strongs ?? "…"}</div>
            </div>

            <div className="mt-2 border-t border-white/10 pt-2 text-sm leading-6">
              {hoverData?.plain ?? (hoverLoading ? "Thinking…" : "—")}
            </div>
          </div>
        </div>
      )}

      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
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

      <p id="disclaimer" className="mt-10 text-center text-xs italic text-white/50">
        {DISCLAIMER}
      </p>
      <p className="mt-6 px-4 text-center text-[10px] leading-4 text-white/40">
        {ESV_NOTICE}
      </p>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setShowSettings(true)}
          className="text-xs text-white/50 hover:text-yellow-400 underline transition-colors"
        >
          Manage Your Data & Privacy
        </button>
      </div>
{/* Email Signup Modal */}
{showEmailModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
      {emailSuccess ? (
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            You're subscribed!
          </h2>
          <p className="text-gray-600">Check your email for confirmation.</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Loved this study guide?
            </h2>
            <p className="text-gray-600">
              Get notified when we add new features, translations, and tools!
            </p>
          </div>

          <input
            type="email"
            placeholder="Enter your email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={emailSubmitting}
          />

          <div className="flex gap-3">
            <button
              onClick={handleEmailSignup}
              disabled={emailSubmitting || !emailInput}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {emailSubmitting ? "Subscribing..." : "Yes, keep me updated"}
            </button>
            <button
              onClick={() => setShowEmailModal(false)}
              disabled={emailSubmitting}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              No thanks
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Optional - you can still use the app anonymously. Unsubscribe anytime.
          </p>
        </>
      )}
    </div>
  </div>
)}
      <footer className="mt-8 text-center text-xs text-white/40">
        © Douglas M. Gilford – The Busy Christian • v{APP_VERSION}
      </footer>
    </main>
  );
}