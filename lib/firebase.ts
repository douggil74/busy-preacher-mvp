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
import { getAuth, Auth } from 'firebase/auth';
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

// Messaging only works in browser
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
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

// ========== PUSH NOTIFICATIONS ==========

export async function savePushToken(userId: string, token: string): Promise<void> {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    pushToken: token
  });
}

export async function requestPushPermission(userId: string): Promise<string | null> {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });

    if (token) {
      await savePushToken(userId, token);
      return token;
    }

    return null;
  } catch (err) {
    console.error('Push permission error:', err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void): void {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Foreground push message:', payload);
    callback(payload);
  });
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
