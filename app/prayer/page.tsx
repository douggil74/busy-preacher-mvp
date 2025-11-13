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
import { PrayerNotification } from '@/components/PrayerNotification';
import { PastorNote } from '@/components/PastorNote';
import { card, button, input, typography, cn } from '@/lib/ui-constants';

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
  const { user } = useAuth();

  // State
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
    if (!user) return;

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
  }, [user]);

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
        const userId = user?.uid || 'anonymous';
        const displayName = isAnonymous ? 'Anonymous' : (user?.displayName || 'Prayer Warrior');
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
    const prayer = communityPrayers.find(p => p.id === prayerId);
    const currentUserId = user?.uid || `guest_${Date.now()}`;
    if (!prayer || prayer.hearts.some(h => h.userId === currentUserId)) return;

    try {
      const prayerRef = doc(db, 'prayer_requests', prayerId);
      await updateDoc(prayerRef, {
        hearts: [...prayer.hearts, { userId: currentUserId, timestamp: Date.now() }],
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
            onPray={handlePrayForRequest}
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
      </div>
    </div>
  );
}

// ========================================
// HEADER COMPONENT
// ========================================

function Header({ userName }: { userName?: string | null }) {
  return (
    <div className="section-spacing">
      <h1 className={`${playfair.className} ${typography.h1} mb-2`}>
        Prayer Center
      </h1>
      <div className="h-[2px] w-20 bg-gradient-to-r from-yellow-400 to-amber-400 mb-4"></div>
      <PastorNote variant="encouragement" className="mb-4" />
      <p className={cn(typography.small, 'text-white/70')}>
        {userName
          ? `Welcome, ${getFirstName(userName)}! Share with community or keep private.`
          : 'Create prayers and share them with the community.'
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
  isSubmitting,
  onSubmit
}: PrayerSubmissionFormProps) {
  return (
    <div className={cn(card.default, 'section-spacing')}>
      <h2 className={`${playfair.className} ${typography.h3} mb-4`}>
        Submit Prayer
      </h2>

      <input
        type="text"
        value={prayerTitle}
        onChange={(e) => setPrayerTitle(e.target.value)}
        placeholder="What would you like prayer for?"
        className={cn(input.base, 'mb-3')}
      />

      <textarea
        value={prayerDescription}
        onChange={(e) => setPrayerDescription(e.target.value)}
        placeholder="Add details (optional)..."
        rows={3}
        className={cn(input.textarea, 'mb-3 min-h-[80px]')}
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

      {!isPrivate && (
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

      <button
        onClick={onSubmit}
        disabled={isSubmitting || !prayerTitle.trim()}
        className={cn(button.primary, 'w-full')}
      >
        {isSubmitting ? 'Submitting...' :
         isPrivate ? 'Submit Prayer' : 'Share with Community'}
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
  onPray: (id: string) => void;
}

function CommunityPrayerList({
  prayers,
  currentUser,
  onPray
}: CommunityPrayerListProps) {
  if (prayers.length === 0) {
    return (
      <div className={cn(typography.small, 'text-center py-20 text-white/50')}>
        No community prayers yet, but that's okay! Someone needs to be first. Why not you? Your prayer could be exactly what someone else needs to see today.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prayers.map(prayer => {
        const currentUserId = currentUser?.uid || `guest_${Date.now()}`;
        const isMyPrayer = currentUserId === prayer.userId;
        const hasUserPrayed = prayer.hearts.some(h => h.userId === currentUserId);

        return (
          <div
            key={prayer.id}
            className={cn(card.default, 'hover:border-white/20 transition-colors')}
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

            <p className={cn(typography.small, 'text-white/70 mb-3 line-clamp-3')}>{prayer.request}</p>

            <button
              onClick={() => onPray(prayer.id)}
              disabled={isMyPrayer || hasUserPrayed}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-medium transition-all',
                isMyPrayer
                  ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                  : hasUserPrayed
                  ? 'bg-red-400/20 border border-red-400/30 text-red-400 cursor-default'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-red-400/20 hover:border-red-400/30 hover:text-red-400'
              )}
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
      <div className={cn(typography.small, 'text-center py-20 text-white/50')}>
        No prayers yet? That's fine! God hears your heart even before the words come. Ready to start? Add one above.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prayers.map(prayer => (
        <div
          key={prayer.id}
          className={card.default}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className={cn(typography.small, 'font-semibold text-white flex-1')}>{prayer.title}</h3>
            {prayer.tags.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-white/10 border border-white/15 rounded text-white/60 capitalize">
                {prayer.tags[0]}
              </span>
            )}
          </div>

          {prayer.description && (
            <p className={cn(typography.small, 'text-white/70 mb-3 line-clamp-2')}>{prayer.description}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => onMarkAnswered(prayer.id)}
              className="px-3 py-1.5 bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 rounded hover:bg-yellow-400/30 text-xs font-medium transition-colors"
            >
              ✓ Answered
            </button>
            <button
              onClick={() => onDelete(prayer.id)}
              className="px-3 py-1.5 bg-red-400/20 border border-red-400/30 text-red-400 rounded hover:bg-red-400/30 text-xs font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
