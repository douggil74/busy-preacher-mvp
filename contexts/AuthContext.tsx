// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  firstName: string;
  fullName: string;
  email: string;
  photoURL?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  createdAt: any;
  lastSignIn: any;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, firstName: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserLocation: (city: string, state: string, country?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Load user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          // Create initial profile
          const profile = await createUserProfile(firebaseUser);
          setUser(profile);
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
    const displayName = firebaseUser.displayName || 'User';
    const firstName = displayName.split(' ')[0];

    const profile: UserProfile = {
      uid: firebaseUser.uid,
      firstName,
      fullName: displayName,
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: serverTimestamp(),
      lastSignIn: serverTimestamp()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), profile);
    return profile;
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);

      // Update last sign in
      await setDoc(
        doc(db, 'users', result.user.uid),
        { lastSignIn: serverTimestamp() },
        { merge: true }
      );

      // Request location permission after sign in
      requestLocationPermission();
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Update last sign in
      await setDoc(
        doc(db, 'users', result.user.uid),
        { lastSignIn: serverTimestamp() },
        { merge: true }
      );
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, firstName: string, fullName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Create user profile
      const profile: UserProfile = {
        uid: result.user.uid,
        firstName,
        fullName,
        email: result.user.email || email,
        createdAt: serverTimestamp(),
        lastSignIn: serverTimestamp()
      };

      await setDoc(doc(db, 'users', result.user.uid), profile);

      // Request location permission after sign up
      requestLocationPermission();
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateUserLocation = async (city: string, state: string, country?: string) => {
    if (!user) return;

    const location = {
      city,
      state,
      country: country || 'USA'
    };

    await setDoc(
      doc(db, 'users', user.uid),
      { location },
      { merge: true }
    );

    setUser({ ...user, location });
  };

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) return;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000
        });
      });

      // Use reverse geocoding to get city/state
      const { latitude, longitude } = position.coords;

      // Using a free geocoding API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );

      if (response.ok) {
        const data = await response.json();
        const city = data.address?.city || data.address?.town || data.address?.village || '';
        const state = data.address?.state || '';
        const country = data.address?.country || 'USA';

        if (city && state) {
          await updateUserLocation(city, state, country);
        }
      }
    } catch (error) {
      console.log('Location permission denied or unavailable');
      // Not critical - user can continue without location
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated: !!user,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateUserLocation
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
