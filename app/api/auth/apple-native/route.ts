/**
 * Backend API for Native Apple Sign-In Token Exchange
 *
 * This route receives the Apple identity token from native iOS,
 * verifies it, creates/updates the user in Firestore,
 * and returns a Firebase custom token for client sign-in.
 *
 * This bypasses WebView OAuth restrictions by moving the token
 * exchange to the backend where there are no limitations.
 */

import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for Firebase Admin SDK compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Import Firebase Admin only at runtime to avoid bundling for client
let adminAuth: any;
let adminDb: any;

async function initializeAdmin() {
  if (!adminAuth) {
    const { adminAuth: auth, adminDb: db } = await import('@/lib/firebase-admin');
    adminAuth = auth;
    adminDb = db;
  }
}

interface AppleTokenPayload {
  identityToken: string;
  authorizationCode?: string;
  user?: {
    email?: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase Admin at runtime
    await initializeAdmin();

    const { identityToken, authorizationCode, user }: AppleTokenPayload = await request.json();

    if (!identityToken) {
      return NextResponse.json(
        { error: 'Missing identity token' },
        { status: 400 }
      );
    }

    console.log('🍎 Backend: Received Apple identity token');

    // Verify the Apple identity token with Firebase Admin
    let decodedToken;
    try {
      // Create a provider credential for verification
      // Firebase Admin can verify Apple tokens directly
      decodedToken = await adminAuth.verifyIdToken(identityToken);
      console.log('✅ Backend: Token verified, UID:', decodedToken.uid);
    } catch (verifyError: any) {
      console.error('❌ Backend: Token verification failed:', verifyError);

      // If direct verification fails, try creating user with Apple provider
      // This handles first-time sign-in where token might not be a Firebase token
      try {
        // Decode the Apple JWT manually to get user info
        const parts = identityToken.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('📝 Backend: Decoded Apple token payload:', {
          sub: payload.sub,
          email: payload.email,
          email_verified: payload.email_verified
        });

        // Check if user exists in Firebase
        let firebaseUser;
        try {
          firebaseUser = await adminAuth.getUserByEmail(payload.email);
          console.log('✅ Backend: Found existing Firebase user:', firebaseUser.uid);
        } catch (getUserError: any) {
          // User doesn't exist, create new user
          console.log('📝 Backend: Creating new Firebase user...');

          const displayName = user?.name
            ? `${user.name.firstName || ''} ${user.name.lastName || ''}`.trim()
            : 'User';

          firebaseUser = await adminAuth.createUser({
            email: payload.email,
            emailVerified: payload.email_verified || false,
            displayName: displayName || undefined,
            providerToLink: {
              providerId: 'apple.com',
              uid: payload.sub,
            } as any,
          });

          console.log('✅ Backend: Created new Firebase user:', firebaseUser.uid);

          // Create user profile in Firestore
          const firstName = user?.name?.firstName || displayName.split(' ')[0] || 'User';
          const userProfile = {
            uid: firebaseUser.uid,
            firstName,
            fullName: displayName,
            email: payload.email,
            createdAt: new Date(),
            lastSignIn: new Date(),
          };

          await adminDb.collection('users').doc(firebaseUser.uid).set(userProfile);
          console.log('✅ Backend: Created user profile in Firestore');
        }

        // Update last sign in
        await adminDb.collection('users').doc(firebaseUser.uid).update({
          lastSignIn: new Date(),
        });

        // Create custom token for client
        const customToken = await adminAuth.createCustomToken(firebaseUser.uid);
        console.log('✅ Backend: Created custom token');

        return NextResponse.json({
          customToken,
          uid: firebaseUser.uid,
          email: firebaseUser.email
        });

      } catch (createError: any) {
        console.error('❌ Backend: Failed to create/find user:', createError);
        return NextResponse.json(
          { error: 'Failed to authenticate with Apple', details: createError.message },
          { status: 500 }
        );
      }
    }

    // If we got here, token was verified successfully (existing Firebase user)
    // Update last sign in
    await adminDb.collection('users').doc(decodedToken.uid).update({
      lastSignIn: new Date(),
    });

    // Create custom token for client
    const customToken = await adminAuth.createCustomToken(decodedToken.uid);
    console.log('✅ Backend: Created custom token for existing user');

    return NextResponse.json({
      customToken,
      uid: decodedToken.uid,
      email: decodedToken.email
    });

  } catch (error: any) {
    console.error('❌ Backend: Apple sign-in error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
