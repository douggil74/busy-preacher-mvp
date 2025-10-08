"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  anchorRef: React.RefObject<HTMLElement>;
  open: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
};

export default function Popover({
  anchorRef,
  open,
  onClose,
  className,
  children,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // ✅ Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // ✅ Close on outside click + Esc
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const p = panelRef.current;
      if (p && !p.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] grid place-items-center px-safe pt-safe pb-4 sm:pb-6 pointer-events-none">
      {/* backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 light:bg-black/15 pointer-events-auto"
      />

      {/* ✅ panel updates below */}
      <div
  ref={panelRef}
  role="dialog"
  aria-modal="true"
  className={[
    "pointer-events-auto",
    "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
    "overflow-auto break-words",
    "rounded-2xl border border-white/10 light:border-black/10",
    "bg-white/10 light:bg-black/5 backdrop-blur shadow-2xl",
    "p-4 sm:p-5 popover-panel",
    className || "",
  ].join(" ")}
>

        {children}
      </div>
    </div>,
    document.body
  );
}