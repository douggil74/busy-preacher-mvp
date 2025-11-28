/**
 * Firebase Admin SDK for Server-Side Operations
 * Used for verifying tokens and creating custom auth tokens
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (singleton pattern)
if (!admin.apps.length) {
  try {
    // Initialize with service account credentials from environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // Private key handling: support both literal \n strings and actual newlines
        privateKey: (() => {
          const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
          if (!key) return undefined;
          // If key contains literal \n, replace with actual newlines
          // Otherwise, assume it already has proper newlines
          return key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
        })(),
      }),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    throw error;
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

export default admin;
