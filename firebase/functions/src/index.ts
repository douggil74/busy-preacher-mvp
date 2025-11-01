// functions/src/index.ts
// Firebase Cloud Functions for The Busy Christian Prayer Network

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// =====================================
// PRAYER REQUEST NOTIFICATIONS
// =====================================

/**
 * Send push notification when new prayer request is created
 * Triggers: onCreate prayer_requests/{requestId}
 */
export const sendNewPrayerNotification = functions.firestore
  .document('prayer_requests/{requestId}')
  .onCreate(async (snap, context) => {
    const prayer = snap.data();
    const requestId = context.params.requestId;

    try {
      // Get all Prayer Warriors
      const warriorsSnapshot = await db.collection('users')
        .where('isPrayerWarrior', '==', true)
        .get();

      if (warriorsSnapshot.empty) {
        console.log('No prayer warriors found');
        return;
      }

      // Filter warriors by category preference
      const eligibleWarriors = warriorsSnapshot.docs.filter(doc => {
        const warrior = doc.data();
        return warrior.prayerCategories.includes('all') || 
               warrior.prayerCategories.includes(prayer.category);
      });

      // Get push tokens
      const tokens = eligibleWarriors
        .map(doc => doc.data().pushToken)
        .filter(token => token); // Remove undefined tokens

      if (tokens.length === 0) {
        console.log('No push tokens found');
        return;
      }

      // Prepare notification
      const userName = prayer.isAnonymous ? 'Someone' : prayer.userName;
      const requestPreview = prayer.request.length > 100 
        ? prayer.request.substring(0, 100) + '...'
        : prayer.request;

      const message = {
        notification: {
          title: '🙏 New Prayer Request',
          body: `${userName}: ${requestPreview}`,
        },
        data: {
          type: 'new_prayer',
          requestId: requestId,
          category: prayer.category,
          userId: prayer.userId
        },
        tokens: tokens
      };

      // Send notification
      const response = await messaging.sendMulticast(message);
      
      console.log(`Sent ${response.successCount} notifications`);
      
      if (response.failureCount > 0) {
        console.log(`Failed to send ${response.failureCount} notifications`);
        
        // Clean up invalid tokens
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        
        // Remove invalid tokens from users
        await cleanupInvalidTokens(failedTokens);
      }

      return response;
    } catch (error) {
      console.error('Error sending new prayer notification:', error);
      throw error;
    }
  });

/**
 * Send notification when someone prays (adds heart)
 * Triggers: onUpdate prayer_requests/{requestId}
 */
export const sendPrayerHeartNotification = functions.firestore
  .document('prayer_requests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const requestId = context.params.requestId;

    // Check if heart count increased
    if (after.heartCount <= before.heartCount) {
      return;
    }

    try {
      // Get the prayer request owner
      const ownerSnapshot = await db.collection('users')
        .doc(after.userId)
        .get();

      if (!ownerSnapshot.exists) {
        console.log('Owner not found');
        return;
      }

      const owner = ownerSnapshot.data();
      const pushToken = owner?.pushToken;

      if (!pushToken) {
        console.log('Owner has no push token');
        return;
      }

      // Get the person who just prayed (last heart)
      const lastHeart = after.hearts[after.hearts.length - 1];
      const prayerName = lastHeart?.userName || 'Someone';

      // Prepare notification
      const message = {
        notification: {
          title: '❤️ Someone is praying for you!',
          body: `${prayerName} and ${after.heartCount} ${after.heartCount === 1 ? 'person is' : 'people are'} praying right now`,
        },
        data: {
          type: 'prayer_heart',
          requestId: requestId,
          heartCount: after.heartCount.toString()
        },
        token: pushToken
      };

      // Send notification
      await messaging.send(message);
      console.log(`Sent heart notification to ${after.userId}`);

      return;
    } catch (error) {
      console.error('Error sending heart notification:', error);
      throw error;
    }
  });

// =====================================
// AUTO-MODERATION
// =====================================

/**
 * Auto-moderate prayer requests for concerning content
 * Triggers: onCreate prayer_requests/{requestId}
 */
export const moderatePrayerContent = functions.firestore
  .document('prayer_requests/{requestId}')
  .onCreate(async (snap, context) => {
    const prayer = snap.data();
    const requestId = context.params.requestId;
    const content = prayer.request.toLowerCase();

    // Crisis keywords that trigger immediate intervention
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'end my life',
      'want to die', 'better off dead', 'hurt myself',
      'cut myself', 'overdose', 'end the pain'
    ];

    // Check for crisis content
    const hasCrisisContent = crisisKeywords.some(keyword => 
      content.includes(keyword)
    );

    if (hasCrisisContent) {
      try {
        // Flag for immediate review
        await snap.ref.update({
          needsModeration: true,
          crisisDetected: true,
          moderationReason: 'Crisis keywords detected'
        });

        // Send crisis resources to user
        await sendCrisisResources(prayer.userId);

        // Alert moderators
        await alertModerators(requestId, 'Crisis content detected');

        console.log(`Crisis content detected in prayer ${requestId}`);
      } catch (error) {
        console.error('Error handling crisis content:', error);
      }
    }

    // Check for spam patterns
    const spamPatterns = [
      /https?:\/\//i, // URLs
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Emails
    ];

    const hasSpam = spamPatterns.some(pattern => pattern.test(content));

    if (hasSpam) {
      await snap.ref.update({
        needsModeration: true,
        spamDetected: true,
        moderationReason: 'Spam pattern detected'
      });
      console.log(`Spam detected in prayer ${requestId}`);
    }

    return;
  });

/**
 * Auto-hide prayers with multiple flags
 * Triggers: onUpdate prayer_requests/{requestId}
 */
export const autoHideFlaggedPrayers = functions.firestore
  .document('prayer_requests/{requestId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const requestId = context.params.requestId;

    // Auto-hide if 3+ flags
    if (after.flagCount >= 3 && after.status !== 'hidden') {
      try {
        await change.after.ref.update({
          status: 'hidden',
          hiddenReason: 'Multiple user reports',
          hiddenAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Alert moderators
        await alertModerators(requestId, 'Auto-hidden due to multiple flags');

        console.log(`Prayer ${requestId} auto-hidden due to flags`);
      } catch (error) {
        console.error('Error auto-hiding prayer:', error);
      }
    }

    return;
  });

// =====================================
// PRAYER WARRIOR BADGES
// =====================================

/**
 * Update Prayer Warrior badge when they pray
 * Triggers: onUpdate users/{userId}
 */
export const updatePrayerWarriorBadge = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if totalPrayers increased
    if (after.totalPrayers <= before.totalPrayers) {
      return;
    }

    let newBadge = after.badgeLevel || 'bronze';
    let shouldUpdate = false;

    // Badge thresholds
    if (after.totalPrayers >= 1000 && after.badgeLevel !== 'platinum') {
      newBadge = 'platinum';
      shouldUpdate = true;
    } else if (after.totalPrayers >= 500 && after.badgeLevel === 'silver' || after.badgeLevel === 'bronze') {
      newBadge = 'gold';
      shouldUpdate = true;
    } else if (after.totalPrayers >= 100 && after.badgeLevel === 'bronze') {
      newBadge = 'silver';
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await change.after.ref.update({
        badgeLevel: newBadge
      });

      // Send congratulations notification
      if (after.pushToken) {
        await messaging.send({
          notification: {
            title: '🏆 New Badge Earned!',
            body: `You've reached ${newBadge.toUpperCase()} Prayer Warrior status! ${after.totalPrayers} prayers and counting!`
          },
          token: after.pushToken
        });
      }

      console.log(`User ${context.params.userId} earned ${newBadge} badge`);
    }

    return;
  });

// =====================================
// CLEANUP & MAINTENANCE
// =====================================

/**
 * Delete expired prayer requests
 * Scheduled: Daily at midnight
 */
export const cleanupExpiredPrayers = functions.pubsub
  .schedule('0 0 * * *') // Every day at midnight
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    
    // Find expired prayers
    const expiredSnapshot = await db.collection('prayer_requests')
      .where('expiresAt', '<=', now)
      .where('status', '==', 'active')
      .get();

    if (expiredSnapshot.empty) {
      console.log('No expired prayers found');
      return;
    }

    // Batch delete
    const batch = db.batch();
    expiredSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'expired' });
    });

    await batch.commit();
    console.log(`Expired ${expiredSnapshot.size} prayers`);

    return;
  });

/**
 * Update prayer streak for active warriors
 * Scheduled: Daily at 1 AM
 */
export const updatePrayerStreaks = functions.pubsub
  .schedule('0 1 * * *') // Every day at 1 AM
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all prayer warriors
    const warriorsSnapshot = await db.collection('users')
      .where('isPrayerWarrior', '==', true)
      .get();

    const batch = db.batch();
    let streaksUpdated = 0;

    for (const doc of warriorsSnapshot.docs) {
      const warrior = doc.data();
      const lastPrayed = warrior.lastPrayedAt?.toDate();

      if (lastPrayed && lastPrayed >= yesterday && lastPrayed < today) {
        // Prayed yesterday - increment streak
        batch.update(doc.ref, {
          prayerStreak: admin.firestore.FieldValue.increment(1)
        });
        streaksUpdated++;
      } else if (!lastPrayed || lastPrayed < yesterday) {
        // Missed a day - reset streak
        batch.update(doc.ref, {
          prayerStreak: 0
        });
      }
    }

    if (streaksUpdated > 0) {
      await batch.commit();
      console.log(`Updated ${streaksUpdated} prayer streaks`);
    }

    return;
  });

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Send crisis resources to user who needs help
 */
async function sendCrisisResources(userId: string): Promise<void> {
  try {
    const userSnapshot = await db.collection('users').doc(userId).get();
    const user = userSnapshot.data();
    const pushToken = user?.pushToken;

    if (pushToken) {
      await messaging.send({
        notification: {
          title: '🆘 Help is Available',
          body: 'If you\'re in crisis, please call 988 (Suicide & Crisis Lifeline). You are not alone.',
        },
        data: {
          type: 'crisis_support',
          hotline: '988',
          url: 'https://988lifeline.org'
        },
        token: pushToken
      });
    }

    console.log(`Sent crisis resources to user ${userId}`);
  } catch (error) {
    console.error('Error sending crisis resources:', error);
  }
}

/**
 * Alert moderators of flagged content
 */
async function alertModerators(requestId: string, reason: string): Promise<void> {
  // Get admin users
  const adminsSnapshot = await db.collection('users')
    .where('isAdmin', '==', true)
    .get();

  if (adminsSnapshot.empty) {
    console.log('No admins found');
    return;
  }

  const adminTokens = adminsSnapshot.docs
    .map(doc => doc.data().pushToken)
    .filter(token => token);

  if (adminTokens.length > 0) {
    await messaging.sendMulticast({
      notification: {
        title: '⚠️ Moderation Alert',
        body: `Prayer request ${requestId}: ${reason}`,
      },
      data: {
        type: 'moderation_alert',
        requestId: requestId,
        reason: reason
      },
      tokens: adminTokens
    });
  }
}

/**
 * Remove invalid push tokens from user documents
 */
async function cleanupInvalidTokens(tokens: string[]): Promise<void> {
  const batch = db.batch();
  
  for (const token of tokens) {
    const usersSnapshot = await db.collection('users')
      .where('pushToken', '==', token)
      .get();

    usersSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        pushToken: admin.firestore.FieldValue.delete()
      });
    });
  }

  await batch.commit();
  console.log(`Cleaned up ${tokens.length} invalid tokens`);
}