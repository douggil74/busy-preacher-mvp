// Firebase Cloud Functions for The Busy Christian
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Send notification when someone prays (adds heart)
export const onPrayerHeartAdded = functions.firestore
  .document('prayer_requests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before || !after) return;

    // Check if heartCount increased
    if ((after.heartCount || 0) <= (before.heartCount || 0)) {
      return;
    }

    const userId = after.userId;

    // Get the user's push token
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const user = userDoc.data();

    if (!user?.pushToken) {
      console.log('No push token for user:', userId);
      return;
    }

    const payload = {
      notification: {
        title: '🙏 Someone Prayed for You',
        body: 'Someone just committed to pray for your request.',
      },
      token: user.pushToken
    };

    try {
      await admin.messaging().send(payload);
      console.log('✅ Notification sent to:', userId);
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  });
