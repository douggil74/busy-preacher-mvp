"use client";

import { useState, useEffect } from "react";
import { sharePrayerToCommunity } from "@/lib/sharePrayer";
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
import { getUserLocation, clearStoredLocation, getStoredLocation, type UserLocation } from "@/lib/locationHelper";

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
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    setPrayers(getPrayers());
    
    // Check if user name and location are already stored
    const storedName = localStorage.getItem('busy_christian_user_name');
    if (storedName) {
      setUserName(storedName);
    }
    
    const storedLocation = getStoredLocation();
    if (storedLocation) {
      setUserLocation(storedLocation);
    }
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

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);
    
    try {
      const location = await getUserLocation();
      if (location) {
        setUserLocation(location);
        setLocationError(null);
      } else {
        setLocationError("Could not get location. You can skip this step.");
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError("Location access denied. You can skip this step.");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleShareToCommunity = async (prayer: Prayer) => {
    if (prayer.isShared) {
      alert("This prayer is already shared to the community!");
      return;
    }

    // Check if we have user info setup
    if (!userName) {
      setShowSetupModal(true);
      setSharingId(prayer.id);
      return;
    }

    setSharingId(prayer.id);
    
    try {
      // Generate consistent user ID based on name
      const userId = 'user_' + btoa(userName).substring(0, 10);
      
      // Call the share function with correct parameters
      const success = await sharePrayerToCommunity(
        prayer,
        userId,
        userName,
        userLocation?.formatted
      );
      
      if (success) {
        setPrayers(getPrayers());
        alert("✅ Prayer shared to the community!");
      } else {
        alert("❌ Failed to share prayer. Please try again.");
      }
    } catch (error) {
      console.error("Error sharing prayer:", error);
      alert("❌ Failed to share prayer. Please try again.");
    } finally {
      setSharingId(null);
    }
  };

  const handleCompleteSetup = () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }
    
    // Save name to localStorage
    localStorage.setItem('busy_christian_user_name', userName.trim());
    setShowSetupModal(false);
    
    // Now share the prayer
    const prayerToShare = prayers.find(p => p.id === sharingId);
    if (prayerToShare) {
      handleShareToCommunity(prayerToShare);
    }
  };

  const handleUpdateInfo = () => {
    setShowSetupModal(true);
    // Don't clear the current values so user can see what they have
  };

  const handleSkipLocation = () => {
    // Just close modal, name is required but location is optional
    if (!userName.trim()) {
      alert("Name is required");
      return;
    }
    handleCompleteSetup();
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
              "Cast all your anxieties on Him, because He cares for you." – 1
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
              href="/prayer"
              className="rounded-lg border border-white/10 bg-white/10 px-6 py-3 text-sm text-white/80 hover:text-yellow-400 hover:border-yellow-400/40 transition-all"
            >
              🌍 View the Prayer Community
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
          {userName && (
            <span>
              Sharing as: <strong className="text-yellow-400">{userName}</strong>
              {userLocation && (
                <span className="text-white/50"> from {userLocation.formatted}</span>
              )}
              <button 
                onClick={handleUpdateInfo}
                className="ml-2 text-xs text-white/50 hover:text-yellow-400"
              >
                (change)
              </button>
            </span>
          )}
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
              const isSharing = sharingId === prayer.id;
              
              return (
                <div
                  key={prayer.id}
                  className={`card ${
                    isAnswered
                      ? "border-yellow-400/40 bg-yellow-400/5"
                      : ""
                  }`}
                >
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {prayer.isShared && (
                      <span className="inline-block rounded-lg bg-white/10 border border-white/15 text-white/70 text-xs px-3 py-1">
                        🌍 Shared
                      </span>
                    )}
                    {isAnswered && (
                      <span className="inline-block rounded-lg bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 text-xs px-3 py-1">
                        ✓ Answered
                      </span>
                    )}
                  </div>

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

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                    {!prayer.isShared && !isAnswered && (
                      <button
                        onClick={() => handleShareToCommunity(prayer)}
                        disabled={isSharing}
                        className="flex-1 rounded-lg border border-blue-400/30 bg-blue-400/10 px-4 py-2.5 text-sm font-medium text-blue-400 hover:bg-blue-400/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSharing ? "Sharing..." : "🌍 Share to Community"}
                      </button>
                    )}
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

      {/* PRAYER MODAL */}
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

      {/* SETUP MODAL */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h2 className={`${playfair.className} text-2xl font-bold text-white mb-2`}>
              Share to Community
            </h2>
            <p className="text-white/70 text-sm mb-6">
              Set up your sharing info to connect with the prayer community.
            </p>
            
            {/* Name Input */}
            <div className="mb-4">
              <label className="text-white/80 text-sm font-medium mb-2 block">
                Your Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleCompleteSetup()}
                autoFocus
              />
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="text-white/80 text-sm font-medium mb-2 block">
                Location <span className="text-white/50">(optional)</span>
              </label>
              
              {userLocation ? (
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <span className="text-white/80 text-sm">📍 {userLocation.formatted}</span>
                  <button
                    onClick={() => {
                      clearStoredLocation();
                      setUserLocation(null);
                    }}
                    className="text-xs text-white/50 hover:text-yellow-400"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="w-full bg-white/5 border border-white/10 text-white/80 rounded-lg px-4 py-3 hover:border-yellow-400/40 hover:bg-white/10 transition-colors disabled:opacity-50 text-sm"
                >
                  {isGettingLocation ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                      Getting location...
                    </span>
                  ) : (
                    "📍 Get My Location"
                  )}
                </button>
              )}
              
              {locationError && (
                <p className="text-orange-400 text-xs mt-2">{locationError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCompleteSetup}
                className="flex-1 rounded-lg border border-yellow-400 bg-yellow-400/20 px-6 py-3 text-yellow-400 font-semibold hover:bg-yellow-400/30 transition-all"
              >
                {userLocation ? "Save & Share" : "Continue Without Location"}
              </button>
              <button
                onClick={() => {
                  setShowSetupModal(false);
                  setSharingId(null);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-white/60 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}