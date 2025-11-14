// app/components/StudyReminderBanner.tsx
"use client";

interface StudyReminderBannerProps {
  userName: string;
  daysSinceLastStudy: number;
  onDismiss: () => void;
  onStartStudy: () => void;
}

export function StudyReminderBanner({
  userName,
  daysSinceLastStudy,
  onDismiss,
  onStartStudy,
}: StudyReminderBannerProps) {
  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDismiss();
  };

  const getMessage = () => {
    if (daysSinceLastStudy >= 7) {
      return {
        title: `We've missed you, ${userName}! 🙏`,
        message: `It's been ${daysSinceLastStudy} days since your last study. The Word is waiting for you!`,
        color: "from-orange-500/20 to-red-500/20 dark:from-orange-500/20 dark:to-red-500/20 border-orange-500/50 dark:border-orange-500/30 bg-orange-50/50 dark:bg-transparent",
        textColor: "text-orange-700 dark:text-orange-300",
      };
    } else if (daysSinceLastStudy >= 3) {
      return {
        title: `Time for Scripture? 🌅`,
        message: `It's been ${daysSinceLastStudy} days. Let's dive back into God's Word together.`,
        color: "from-yellow-500/20 to-orange-500/20 dark:from-yellow-500/20 dark:to-orange-500/20 border-yellow-500/50 dark:border-yellow-500/30 bg-yellow-50/50 dark:bg-transparent",
        textColor: "text-yellow-700 dark:text-yellow-300",
      };
    } else {
      return {
        title: `Keep your streak going! 🔥`,
        message: `Ready for another powerful study session, ${userName}?`,
        color: "from-blue-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 border-blue-500/50 dark:border-blue-500/30 bg-blue-50/50 dark:bg-transparent",
        textColor: "text-blue-700 dark:text-blue-300",
      };
    }
  };

  const { title, message, color, textColor } = getMessage();

  return (
    <div
      className={`mb-6 rounded-xl border bg-gradient-to-r ${color} p-6 transition-opacity duration-200`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">📖</div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>
            {title}
          </h3>
          <p className="text-slate-700 dark:text-white/80 mb-4">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onStartStudy}
              className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-400 dark:hover:bg-yellow-300 text-white dark:text-slate-900 font-semibold transition-colors"
            >
              Start Studying Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-500 hover:text-slate-700 dark:text-white/60 dark:hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}