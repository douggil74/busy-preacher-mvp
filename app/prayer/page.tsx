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
  increment,
  arrayUnion
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
import { EncouragingBanner } from '@/components/EncouragingBanner';
import { card, button, input, typography, cn } from '@/lib/ui-constants';
import { getPastorNote } from '@/lib/personalMessages';
import RequireAuth from '@/components/RequireAuth';
import { Paywall } from '@/components/Paywall';

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
  type?: 'milestone' | 'prayer_support' | 'reminder';
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
  const [pastorNote, setPastorNote] = useState<string>("");
  const [soundUnlocked, setSoundUnlocked] = useState(false);

  // ========================================
  // EFFECTS
  // ========================================

  // Generate dynamic pastor message
  useEffect(() => {
    setPastorNote(getPastorNote());
  }, []);

  // Check if sound was already unlocked
  useEffect(() => {
    const unlocked = localStorage.getItem('soundUnlocked');
    if (unlocked === 'true') {
      setSoundUnlocked(true);
    }
  }, []);

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

  // Listen for prayers on MY requests (when signed in)
  useEffect(() => {
    console.log('📱 Prayer page: user state changed:', user ? `${user.firstName} (${user.uid})` : 'null');

    // Only run if user is signed in and uid exists
    if (!user || !user.uid) {
      console.log('🔕 Notification listener not started - user not signed in');
      return;
    }

    console.log('🔔 Starting notification listener for user:', user.uid);

    const myPrayersQuery = query(
      collection(db, 'prayer_requests'),
      where('userId', '==', user.uid),
      where('status', '==', 'active')
    );

    let previousHeartCounts: { [key: string]: number } = {};
    let isInitialLoad = true;

    const unsubscribe = onSnapshot(myPrayersQuery, (snapshot) => {
      console.log('🔔 Checking for prayer updates...', snapshot.docs.length, 'prayers found');

      snapshot.docs.forEach((doc) => {
        const prayer = doc.data() as CommunityPrayer;
        const prayerId = doc.id;
        const currentHeartCount = prayer.heartCount || 0;
        const previousCount = previousHeartCounts[prayerId] || 0;

        console.log(`Prayer "${prayer.request.substring(0, 30)}..." - Hearts: ${currentHeartCount} (was: ${previousCount}), isInitialLoad: ${isInitialLoad}`);

        if (currentHeartCount > previousCount && !isInitialLoad) {
          // Ensure hearts array exists and has items
          if (prayer.hearts && Array.isArray(prayer.hearts) && prayer.hearts.length > 0) {
            const lastHeart = prayer.hearts[prayer.hearts.length - 1];
            console.log('💓 New heart detected!', { lastHeart, myUserId: user.uid, heartsLength: prayer.hearts.length });

            if (lastHeart && lastHeart.userId !== user.uid) {
              console.log('✅ Showing notification for prayer:', prayerId);
              setNotification({
                id: prayerId,
                message: `${currentHeartCount} ${currentHeartCount === 1 ? 'person is' : 'people are'} praying`,
                prayerTitle: prayer.request.split('\n')[0].substring(0, 60),
                type: 'prayer_support'
              });
              // Sound is played by PrayerNotification component
            } else {
              console.log('⚠️ Not showing notification - it was your own heart');
            }
          } else {
            console.log('⚠️ Heart count increased but hearts array is empty or invalid:', {
              hearts: prayer.hearts,
              isArray: Array.isArray(prayer.hearts)
            });
          }
        }

        previousHeartCounts[prayerId] = currentHeartCount;
      });

      console.log('🔔 Finished checking prayers. Setting isInitialLoad = false');
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
        // Use authenticated user info if available, otherwise allow anonymous posting
        const userId = user?.uid || 'anonymous';
        const displayName = isAnonymous ? 'Anonymous' : (user?.firstName || 'Prayer Warrior');
        const userLocation = user?.location ? `${user.location.city}, ${user.location.state}` : undefined;
        const request = prayerDescription
          ? `${prayerTitle}\n\n${prayerDescription}`
          : prayerTitle;

        await submitPrayerRequest(
          userId,
          displayName,
          request,
          category,
          isAnonymous,
          userLocation
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
    // Must be signed in (RequireAuth ensures this, but check anyway)
    if (!user?.uid) {
      console.error('Cannot add heart: user not signed in');
      return;
    }

    const prayer = communityPrayers.find(p => p.id === prayerId);
    const currentUserId = user.uid;

    // Check if user already prayed (handle missing hearts array)
    const hearts = prayer?.hearts || [];
    if (!prayer || hearts.some(h => h.userId === currentUserId)) {
      console.log('Cannot add heart: prayer not found or user already prayed');
      return;
    }

    try {
      console.log('💓 Adding heart to prayer:', prayerId);
      const prayerRef = doc(db, 'prayer_requests', prayerId);

      // Use arrayUnion to atomically add to hearts array
      await updateDoc(prayerRef, {
        hearts: arrayUnion({ userId: currentUserId, timestamp: Date.now() }),
        heartCount: increment(1)
      });

      console.log('✅ Heart added successfully');
    } catch (error) {
      console.error('❌ Error adding heart:', error);
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

  const handleUnlockSound = async () => {
    try {
      // First unlock the AudioContext (required by iOS Safari)
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        await audioContext.resume();

        // Create a short beep to confirm it works
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = 0.1;
        oscillator.frequency.value = 440;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      }

      // Also play the actual notification sound to preload it
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      await audio.play();

      console.log('🔊 Sound unlocked for mobile!');
      setSoundUnlocked(true);
      localStorage.setItem('soundUnlocked', 'true');
    } catch (err) {
      console.warn('Could not unlock sound:', err);
      // Still mark as unlocked so the banner goes away
      // The user may have their phone on silent
      setSoundUnlocked(true);
      localStorage.setItem('soundUnlocked', 'true');
      alert('Sound enabled! Make sure your device is not on silent mode.');
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
    <RequireAuth>
    <Paywall>
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      <div className="page-container">
        {pastorNote && <EncouragingBanner message={pastorNote} />}

        {/* Sound unlock banner for mobile */}
        {!soundUnlocked && typeof localStorage !== 'undefined' && !localStorage.getItem('soundUnlocked') && (
          <div className="mb-6 p-4 bg-yellow-400/20 border border-yellow-400/30 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔔</span>
              <div className="flex-1">
                <h3 className="text-yellow-400 font-semibold text-sm mb-1">
                  Enable Prayer Notifications
                </h3>
                <p className="text-white/70 text-xs mb-3">
                  Tap below to enable sound notifications when people pray for your requests
                </p>
                <button
                  onClick={handleUnlockSound}
                  className="px-4 py-2 bg-yellow-400/30 hover:bg-yellow-400/40 border border-yellow-400/50 rounded-lg text-yellow-400 text-sm font-medium transition-colors"
                >
                  🔊 Enable Sound
                </button>
              </div>
            </div>
          </div>
        )}

        <Header
          userName={null}
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
    </Paywall>
  </RequireAuth>
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
      <p className={cn(typography.small, 'text-white/70 light:text-black/70')}>
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
                : 'border border-white/10 light:border-black/10 bg-white/5 light:bg-black/5 text-white/60 light:text-black/60 hover:border-white/20 light:hover:border-black/20'
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
            <span className="text-white/80 light:text-black/80">Post anonymously</span>
          </label>
        </div>
      )}

      <div className="flex items-center gap-6 mb-3 p-3 bg-white/5 light:bg-black/5 rounded-lg border border-white/10 light:border-black/10">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={!isPrivate}
            onChange={() => setIsPrivate(false)}
            className="w-4 h-4 text-yellow-400"
          />
          <span className="text-sm text-white/80 light:text-black/80">
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
          <span className="text-sm text-white/80 light:text-black/80">🔒 Keep Private</span>
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
      <div className={cn(typography.small, 'text-center py-20 text-white/50 light:text-black/50')}>
        No community prayers yet, but that's okay! Someone needs to be first. Why not you? Your prayer could be exactly what someone else needs to see today.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prayers.map(prayer => {
        // Use authenticated user ID if available
        const currentUserId = currentUser?.uid;
        const isMyPrayer = currentUserId && currentUserId === prayer.userId;
        // Handle missing hearts array for older prayers
        const hearts = prayer.hearts || [];
        const hasUserPrayed = currentUserId && hearts.some(h => h.userId === currentUserId);

        return (
          <div
            key={prayer.id}
            className={cn(card.default, 'hover:border-white/20 transition-colors')}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white light:text-black text-sm truncate">
                    {prayer.isAnonymous ? 'Anonymous' : getFirstName(prayer.userName)}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-white/10 light:bg-black/10 border border-white/15 light:border-black/15 rounded text-white/60 light:text-black/60 capitalize flex-shrink-0">
                    {categoryEmojis[prayer.category]} {prayer.category}
                  </span>
                  {isMyPrayer && (
                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 flex-shrink-0">
                      Your Prayer
                    </span>
                  )}
                </div>
                {getState(prayer.userLocation) && (
                  <div className="text-xs text-white/50 light:text-black/50">{getState(prayer.userLocation)}</div>
                )}
              </div>
              <span className="text-xs text-white/50 light:text-black/50 flex-shrink-0">
                {formatDate(prayer.createdAt)}
              </span>
            </div>

            <p className={cn(typography.small, 'text-white/70 light:text-black/70 mb-3 line-clamp-3')}>{prayer.request}</p>

            <button
              onClick={() => onPray(prayer.id)}
              disabled={isMyPrayer || hasUserPrayed}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-medium transition-all',
                isMyPrayer
                  ? 'bg-white/5 light:bg-black/5 border border-white/10 light:border-black/10 text-white/40 light:text-black/40 cursor-not-allowed'
                  : hasUserPrayed
                  ? 'bg-red-400/20 border border-red-400/30 text-red-400 cursor-default'
                  : 'bg-white/5 light:bg-black/5 border border-white/10 light:border-black/10 text-white/70 light:text-black/70 hover:bg-red-400/20 hover:border-red-400/30 hover:text-red-400'
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
      <div className={cn(typography.small, 'text-center py-20 text-white/50 light:text-black/50')}>
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
            <h3 className={cn(typography.small, 'font-semibold text-white light:text-black flex-1')}>{prayer.title}</h3>
            {prayer.tags.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-white/10 light:bg-black/10 border border-white/15 light:border-black/15 rounded text-white/60 light:text-black/60 capitalize">
                {prayer.tags[0]}
              </span>
            )}
          </div>

          {prayer.description && (
            <p className={cn(typography.small, 'text-white/70 light:text-black/70 mb-3 line-clamp-2')}>{prayer.description}</p>
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
