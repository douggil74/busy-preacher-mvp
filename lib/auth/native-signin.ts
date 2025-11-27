/**
 * Native Sign-In Service
 * Handles native Apple and Google Sign-In for iOS app
 * Uses web OAuth for browser
 */

import { Capacitor } from '@capacitor/core';
import { SignInWithApple, SignInWithAppleResponse } from '@capacitor-community/apple-sign-in';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * Check if running in native iOS app
 */
export function isNativeIOSApp(): boolean {
  return Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform();
}

/**
 * Initialize native Google Auth
 * Must be called on app startup
 */
export async function initializeNativeGoogleAuth() {
  if (isNativeIOSApp()) {
    try {
      await GoogleAuth.initialize({
        clientId: '689195108551-8v3f7e0l9q4h4k6h5j6f7g8h9j0k1l2m.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
      console.log('✅ Google Auth initialized for iOS');
    } catch (error) {
      console.error('⚠️ Failed to initialize Google Auth:', error);
    }
  }
}

/**
 * Native Apple Sign-In for iOS
 * Returns Firebase User
 *
 * NEW APPROACH: Instead of client-side credential exchange (which fails in WebView),
 * we send the Apple token to our backend API which exchanges it for a Firebase
 * custom token. This bypasses ALL WebView OAuth restrictions!
 */
export async function nativeAppleSignIn() {
  try {
    console.log('🍎 Starting native Apple Sign-In for iOS...');

    // Call Apple Sign-In
    const result: SignInWithAppleResponse = await SignInWithApple.authorize({
      clientId: 'com.busychristian.app',
      redirectURI: 'https://thebusychristian-app.firebaseapp.com/__/auth/handler',
      scopes: 'email name',
    });

    console.log('✅ Got response from Apple');

    if (!result.response.identityToken) {
      throw new Error('No identity token received from Apple Sign-In');
    }

    // Send Apple token to backend for exchange
    console.log('🔄 Sending token to backend for exchange...');

    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/auth/apple-native`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identityToken: result.response.identityToken,
        authorizationCode: result.response.authorizationCode,
        user: result.response.user,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Backend authentication failed');
    }

    const { customToken } = await response.json();
    console.log('✅ Got custom token from backend');

    // Sign in to Firebase with custom token
    console.log('🔑 Signing in to Firebase with custom token...');
    const { signInWithCustomToken } = await import('firebase/auth');
    const userCredential = await signInWithCustomToken(auth, customToken);

    console.log('✅ SUCCESS! User:', userCredential.user.email);

    return userCredential.user;
  } catch (error: any) {
    console.error('❌ ERROR:', error);
    throw error;
  }
}

/**
 * Native Google Sign-In for iOS
 * Returns Firebase User
 */
export async function nativeGoogleSignIn() {
  try {
    console.log('📱 Starting native Google Sign-In...');

    const googleUser = await GoogleAuth.signIn();
    console.log('✅ Native Google Sign-In successful');

    if (!googleUser.authentication?.idToken) {
      throw new Error('No ID token received from Google');
    }

    // Create Firebase credential
    const credential = GoogleAuthProvider.credential(
      googleUser.authentication.idToken,
      googleUser.authentication.accessToken
    );

    // Sign in to Firebase
    const userCredential = await signInWithCredential(auth, credential);
    console.log('✅ Firebase sign-in successful:', userCredential.user.email);

    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Native Google Sign-In error:', error);
    throw error;
  }
}
