"use strict";
// functions/src/index.ts
// Cloud Functions for The Busy Christian Prayer Center
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireOldPrayers = exports.updateWarriorStats = exports.detectSpam = exports.detectCrisis = exports.onPrayerHeartAdded = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
// ========================================
// PUSH NOTIFICATION WHEN SOMEONE PRAYS
// ========================================
exports.onPrayerHeartAdded = functions.firestore
    .document('prayer_requests/{prayerId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const prayerId = context.params.prayerId;
    // Check if heartCount increased
    const heartCountBefore = before.heartCount || 0;
    const heartCountAfter = after.heartCount || 0;
    if (heartCountAfter <= heartCountBefore) {
        console.log('No new hearts added, skipping notification');
        return null;
    }
    console.log(`🙏 New heart added! Count: ${heartCountBefore} → ${heartCountAfter}`);
    // Get the prayer request owner
    const ownerId = after.userId;
    // Don't send notification if prayer is anonymous
    if (ownerId === 'anonymous') {
        console.log('Prayer is anonymous, skipping notification');
        return null;
    }
    // Check who added the heart
    const heartsBefore = before.hearts || [];
    const heartsAfter = after.hearts || [];
    const newHearts = heartsAfter.filter((heart) => !heartsBefore.some((oldHeart) => oldHeart.userId === heart.userId));
    if (newHearts.length === 0) {
        console.log('No new unique hearts found');
        return null;
    }
    // Get the person who just prayed
    const lastHeart = newHearts[newHearts.length - 1];
    const prayerUserId = lastHeart.userId;
    // Don't notify if user prayed for their own prayer
    if (prayerUserId === ownerId) {
        console.log('⚠️ User prayed for their own prayer, skipping notification');
        return null;
    }
    console.log(`✅ ${prayerUserId} prayed for ${ownerId}'s prayer - sending notification`);
    try {
        // Get the owner's push token
        const userDoc = await db.collection('users').doc(ownerId).get();
        if (!userDoc.exists) {
            console.log('User not found, skipping notification');
            return null;
        }
        const userData = userDoc.data();
        const pushToken = userData === null || userData === void 0 ? void 0 : userData.pushToken;
        if (!pushToken) {
            console.log('User has no push token, skipping notification');
            return null;
        }
        // Get the first line of the prayer request as title
        const prayerRequest = after.request || 'Your prayer request';
        const prayerTitle = prayerRequest.split('\n')[0].substring(0, 60);
        // Prepare notification payload
        const payload = {
            token: pushToken,
            notification: {
                title: '🙏 Someone is Praying for You!',
                body: `${heartCountAfter} ${heartCountAfter === 1 ? 'person is' : 'people are'} praying for: ${prayerTitle}`,
            },
            data: {
                type: 'prayer_heart',
                prayerId: prayerId,
                heartCount: heartCountAfter.toString(),
                url: '/prayer',
            },
            webpush: {
                notification: {
                    icon: '/icon-192x192.png',
                    badge: '/badge-72x72.png',
                    requireInteraction: false,
                    tag: `prayer-${prayerId}`,
                    renotify: true,
                    vibrate: [200, 100, 200],
                },
                fcmOptions: {
                    link: 'https://thebusychristianapp.com/prayer',
                },
            },
        };
        // Send the notification
        const response = await messaging.send(payload);
        console.log('✅ Notification sent successfully:', response);
        return response;
    }
    catch (error) {
        console.error('❌ Error sending notification:', error);
        // If token is invalid, remove it from user document
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
            console.log('Removing invalid push token from user');
            await db.collection('users').doc(ownerId).update({
                pushToken: admin.firestore.FieldValue.delete()
            });
        }
        return null;
    }
});
// ========================================
// CRISIS DETECTION
// ========================================
exports.detectCrisis = functions.firestore
    .document('prayer_requests/{prayerId}')
    .onCreate(async (snap, context) => {
    const data = snap.data();
    const request = (data.request || '').toLowerCase();
    // Crisis keywords
    const crisisKeywords = [
        'suicide', 'kill myself', 'end it all', 'want to die',
        'self harm', 'cutting', 'overdose', 'hurt myself',
        'no reason to live', 'better off dead'
    ];
    const hasCrisisKeyword = crisisKeywords.some(keyword => request.includes(keyword));
    if (hasCrisisKeyword) {
        console.log('⚠️ CRISIS DETECTED in prayer request:', context.params.prayerId);
        // Flag the prayer for immediate review
        await snap.ref.update({
            crisisDetected: true,
            flagCount: admin.firestore.FieldValue.increment(5),
            needsModeration: true
        });
    }
    return null;
});
// ========================================
// SPAM DETECTION
// ========================================
exports.detectSpam = functions.firestore
    .document('prayer_requests/{prayerId}')
    .onCreate(async (snap, context) => {
    const data = snap.data();
    const request = (data.request || '').toLowerCase();
    // Spam patterns
    const spamPatterns = [
        /http[s]?:\/\//gi,
        /\$\d+/g,
        /buy now/gi,
        /click here/gi,
        /viagra|cialis/gi,
    ];
    const isSpam = spamPatterns.some(pattern => pattern.test(request));
    if (isSpam) {
        console.log('⚠️ SPAM DETECTED:', context.params.prayerId);
        await snap.ref.update({
            spamDetected: true,
            flagCount: admin.firestore.FieldValue.increment(10),
            status: 'hidden',
            needsModeration: true
        });
    }
    return null;
});
// ========================================
// PRAYER WARRIOR STATS UPDATE
// ========================================
exports.updateWarriorStats = functions.firestore
    .document('prayer_requests/{prayerId}')
    .onUpdate(async (change, context) => {
    var _a;
    const before = change.before.data();
    const after = change.after.data();
    const heartsBefore = before.hearts || [];
    const heartsAfter = after.hearts || [];
    // Find new hearts
    const newHearts = heartsAfter.filter((heart) => !heartsBefore.some((oldHeart) => oldHeart.userId === heart.userId));
    if (newHearts.length === 0)
        return null;
    // Update stats for each prayer warrior
    const batch = db.batch();
    for (const heart of newHearts) {
        const userRef = db.collection('users').doc(heart.userId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            const totalPrayers = (((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.totalPrayers) || 0) + 1;
            let badgeLevel = 'bronze';
            if (totalPrayers >= 1000)
                badgeLevel = 'platinum';
            else if (totalPrayers >= 100)
                badgeLevel = 'gold';
            else if (totalPrayers >= 25)
                badgeLevel = 'silver';
            batch.update(userRef, {
                totalPrayers,
                badgeLevel,
                lastPrayedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    }
    await batch.commit();
    console.log('✅ Warrior stats updated');
    return null;
});
// ========================================
// AUTO-EXPIRE OLD PRAYERS
// ========================================
exports.expireOldPrayers = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const expiredPrayers = await db
        .collection('prayer_requests')
        .where('expiresAt', '<=', now)
        .where('status', '==', 'active')
        .get();
    console.log(`Found ${expiredPrayers.size} expired prayers`);
    const batch = db.batch();
    expiredPrayers.forEach(doc => {
        batch.update(doc.ref, { status: 'expired' });
    });
    await batch.commit();
    console.log('✅ Expired prayers updated');
    return null;
});
//# sourceMappingURL=index.js.map