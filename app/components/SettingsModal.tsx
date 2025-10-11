// app/components/SettingsModal.tsx
"use client";

import { useState } from "react";
import { Playfair_Display } from "next/font/google";

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
  const [activeTab, setActiveTab] = useState<"account" | "data">("account");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteOption, setDeleteOption] = useState<DeleteOption>(null);
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  const handleDelete = () => {
    if (!deleteOption) return;

    switch (deleteOption) {
      case "all":
        // Delete everything and reload
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className={`${playfair.className} text-2xl font-semibold text-yellow-400`}>
            Settings & Privacy
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("account")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "account"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "data"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Data & Privacy
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Your Profile</h3>
                
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-white/60 mb-1">Name</div>
                    <div className="text-lg text-white">{userName}</div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-white/60 mb-1">Study Style</div>
                    <div className="text-lg text-white">{currentStyle}</div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-white/60 mb-1">Data Storage</div>
                    <div className="text-sm text-white/80">
                      All your data is stored locally in your browser. Nothing is sent to our servers.
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Your Activity</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.studies}</div>
                    <div className="text-xs text-white/60 mt-1">Studies</div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.notes}</div>
                    <div className="text-xs text-white/60 mt-1">Notes</div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.checkIns}</div>
                    <div className="text-xs text-white/60 mt-1">Check-ins</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && !showDeleteConfirm && (
            <div className="space-y-6">
              {/* Privacy Notice */}
              <div className="rounded-lg border border-blue-400/30 bg-blue-400/10 p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-white/80">
                    <strong className="text-blue-400">Privacy First:</strong> All your data is stored locally in your browser. 
                    We don't track you, collect analytics, or send your personal information anywhere.
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

              {/* Delete Options - More Visual */}
              <div className="space-y-3">
                <button
                  onClick={() => initiateDelete("history")}
                  className="w-full text-left p-5 rounded-xl border-2 border-orange-500/30 bg-orange-500/10 hover:border-orange-500/50 hover:bg-orange-500/20 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                      <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1 text-base">Clear Study History</div>
                      <div className="text-sm text-white/70 mb-2">
                        Remove your {stats.studies} saved studies. Your notes and account remain intact.
                      </div>
                      <div className="text-xs text-orange-400 font-medium">
                        → Click to delete
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => initiateDelete("notes")}
                  className="w-full text-left p-5 rounded-xl border-2 border-orange-500/30 bg-orange-500/10 hover:border-orange-500/50 hover:bg-orange-500/20 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                      <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1 text-base">Clear All Notes</div>
                      <div className="text-sm text-white/70 mb-2">
                        Delete all {stats.notes} personal notes. Your study history stays.
                      </div>
                      <div className="text-xs text-orange-400 font-medium">
                        → Click to delete
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => initiateDelete("journey")}
                  className="w-full text-left p-5 rounded-xl border-2 border-orange-500/30 bg-orange-500/10 hover:border-orange-500/50 hover:bg-orange-500/20 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                      <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1 text-base">Reset Journey & Patterns</div>
                      <div className="text-sm text-white/70 mb-2">
                        Clear streaks, patterns, and {stats.checkIns} check-in responses. Start fresh!
                      </div>
                      <div className="text-xs text-orange-400 font-medium">
                        → Click to reset
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Nuclear Option - Separated */}
              <div className="border-t-2 border-white/10 pt-6 mt-6">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-red-400 mb-1">Complete Reset</h3>
                  <p className="text-sm text-white/60">
                    This will erase everything and you'll start from scratch.
                  </p>
                </div>

                <button
                  onClick={() => initiateDelete("all")}
                  className="w-full text-left p-5 rounded-xl border-2 border-red-500/40 bg-red-500/15 hover:border-red-500/60 hover:bg-red-500/25 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-red-500/30 group-hover:bg-red-500/40 transition-colors">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-red-400 mb-1 text-base">Delete Everything</div>
                      <div className="text-sm text-white/70 mb-2">
                        ⚠️ Permanently removes ALL data: {stats.studies} studies, {stats.notes} notes, profile, everything. 
                        You'll go back to the welcome screen.
                      </div>
                      <div className="text-xs text-red-400 font-medium">
                        → Click to delete EVERYTHING
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

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