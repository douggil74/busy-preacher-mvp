"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";

type Entry = {
  term?: string;
  language?: "Greek" | "Hebrew";
  strongs?: string;
  definition?: string;
  error?: string;
  needsMoreInfo?: boolean;
};

type Anchor = { x: number; y: number; w: number; h: number };

type Ctx = {
  openTerm: string | null;
  setOpenTerm: (t: string | null) => void;
  anchor: Anchor | null;
  setAnchor: (a: Anchor | null) => void;
  entry: Entry | null;
  setEntry: (e: Entry | null) => void;
  isMobile: boolean;

  // cross-element hover coordination (desktop only)
  scheduleClose: () => void;
  cancelClose: () => void;
};

const PopCtx = createContext<Ctx | null>(null);

export const LexiconPopover = {
  Provider: ({ children }: { children: React.ReactNode }) => {
    const [openTerm, setOpenTerm] = useState<string | null>(null);
    const [anchor, setAnchor] = useState<Anchor | null>(null);
    const [entry, setEntry] = useState<Entry | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // 🔧 FIXED: Detect mobile primarily by screen width (works in DevTools mobile mode)
    useEffect(() => {
      const checkMobile = () => {
        // Primary: screen width (works in DevTools mobile emulation)
        // Secondary: touch support (works on real devices)
        const mobile = window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        console.log('🔍 Mobile detection:', mobile, {
          width: window.innerWidth,
          hasTouch: 'ontouchstart' in window,
          touchPoints: navigator.maxTouchPoints
        });
        setIsMobile(mobile);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // shared close timer so Trigger and Panel can coordinate hover-out closing (desktop only)
    const closeTimer = useRef<number | null>(null);

    const scheduleClose = () => {
      if (isMobile) return; // Don't auto-close on mobile
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      closeTimer.current = window.setTimeout(() => {
        setOpenTerm(null);
        setAnchor(null);
        setEntry(null);
        closeTimer.current = null;
      }, 120);
    };

    const cancelClose = () => {
      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    };

    const value = useMemo<Ctx>(
      () => ({
        openTerm,
        setOpenTerm,
        anchor,
        setAnchor,
        entry,
        setEntry,
        isMobile,
        scheduleClose,
        cancelClose,
      }),
      [openTerm, anchor, entry, isMobile]
    );

    return <PopCtx.Provider value={value}>{children}</PopCtx.Provider>;
  },

  Trigger: ({ term, children }: { term: string; children: React.ReactNode }) => {
    const ctx = useContext(PopCtx)!;
    const ref = useRef<HTMLSpanElement>(null);

    function openPopover() {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      ctx.setAnchor({
        x: r.left + window.scrollX,
        y: r.top + window.scrollY,
        w: r.width,
        h: r.height,
      });
      ctx.setOpenTerm(term);
      ctx.setEntry(null);
      console.log('✅ Opened popover for:', term, 'isMobile:', ctx.isMobile);
    }

    function closePopover() {
      ctx.setOpenTerm(null);
      ctx.setAnchor(null);
      ctx.setEntry(null);
      console.log('❌ Closed popover');
    }

    function handleMouseEnter() {
      if (ctx.isMobile) return; // Ignore hover on mobile
      ctx.cancelClose();
      openPopover();
    }

    function handleMouseLeave() {
      if (ctx.isMobile) return; // Ignore hover on mobile
      ctx.scheduleClose();
    }

    function handleClick(e: React.MouseEvent) {
      console.log('👆 Click event, isMobile:', ctx.isMobile);
      if (ctx.isMobile) {
        e.preventDefault();
        if (ctx.openTerm === term) {
          closePopover();
        } else {
          openPopover();
        }
      } else {
        // Desktop: copy the word on click
        navigator.clipboard.writeText(term).catch(() => {});
      }
    }

    return (
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="underline underline-offset-4 decoration-[1.5px] hover:opacity-80 cursor-pointer"
        style={{ textDecorationColor: "#FFD966" }}
        role="button"
        data-lexicon-trigger="true"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (ctx.openTerm === term) {
              closePopover();
            } else {
              openPopover();
            }
          }
        }}
      >
        {children}
      </span>
    );
  },

  Portal: () => {
    const ctx = useContext(PopCtx)!;
    const panelRef = useRef<HTMLDivElement>(null);
    const [busy, setBusy] = useState(false);
    const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
    const [countdown, setCountdown] = useState(5);

    // Fetch entry when term opens/changes
    useEffect(() => {
      if (!ctx.openTerm) return;
      setBusy(true);
      ctx.setEntry(null);

      let aborted = false;
      (async () => {
        try {
          const res = await fetch("/api/lexicon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: ctx.openTerm }),
          });
          const json = (await res.json()) as Entry;
          if (!aborted) ctx.setEntry(json);
        } catch (e: any) {
          if (!aborted) ctx.setEntry({ error: e?.message || "Lookup failed" });
        } finally {
          if (!aborted) setBusy(false);
        }
      })();
      return () => {
        aborted = true;
      };
    }, [ctx.openTerm]);

    // Recompute position after render and when content changes
    useLayoutEffect(() => {
      if (!ctx.anchor || !ctx.openTerm || !panelRef.current) {
        setPos(null);
        return;
      }

      const padding = ctx.isMobile ? 16 : 12;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxWidth = ctx.isMobile ? Math.min(340, vw - 32) : 360;
      const width = Math.min(maxWidth, vw - 32);

      const panel = panelRef.current;
      panel.style.visibility = "hidden";
      panel.style.left = "0px";
      panel.style.top = "0px";
      panel.style.width = `${width}px`;

      const height = panel.offsetHeight;

      let left = ctx.isMobile 
        ? (vw - width) / 2 + window.scrollX
        : ctx.anchor.x - 6;
      
      if (!ctx.isMobile) {
        left = Math.min(Math.max(16 + window.scrollX, left), window.scrollX + vw - width - 16);
      }

      let top = ctx.anchor.y + ctx.anchor.h + padding;
      const bottomEdge = top + height + 16;

      if (bottomEdge > window.scrollY + vh) {
        top = ctx.anchor.y - height - padding;
      }

      const minTop = window.scrollY + 16;
      const maxTop = window.scrollY + vh - height - 16;
      top = Math.min(Math.max(top, minTop), maxTop);

      setPos({ top, left, width });
      panel.style.visibility = "";
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ctx.anchor, ctx.openTerm, ctx.entry, busy, ctx.isMobile]);

    // Desktop only: Close on scroll/resize
    useEffect(() => {
      if (!ctx.openTerm || ctx.isMobile) return;
      const close = () => ctx.scheduleClose();
      window.addEventListener("scroll", close, { passive: true });
      window.addEventListener("resize", close);
      return () => {
        window.removeEventListener("scroll", close);
        window.removeEventListener("resize", close);
      };
    }, [ctx.openTerm, ctx.isMobile, ctx.scheduleClose]);

    // 🔧 FIXED: Mobile auto-fade with countdown
    useEffect(() => {
      if (!ctx.openTerm || !ctx.isMobile) {
        setCountdown(5);
        return;
      }
      
      console.log('⏰ Starting 5-second auto-close timer (mobile mode)');
      setCountdown(5);
      
      // Countdown display
      const countInterval = setInterval(() => {
        setCountdown(prev => {
          const next = prev - 1;
          console.log('⏱️ Countdown:', next);
          return next;
        });
      }, 1000);
      
      // Auto-close after 5 seconds
      const fadeTimer = setTimeout(() => {
        console.log('⏰ 5 seconds elapsed, closing popup');
        ctx.setOpenTerm(null);
        ctx.setAnchor(null);
        ctx.setEntry(null);
      }, 5000);
      
      // Close on outside click
      const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          const target = e.target as HTMLElement;
          const isWordTrigger = target.closest('[data-lexicon-trigger]');
          const isActionButton = target.closest('button:not([aria-label="Close"])');
          
          if (!isWordTrigger && !isActionButton) {
            console.log('👆 Outside click, closing popup');
            ctx.setOpenTerm(null);
            ctx.setAnchor(null);
            ctx.setEntry(null);
          }
        }
      };

      const clickTimer = setTimeout(() => {
        document.addEventListener('touchstart', handleOutsideClick);
        document.addEventListener('mousedown', handleOutsideClick);
      }, 100);

      return () => {
        clearInterval(countInterval);
        clearTimeout(fadeTimer);
        clearTimeout(clickTimer);
        document.removeEventListener('touchstart', handleOutsideClick);
        document.removeEventListener('mousedown', handleOutsideClick);
        setCountdown(5);
      };
    }, [ctx.openTerm, ctx.isMobile, ctx]);

    if (!ctx.openTerm || !ctx.anchor) return null;

    const showEssentials =
      !busy && ctx.entry && !ctx.entry.error && !ctx.entry.needsMoreInfo;

    return (
      <div
        ref={panelRef}
        onMouseEnter={ctx.isMobile ? undefined : ctx.cancelClose}
        onMouseLeave={ctx.isMobile ? undefined : ctx.scheduleClose}
        className="z-50 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-auto break-words"
        style={{
          position: "absolute",
          visibility: pos ? "visible" : "hidden",
          left: pos?.left ?? 0,
          top: pos?.top ?? 0,
          width: pos?.width ?? 360,
        }}
      >
        <div className="rounded-lg border border-white/15 bg-zinc-900 light:bg-white p-3 shadow-xl text-white light:text-black relative">
          {/* Close button - always visible */}
          <button
            onClick={() => {
              ctx.setOpenTerm(null);
              ctx.setAnchor(null);
              ctx.setEntry(null);
            }}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="flex items-center justify-between pr-8">
            <div className="text-sm">
              <span className="font-semibold">Word study</span>{" "}
              <span className="text-white/60 light:text-black/60">
                ({ctx.openTerm})
              </span>
              {ctx.isMobile && (
                <span className="ml-2 text-yellow-400 font-mono text-xs">
                  {countdown}s
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 text-sm">
            {busy && <p className="text-white/60 light:text-black/60">Looking up…</p>}
            {ctx.entry?.error && <p className="text-red-500">{ctx.entry.error}</p>}
            {showEssentials && (
              <div className="space-y-1">
                <p className="text-white/80 light:text-black/80">
                  {ctx.entry!.language && (
                    <span className="font-medium">{ctx.entry!.language}</span>
                  )}
                  {ctx.entry!.language && ctx.entry!.strongs && <span> · </span>}
                  {ctx.entry!.strongs && (
                    <span className="font-mono">Strong's {ctx.entry!.strongs}</span>
                  )}
                </p>
                {ctx.entry!.definition && (
                  <p>
                    <span className="font-medium">Definition:</span>{" "}
                    {ctx.entry!.definition}
                  </p>
                )}
              </div>
            )}
            {!busy && (!ctx.entry || ctx.entry.needsMoreInfo) && !ctx.entry?.error && (
              <p className="text-white/70 light:text-black/60">No entry found.</p>
            )}
            
            {ctx.isMobile && !busy && (
              <p className="text-white/50 light:text-black/50 text-xs mt-3 pt-2 border-t border-white/10">
                Auto-closes in {countdown}s • Tap outside to close now
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
};