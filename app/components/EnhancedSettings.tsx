// app/components/EnhancedSettings.tsx
"use client";

import { useState, useEffect } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
});

interface EnhancedSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  currentStyle: string;
}

export function EnhancedSettings({ 
  isOpen, 
  onClose, 
  userName, 
  currentStyle 
}: EnhancedSettingsProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "data">("profile");
  
  // Profile settings
  const [name, setName] = useState(userName);
  const [studyStyle, setStudyStyle] = useState(currentStyle);
  const [studyGoal, setStudyGoal] = useState("");
  const [weeklyFrequency, setWeeklyFrequency] = useState(3);
  
  // Feature preferences
  const [showDevotional, setShowDevotional] = useState(true);
  const [showReadingPlan, setShowReadingPlan] = useState(true);
  const [enableReminders, setEnableReminders] = useState(true);
  
  // Email
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load all settings from localStorage
      setName(localStorage.getItem("bc-user-name") || "");
      setStudyStyle(localStorage.getItem("bc-style") || "Casual Devotional");
      setStudyGoal(localStorage.getItem("bc-study-goal") || "");
      setWeeklyFrequency(parseInt(localStorage.getItem("bc-weekly-frequency") || "3"));
      setShowDevotional(localStorage.getItem("bc-show-devotional") === "true");
      setShowReadingPlan(localStorage.getItem("bc-show-reading-plan") !== "false");
      setEnableReminders(localStorage.getItem("bc-enable-reminders") !== "false");
      setIsSubscribed(localStorage.getItem("bc-subscribed") === "true");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Save all settings
    localStorage.setItem("bc-user-name", name);
    localStorage.setItem("bc-style", studyStyle);
    localStorage.setItem("bc-study-goal", studyGoal);
    localStorage.setItem("bc-weekly-frequency", String(weeklyFrequency));
    localStorage.setItem("bc-show-devotional", String(showDevotional));
    localStorage.setItem("bc-show-reading-plan", String(showReadingPlan));
    localStorage.setItem("bc-enable-reminders", String(enableReminders));
    
    // Reload to apply changes
    window.location.reload();
  };

  const handleExportData = () => {
    const data = {
      profile: {
        name: localStorage.getItem("bc-user-name"),
        studyStyle: localStorage.getItem("bc-style"),
        studyGoal: localStorage.getItem("bc-study-goal"),
        weeklyFrequency: localStorage.getItem("bc-weekly-frequency"),
      },
      preferences: {
        showDevotional: localStorage.getItem("bc-show-devotional"),
        showReadingPlan: localStorage.getItem("bc-show-reading-plan"),
        enableReminders: localStorage.getItem("bc-enable-reminders"),
      },
      history: {
        savedStudies: localStorage.getItem("bc-saved-studies"),
        notes: localStorage.getItem("bc-notes"),
        progress: localStorage.getItem("bc-progress"),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `busy-christian-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = () => {
    if (confirm("Are you sure? This will delete ALL your data including study history and notes.")) {
      // Clear all app data
      const keysToDelete = Object.keys(localStorage).filter(key => key.startsWith("bc-"));
      keysToDelete.forEach(key => localStorage.removeItem(key));
      
      alert("All data deleted. You'll be redirected to start fresh.");
      window.location.href = "/";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl border-2 border-white/20 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className={`${playfair.className} text-2xl font-bold text-yellow-400`}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { key: "profile" as const, label: "Profile", icon: "👤" },
            { key: "preferences" as const, label: "Preferences", icon: "⚙️" },
            { key: "data" as const, label: "Data & Privacy", icon: "🔒" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-white/80 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-400/50"
                />
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-2">Study Style</label>
                <div className="space-y-2">
                  {[
                    { value: "Casual Devotional", emoji: "☕", desc: "Quick, encouraging insights" },
                    { value: "Bible Student", emoji: "📖", desc: "Deeper exploration" },
                    { value: "Pastor/Teacher", emoji: "👨‍🏫", desc: "Comprehensive analysis" },
                  ].map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setStudyStyle(style.value)}
                      className={`w-full text-left rounded-lg border p-4 transition-all ${
                        studyStyle === style.value
                          ? "border-yellow-400 bg-yellow-400/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{style.emoji}</span>
                        <div>
                          <div className="font-medium">{style.value}</div>
                          <div className="text-xs text-white/60">{style.desc}</div>
                        </div>
                        {studyStyle === style.value && (
                          <span className="ml-auto text-yellow-400">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-2">Study Goal</label>
                <textarea
                  value={studyGoal}
                  onChange={(e) => setStudyGoal(e.target.value)}
                  placeholder="What's your main goal for Bible study?"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50 min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-4">
                  Weekly Study Goal: {weeklyFrequency}x per week
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={weeklyFrequency}
                  onChange={(e) => setWeeklyFrequency(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />
                <div className="flex justify-between text-xs text-white/50 mt-2">
                  <span>1x/week</span>
                  <span>Daily</span>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div className="space-y-4">
                {[
                  {
                    key: "showDevotional",
                    value: showDevotional,
                    setter: setShowDevotional,
                    emoji: "🌅",
                    title: "Daily Devotional",
                    desc: "Show Our Daily Bread devotional",
                  },
                  {
                    key: "showReadingPlan",
                    value: showReadingPlan,
                    setter: setShowReadingPlan,
                    emoji: "📖",
                    title: "Reading Plan Widget",
                    desc: "Display reading plan on homepage",
                  },
                  {
                    key: "enableReminders",
                    value: enableReminders,
                    setter: setEnableReminders,
                    emoji: "🔔",
                    title: "Study Reminders",
                    desc: "Gentle nudges when inactive",
                  },
                ].map((pref) => (
                  <div
                    key={pref.key}
                    className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex gap-3">
                      <span className="text-2xl">{pref.emoji}</span>
                      <div>
                        <div className="font-medium">{pref.title}</div>
                        <div className="text-sm text-white/60">{pref.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => pref.setter(!pref.value)}
                      className={`w-12 h-6 rounded-full transition-all relative ${
                        pref.value ? "bg-yellow-400" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          pref.value ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10">
                <h3 className="font-semibold mb-3">Email Notifications</h3>
                {isSubscribed ? (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Subscribed to updates</span>
                    </div>
                    <p className="text-sm text-white/70">
                      You'll receive occasional emails about new features and resources.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50"
                    />
                    <button
                      onClick={async () => {
                        if (email.trim()) {
                          try {
                            await fetch("/api/subscribe", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email, source: "settings" }),
                            });
                            localStorage.setItem("bc-subscribed", "true");
                            setIsSubscribed(true);
                          } catch (error) {
                            alert("Subscription failed. Please try again.");
                          }
                        }
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-yellow-400/20 border border-yellow-400 text-yellow-400 hover:bg-yellow-400/30 transition-colors"
                    >
                      Subscribe to Updates
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data & Privacy Tab */}
          {activeTab === "data" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Your Data</h3>
                <p className="text-sm text-white/70 mb-4">
                  All your data is stored locally on your device. We don't have access to your study history, notes, or preferences unless you subscribe to email updates.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📥</span>
                    <div>
                      <div className="font-medium">Export My Data</div>
                      <div className="text-sm text-white/60">Download all your studies, notes, and settings</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleDeleteData}
                  className="w-full rounded-lg border border-red-500/30 bg-red-500/10 p-4 hover:bg-red-500/20 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🗑️</span>
                    <div>
                      <div className="font-medium text-red-400">Delete All Data</div>
                      <div className="text-sm text-white/60">Permanently remove everything</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h3 className="font-semibold mb-2">Privacy Policy</h3>
                <div className="text-sm text-white/70 space-y-2">
                  <p>• We use localStorage for all app functionality</p>
                  <p>• No tracking, analytics, or third-party cookies</p>
                  <p>• Email addresses (if provided) are only used for updates</p>
                  <p>• We never sell or share your data</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 rounded-lg bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}