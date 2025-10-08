'use client';
import { useState } from 'react';

type Props = {
  content: string;
  onClose?: () => void;
  title?: string;
};

export default function PreviewPanel({ content, onClose, title = 'ESV Preview' }: Props) {
  const [toast, setToast] = useState<string | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content || '');
      setToast('Copied');
    } catch {
      setToast('Copy failed');
    } finally {
      setTimeout(() => setToast(null), 1100);
    }
  }

  return (
    <div className="mt-4 rounded-none sm:rounded-2xl border border-white/10 bg-white/5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold opacity-90">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="rounded border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            Copy
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Body (scrolls if long) */}
      <div className="px-4 py-3 max-h-[70dvh] overflow-y-auto">
        <pre className="whitespace-pre-wrap leading-7 text-[0.95rem] text-white/90">
          {content}
        </pre>
      </div>

      {/* Tiny toast */}
      {toast && (
        <div className="px-4 pb-3 text-xs opacity-80">
          {toast}
        </div>
      )}
    </div>
  );
}