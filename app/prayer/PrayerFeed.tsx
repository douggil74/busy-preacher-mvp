'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Playfair_Display } from 'next/font/google';
import { 
  subscribeToPrayerRequests, 
  submitPrayerRequest, 
  addPrayerHeart,
  type PrayerRequest 
} from '@/lib/firebase';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export default function PrayerFeed() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [filter, setFilter] = useState<'active' | 'answered' | 'all'>('active');

  // Mock user - replace with real auth later
  const currentUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: 'User',
    location: 'Your Location'
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToPrayerRequests(
      (updatedPrayers) => {
        setPrayers(updatedPrayers);
        setLoading(false);
      },
      { status: filter === 'all' ? undefined : filter }
    );

    return () => unsubscribe();
  }, [filter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white/70">Loading prayers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className={`${playfair.className} text-5xl sm:text-6xl font-bold text-white mb-3 tracking-tight`}>
              Prayer Community 
            </h1>
            <div className="h-[2px] w-24 bg-gradient-to-r from-yellow-400 to-amber-400 mb-4"></div>
            <p className="text-white/70 text-base italic">
              "Where two or three gather in my name, there am I with them." — Matthew 18:20
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="rounded-lg border border-yellow-400 bg-yellow-400/20 px-6 py-3 text-sm text-yellow-400 font-semibold hover:bg-yellow-400/30 transition-all"
            >
              + Share Prayer Request
            </button>
            <Link
              href="/my-prayers"
              className="rounded-lg border border-white/10 bg-white/10 px-6 py-3 text-sm text-white/80 hover:text-yellow-400 hover:border-yellow-400/40 transition-all"
            >
              📖 My Prayers
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="flex flex-wrap items-center gap-6 mb-10 text-sm text-white/70">
          <span>
            Active Prayers: <strong className="text-yellow-400">{prayers.length}</strong>
          </span>
          <span>•</span>
          <span>Praying Together Worldwide</span>
        </div>

        {/* SUBMIT FORM */}
        {showSubmitForm && (
          <SubmitPrayerForm
            userId={currentUser.id}
            userName={currentUser.name}
            userLocation={currentUser.location}
            onClose={() => setShowSubmitForm(false)}
          />
        )}

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 mb-8">
          {(['active', 'answered', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium border transition-all ${
                filter === f
                  ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* PRAYER LIST */}
        {prayers.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-lg max-w-3xl mx-auto">
            <h3 className={`${playfair.className} text-2xl font-semibold text-white mb-3`}>
              No prayers yet
            </h3>
            <p className="text-white/60 mb-6">
              Be the first to share a prayer request with the community
            </p>
            <button
              onClick={() => setShowSubmitForm(true)}
              className="rounded-lg border border-yellow-400 bg-yellow-400/20 px-6 py-3 text-yellow-400 font-semibold hover:bg-yellow-400/30 transition-all"
            >
              Share First Prayer
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {prayers.map((prayer) => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                currentUserId={currentUser.id}
                currentUserName={currentUser.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================
// PRAYER CARD COMPONENT
// =====================================

interface PrayerCardProps {
  prayer: PrayerRequest;
  currentUserId: string;
  currentUserName: string;
}

function PrayerCard({ prayer, currentUserId, currentUserName }: PrayerCardProps) {
  const [isPraying, setIsPraying] = useState(false);
  const hasUserPrayed = prayer.hearts?.some(h => h.userId === currentUserId);
  const isAnswered = prayer.status === 'answered';

  const handlePray = async () => {
    if (hasUserPrayed || isPraying) return;
    
    setIsPraying(true);
    try {
      await addPrayerHeart(prayer.id!, currentUserId, currentUserName);
    } catch (error) {
      console.error('Error praying:', error);
    } finally {
      setIsPraying(false);
    }
  };

  const timeAgo = (timestamp: any) => {
    if (!timestamp) return 'just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const categoryEmoji: Record<string, string> = {
    health: '🏥',
    family: '👨‍👩‍👧‍👦',
    work: '💼',
    spiritual: '✝️',
    other: '📌'
  };

  return (
    <div className={`rounded-lg border-2 bg-white/5 p-6 transition-all ${
      isAnswered 
        ? 'border-yellow-400/40 bg-yellow-400/5' 
        : 'border-white/10 hover:border-white/20'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">
              {prayer.userName}
            </span>
            {prayer.userLocation && (
              <span className="text-xs text-white/50">• {prayer.userLocation}</span>
            )}
          </div>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-0.5 bg-white/10 border border-white/15 rounded text-white/60">
              {categoryEmoji[prayer.category]} {prayer.category}
            </span>
            {isAnswered && (
              <span className="text-xs px-2 py-0.5 bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 rounded">
                ✓ Answered
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-white/50">{timeAgo(prayer.createdAt)}</span>
      </div>

      {/* Prayer Text */}
      <p className="text-white/70 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
        {prayer.request}
      </p>

      {/* Praise Report */}
      {prayer.praiseReport && (
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 mb-4">
          <div className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
            <span>🎉</span>
            <span>Praise Report</span>
          </div>
          <p className="text-white/70 text-sm">{prayer.praiseReport}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          onClick={handlePray}
          onTouchEnd={(e) => {
            // Better iOS touch handling
            if (!hasUserPrayed && !isPraying && !isAnswered) {
              e.preventDefault();
              handlePray();
            }
          }}
          disabled={hasUserPrayed || isPraying || isAnswered}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all select-none ${
            hasUserPrayed
              ? 'bg-yellow-400/20 text-yellow-400 cursor-default'
              : isAnswered
              ? 'bg-white/5 text-white/40 cursor-not-allowed'
              : 'bg-white/10 text-white/80 hover:bg-yellow-400/20 hover:text-yellow-400 active:bg-yellow-400/30 cursor-pointer'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
        >
          <span className={isPraying ? 'animate-pulse' : ''}>
            {hasUserPrayed ? '❤️' : '🤍'}
          </span>
          <span>
            {isPraying ? 'Praying...' : hasUserPrayed ? 'Praying' : 'Pray'}
          </span>
        </button>

        <div className="text-sm text-white/60">
          {prayer.heartCount > 0 ? (
            <span>
              <span className="text-yellow-400 font-semibold">{prayer.heartCount}</span>
              {' '}{prayer.heartCount === 1 ? 'person' : 'people'} praying
            </span>
          ) : (
            <span>Be the first to pray</span>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================
// SUBMIT PRAYER FORM
// =====================================

interface SubmitPrayerFormProps {
  userId: string;
  userName: string;
  userLocation?: string;
  onClose: () => void;
}

function SubmitPrayerForm({ userId, userName, userLocation, onClose }: SubmitPrayerFormProps) {
  const [request, setRequest] = useState('');
  const [category, setCategory] = useState<'health' | 'family' | 'work' | 'spiritual' | 'other'>('other');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!request.trim()) return;

    setIsSubmitting(true);
    try {
      await submitPrayerRequest(
        userId,
        userName,
        request,
        category,
        isAnonymous,
        userLocation
      );
      
      setRequest('');
      onClose();
      alert('🙏 Your prayer request has been shared!');
    } catch (error) {
      console.error('Error submitting prayer:', error);
      alert('Failed to submit prayer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border-2 border-white/10 bg-white/5 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-yellow-400">Share Prayer Request</h3>
        <button onClick={onClose} className="text-white/50 hover:text-white/80">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            How can we pray for you?
          </label>
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Share your prayer request..."
            className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-3 min-h-32 focus:border-yellow-400 focus:outline-none"
            maxLength={500}
          />
          <div className="text-xs text-white/50 text-right mt-1">
            {request.length}/500
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['health', 'family', 'work', 'spiritual', 'other'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  category === cat
                    ? 'bg-yellow-400/20 border-2 border-yellow-400 text-yellow-400 font-semibold'
                    : 'bg-white/5 border-2 border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-white/60">
            Post anonymously
          </span>
        </label>

        <button
          type="submit"
          disabled={!request.trim() || isSubmitting}
          className="w-full rounded-lg border border-yellow-400 bg-yellow-400/20 px-6 py-3 text-yellow-400 font-semibold hover:bg-yellow-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '🙏 Sharing...' : '✨ Share Prayer Request'}
        </button>
      </form>
    </div>
  );
}