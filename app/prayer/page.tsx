'use client';

import React, { useState, useEffect } from 'react';
import { Playfair_Display } from 'next/font/google';
import { 
  collection, 
  query, 
  where,
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db, submitPrayerRequest, requestPushPermission, onForegroundMessage } from '@/lib/firebase';
import {
  Prayer,
  getPrayers,
  addPrayer,
  deletePrayer,
  markAnswered,
} from '@/lib/prayerStorage';
import { useAuth } from '@/contexts/AuthContext';
import { SignInPrompt } from '@/components/SignInPrompt';
import { PrayerNotification } from '@/components/PrayerNotification';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

// ========================================
// TYPES & INTERFACES
// ========================================

interface CommunityPrayer {
  id: string;
  userId: string;
  userName: string;
  userLocation?: string;
  request: string;
  category: Category;
  isAnonymous: boolean;
  hearts: string[];
  heartCount: number;
  status: string;
  createdAt: any;
  crisisDetected?: boolean;
}

type Category = 'health' | 'family' | 'work' | 'spiritual' | 'other';

interface Notification {
  id: string;
  message: string;
  prayerTitle: string;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return 'Anonymous';
  return fullName.trim().split(' ')[0] || 'Anonymous';
}

function getState(location: string | null | undefined): string {
  if (!location) return '';
  const trimmed = location.trim();
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',');
    return parts[parts.length - 1].trim();
  }
  return trimmed;
}

function formatDate(timestamp: any): string {
  if (!timestamp) return 'just now';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
const categoryEmojis: Record<Category, string> = {
  health: '🏥',
  family: '👨‍👩‍👧‍👦',
  work: '💼',
  spiritual: '✝️',
  other: '📌'
};

// ✅ ADD THIS FUNCTION
function playNotificationSound() {
  try {
    const audio = new Audio('/notifications.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.warn('🔊 Sound play failed:', err));
  } catch (error) {
    console.warn('⚠️ Audio not available:', error);
  }
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function PrayerPage() {
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [showSignIn, setShowSignIn] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [privatePrayers, setPrivatePrayers] = useState<Prayer[]>([]);
  const [communityPrayers, setCommunityPrayers] = useState<CommunityPrayer[]>([]);
  const [activeTab, setActiveTab] = useState<'community' | 'private'>('community');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  
  // Form state
  const [isPrivate, setIsPrivate] = useState(false);
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerDescription, setPrayerDescription] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ========================================
  // EFFECTS
  // ========================================

  // Load private prayers from localStorage
  useEffect(() => {
    setPrivatePrayers(getPrayers().filter(p => !p.isAnswered));
  }, []);

  // Subscribe to community prayers
  useEffect(() => {
    const q = query(
      collection(db, 'prayer_requests'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prayers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CommunityPrayer));
      setCommunityPrayers(prayers);
    });

    return () => unsubscribe();
  }, []);

  // 🔔 Setup push notifications (NON-BLOCKING)
  useEffect(() => {
    if (!user) return;

    // Request push permission (optional, won't block page)
    requestPushPermission(user.uid).catch((err) => {
      console.warn('⚠️ Push notifications unavailable:', err);
    });

    // Setup foreground message listener (safe even if messaging fails)
    try {
      onForegroundMessage((payload) => {
        const title = payload.notification?.title || 'Prayer Update';
        const body = payload.notification?.body || 'Someone prayed for your request!';
        setNotification({
          id: crypto.randomUUID(),
          message: body,
          prayerTitle: title,
        });
      });
    } catch (err) {
      console.warn('⚠️ Foreground messaging unavailable:', err);
    }
  }, [user]);
// 🔔 Listen for prayers on MY requests (ONLY notify when OTHERS pray for MY prayers)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const myPrayersQuery = query(
      collection(db, 'prayer_requests'),
      where('userId', '==', user.uid),
      where('status', '==', 'active')
    );

    let previousHeartCounts: { [key: string]: number } = {};
    let isInitialLoad = true; // ✅ ADDED

    const unsubscribe = onSnapshot(myPrayersQuery, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const prayer = doc.data() as CommunityPrayer;
        const prayerId = doc.id;
        const currentHeartCount = prayer.heartCount || 0;
        const previousCount = previousHeartCounts[prayerId] || 0;

        // ✅ CHANGED: Skip only on initial load, not when previousCount is 0
        if (currentHeartCount > previousCount && !isInitialLoad) {
          const lastHeart = prayer.hearts[prayer.hearts.length - 1];
          
          if (lastHeart && lastHeart.userId !== user.uid) {
            setNotification({
              id: prayerId,
              message: `${currentHeartCount} ${currentHeartCount === 1 ? 'person is' : 'people are'} praying`,
              prayerTitle: prayer.request.split('\n')[0].substring(0, 60)
            });

            // ✅ ADDED: Play sound
            playNotificationSound();
          }
        }

        previousHeartCounts[prayerId] = currentHeartCount;
      });

      // ✅ ADDED: Mark initial load as complete
      isInitialLoad = false;
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleSubmitPrayer = async () => {
    if (!prayerTitle.trim()) {
      alert('Please enter a prayer request');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isPrivate) {
        // Private prayer - no auth required
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
        // Community prayer - require sign-in
        if (!isAuthenticated) {
          setShowSignIn(true);
          setIsSubmitting(false);
          return;
        }

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
      alert('❌ Failed to submit prayer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrayForRequest = async (prayerId: string) => {
    if (!isAuthenticated) {
      setShowSignIn(true);
      return;
    }

    const prayer = communityPrayers.find(p => p.id === prayerId);
    if (!prayer || prayer.hearts.includes(user!.uid)) return;

    try {
      const prayerRef = doc(db, 'prayer_requests', prayerId);
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

  // ========================================
  // FILTERS
  // ========================================

  const filteredCommunityPrayers = filterCategory === 'all' 
    ? communityPrayers 
    : communityPrayers.filter(p => p.category === filterCategory);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        
        {/* HEADER */}
        <Header 
          isAuthenticated={isAuthenticated} 
          userName={user?.displayName}
        />

        {/* PRAYER SUBMISSION FORM */}
        <PrayerSubmissionForm
          isPrivate={isPrivate}
          setIsPrivate={setIsPrivate}
          prayerTitle={prayerTitle}
          setPrayerTitle={setPrayerTitle}
          prayerDescription={prayerDescription}
          setPrayerDescription={setPrayerDescription}
          category={category}
          setCategory={setCategory}
          isAnonymous={isAnonymous}
          setIsAnonymous={setIsAnonymous}
          isAuthenticated={isAuthenticated}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitPrayer}
        />

        {/* TABS */}
        <PrayerTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          communityCount={communityPrayers.length}
          privateCount={privatePrayers.length}
        />

        {/* CATEGORY FILTER (Community only) */}
        {activeTab === 'community' && (
          <CategoryFilter
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
          />
        )}

        {/* PRAYER LISTS */}
        {activeTab === 'community' ? (
          <CommunityPrayerList
            prayers={filteredCommunityPrayers}
            currentUser={user}
            isAuthenticated={isAuthenticated}
            onPray={handlePrayForRequest}
            onSignIn={() => setShowSignIn(true)}
          />
        ) : (
          <PrivatePrayerList
            prayers={privatePrayers}
            onMarkAnswered={handleMarkPrivateAnswered}
            onDelete={handleDeletePrivatePrayer}
          />
        )}

        {/* NOTIFICATION */}
        <PrayerNotification
          notification={notification}
          onClose={() => setNotification(null)}
        />

        {/* SIGN-IN MODAL */}
        <SignInPrompt
          isOpen={showSignIn}
          onClose={() => setShowSignIn(false)}
          message="Sign in to share prayers with the community and pray for others"
        />
      </div>
    </div>
  );
}

// ========================================
// HEADER COMPONENT
// ========================================

function Header({ isAuthenticated, userName }: { isAuthenticated: boolean; userName?: string | null }) {
  return (
    <div className="mb-8">
      <h1 className={`${playfair.className} text-4xl font-bold text-white mb-2`}>
        Prayer Center
      </h1>
      <div className="h-[2px] w-20 bg-gradient-to-r from-yellow-400 to-amber-400 mb-3"></div>
      <p className="text-white/70 text-sm">
        {isAuthenticated 
          ? `Welcome, ${getFirstName(userName)}! Share with community or keep private.`
          : 'Create private prayers or sign in to join the community.'
        }
      </p>
    </div>
  );
}

// ========================================
// PRAYER SUBMISSION FORM COMPONENT
// ========================================

interface PrayerSubmissionFormProps {
  isPrivate: boolean;
  setIsPrivate: (val: boolean) => void;
  prayerTitle: string;
  setPrayerTitle: (val: string) => void;
  prayerDescription: string;
  setPrayerDescription: (val: string) => void;
  category: Category;
  setCategory: (val: Category) => void;
  isAnonymous: boolean;
  setIsAnonymous: (val: boolean) => void;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

function PrayerSubmissionForm({
  isPrivate,
  setIsPrivate,
  prayerTitle,
  setPrayerTitle,
  prayerDescription,
  setPrayerDescription,
  category,
  setCategory,
  isAnonymous,
  setIsAnonymous,
  isAuthenticated,
  isSubmitting,
  onSubmit
}: PrayerSubmissionFormProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
      <h2 className={`${playfair.className} text-lg font-semibold text-white mb-3`}>
        Submit Prayer
      </h2>

      {/* Title */}
      <input
        type="text"
        value={prayerTitle}
        onChange={(e) => setPrayerTitle(e.target.value)}
        placeholder="What would you like prayer for?"
        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-yellow-400 focus:outline-none mb-2"
      />

      {/* Description */}
      <textarea
        value={prayerDescription}
        onChange={(e) => setPrayerDescription(e.target.value)}
        placeholder="Add details (optional)..."
        rows={2}
        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-yellow-400 focus:outline-none resize-none mb-2"
      />

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

      {/* Sign-in notice */}
      {!isPrivate && !isAuthenticated && (
        <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            ℹ️ Sign in to share prayers with the community and pray for others
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting || !prayerTitle.trim()}
        className="w-full rounded-lg border border-yellow-400 bg-yellow-400/20 px-4 py-2 text-sm text-yellow-400 font-semibold hover:bg-yellow-400/30 transition-all disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 
         isPrivate ? 'Submit Prayer' : 
         isAuthenticated ? 'Share with Community' : 
         'Sign In to Share'}
      </button>
    </div>
  );
}

// ========================================
// TABS COMPONENT
// ========================================

function PrayerTabs({ 
  activeTab, 
  setActiveTab, 
  communityCount, 
  privateCount 
}: { 
  activeTab: 'community' | 'private';
  setActiveTab: (tab: 'community' | 'private') => void;
  communityCount: number;
  privateCount: number;
}) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => setActiveTab('community')}
        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
          activeTab === 'community'
            ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400'
            : 'border border-white/10 bg-white/5 text-white/60 hover:border-white/20'
        }`}
      >
        🌍 Community ({communityCount})
      </button>
      <button
        onClick={() => setActiveTab('private')}
        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
          activeTab === 'private'
            ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400'
            : 'border border-white/10 bg-white/5 text-white/60 hover:border-white/20'
        }`}
      >
        🔒 My Private ({privateCount})
      </button>
    </div>
  );
}

// ========================================
// CATEGORY FILTER COMPONENT
// ========================================

function CategoryFilter({ 
  filterCategory, 
  setFilterCategory 
}: { 
  filterCategory: Category | 'all';
  setFilterCategory: (cat: Category | 'all') => void;
}) {
  return (
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
  );
}

// ========================================
// COMMUNITY PRAYER LIST COMPONENT
// ========================================

interface CommunityPrayerListProps {
  prayers: CommunityPrayer[];
  currentUser: any;
  isAuthenticated: boolean;
  onPray: (id: string) => void;
  onSignIn: () => void;
}

function CommunityPrayerList({ 
  prayers, 
  currentUser, 
  isAuthenticated, 
  onPray,
  onSignIn
}: CommunityPrayerListProps) {
  if (prayers.length === 0) {
    return (
      <div className="text-center py-20 text-white/50 text-sm">
        {isAuthenticated 
          ? 'No community prayers yet. Be the first to share!'
          : 'No community prayers yet. Sign in to share yours!'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {prayers.map(prayer => {
        // ✅ ADDED: Check if this is MY prayer
        const isMyPrayer = isAuthenticated && currentUser?.uid === prayer.userId;
        const hasUserPrayed = isAuthenticated && prayer.hearts.includes(currentUser?.uid);

        return (
          <div
            key={prayer.id}
            className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white text-sm truncate">
                    {prayer.isAnonymous ? 'Anonymous' : getFirstName(prayer.userName)}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-white/10 border border-white/15 rounded text-white/60 capitalize flex-shrink-0">
                    {categoryEmojis[prayer.category]} {prayer.category}
                  </span>
                  {/* ✅ ADDED: Show "Your Prayer" badge */}
                  {isMyPrayer && (
                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 flex-shrink-0">
                      Your Prayer
                    </span>
                  )}
                </div>
                {getState(prayer.userLocation) && (
                  <div className="text-xs text-white/50">{getState(prayer.userLocation)}</div>
                )}
              </div>
              <span className="text-xs text-white/50 flex-shrink-0">
                {formatDate(prayer.createdAt)}
              </span>
            </div>

            <p className="text-white/70 text-sm mb-2 line-clamp-3">{prayer.request}</p>

            <button
              onClick={() => isAuthenticated ? onPray(prayer.id) : onSignIn()}
              disabled={isMyPrayer || hasUserPrayed} // ✅ CHANGED: Can't pray for own prayer
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                isMyPrayer
                  ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                  : hasUserPrayed
                  ? 'bg-red-400/20 border border-red-400/30 text-red-400 cursor-default'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-red-400/20 hover:border-red-400/30 hover:text-red-400'
              }`}
            >
              {/* ✅ CHANGED: Show "Your Prayer" text */}
              ❤️ {isMyPrayer ? 'Your Prayer' : hasUserPrayed ? 'Prayed' : 'Pray'} ({prayer.heartCount})
            </button>
          </div>
        );
      })}
    </div>
  );
}
// ========================================
// PRIVATE PRAYER LIST COMPONENT
// ========================================

interface PrivatePrayerListProps {
  prayers: Prayer[];
  onMarkAnswered: (id: string) => void;
  onDelete: (id: string) => void;
}

function PrivatePrayerList({ prayers, onMarkAnswered, onDelete }: PrivatePrayerListProps) {
  if (prayers.length === 0) {
    return (
      <div className="text-center py-20 text-white/50 text-sm">
        No private prayers yet. Add one above!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {prayers.map(prayer => (
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
              onClick={() => onMarkAnswered(prayer.id)}
              className="px-2.5 py-1 bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 rounded hover:bg-yellow-400/30 text-xs font-medium"
            >
              ✓ Answered
            </button>
            <button
              onClick={() => onDelete(prayer.id)}
              className="px-2.5 py-1 bg-red-400/20 border border-red-400/30 text-red-400 rounded hover:bg-red-400/30 text-xs font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}