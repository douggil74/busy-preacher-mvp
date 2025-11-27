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
 * Generate a random string for nonce
 */
function generateNonce(length: number = 32): string {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  randomValues.forEach((v) => {
    result += charset[v % charset.length];
  });
  return result;
}

/**
 * SHA256 hash a string
 */
async function sha256(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Native Apple Sign-In for iOS
 * Returns Firebase User
 */
export async function nativeAppleSignIn() {
  try {
    console.log('🍎 Starting native Apple Sign-In...');

    // Generate a random nonce and hash it with SHA256
    const rawNonce = generateNonce();
    const hashedNonce = await sha256(rawNonce);

    console.log('🔐 Generated nonce for Apple Sign-In');

    const result: SignInWithAppleResponse = await SignInWithApple.authorize({
      clientId: 'com.busychristian.signin',
      redirectURI: 'https://thebusychristian-app.firebaseapp.com/__/auth/handler',
      scopes: 'email name',
      state: generateNonce(10),
      nonce: hashedNonce,
    });

    console.log('✅ Native Apple Sign-In successful');
    console.log('Identity Token:', result.response.identityToken ? 'present' : 'missing');

    if (!result.response.identityToken) {
      throw new Error('No identity token received from Apple Sign-In');
    }

    // Create Firebase credential with identity token and raw (unhashed) nonce
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: result.response.identityToken,
      rawNonce: rawNonce,  // Use the raw nonce, not the hashed one
    });

    console.log('🔑 Signing in to Firebase with credential...');

    // Sign in to Firebase
    const userCredential = await signInWithCredential(auth, credential);
    console.log('✅ Firebase sign-in successful:', userCredential.user.email);

    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Native Apple Sign-In error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    alert('Apple Sign-In Error: ' + error.message);
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
