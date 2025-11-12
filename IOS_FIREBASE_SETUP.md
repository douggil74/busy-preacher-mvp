# Firebase Cloud Messaging (FCM) Setup for iOS

## Prerequisites
- Apple Developer Account (enrolled in Apple Developer Program)
- Firebase project already created (thebusychristian-app)
- Xcode installed on your Mac

## Step 1: Create APNs Authentication Key

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles** → **Keys**
3. Click the **+** button to create a new key
4. Name it: `The Busy Christian APNs Key`
5. Check the box for **Apple Push Notifications service (APNs)**
6. Click **Continue** → **Register**
7. **Download the .p8 file** (you can only download this ONCE!)
8. Note your:
   - **Key ID** (10-character string)
   - **Team ID** (found in top-right of developer portal)

## Step 2: Upload APNs Key to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **thebusychristian-app**
3. Go to **Project Settings** (gear icon) → **Cloud Messaging** tab
4. Scroll to **Apple app configuration**
5. Click **Upload** under APNs Authentication Key
6. Upload your **.p8 file**
7. Enter your **Key ID**
8. Enter your **Team ID**
9. Click **Upload**

## Step 3: Download GoogleService-Info.plist

1. Still in Firebase Console → **Project Settings**
2. Scroll to **Your apps** section
3. Find your iOS app or click **Add app** → **iOS**
   - Bundle ID: `com.busychristian.app`
   - App nickname: `The Busy Christian iOS`
   - App Store ID: (leave blank for now)
4. Click **Download GoogleService-Info.plist**
5. Save this file - you'll add it to Xcode in the next step

## Step 4: Add GoogleService-Info.plist to Xcode

1. Open your iOS project in Xcode:
   ```bash
   npm run ios:open
   ```

2. In Xcode, find the **App** folder in the left sidebar

3. **Drag and drop** the `GoogleService-Info.plist` file into the **App** folder

4. In the dialog that appears:
   - ✅ Check **Copy items if needed**
   - ✅ Check **App** target
   - Click **Finish**

5. Verify the file appears in your project navigator under the **App** group

## Step 5: Add Firebase SDK to iOS Project

1. Open `ios/App/Podfile` in a text editor

2. Add Firebase dependencies after the `use_frameworks!` line:

```ruby
target 'App' do
  capacitor_pods
  # Add pods for desired Firebase products
  # https://firebase.google.com/docs/ios/setup#available-pods
  
  pod 'Firebase/Messaging'
  pod 'Firebase/Analytics'
end
```

3. Install the pods:
```bash
cd ios/App
pod install
cd ../..
```

## Step 6: Initialize Firebase in AppDelegate

1. Open `ios/App/App/AppDelegate.swift`

2. Add Firebase import at the top:
```swift
import FirebaseCore
import FirebaseMessaging
```

3. Add Firebase initialization in `application(_:didFinishLaunchingWithOptions:)`:

```swift
import UIKit
import Capacitor
import FirebaseCore
import FirebaseMessaging

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // Initialize Firebase
        FirebaseApp.configure()
        
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, etc.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate.
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Pass device token to Capacitor
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
        
        // Pass token to Firebase Messaging
        Messaging.messaging().apnsToken = deviceToken
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        // Pass error to Capacitor
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
}
```

## Step 7: Enable Push Notifications Capability in Xcode

1. In Xcode, select the **App** target
2. Go to the **Signing & Capabilities** tab
3. Click **+ Capability**
4. Add **Push Notifications**
5. Add **Background Modes**
6. Under Background Modes, check:
   - ✅ Remote notifications
   - ✅ Background fetch

## Step 8: Configure App in Your Code

1. In your main app file (e.g., `app/layout.tsx`), initialize push notifications:

```typescript
'use client';

import { useEffect } from 'react';
import { initializePushNotifications } from '@/lib/pushNotifications';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize push notifications on app start
    initializePushNotifications().catch(console.error);
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Step 9: Test Push Notifications

### Test from Firebase Console

1. Go to Firebase Console → **Engage** → **Messaging**
2. Click **Create your first campaign** → **Firebase Notification messages**
3. Enter notification details:
   - Notification title: `Test from Firebase`
   - Notification text: `Hello from The Busy Christian!`
4. Click **Next**
5. Select your iOS app
6. Click **Next** through the rest
7. Click **Publish**
8. Check your iOS device for the notification

### Test Programmatically

Use the Firebase Admin SDK to send notifications from your backend:

```typescript
// In your API route or Cloud Function
import { getMessaging } from 'firebase-admin/messaging';

const message = {
  notification: {
    title: 'Prayer Reminder',
    body: 'Time for your evening prayers!'
  },
  data: {
    route: '/my-prayers',
    type: 'prayer-reminder'
  },
  token: userFcmToken // Get from user's stored token
};

await getMessaging().send(message);
```

## Troubleshooting

### "No valid 'aps-environment' entitlement string found"
- Make sure you've added Push Notifications capability in Xcode
- Clean build folder (Cmd+Shift+K) and rebuild

### "Failed to get token"
- Check that GoogleService-Info.plist is added to Xcode correctly
- Verify APNs key is uploaded to Firebase
- Check bundle ID matches exactly: `com.busychristian.app`

### Notifications not received
- Check device is not in Do Not Disturb mode
- Verify app has notification permissions
- Check Firebase Console → Cloud Messaging for any errors
- Verify APNs certificate/key is valid and not expired

### Simulator Testing
- Push notifications do NOT work on iOS Simulator
- You MUST test on a physical iOS device

## Next Steps

After setup is complete:

1. ✅ Test notifications on physical device
2. ✅ Store FCM tokens in Firestore for each user
3. ✅ Send notifications from your backend/Cloud Functions
4. ✅ Handle notification clicks and navigate to appropriate screens
5. ✅ Implement notification scheduling for daily devotionals
6. ✅ Add notification preferences in app settings

## Additional Resources

- [Firebase iOS Setup](https://firebase.google.com/docs/ios/setup)
- [FCM for iOS](https://firebase.google.com/docs/cloud-messaging/ios/client)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Apple Push Notifications](https://developer.apple.com/documentation/usernotifications)
