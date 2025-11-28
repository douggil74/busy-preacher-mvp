// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  firstName: string;
  fullName: string;
  email: string;
  phone?: string; // Optional phone for crisis contact
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
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, firstName: string, fullName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserLocation: (city: string, state: string, country?: string) => Promise<void>;
  updateUserPhone: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    console.log('Auth state listener initialized');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Load user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          const userWithId = {
            uid: firebaseUser.uid,
            ...profileData
          } as UserProfile;

          console.log('User loaded:', userWithId.firstName, userWithId.uid);
          setUser(userWithId);

          // Save to localStorage for email transcripts
          if (typeof window !== 'undefined' && userWithId.email) {
            localStorage.setItem('bc-user-email', userWithId.email);
            localStorage.setItem('bc-user-name', userWithId.firstName || userWithId.fullName);
          }

          // Update last sign in
          await setDoc(
            doc(db, 'users', firebaseUser.uid),
            { lastSignIn: serverTimestamp() },
            { merge: true }
          );
        } else {
          // Profile doesn't exist - create one with email info
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            firstName: firebaseUser.email?.split('@')[0] || 'User',
            fullName: firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            createdAt: serverTimestamp(),
            lastSignIn: serverTimestamp()
          };

          await setDoc(doc(db, 'users', firebaseUser.uid), profile);
          setUser(profile);

          if (typeof window !== 'undefined' && profile.email) {
            localStorage.setItem('bc-user-email', profile.email);
            localStorage.setItem('bc-user-name', profile.firstName);
          }
        }
      } else {
        console.log('Clearing user state');
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bc-user-email');
          localStorage.removeItem('bc-user-name');
        }
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);

      // Clear all auth-related localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bc-user-email');
        localStorage.removeItem('bc-user-name');
        localStorage.removeItem('bc-onboarding-complete');
        localStorage.removeItem('bc-style');
        localStorage.removeItem('bc-study-style');
        window.location.href = '/';
      }
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

  const updateUserPhone = async (phone: string) => {
    if (!user) return;

    await setDoc(
      doc(db, 'users', user.uid),
      { phone },
      { merge: true }
    );

    setUser({ ...user, phone });
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated: !!user,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
    updateUserLocation,
    updateUserPhone
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
