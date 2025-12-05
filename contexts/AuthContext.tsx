// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserPreferences {
  studyStyle?: string;
  studyGoal?: string;
  weeklyFrequency?: number;
  enableDevotional?: boolean;
  enableReadingPlan?: boolean;
  enableReminders?: boolean;
  onboardingComplete?: boolean;
}

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
  preferences?: UserPreferences;
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
  updateUserPreferences: (preferences: UserPreferences) => Promise<void>;
  // Phone auth
  sendPhoneCode: (phoneNumber: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
  verifyPhoneCode: (confirmationResult: ConfirmationResult, code: string, firstName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if running in Capacitor/iOS native app
function checkIsCapacitor(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!(window as any).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    console.log('Auth state listener initialized');
    const isNativeApp = checkIsCapacitor();

    // On iOS Capacitor, set a timeout to prevent lockups
    // If auth doesn't respond within 3 seconds, assume no user
    let timeoutId: NodeJS.Timeout | null = null;
    if (isNativeApp) {
      timeoutId = setTimeout(() => {
        console.log('iOS Capacitor: Auth timeout - assuming no authenticated user');
        setIsLoading(false);
      }, 3000);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clear timeout since auth responded
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      console.log('Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Load user profile from Firestore (with timeout on iOS)
        try {
          // Use shorter timeout on iOS Capacitor to prevent lockups
          const firestoreTimeout = isNativeApp ? 3000 : 10000;
          const userDocPromise = getDoc(doc(db, 'users', firebaseUser.uid));
          const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), firestoreTimeout)
          );

          const userDoc = await Promise.race([userDocPromise, timeoutPromise]);

          // If timeout occurred (userDoc is null), use basic info
          if (!userDoc) {
            console.log('Firestore timeout - using basic user info');
            setUser({
              uid: firebaseUser.uid,
              firstName: firebaseUser.email?.split('@')[0] || 'User',
              fullName: firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              createdAt: null,
              lastSignIn: null
            });
            setIsLoading(false);
            return;
          }

          if (userDoc.exists()) {
            const profileData = userDoc.data();
            const userWithId = {
              uid: firebaseUser.uid,
              ...profileData
            } as UserProfile;

            console.log('User loaded:', userWithId.firstName, userWithId.uid);
            setUser(userWithId);

            // Save to localStorage for email transcripts and preferences
            if (typeof window !== 'undefined') {
              if (userWithId.email) {
                localStorage.setItem('bc-user-email', userWithId.email);
              }
              localStorage.setItem('bc-user-name', userWithId.firstName || userWithId.fullName);

              // Restore preferences from Firestore to localStorage
              if (userWithId.preferences) {
                const prefs = userWithId.preferences;
                if (prefs.onboardingComplete) {
                  localStorage.setItem('bc-onboarding-complete', 'true');
                  localStorage.setItem('onboarding_completed', 'true');
                }
                if (prefs.studyStyle) {
                  localStorage.setItem('bc-style', prefs.studyStyle);
                }
                if (prefs.studyGoal) {
                  localStorage.setItem('bc-study-goal', prefs.studyGoal);
                }
                if (prefs.weeklyFrequency !== undefined) {
                  localStorage.setItem('bc-weekly-frequency', String(prefs.weeklyFrequency));
                }
                if (prefs.enableDevotional !== undefined) {
                  localStorage.setItem('bc-show-devotional', String(prefs.enableDevotional));
                }
                if (prefs.enableReadingPlan !== undefined) {
                  localStorage.setItem('bc-show-reading-plan', String(prefs.enableReadingPlan));
                }
                if (prefs.enableReminders !== undefined) {
                  localStorage.setItem('bc-enable-reminders', String(prefs.enableReminders));
                }
                console.log('Restored preferences from Firestore:', prefs);
              }
            }

            // Update last sign in and track login data (IP, location)
            await setDoc(
              doc(db, 'users', firebaseUser.uid),
              { lastSignIn: serverTimestamp() },
              { merge: true }
            );

            // Track login with IP and location (fire and forget)
            fetch('/api/auth/track-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: firebaseUser.uid }),
            }).catch(err => console.error('Login tracking failed:', err));
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
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // Still set basic user info even if Firestore fails
          setUser({
            uid: firebaseUser.uid,
            firstName: firebaseUser.email?.split('@')[0] || 'User',
            fullName: firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            createdAt: null,
            lastSignIn: null
          });
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

    return () => {
      unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
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

      // Clear auth-related localStorage (but keep onboarding/preferences)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bc-user-email');
        localStorage.removeItem('bc-user-name');
        // Don't clear onboarding - user shouldn't redo it when signing back in
        // localStorage.removeItem('bc-onboarding-complete');
        // Don't clear preferences either - keep style settings
        // localStorage.removeItem('bc-style');
        // localStorage.removeItem('bc-study-style');
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

  const updateUserPreferences = async (preferences: UserPreferences) => {
    if (!user) return;

    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { preferences },
        { merge: true }
      );

      setUser({ ...user, preferences: { ...user.preferences, ...preferences } });
      console.log('Saved preferences to Firestore:', preferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // Still update local state even if Firestore fails
      setUser({ ...user, preferences: { ...user.preferences, ...preferences } });
    }
  };

  // Phone authentication - Step 1: Send verification code
  const sendPhoneCode = async (phoneNumber: string, recaptchaContainerId: string): Promise<ConfirmationResult> => {
    try {
      // Format phone number to E.164 format if not already
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
        formattedPhone = '1' + formattedPhone; // Add US country code
      }
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      // Create invisible reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      return confirmationResult;
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      throw error;
    }
  };

  // Phone authentication - Step 2: Verify the code
  const verifyPhoneCode = async (confirmationResult: ConfirmationResult, code: string, firstName?: string) => {
    try {
      const result = await confirmationResult.confirm(code);

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));

      if (!userDoc.exists()) {
        // Create new user profile for phone user
        const profile: UserProfile = {
          uid: result.user.uid,
          firstName: firstName || 'User',
          fullName: firstName || 'User',
          email: '', // Phone users don't have email
          phone: result.user.phoneNumber || '',
          createdAt: serverTimestamp(),
          lastSignIn: serverTimestamp()
        };

        await setDoc(doc(db, 'users', result.user.uid), profile);
      }
    } catch (error: any) {
      console.error('Code verification error:', error);
      throw error;
    }
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
    updateUserPhone,
    updateUserPreferences,
    sendPhoneCode,
    verifyPhoneCode
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
