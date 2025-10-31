"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { AddPrayerModal } from "@/components/AddPrayerModal";
import {
  Prayer,
  PrayerFilter,
  getPrayers,
  addPrayer,
  updatePrayer,
  deletePrayer,
  markAnswered,
  filterPrayers,
  searchPrayers,
  getPrayerStats,
  formatPrayerDate,
} from "@/lib/prayerStorage";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export default function PrayerJournalPage() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [filter, setFilter] = useState<PrayerFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    setPrayers(getPrayers());
  }, []);

  const displayedPrayers = (() => {
    let result = filterPrayers(prayers, filter);
    if (searchQuery.trim()) result = searchPrayers(result, searchQuery);
    return result;
  })();

  const stats = getPrayerStats(prayers);

  const handleAddPrayer = () => {
    setEditingPrayer(null);
    setIsAnswering(false);
    setIsModalOpen(true);
  };

  const handleEditPrayer = (prayer: Prayer) => {
    setEditingPrayer(prayer);
    setIsAnswering(false);
    setIsModalOpen(true);
  };

  const handleMarkAnswered = (prayer: Prayer) => {
    setEditingPrayer(prayer);
    setIsAnswering(true);
    setIsModalOpen(true);
  };

  const handleSavePrayer = (
    prayerData: Omit<Prayer, "id" | "dateAdded" | "isAnswered">
  ) => {
    if (isAnswering && editingPrayer) {
      markAnswered(editingPrayer.id, prayerData.answerNotes);
    } else if (editingPrayer) {
      updatePrayer(editingPrayer.id, prayerData);
    } else {
      addPrayer(prayerData);
    }
    setPrayers(getPrayers());
    setEditingPrayer(null);
    setIsAnswering(false);
  };

  const handleDeletePrayer = (id: string) => {
    deletePrayer(id);
    setPrayers(getPrayers());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1
              className={`${playfair.className} text-5xl sm:text-6xl font-bold text-white mb-3 tracking-tight`}
            >
              Prayer Journal
            </h1>
            <div className="h-[2px] w-24 bg-gradient-to-r from-yellow-400 to-amber-400 mb-4"></div>
            <p className="text-white/70 text-base italic">
              "Cast all your anxieties on Him, because He cares for you." — 1
              Peter 5:7
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddPrayer}
              className="rounded-lg border border-yellow-400 bg-yellow-400/20 px-6 py-3 text-sm text-yellow-400 font-semibold hover:bg-yellow-400/30 transition-all"
            >
              + Add Prayer
            </button>
            <Link
              href="/community-prayers"
              className="rounded-lg border border-white/10 bg-white/10 px-6 py-3 text-sm text-white/80 hover:text-yellow-400 hover:border-yellow-400/40 transition-all"
            >
              🌍 View Community Prayers
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="flex flex-wrap items-center gap-6 mb-10 text-sm text-white/70">
          <span>
            Total: <strong className="text-yellow-400">{stats.total}</strong>
          </span>
          <span>
            Active: <strong className="text-yellow-400">{stats.active}</strong>
          </span>
          <span>
            Answered: <strong className="text-yellow-400">{stats.answered}</strong>
          </span>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 mb-8">
          {(["all", "active", "answered"] as PrayerFilter[]).map((f) => {
            const isActive = filter === f;

            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-5 py-2.5 text-sm font-medium border transition-all ${
                  isActive
                    ? "bg-yellow-400/20 border-yellow-400 text-yellow-400"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} (
                {f === "all"
                  ? prayers.length
                  : f === "active"
                  ? stats.active
                  : stats.answered}
                )
              </button>
            );
          })}
        </div>

        {/* SEARCH */}
        <div className="mb-10">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prayers..."
            className="input w-full"
          />
        </div>

        {/* LIST */}
        {displayedPrayers.length === 0 ? (
          <div className="card text-center py-20 border-dashed max-w-3xl">
            <h3
              className={`${playfair.className} text-2xl font-semibold text-white mb-3`}
            >
              {searchQuery
                ? "No prayers found"
                : filter === "answered"
                ? "No answered prayers yet"
                : "No prayers yet"}
            </h3>
            <p className="text-white/60 mb-6">
              {searchQuery
                ? "Try a different search term"
                : filter === "answered"
                ? "Prayers marked as answered will appear here"
                : "Start by adding your first prayer request"}
            </p>
            {!searchQuery && filter === "all" && (
              <button
                onClick={handleAddPrayer}
                className="rounded-lg border border-yellow-400 bg-yellow-400/20 px-6 py-3 text-yellow-400 font-semibold hover:bg-yellow-400/30 transition-all"
              >
                Add Your First Prayer
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {displayedPrayers.map((prayer) => {
              const isAnswered = prayer.isAnswered;
              return (
                <div
                  key={prayer.id}
                  className={`card ${
                    isAnswered
                      ? "border-yellow-400/40 bg-yellow-400/5"
                      : ""
                  }`}
                >
                  {/* Shared badge */}
                  {prayer.isShared && (
                    <span className="inline-block mb-3 rounded-lg bg-white/10 border border-white/15 text-white/70 text-xs px-3 py-1">
                      🌍 Shared
                    </span>
                  )}

                  {isAnswered && (
                    <span className="inline-block mb-4 rounded-lg bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 text-xs px-3 py-1">
                      ✓ Answered
                    </span>
                  )}

                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      isAnswered ? "text-yellow-400" : "text-white"
                    }`}
                  >
                    {prayer.title}
                  </h3>

                  {prayer.description && (
                    <p className="text-white/70 text-sm mb-4">
                      {prayer.description}
                    </p>
                  )}

                  {prayer.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {prayer.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs px-3 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-white/50 mb-4">
                    {isAnswered
                      ? `Answered ${formatPrayerDate(prayer.dateAnswered!)}`
                      : `Added ${formatPrayerDate(prayer.dateAdded)}`}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    {!isAnswered && (
                      <button
                        onClick={() => handleMarkAnswered(prayer)}
                        className="flex-1 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-4 py-2.5 text-sm font-medium text-yellow-400 hover:bg-yellow-400/20 transition-colors"
                      >
                        Mark Answered
                      </button>
                    )}
                    <button
                      onClick={() => handleEditPrayer(prayer)}
                      className="flex-1 btn text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete prayer "${prayer.title}"?`)) {
                          handleDeletePrayer(prayer.id);
                        }
                      }}
                      className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-400/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      <AddPrayerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPrayer(null);
          setIsAnswering(false);
        }}
        onSave={handleSavePrayer}
        editingPrayer={editingPrayer}
        isAnswering={isAnswering}
      />
    </div>
  );
}