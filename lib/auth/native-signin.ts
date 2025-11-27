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
 */
export async function nativeAppleSignIn() {
  try {
    console.log('🍎 Starting native Apple Sign-In...');

    // Generate a random nonce for security
    const nonce = Math.random().toString(36).substring(2, 15);

    const result: SignInWithAppleResponse = await SignInWithApple.authorize({
      clientId: 'com.busychristian.signin',
      redirectURI: 'https://thebusychristian-app.firebaseapp.com/__/auth/handler',
      scopes: 'email name',
      state: Math.random().toString(36).substring(7),
      nonce: nonce,
    });

    console.log('✅ Native Apple Sign-In successful');
    console.log('Identity Token:', result.response.identityToken ? 'present' : 'missing');
    console.log('Authorization Code:', result.response.authorizationCode ? 'present' : 'missing');

    if (!result.response.identityToken) {
      throw new Error('No identity token received from Apple Sign-In');
    }

    // Create Firebase credential with both identity token and nonce
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: result.response.identityToken,
      rawNonce: nonce,
    });

    console.log('🔑 Signing in to Firebase...');

    // Sign in to Firebase
    const userCredential = await signInWithCredential(auth, credential);
    console.log('✅ Firebase sign-in successful:', userCredential.user.email);

    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Native Apple Sign-In error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
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
