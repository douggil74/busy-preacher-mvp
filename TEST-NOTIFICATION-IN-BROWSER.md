# Prayer Notification System - Test Instructions

## What Was Fixed

### 1. **Fixed Race Condition in Heart Updates**
**Problem:** Hearts were being added using array spread (`[...prayer.hearts, newHeart]`), which caused race conditions where:
- The local state could be stale
- `heartCount` could increment but `hearts` array wouldn't update
- Notifications would fail because hearts array was empty

**Solution:** Now using Firebase's atomic `arrayUnion()` operation:
```javascript
await updateDoc(prayerRef, {
  hearts: arrayUnion({ userId: currentUserId, timestamp: Date.now() }),
  heartCount: increment(1)
});
```

### 2. **Enhanced Logging**
Added comprehensive console logging to track:
- When notifications are triggered
- Heart count changes
- Hearts array validation
- Why notifications might not show

### 3. **Better Error Handling**
- Validates hearts array is actually an array
- Checks for user authentication before allowing hearts
- Logs detailed error messages

## How to Test

### **Test 1: Two-Browser Test (Recommended)**

1. **Browser 1 (Your Account):**
   - Sign in to your Google account
   - Go to http://localhost:3001/prayer
   - Create a new community prayer request
   - Open browser console (F12) to see logs
   - Keep this tab open and visible

2. **Browser 2 (Different Account):**
   - Sign in with a DIFFERENT Google account (or use incognito mode)
   - Go to http://localhost:3001/prayer
   - Find the prayer you created in Browser 1
   - Click the heart (🙏) button to pray for it

3. **Expected Result in Browser 1:**
   - Console should show: "💓 New heart detected!"
   - Console should show: "✅ Showing notification for prayer: [id]"
   - A yellow notification should slide down from top-right
   - You should hear a notification sound (if sound is enabled)
   - Phone should vibrate (if on mobile)
   - Notification shows: "Someone is praying for you!"

### **Test 2: Check Console Logs**

Open browser console in the prayer page and look for:

```
📱 Prayer page: user state changed: [Your Name] ([your-uid])
🔔 Starting notification listener for user: [your-uid]
🔔 Checking for prayer updates... X prayers found
Prayer "Your prayer text..." - Hearts: 0 (was: 0), isInitialLoad: true
🔔 Finished checking prayers. Setting isInitialLoad = false
```

When someone adds a heart:
```
Prayer "Your prayer text..." - Hearts: 1 (was: 0), isInitialLoad: false
💓 New heart detected! { lastHeart: {...}, myUserId: "...", heartsLength: 1 }
✅ Showing notification for prayer: [prayer-id]
```

### **Test 3: Verify Sound**

1. Make sure browser allows audio playback
2. Check notification sound toggle (🔔 icon in notification)
3. Listen for notification sound at 30% volume
4. If sound doesn't play, check:
   - `/notification.mp3` exists in public folder ✅
   - Browser console for audio errors
   - Browser autoplay policy (may need user interaction first)

### **Test 4: Mobile/Safari Test**

1. Test on mobile device (iPhone/Android)
2. Should feel vibration: `[200ms, 100ms, 200ms]` pattern
3. Notification should still show even if sound blocked

## Troubleshooting

### "Not showing notification - it was your own heart"
✅ **Expected!** You won't get notified when you heart your own prayers.

### "Heart count increased but hearts array is empty"
❌ **Bug!** This should not happen anymore with `arrayUnion()`.
- Check Firestore rules allow writes
- Check network connection
- Look for Firestore errors in console

### "Notification listener not started - user not signed in"
❌ **Problem:** User not authenticated
- RequireAuth should prevent this
- Check if AuthContext is working
- Verify Firebase Auth is initialized

### No sound plays
- Check browser console for audio errors
- Try clicking page first (browsers block autoplay)
- Check sound toggle (🔔) in notification
- Verify `/notification.mp3` exists
- On mobile, check device volume

## Debug Commands

Run these in browser console while on `/prayer` page:

```javascript
// Check if notification listener is running
console.log('Checking notification setup...');

// Check localStorage sound preference
localStorage.getItem('notificationSound'); // should be "true" or "false"

// Manually trigger a test notification (won't have sound)
// Replace with actual prayer ID from your data
const testNotification = {
  id: 'test',
  message: '3 people are praying',
  prayerTitle: 'Test prayer notification',
  type: 'prayer_support'
};
// This will show the notification UI
```

## What Happens When Someone Prays

1. User B clicks heart on User A's prayer
2. Firestore atomically updates: `hearts: arrayUnion(...)` + `heartCount: increment(1)`
3. User A's browser (subscribed via `onSnapshot`) receives update
4. Notification listener detects: `currentHeartCount > previousCount`
5. Checks: `!isInitialLoad` ✅ and `lastHeart.userId !== myUserId` ✅
6. Triggers: `setNotification({...})`
7. PrayerNotification component renders and plays sound
8. Auto-closes after 5 seconds

## Technical Details

**Notification Listener:**
- Runs only when user is signed in
- Queries only user's own active prayers: `where('userId', '==', user.uid)`
- Skips initial load to avoid false notifications
- Compares heart counts to detect changes
- Validates hearts array before showing notification

**Sound System:**
- Default: `/notification.mp3` (98KB)
- Volume: 30%
- Fallback: Vibration on mobile
- User can toggle: localStorage key `notificationSound`

## Files Modified

- ✅ `/app/prayer/page.tsx` - Fixed heart updates with `arrayUnion()`
- ✅ `/app/prayer/page.tsx` - Enhanced notification listener logging
- ✅ `/app/prayer/page.tsx` - Added RequireAuth wrapper
- ✅ `/components/PrayerNotification.tsx` - Already had sound system
- ✅ `/public/notification.mp3` - Sound file exists
