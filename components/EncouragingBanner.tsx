// components/EncouragingBanner.tsx
"use client";

interface EncouragingBannerProps {
  message: string;
}

export function EncouragingBanner({ message }: EncouragingBannerProps) {
  return (
    <div className="mb-6 max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 dark:from-yellow-500/5 dark:to-orange-500/5 border-l-4 border-yellow-500/50 dark:border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">📖</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">A Word from Your Pastor</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
