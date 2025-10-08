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

  // cross-element hover coordination
  scheduleClose: () => void;
  cancelClose: () => void;
};

const PopCtx = createContext<Ctx | null>(null);

export const LexiconPopover = {
  Provider: ({ children }: { children: React.ReactNode }) => {
    const [openTerm, setOpenTerm] = useState<string | null>(null);
    const [anchor, setAnchor] = useState<Anchor | null>(null);
    const [entry, setEntry] = useState<Entry | null>(null);

    // shared close timer so Trigger and Panel can coordinate hover-out closing
    const closeTimer = useRef<number | null>(null);

    const scheduleClose = () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      closeTimer.current = window.setTimeout(() => {
        setOpenTerm(null);
        setAnchor(null);
        setEntry(null);
        closeTimer.current = null;
      }, 120); // small grace so you can move into the panel
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
        scheduleClose,
        cancelClose,
      }),
      [openTerm, anchor, entry]
    );

    return <PopCtx.Provider value={value}>{children}</PopCtx.Provider>;
  },

  // Renders a SPAN (not a button) to avoid nested <button> issues.
  // Hover shows popover; leaving schedules close; clicking copies the term.
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
    }

    function handleMouseEnter() {
      ctx.cancelClose();
      openPopover();
    }

    function handleMouseLeave() {
      ctx.scheduleClose();
    }

    function handleClick() {
      // copy the word; keep hover behavior (not sticky)
      navigator.clipboard.writeText(term).catch(() => {});
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
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
            openPopover();
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

      const padding = 12;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxWidth = 360;
      const width = Math.min(maxWidth, vw - 32); // 16px margins on both sides

      const panel = panelRef.current;
      // Temporarily place it to measure height
      panel.style.visibility = "hidden";
      panel.style.left = "0px";
      panel.style.top = "0px";
      panel.style.width = `${width}px`;

      const height = panel.offsetHeight;

      // Prefer below
      let left = ctx.anchor.x - 6;
      left = Math.min(Math.max(16 + window.scrollX, left), window.scrollX + vw - width - 16);

      let top = ctx.anchor.y + ctx.anchor.h + padding; // below
      const bottomEdge = top + height + 16;

      // If falling off bottom, put it above
      if (bottomEdge > window.scrollY + vh) {
        top = ctx.anchor.y - height - padding; // above
      }

      // Clamp top to viewport padding
      const minTop = window.scrollY + 16;
      const maxTop = window.scrollY + vh - height - 16;
      top = Math.min(Math.max(top, minTop), maxTop);

      setPos({ top, left, width });

      // restore; the real styles will be applied via state
      panel.style.visibility = "";
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ctx.anchor, ctx.openTerm, ctx.entry, busy]);

    // Close on scroll/resize (hover UX)
    useEffect(() => {
      if (!ctx.openTerm) return;
      const close = () => ctx.scheduleClose();
      window.addEventListener("scroll", close, { passive: true });
      window.addEventListener("resize", close);
      return () => {
        window.removeEventListener("scroll", close);
        window.removeEventListener("resize", close);
      };
    }, [ctx.openTerm, ctx.scheduleClose]);

    if (!ctx.openTerm || !ctx.anchor) return null;

    const showEssentials =
      !busy && ctx.entry && !ctx.entry.error && !ctx.entry.needsMoreInfo;

    return (
      <div
        ref={panelRef}
        onMouseEnter={ctx.cancelClose}
        onMouseLeave={ctx.scheduleClose}
        className="z-50 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-auto break-words"
        style={{
          position: "absolute",
          visibility: pos ? "visible" : "hidden",
          left: pos?.left ?? 0,
          top: pos?.top ?? 0,
          width: pos?.width ?? 360,
        }}
      >
        <div className="rounded-lg border border-white/15 bg-zinc-900 light:bg-white p-3 shadow-xl text-white light:text-black">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold">Word study</span>{" "}
              <span className="text-white/60 light:text-black/60">
                ({ctx.openTerm})
              </span>
            </div>
            <button
              className="text-white/60 hover:text-white light:text-black/60 light:hover:text-black"
              onClick={() => {
                ctx.setOpenTerm(null);
                ctx.setAnchor(null);
                ctx.setEntry(null);
              }}
              aria-label="Close"
            >
              ✕
            </button>
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
                    <span className="font-mono">Strong’s {ctx.entry!.strongs}</span>
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
          </div>
        </div>
      </div>
    );
  },
};