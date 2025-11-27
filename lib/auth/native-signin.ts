/**
 * Native Sign-In Service
 * Handles native Apple and Google Sign-In for iOS app
 * Uses web OAuth for browser
 */

import { Capacitor } from '@capacitor/core';
import { SignInWithApple, SignInWithAppleResponse } from '@capacitor-community/apple-sign-in';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { OAuthProvider, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
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
 * SIMPLIFIED: No nonce for native iOS - just use identity token directly
 */
export async function nativeAppleSignIn() {
  try {
    console.log('🍎 Starting native Apple Sign-In for iOS...');
    alert('Starting Apple Sign-In...');

    // Simplest possible call - no nonce, no client ID for native iOS
    const result: SignInWithAppleResponse = await SignInWithApple.authorize({
      scopes: 'email name',
    });

    console.log('✅ Got response from Apple');
    console.log('Identity Token:', result.response.identityToken ? 'YES' : 'NO');
    console.log('User:', result.response.user);
    console.log('Email:', result.response.email);
    console.log('Full Name:', result.response.givenName, result.response.familyName);

    if (!result.response.identityToken) {
      alert('Error: No identity token from Apple');
      throw new Error('No identity token received from Apple Sign-In');
    }

    alert('Got token from Apple, signing in to Firebase...');

    // Use identity token directly with Firebase - no nonce needed for native
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: result.response.identityToken,
    });

    console.log('🔑 Created Firebase credential, signing in...');

    // Sign in to Firebase
    const userCredential = await signInWithCredential(auth, credential);

    console.log('✅ Firebase sign-in SUCCESS!');
    console.log('User email:', userCredential.user.email);
    console.log('User UID:', userCredential.user.uid);

    alert('Success! Signed in as: ' + userCredential.user.email);

    return userCredential.user;
  } catch (error: any) {
    console.error('❌ APPLE SIGN-IN ERROR:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));

    const errorMsg = `Apple Sign-In Failed!\n\nCode: ${error.code || 'unknown'}\n\nMessage: ${error.message || 'No message'}\n\nPlease screenshot this!`;
    alert(errorMsg);

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
