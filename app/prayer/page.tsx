'use client';

import React, { useState, useEffect } from 'react';
import { Playfair_Display } from 'next/font/google';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db, submitPrayerRequest } from '@/lib/firebase';
import {
  Prayer,
  getPrayers,
  addPrayer,
  deletePrayer,
  markAnswered,
} from '@/lib/prayerStorage';
import { useAuth } from '@/contexts/AuthContext';
import { SignInPrompt } from '@/components/SignInPrompt';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

interface CommunityPrayer {
  id: string;
  userId: string;
  userName: string;
  userLocation?: string;
  request: string;
  category: string;
  isAnonymous: boolean;
  hearts: string[];
  heartCount: number;
  status: string;
  createdAt: any;
  crisisDetected?: boolean;
}

type Category = 'health' | 'family' | 'work' | 'spiritual' | 'other';

export default function UnifiedPrayerPage() {
  // Google Sign-In Authentication
  const { user, isAuthenticated } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  
  // Private prayers (localStorage)
  const [privatePrayers, setPrivatePrayers] = useState<Prayer[]>([]);
  
  // Community prayers (Firebase)
  const [communityPrayers, setCommunityPrayers] = useState<CommunityPrayer[]>([]);
  
  // Form state
  const [isPrivate, setIsPrivate] = useState(false);
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerDescription, setPrayerDescription] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // View state
  const [activeTab, setActiveTab] = useState<'community' | 'private'>('community');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');

  useEffect(() => {
    // Load private prayers
    setPrivatePrayers(getPrayers().filter(p => !p.isAnswered));
  }, []);

  useEffect(() => {
    // Subscribe to community prayers
    const q = query(
      collection(db, 'prayer_requests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prayers: CommunityPrayer[] = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CommunityPrayer))
        .filter(p => p.status === 'active');
      
      setCommunityPrayers(prayers);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmitPrayer = async () => {
    if (!prayerTitle.trim()) {
      alert('Please enter a prayer request');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isPrivate) {
        // Save to localStorage as private prayer (no auth required)
        const newPrayer: Omit<Prayer, 'id' | 'dateAdded' | 'isAnswered'> = {
          title: prayerTitle,
          description: prayerDescription || '',
          tags: [category],
          isShared: false,
        };
        addPrayer(newPrayer);
        setPrivatePrayers(getPrayers().filter(p => !p.isAnswered));
        alert('✅ Private prayer saved!');
      } else {
        // Community prayer - REQUIRE sign-in
        if (!isAuthenticated) {
          setShowSignIn(true);
          setIsSubmitting(false);
          return;
        }

        // Save to Firebase as community prayer
        const userId = isAnonymous ? 'anonymous' : user!.uid;
        const displayName = isAnonymous ? 'Anonymous' : (user!.displayName || 'Prayer Warrior');
        
        const request = prayerDescription 
          ? `${prayerTitle}\n\n${prayerDescription}`
          : prayerTitle;

        await submitPrayerRequest(
          userId,
          displayName,
          request,
          category,
          isAnonymous,
          undefined
        );
        
        alert('✅ Prayer shared with community!');
      }

      // Reset form
      setPrayerTitle('');
      setPrayerDescription('');
      setCategory('other');
      setIsAnonymous(false);
      
    } catch (error) {
      console.error('Error submitting prayer:', error);
      alert('❌ Failed to submit prayer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrayForRequest = async (prayerId: string) => {
    // Require sign-in to pray for others
    if (!isAuthenticated) {
      setShowSignIn(true);
      return;
    }

    try {
      const prayerRef = doc(db, 'prayer_requests', prayerId);
      const prayer = communityPrayers.find(p => p.id === prayerId);
      
      if (!prayer) return;

      // Check if already prayed
      if (prayer.hearts.includes(user!.uid)) {
        return;
      }

      // Add heart
      await updateDoc(prayerRef, {
        hearts: [...prayer.hearts, user!.uid],
        heartCount: increment(1)
      });

    } catch (error) {
      console.error('Error adding heart:', error);
    }
  };

  const handleMarkPrivateAnswered = (prayerId: string) => {
    const prayer = privatePrayers.find(p => p.id === prayerId);
    if (prayer) {
      const answer = prompt('How was this prayer answered? (Optional)');
      markAnswered(prayerId, answer || '');
      setPrivatePrayers(getPrayers().filter(p => !p.isAnswered));
    }
  };

  const handleDeletePrivatePrayer = (prayerId: string) => {
    if (confirm('Delete this prayer?')) {
      deletePrayer(prayerId);
      setPrivatePrayers(getPrayers().filter(p => !p.isAnswered));
    }
  };

  const filteredCommunityPrayers = filterCategory === 'all' 
    ? communityPrayers 
    : communityPrayers.filter(p => p.category === filterCategory);

  const privatePrayerCount = privatePrayers.length;
  const communityPrayerCount = communityPrayers.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className={`${playfair.className} text-4xl font-bold text-white mb-2`}>
            Prayer Center
          </h1>
          <div className="h-[2px] w-20 bg-gradient-to-r from-yellow-400 to-amber-400 mb-3"></div>
          <p className="text-white/70 text-sm">
            {isAuthenticated 
              ? `Welcome, ${user?.displayName}! Share with community or keep private.`
              : 'Create private prayers or sign in to join the community.'
            }
          </p>
        </div>

        {/* PRAYER SUBMISSION FORM */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
          <h2 className={`${playfair.className} text-lg font-semibold text-white mb-3`}>
            Submit Prayer
          </h2>

          {/* Title */}
          <div className="mb-2">
            <input
              type="text"
              value={prayerTitle}
              onChange={(e) => setPrayerTitle(e.target.value)}
              placeholder="What would you like prayer for?"
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-yellow-400 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="mb-2">
            <textarea
              value={prayerDescription}
              onChange={(e) => setPrayerDescription(e.target.value)}
              placeholder="Add details (optional)..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-yellow-400 focus:outline-none resize-none"
            />
          </div>

          {/* Category */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(['health', 'family', 'work', 'spiritual', 'other'] as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-all ${
                  category === cat
                    ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400'
                    : 'border border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Anonymous (only for community prayers when signed in) */}
          {!isPrivate && isAuthenticated && (
            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-yellow-400"
                />
                <span className="text-white/80">Post anonymously</span>
              </label>
            </div>
          )}

          {/* Private/Public Radio Selector */}
          <div className="flex items-center gap-6 mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!isPrivate}
                onChange={() => setIsPrivate(false)}
                className="w-4 h-4 text-yellow-400"
              />
              <span className="text-sm text-white/80">
                🌍 Share with Community
                {!isAuthenticated && <span className="text-yellow-400 ml-1">(requires sign-in)</span>}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={isPrivate}
                onChange={() => setIsPrivate(true)}
                className="w-4 h-4 text-yellow-400"
              />
              <span className="text-sm text-white/80">🔒 Keep Private</span>
            </label>
          </div>

          {/* Sign-in notice for community prayers */}
          {!isPrivate && !isAuthenticated && (
            <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                ℹ️ Sign in to share prayers with the community and pray for others
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmitPrayer}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-yellow-400 bg-yellow-400/20 px-4 py-2 text-sm text-yellow-400 font-semibold hover:bg-yellow-400/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 
             isPrivate ? 'Submit Prayer' : 
             isAuthenticated ? 'Share with Community' : 
             'Sign In to Share'}
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'community'
                ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400'
                : 'border border-white/10 bg-white/5 text-white/60 hover:border-white/20'
            }`}
          >
            🌍 Community ({communityPrayerCount})
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'private'
                ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400'
                : 'border border-white/10 bg-white/5 text-white/60 hover:border-white/20'
            }`}
          >
            🔒 My Private ({privatePrayerCount})
          </button>
        </div>

        {/* CATEGORY FILTER (Community only) */}
        {activeTab === 'community' && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                filterCategory === 'all'
                  ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400'
                  : 'border border-white/10 bg-white/5 text-white/60 hover:border-white/20'
              }`}
            >
              All
            </button>
            {(['health', 'family', 'work', 'spiritual', 'other'] as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-all ${
                  filterCategory === cat
                    ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400'
                    : 'border border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* COMMUNITY PRAYERS - COMPACT CARDS */}
        {activeTab === 'community' && (
          <div className="space-y-2">
            {filteredCommunityPrayers.length === 0 ? (
              <div className="text-center py-20 text-white/50 text-sm">
                {isAuthenticated 
                  ? 'No community prayers yet. Be the first to share!'
                  : 'No community prayers yet. Sign in to share yours!'}
              </div>
            ) : (
              filteredCommunityPrayers.map(prayer => (
                <div
                  key={prayer.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm truncate">
                          {prayer.isAnonymous ? 'Anonymous' : prayer.userName}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-white/10 border border-white/15 rounded text-white/60 capitalize flex-shrink-0">
                          {prayer.category}
                        </span>
                      </div>
                      {prayer.userLocation && (
                        <div className="text-xs text-white/50">{prayer.userLocation}</div>
                      )}
                    </div>
                    <span className="text-xs text-white/50 flex-shrink-0">
                      {new Date(prayer.createdAt?.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-white/70 text-sm mb-2 line-clamp-3">{prayer.request}</p>

                  <button
                    onClick={() => handlePrayForRequest(prayer.id)}
                    disabled={isAuthenticated && prayer.hearts.includes(user!.uid)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      isAuthenticated && prayer.hearts.includes(user!.uid)
                        ? 'bg-red-400/20 border border-red-400/30 text-red-400 cursor-default'
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-red-400/20 hover:border-red-400/30 hover:text-red-400'
                    }`}
                  >
                    ❤️ {isAuthenticated && prayer.hearts.includes(user!.uid) ? 'Prayed' : 'Pray'} ({prayer.heartCount})
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* PRIVATE PRAYERS - COMPACT CARDS */}
        {activeTab === 'private' && (
          <div className="space-y-2">
            {privatePrayers.length === 0 ? (
              <div className="text-center py-20 text-white/50 text-sm">
                No private prayers yet. Add one above!
              </div>
            ) : (
              privatePrayers.map(prayer => (
                <div
                  key={prayer.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-white flex-1">{prayer.title}</h3>
                    {prayer.tags.length > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-white/10 border border-white/15 rounded text-white/60 capitalize">
                        {prayer.tags[0]}
                      </span>
                    )}
                  </div>
                  
                  {prayer.description && (
                    <p className="text-white/70 text-sm mb-2 line-clamp-2">{prayer.description}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkPrivateAnswered(prayer.id)}
                      className="px-2.5 py-1 bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 rounded hover:bg-yellow-400/30 text-xs font-medium"
                    >
                      ✓ Answered
                    </button>
                    <button
                      onClick={() => handleDeletePrivatePrayer(prayer.id)}
                      className="px-2.5 py-1 bg-red-400/20 border border-red-400/30 text-red-400 rounded hover:bg-red-400/30 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Sign-In Modal */}
        <SignInPrompt
          isOpen={showSignIn}
          onClose={() => setShowSignIn(false)}
          message="Sign in to share prayers with the community and pray for others"
        />
      </div>
    </div>
  );
}