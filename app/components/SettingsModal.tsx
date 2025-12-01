// app/components/SettingsModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { NotificationService } from '@/lib/notificationService';
import { useAuth } from '@/contexts/AuthContext';

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  currentStyle: string;
}

type DeleteOption = "all" | "history" | "notes" | "journey" | null;

export function SettingsModal({ isOpen, onClose, userName, currentStyle }: SettingsModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"preferences" | "account" | "data">("preferences");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteOption, setDeleteOption] = useState<DeleteOption>(null);
  const [confirmText, setConfirmText] = useState("");
  
  // Onboarding preferences
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studyStyle, setStudyStyle] = useState<"Casual Devotional" | "Bible Student" | "Pastor/Teacher">("Casual Devotional");
  const [studyGoal, setStudyGoal] = useState("");
  const [weeklyFrequency, setWeeklyFrequency] = useState(3);
  const [showDevotional, setShowDevotional] = useState(true);
  const [showReadingPlan, setShowReadingPlan] = useState(true);
  const [enableReminders, setEnableReminders] = useState(true);
  
  const [notificationPrefs, setNotificationPrefs] = useState(NotificationService.getPreferences());

  useEffect(() => {
    if (isOpen) {
      // Load all preferences
      setName(localStorage.getItem("bc-user-name") || "");
      setEmail(localStorage.getItem("bc-user-email") || "");
      setStudyStyle((localStorage.getItem("bc-style") as any) || "Casual Devotional");
      setStudyGoal(localStorage.getItem("bc-study-goal") || "");
      setWeeklyFrequency(Number(localStorage.getItem("bc-weekly-frequency")) || 3);
      
      const savedDevotional = localStorage.getItem("bc-show-devotional");
      setShowDevotional(savedDevotional === "true" || savedDevotional === null);
      
      const savedReadingPlan = localStorage.getItem("bc-show-reading-plan");
      setShowReadingPlan(savedReadingPlan === "true" || savedReadingPlan === null);
      
      const savedReminders = localStorage.getItem("bc-enable-reminders");
      setEnableReminders(savedReminders === "true" || savedReminders === null);
      
      setNotificationPrefs(NotificationService.getPreferences());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSavePreferences = async () => {
    // Capitalize name properly
    const capitalizedName = name
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Save all preferences to localStorage
    localStorage.setItem("bc-user-name", capitalizedName);
    localStorage.setItem("bc-user-email", email);
    localStorage.setItem("bc-style", studyStyle);
    localStorage.setItem("bc-study-goal", studyGoal);
    localStorage.setItem("bc-weekly-frequency", String(weeklyFrequency));
    localStorage.setItem("bc-show-devotional", String(showDevotional));
    localStorage.setItem("bc-show-reading-plan", String(showReadingPlan));
    localStorage.setItem("bc-enable-reminders", String(enableReminders));

    if (!showDevotional) {
      localStorage.removeItem("bc-devotional-last-shown");
    }

    // Also save to Firestore if user is logged in
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
              studyStyle: studyStyle,
              studyGoal: studyGoal,
              weeklyFrequency: weeklyFrequency,
              enableDevotional: showDevotional,
              enableReadingPlan: showReadingPlan,
              enableReminders: enableReminders,
            }
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Failed to save to Firestore:', error);
      }
    }

    // Reload to apply changes immediately
    window.location.reload();
  };

  const handleDelete = () => {
    if (!deleteOption) return;

    switch (deleteOption) {
      case "all":
        localStorage.clear();
        window.location.reload();
        break;

      case "history":
        localStorage.removeItem("bc-saved-studies");
        alert("Study history cleared!");
        setShowDeleteConfirm(false);
        setConfirmText("");
        break;

      case "notes":
        localStorage.removeItem("bc-notes");
        alert("Notes cleared!");
        setShowDeleteConfirm(false);
        setConfirmText("");
        break;

      case "journey":
        localStorage.removeItem("bc-saved-studies");
        localStorage.removeItem("bc-check-in-responses");
        alert("Journey data cleared! Your account settings remain.");
        setShowDeleteConfirm(false);
        setConfirmText("");
        break;
    }

    if (deleteOption !== "all") {
      window.location.reload();
    }
  };

  const initiateDelete = (option: DeleteOption) => {
    setDeleteOption(option);
    setShowDeleteConfirm(true);
  };

  const getDataStats = () => {
    const studies = JSON.parse(localStorage.getItem("bc-saved-studies") || "[]");
    const notes = JSON.parse(localStorage.getItem("bc-notes") || "[]");
    const checkIns = JSON.parse(localStorage.getItem("bc-check-in-responses") || "[]");

    return {
      studies: studies.length,
      notes: notes.length,
      checkIns: checkIns.length,
    };
  };

  const stats = getDataStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          border: '1px solid var(--card-border)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid var(--card-border)' }}
        >
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--accent-color)' }}>
            Settings & Privacy
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <button
            onClick={() => setActiveTab("preferences")}
            className="flex-1 px-6 py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === "preferences" ? 'var(--accent-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === "preferences" ? '2px solid var(--accent-color)' : 'none',
            }}
          >
            Study Preferences
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className="flex-1 px-6 py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === "account" ? 'var(--accent-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === "account" ? '2px solid var(--accent-color)' : 'none',
            }}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className="flex-1 px-6 py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === "data" ? 'var(--accent-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === "data" ? '2px solid var(--accent-color)' : 'none',
            }}
          >
            Data & Privacy
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STUDY PREFERENCES TAB */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">📖 Study Settings</h3>
                
                {/* Study Style */}
                <div className="space-y-3 mb-6">
                  <label className="text-sm font-medium text-white/80">Study Style</label>
                  <div className="space-y-2">
                    {[
                      { value: "Casual Devotional", emoji: "☕", desc: "Quick, encouraging insights" },
                      { value: "Bible Student", emoji: "📖", desc: "Deeper exploration with context" },
                      { value: "Pastor/Teacher", emoji: "👨‍🏫", desc: "Comprehensive analysis" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setStudyStyle(option.value as any)}
                        className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
                          studyStyle === option.value
                            ? "border-yellow-400 bg-yellow-400/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{option.emoji}</span>
                          <div className="flex-1">
                            <div className="font-medium text-white">{option.value}</div>
                            <div className="text-xs text-white/60">{option.desc}</div>
                          </div>
                          {studyStyle === option.value && (
                            <span className="text-yellow-400">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Study Goal */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/80 mb-2">Study Goal</label>
                  <input
                    type="text"
                    value={studyGoal}
                    onChange={(e) => setStudyGoal(e.target.value)}
                    placeholder="What's your study goal?"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                {/* Weekly Frequency */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Weekly Study Frequency: <span className="text-yellow-400">{weeklyFrequency}x/week</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={weeklyFrequency}
                    onChange={(e) => setWeeklyFrequency(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-1">
                    <span>1x/week</span>
                    <span>Daily</span>
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">⚙️ Features</h3>
                <div className="space-y-3">
                  {[
                    { key: "devotional", label: "Daily Devotional", emoji: "🌅", value: showDevotional, setter: setShowDevotional },
                    { key: "readingPlan", label: "Reading Plan Widget", emoji: "📖", value: showReadingPlan, setter: setShowReadingPlan },
                    { key: "reminders", label: "Study Reminders", emoji: "🔔", value: enableReminders, setter: setEnableReminders },
                  ].map((feature) => (
                    <button
                      key={feature.key}
                      onClick={() => feature.setter(!feature.value)}
                      className="w-full text-left rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{feature.emoji}</span>
                          <span className="text-white">{feature.label}</span>
                        </div>
                        <div
                          className={`w-12 h-6 rounded-full transition-all relative ${
                            feature.value ? "bg-yellow-400" : "bg-white/20"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                              feature.value ? "left-7" : "left-1"
                            }`}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSavePreferences}
                className="w-full py-3 rounded-lg bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300 transition-colors"
              >
                💾 Save Preferences
              </button>
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Your Profile</h3>
                
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email (optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  {/* Current Style Display */}
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-white/60 mb-1">Current Study Style</div>
                    <div className="text-lg text-white">{currentStyle}</div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-white/60 mb-1">Data Storage</div>
                    <div className="text-sm text-white/80">
                      All your data is stored locally in your browser. Nothing is sent to our servers.
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSavePreferences}
                  className="w-full mt-6 py-3 rounded-lg bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300 transition-colors"
                >
                  💾 Save Profile
                </button>
              </div>

              {/* Notifications Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">🔔 Notifications</h3>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-white mb-1">Study Reminders</div>
                      <div className="text-sm text-white/70">
                        Get gentle encouragement when you haven't studied in a while
                      </div>
                    </div>
                    <div
                      className={`w-12 h-6 rounded-full transition-all relative ${
                        notificationPrefs.enabled ? "bg-yellow-400" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          notificationPrefs.enabled ? "left-7" : "left-1"
                        }`}
                      />
                    </div>
                  </div>
                  {notificationPrefs && (
                    <div className="text-xs text-white/60">
                      Study reminders: {notificationPrefs.studyReminders ? '✓ On' : '✗ Off'}
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription & Billing Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">💳 Subscription & Billing</h3>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  {user ? (
                    <>
                      <p className="text-sm text-white/70 mb-4">
                        View your subscription status, payment method, and billing history.
                      </p>
                      <a
                        href="/account"
                        onClick={onClose}
                        className="block w-full text-center py-3 rounded-lg bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300 transition-colors"
                      >
                        Manage Subscription
                      </a>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-white/70 mb-4">
                        Sign in to manage your subscription and billing.
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          router.push('/');
                        }}
                        className="block w-full text-center py-3 rounded-lg bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300 transition-colors"
                      >
                        Sign In
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DATA & PRIVACY TAB */}
          {activeTab === "data" && !showDeleteConfirm && (
            <div className="space-y-6">
              {/* Data Overview */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Your Data</h3>
                <p className="text-sm text-white/60 mb-4">
                  Everything is stored locally in your browser. We don't collect or transmit your personal data.
                </p>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.studies}</div>
                    <div className="text-xs text-white/60">Studies</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.notes}</div>
                    <div className="text-xs text-white/60">Notes</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.checkIns}</div>
                    <div className="text-xs text-white/60">Check-ins</div>
                  </div>
                </div>
              </div>

              {/* Clear Section Header */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Delete Your Data</h3>
                <p className="text-sm text-white/60 mb-4">
                  Choose what you want to remove. All deletions are permanent and cannot be undone.
                </p>
              </div>

              {/* Delete Options */}
              <div className="space-y-3">
                <button
                  onClick={() => initiateDelete("history")}
                  className="w-full text-left p-4 rounded-xl border-2 border-orange-500/30 bg-orange-500/10 hover:border-orange-500/50 hover:bg-orange-500/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🕐</div>
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">Clear Study History</div>
                      <div className="text-sm text-white/70">
                        Remove your {stats.studies} saved studies
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => initiateDelete("notes")}
                  className="w-full text-left p-4 rounded-xl border-2 border-orange-500/30 bg-orange-500/10 hover:border-orange-500/50 hover:bg-orange-500/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📝</div>
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">Clear All Notes</div>
                      <div className="text-sm text-white/70">
                        Delete all {stats.notes} personal notes
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => initiateDelete("journey")}
                  className="w-full text-left p-4 rounded-xl border-2 border-orange-500/30 bg-orange-500/10 hover:border-orange-500/50 hover:bg-orange-500/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📊</div>
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">Reset Journey & Patterns</div>
                      <div className="text-sm text-white/70">
                        Clear streaks, patterns, and {stats.checkIns} check-ins
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Nuclear Option */}
              <div className="border-t-2 border-white/10 pt-6 mt-6">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-red-400 mb-1">Complete Reset</h3>
                  <p className="text-sm text-white/60">
                    This will erase everything and you'll start from scratch.
                  </p>
                </div>

                <button
                  onClick={() => initiateDelete("all")}
                  className="w-full text-left p-4 rounded-xl border-2 border-red-500/40 bg-red-500/15 hover:border-red-500/60 hover:bg-red-500/25 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🗑️</div>
                    <div className="flex-1">
                      <div className="font-semibold text-red-400 mb-1">Delete Everything</div>
                      <div className="text-sm text-white/70">
                        ⚠️ Permanently removes ALL data: {stats.studies} studies, {stats.notes} notes, profile, everything
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-start gap-3 mb-4">
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Are you absolutely sure?</h3>
                    <p className="text-sm text-white/80">
                      {deleteOption === "all" && "This will delete EVERYTHING and you'll need to set up your account again."}
                      {deleteOption === "history" && `This will permanently delete ${stats.studies} saved studies.`}
                      {deleteOption === "notes" && `This will permanently delete ${stats.notes} personal notes.`}
                      {deleteOption === "journey" && "This will reset all your journey data, streaks, and patterns."}
                    </p>
                  </div>
                </div>

                {deleteOption === "all" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Type <span className="font-mono bg-white/10 px-2 py-0.5 rounded">DELETE</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border-2 border-white/10 text-white placeholder:text-white/40 focus:border-red-400 focus:outline-none"
                      placeholder="Type DELETE"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteOption(null);
                    setConfirmText("");
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteOption === "all" && confirmText !== "DELETE"}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteOption === "all" ? "Delete Everything" : "Confirm Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}