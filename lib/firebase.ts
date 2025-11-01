// lib/firebase.ts
// Firebase Configuration for The Busy Christian Prayer Network

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
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
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
// Replace these with your actual Firebase project credentials
// lib/firebase.ts

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

// ADD THIS DEBUG CODE:
console.log('🔥 Firebase Config Check:');
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'EXISTS' : '❌ MISSING');
console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'EXISTS' : '❌ MISSING');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'EXISTS' : '❌ MISSING');
console.log('Full API Key (first 10 chars):', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10));
console.log('firebaseConfig:', firebaseConfig);

// Initialize Firebase (singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Messaging (only in browser)
let messaging: any = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Messaging not available:', error);
  }
}

// =====================================
// PRAYER REQUEST TYPES
// =====================================

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

// =====================================
// PRAYER REQUEST FUNCTIONS
// =====================================

/**
 * Submit a new prayer request
 */
export async function submitPrayerRequest(
  userId: string,
  userName: string,
  request: string,
  category: PrayerRequest['category'],
  isAnonymous: boolean = false,
  userLocation?: string
): Promise<string> {
  try {
    const now = new Date();
    const expiresIn7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const prayerData: any = {
  userId,
  userName: isAnonymous ? 'Anonymous' : userName,
  request,
  category,
  isAnonymous,
  hearts: [],
  heartCount: 0,
  createdAt: serverTimestamp(),
  expiresAt: Timestamp.fromDate(expiresIn7Days),
  status: 'active',
  isModerated: true,
  flagCount: 0
};

// Only add userLocation if not anonymous and has a value
if (!isAnonymous && userLocation) {
  prayerData.userLocation = userLocation;
}    const docRef = await addDoc(collection(db, 'prayer_requests'), prayerData);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting prayer request:', error);
    throw error;
  }
}

/**
 * Add a heart (prayer) to a request
 */
export async function addPrayerHeart(
  requestId: string,
  userId: string,
  userName: string
): Promise<void> {
  try {
    const requestRef = doc(db, 'prayer_requests', requestId);
    
    const heart: PrayerHeart = {
  userId,
  userName,
  timestamp: Timestamp.now()  // ← GOOD - Use Timestamp.now() instead
};

// First, get the current hearts array
const docSnap = await getDoc(requestRef);
const currentHearts = docSnap.data()?.hearts || [];

await updateDoc(requestRef, {
  hearts: [...currentHearts, heart],
  heartCount: increment(1)
});
    // Update user's prayer count
    await updateUserPrayerStats(userId);
  } catch (error) {
    console.error('Error adding prayer heart:', error);
    throw error;
  }
}

/**
 * Mark prayer as answered with praise report
 */
export async function markPrayerAnswered(
  requestId: string,
  praiseReport: string
): Promise<void> {
  try {
    const requestRef = doc(db, 'prayer_requests', requestId);
    await updateDoc(requestRef, {
      status: 'answered',
      praiseReport,
      answeredAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking prayer answered:', error);
    throw error;
  }
}

/**
 * Flag inappropriate content
 */
export async function flagPrayerRequest(requestId: string): Promise<void> {
  try {
    const requestRef = doc(db, 'prayer_requests', requestId);
    await updateDoc(requestRef, {
      flagCount: increment(1)
    });
    // Cloud Function will auto-hide if flagCount >= 3
  } catch (error) {
    console.error('Error flagging prayer:', error);
    throw error;
  }
}

/**
 * Listen to prayer requests in real-time
 */
export function subscribeToPrayerRequests(
  onUpdate: (prayers: PrayerRequest[]) => void,
  filters?: {
    category?: string;
    status?: string;
  }
): () => void {
  try {
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
  } catch (error) {
    console.error('Error subscribing to prayers:', error);
    throw error;
  }
}

// =====================================
// USER / PRAYER WARRIOR FUNCTIONS
// =====================================

/**
 * Register user as a Prayer Warrior (opts in to notifications)
 */
export async function becomePrayerWarrior(
  userId: string,
  name: string,
  location?: string,
  categories: string[] = ['all']
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isPrayerWarrior: true,
      prayerCategories: categories,
      name,
      location
    });
  } catch (error) {
    console.error('Error becoming prayer warrior:', error);
    throw error;
  }
}

/**
 * Update user's prayer statistics
 */
async function updateUserPrayerStats(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create user document if it doesn't exist
      await setDoc(userRef, {
        userId: userId,
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
      console.log('Created user document for', userId);
    } else {
      // Update existing user
      await updateDoc(userRef, {
        totalPrayers: increment(1),
        lastPrayedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating prayer stats:', error);
    // Don't throw - let the prayer heart still work
  }
}
/**
 * Save push notification token
 */
export async function savePushToken(userId: string, token: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pushToken: token
    });
  } catch (error) {
    console.error('Error saving push token:', error);
    throw error;
  }
}

// =====================================
// PUSH NOTIFICATION FUNCTIONS
// =====================================

/**
 * Request push notification permission and get token
 */
export async function requestPushPermission(userId: string): Promise<string | null> {
  if (!messaging) {
    console.log('Messaging not supported');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });
      
      if (token) {
        await savePushToken(userId, token);
        return token;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error requesting push permission:', error);
    return null;
  }
}

/**
 * Listen for foreground push notifications
 */
export function onForegroundMessage(callback: (payload: any) => void): void {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
}

// =====================================
// EXPORTS
// =====================================

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