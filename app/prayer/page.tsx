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

interface PrayerHeart {
  userId: string;
  timestamp: number;
}

interface CommunityPrayer {
  id: string;
  userId: string;
  userName: string;
  userLocation?: string;
  request: string;
  category: Category;
  isAnonymous: boolean;
  hearts: PrayerHeart[];
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
    getPrayers().then(prayers => {
      setPrivatePrayers(prayers.filter(p => !p.isAnswered));
    });
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

  // Setup push notifications
  useEffect(() => {
    if (!user) return;

    requestPushPermission(user.uid).catch((err) => {
      console.warn('⚠️ Push notifications unavailable:', err);
    });

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

  // Listen for prayers on MY requests
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const myPrayersQuery = query(
      collection(db, 'prayer_requests'),
      where('userId', '==', user.uid),
      where('status', '==', 'active')
    );

    let previousHeartCounts: { [key: string]: number } = {};
    let isInitialLoad = true;

    const unsubscribe = onSnapshot(myPrayersQuery, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const prayer = doc.data() as CommunityPrayer;
        const prayerId = doc.id;
        const currentHeartCount = prayer.heartCount || 0;
        const previousCount = previousHeartCounts[prayerId] || 0;

        if (currentHeartCount > previousCount && !isInitialLoad) {
          const lastHeart = prayer.hearts[prayer.hearts.length - 1];
          
          if (lastHeart && lastHeart.userId !== user.uid) {
            setNotification({
              id: prayerId,
              message: `${currentHeartCount} ${currentHeartCount === 1 ? 'person is' : 'people are'} praying`,
              prayerTitle: prayer.request.split('\n')[0].substring(0, 60)
            });
            playNotificationSound();
          }
        }

        previousHeartCounts[prayerId] = currentHeartCount;
      });

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
        const newPrayer: Omit<Prayer, 'id' | 'dateAdded' | 'isAnswered'> = {
          title: prayerTitle,
          description: prayerDescription || '',
          tags: [category],
          isShared: false,
        };
        await addPrayer(newPrayer);
        const prayers = await getPrayers();
        setPrivatePrayers(prayers.filter(p => !p.isAnswered));
        alert('✅ Private prayer saved!');
      } else {
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
    if (!prayer || prayer.hearts.some(h => h.userId === user!.uid)) return;

    try {
      const prayerRef = doc(db, 'prayer_requests', prayerId);
      await updateDoc(prayerRef, {
        hearts: [...prayer.hearts, { userId: user!.uid, timestamp: Date.now() }],
        heartCount: increment(1)
      });
    } catch (error) {
      console.error('Error adding heart:', error);
    }
  };

  const handleMarkPrivateAnswered = async (prayerId: string) => {
    const prayer = privatePrayers.find(p => p.id === prayerId);
    if (prayer) {
      const answer = prompt('How was this prayer answered? (Optional)');
      await markAnswered(prayerId, answer || '');
      const prayers = await getPrayers();
      setPrivatePrayers(prayers.filter(p => !p.isAnswered));
    }
  };

  const handleDeletePrivatePrayer = async (prayerId: string) => {
    if (confirm('Delete this prayer?')) {
      await deletePrayer(prayerId);
      const prayers = await getPrayers();
      setPrivatePrayers(prayers.filter(p => !p.isAnswered));
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
        
        <Header 
          isAuthenticated={isAuthenticated} 
          userName={user?.displayName}
        />

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

        <PrayerTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          communityCount={communityPrayers.length}
          privateCount={privatePrayers.length}
        />

        {activeTab === 'community' && (
          <CategoryFilter
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
          />
        )}

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

        <PrayerNotification
          notification={notification}
          onClose={() => setNotification(null)}
        />

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

      <input
        type="text"
        value={prayerTitle}
        onChange={(e) => setPrayerTitle(e.target.value)}
        placeholder="What would you like prayer for?"
        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-yellow-400 focus:outline-none mb-2"
      />

      <textarea
        value={prayerDescription}
        onChange={(e) => setPrayerDescription(e.target.value)}
        placeholder="Add details (optional)..."
        rows={2}
        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-yellow-400 focus:outline-none resize-none mb-2"
      />

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

      {!isPrivate && !isAuthenticated && (
        <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            ℹ️ Sign in to share prayers with the community and pray for others
          </p>
        </div>
      )}

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
  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-8 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-white mb-3">
          Sign In to View Community Prayers
        </h3>
        <p className="text-white/70 mb-6 max-w-md mx-auto">
          For security and accountability, you need to sign in with Google to view and participate 
          in the prayer community.
        </p>
        <button
          onClick={onSignIn}
          className="inline-flex items-center gap-3 rounded-lg bg-white text-gray-900 px-6 py-3 font-semibold hover:bg-gray-100 transition-all shadow-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
        <p className="text-xs text-white/50 mt-4">
          You can create private prayers without signing in
        </p>
      </div>
    );
  }

  if (prayers.length === 0) {
    return (
      <div className="text-center py-20 text-white/50 text-sm">
        No community prayers yet. Be the first to share!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {prayers.map(prayer => {
        const isMyPrayer = currentUser?.uid === prayer.userId;
        const hasUserPrayed = prayer.hearts.some(h => h.userId === currentUser?.uid);

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
              onClick={() => onPray(prayer.id)}
              disabled={isMyPrayer || hasUserPrayed}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                isMyPrayer
                  ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                  : hasUserPrayed
                  ? 'bg-red-400/20 border border-red-400/30 text-red-400 cursor-default'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-red-400/20 hover:border-red-400/30 hover:text-red-400'
              }`}
            >
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