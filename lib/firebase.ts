// lib/firebase.ts
// Firebase client + SSR-safe setup for The Busy Christian Prayer Network

import {
  initializeApp,
  getApps,
  getApp,
  FirebaseApp
} from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  addDoc,
  updateDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { getAuth, Auth, indexedDBLocalPersistence, setPersistence } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// ========== CONFIG ==========
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

// ========== INITIALIZE ==========
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let messaging: any = null;

// Initialize for both server and client
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

db = getFirestore(app);
auth = getAuth(app);

// Check if running in Capacitor/iOS native app
const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();

// Set persistence - skip on Capacitor iOS to prevent lockups
if (typeof window !== 'undefined' && !isCapacitor) {
  // Only use indexedDB persistence on web (not iOS Capacitor)
  setPersistence(auth, indexedDBLocalPersistence).catch((error) => {
    console.warn('Failed to set auth persistence:', error);
  });
}

// Messaging only works in browser (not Capacitor iOS)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !isCapacitor) {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn('⚠️ Messaging not supported:', err);
  }
}

// ========== TYPES ==========
export interface PrayerRequest {
  id?: string;
  userId: string;
  userName: string;
  userLocation?: string;
  request: string;
  category: 'health' | 'family' | 'work' | 'spiritual' | 'other';
  isAnonymous: boolean;
  hearts: PrayerHeart[];
  heartCount: number;
  createdAt: any;
  expiresAt: any;
  status: 'active' | 'answered' | 'expired' | 'hidden';
  isModerated: boolean;
  flagCount: number;
  praiseReport?: string;
  answeredAt?: any;
}

export interface PrayerHeart {
  userId: string;
  userName: string;
  timestamp: any;
}

export interface PrayerWarrior {
  userId: string;
  name: string;
  location?: string;
  isPrayerWarrior: boolean;
  prayerCategories: string[];
  pushToken?: string;
  totalPrayers: number;
  totalRequests: number;
  prayerStreak: number;
  lastPrayedAt?: any;
  joinedAt: any;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// ========== FIRESTORE FUNCTIONS ==========

export async function submitPrayerRequest(
  userId: string,
  userName: string,
  request: string,
  category: PrayerRequest['category'],
  isAnonymous = false,
  userLocation?: string
): Promise<string> {
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const data: PrayerRequest = {
    userId,
    userName: isAnonymous ? 'Anonymous' : userName,
    request,
    category,
    isAnonymous,
    hearts: [],
    heartCount: 0,
    createdAt: serverTimestamp(),
    expiresAt,
    status: 'active',
    isModerated: true,
    flagCount: 0
  };

  if (!isAnonymous && userLocation) {
    data.userLocation = userLocation;
  }

  const docRef = await addDoc(collection(db, 'prayer_requests'), data);
  return docRef.id;
}

export async function addPrayerHeart(
  requestId: string,
  userId: string,
  userName: string
): Promise<void> {
  const ref = doc(db, 'prayer_requests', requestId);
  const snap = await getDoc(ref);
  const currentHearts = snap.data()?.hearts || [];

  const heart: PrayerHeart = {
    userId,
    userName,
    timestamp: Timestamp.now()
  };

  await updateDoc(ref, {
    hearts: [...currentHearts, heart],
    heartCount: increment(1)
  });

  await updateUserPrayerStats(userId);
}

export async function markPrayerAnswered(
  requestId: string,
  praiseReport: string
): Promise<void> {
  const ref = doc(db, 'prayer_requests', requestId);
  await updateDoc(ref, {
    status: 'answered',
    praiseReport,
    answeredAt: serverTimestamp()
  });
}

export async function flagPrayerRequest(requestId: string): Promise<void> {
  const ref = doc(db, 'prayer_requests', requestId);
  await updateDoc(ref, {
    flagCount: increment(1)
  });
}

export function subscribeToPrayerRequests(
  onUpdate: (prayers: PrayerRequest[]) => void,
  filters?: {
    category?: string;
    status?: string;
  }
): () => void {
  let q = query(
    collection(db, 'prayer_requests'),
    where('status', '==', filters?.status || 'active'),
    orderBy('createdAt', 'desc')
  );

  if (filters?.category) {
    q = query(q, where('category', '==', filters.category));
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const prayers: PrayerRequest[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PrayerRequest));
    onUpdate(prayers);
  });

  return unsubscribe;
}

// ========== USERS ==========

export async function becomePrayerWarrior(
  userId: string,
  name: string,
  location?: string,
  categories: string[] = ['all']
): Promise<void> {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    isPrayerWarrior: true,
    prayerCategories: categories,
    name,
    location
  });
}

async function updateUserPrayerStats(userId: string): Promise<void> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      userId,
      name: 'User',
      isPrayerWarrior: false,
      prayerCategories: [],
      totalPrayers: 1,
      totalRequests: 0,
      prayerStreak: 0,
      lastPrayedAt: serverTimestamp(),
      joinedAt: serverTimestamp(),
      badgeLevel: 'bronze'
    });
  } else {
    await updateDoc(ref, {
      totalPrayers: increment(1),
      lastPrayedAt: serverTimestamp()
    });
  }
}

// ========== PUSH NOTIFICATIONS (IMPROVED) ==========

export async function savePushToken(userId: string, token: string): Promise<void> {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    pushToken: token
  });
}

export async function requestPushPermission(userId: string): Promise<string | null> {
  // Silently fail if messaging not available (not all browsers support it)
  if (!messaging) {
    console.log('ℹ️ Push notifications not available in this browser');
    return null;
  }

  // Check if VAPID key is configured
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn('⚠️ NEXT_PUBLIC_FIREBASE_VAPID_KEY not configured');
    return null;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('ℹ️ User denied notification permission');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, { vapidKey });

    if (token) {
      console.log('✅ Got FCM token, saving to user profile');
      await savePushToken(userId, token);
      return token;
    } else {
      console.warn('⚠️ No FCM token received');
      return null;
    }

  } catch (err: any) {
    // Don't throw error - just log and return null
    // This makes push notifications truly optional
    console.warn('⚠️ Push notification setup failed:', err.message || err);
    
    // If it's a specific Firebase error, log more details
    if (err.code) {
      console.warn('Firebase error code:', err.code);
    }
    
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void): void {
  if (!messaging) {
    console.log('ℹ️ Foreground messaging not available');
    return;
  }

  try {
    onMessage(messaging, (payload) => {
      console.log('📬 Foreground push message:', payload);

      // 🔊 Play local sound immediately
      try {
        const audio = new Audio('/prayer-sound.mp3');
        audio.play().catch((e) => console.warn('Audio play failed:', e));
      } catch (e) {
        console.warn('Audio not available:', e);
      }

      // 🔔 Show browser popup notification
      try {
        const title = payload.notification?.title || 'Prayer Update';
        const body = payload.notification?.body || 'Someone prayed for your request!';
        new Notification(title, {
          body,
          icon: '/icon-192x192.png',
        });
      } catch (e) {
        console.warn('Browser notification failed:', e);
      }

      // Send payload to your React UI (like setNotification)
      callback(payload);
    });
  } catch (err) {
    console.warn('⚠️ Could not set up foreground message listener:', err);
  }
}

// ========== EXPORTS ==========
export { app, db, auth, messaging };

export default {
  submitPrayerRequest,
  addPrayerHeart,
  markPrayerAnswered,
  flagPrayerRequest,
  subscribeToPrayerRequests,
  becomePrayerWarrior,
  requestPushPermission,
  onForegroundMessage
};