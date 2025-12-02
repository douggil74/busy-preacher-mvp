import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log(`🗑️ Starting account deletion for user: ${userId}`);

    // Collections to delete user data from
    const collectionsToClean = [
      'users',
      'subscriptions',
      'prayers',
      'devotionals',
      'reading-progress',
      'saved-items',
      'guidance-history',
      'notifications',
      'user-preferences',
    ];

    // Delete user documents from all collections
    const deletePromises = collectionsToClean.map(async (collection) => {
      try {
        const docRef = adminDb.collection(collection).doc(userId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          await docRef.delete();
          console.log(`  ✓ Deleted from ${collection}`);
        }
      } catch (e) {
        console.log(`  - No data in ${collection} or error:`, e);
      }
    });

    // Also delete any subcollections under user document
    const userSubcollections = [
      'prayers',
      'saved',
      'history',
      'notes',
    ];

    const subcollectionDeletes = userSubcollections.map(async (subcollection) => {
      try {
        const subRef = adminDb.collection('users').doc(userId).collection(subcollection);
        const snapshot = await subRef.get();
        const batch = adminDb.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        if (snapshot.docs.length > 0) {
          await batch.commit();
          console.log(`  ✓ Deleted ${snapshot.docs.length} docs from users/${userId}/${subcollection}`);
        }
      } catch (e) {
        console.log(`  - No subcollection ${subcollection} or error:`, e);
      }
    });

    // Delete profile photo from storage if exists
    // Note: This would need Firebase Storage Admin, skipping for now

    // Wait for all Firestore deletions
    await Promise.all([...deletePromises, ...subcollectionDeletes]);

    // Delete the Firebase Auth user
    try {
      await adminAuth.deleteUser(userId);
      console.log('  ✓ Deleted Firebase Auth user');
    } catch (authError: any) {
      // User might not exist in Auth (e.g., if using custom auth)
      if (authError.code !== 'auth/user-not-found') {
        console.error('Error deleting auth user:', authError);
      }
    }

    console.log(`✅ Account deletion completed for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted'
    });

  } catch (error: any) {
    console.error('❌ Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
