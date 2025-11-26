# Sign in with Apple - Setup Guide

This guide will help you configure Sign in with Apple for your iOS app to pass Apple's App Store review.

## Why This Is Required

**Apple App Store Guideline 4.8:** If your app uses third-party sign-in services (like Google), you **MUST** also offer Sign in with Apple as an option, and it must be displayed with equal or greater prominence.

## What I've Already Done

✅ Added `signInWithApple()` function to AuthContext
✅ Added "Sign in with Apple" button to the EnhancedOnboarding component
✅ Positioned Apple Sign-In **above** Google Sign-In (required by Apple)
✅ Added proper Apple logo and styling

## What You Need to Do

### Step 1: Enable Sign in with Apple in Xcode

1. **Open your iOS project in Xcode:**
   ```bash
   open ios/App/App.xcworkspace
   ```

2. **Select your App target** in the left sidebar

3. **Go to "Signing & Capabilities" tab**

4. **Click the "+ Capability" button**

5. **Search for and add "Sign in with Apple"**

6. **Save the project** (Cmd+S)

### Step 2: Enable Apple Authentication in Firebase Console

1. **Go to Firebase Console:** https://console.firebase.google.com/

2. **Select your project:** `thebusychristian-app`

3. **Go to Authentication** → **Sign-in method**

4. **Click on "Apple"**

5. **Toggle "Enable"**

6. **You'll need to configure:**
   - **Services ID:** (Optional for web, but recommended)
     - Go to https://developer.apple.com/account/resources/identifiers/list/serviceId
     - Create a new Services ID if needed
     - Use identifier like: `com.thebusychristian.signin`

   - **App ID:** Your app's Bundle ID from Xcode
     - Should be: `com.ilovecornerstone.thebusychristian` (or whatever your Bundle ID is)

7. **Click "Save"**

### Step 3: Configure App ID on Apple Developer Portal

1. **Go to Apple Developer Portal:**
   https://developer.apple.com/account/resources/identifiers/list

2. **Find your App ID** (should match your Bundle ID)

3. **Edit the App ID**

4. **Under "Capabilities", enable "Sign in with Apple"**

5. **Save**

### Step 4: Rebuild and Test

1. **Sync Capacitor:**
   ```bash
   npx cap sync ios
   ```

2. **Clean build folder in Xcode:**
   - Product → Clean Build Folder (Shift+Cmd+K)

3. **Build and run:**
   ```bash
   npx cap run ios
   ```

4. **Test Sign in with Apple:**
   - Open the app
   - You should see the onboarding flow
   - Try clicking "Continue with Apple"
   - It should open the Apple Sign-In sheet

### Step 5: Testing on Simulator vs Device

**Simulator:**
- Sign in with Apple works on simulator
- You'll use your Apple ID credentials
- Great for testing the flow

**Real Device:**
- Must be signed into iCloud
- Uses Face ID/Touch ID for authentication
- More secure, production-like experience

### Step 6: What to Expect

When users click "Continue with Apple":
1. Apple Sign-In sheet appears
2. User authenticates with Face ID/Touch ID
3. User can choose to "Hide My Email" (Apple provides relay email)
4. User can edit the name shared with your app
5. User confirms
6. Your app receives the user's info
7. Firebase creates/updates the user account
8. User proceeds through onboarding

### Troubleshooting

**Error: "Sign in with Apple is not enabled"**
- Make sure you enabled it in Firebase Console (Step 2)
- Make sure you added the capability in Xcode (Step 1)

**Error: "Invalid client"**
- Your Bundle ID must match between Xcode, Firebase, and Apple Developer Portal
- Double-check all three have the same Bundle ID

**Button doesn't appear**
- Make sure you're running the latest code
- Try refreshing the app (Cmd+R in simulator)

**Popup closes immediately**
- Check that your Apple Developer account is in good standing
- Verify your App ID has Sign in with Apple enabled

### App Store Submission Checklist

Before resubmitting to Apple:

- [ ] "Sign in with Apple" button appears on the sign-in screen
- [ ] Apple button is positioned ABOVE Google button
- [ ] Both buttons work correctly
- [ ] Apple Sign-In flow completes successfully
- [ ] User can sign in and access the app
- [ ] Tested on real device (not just simulator)
- [ ] Bundle ID matches across Xcode, Firebase, and Apple Developer Portal

### Screenshots for App Store

Apple will test this, so make sure:
1. The sign-in screen shows both buttons
2. Apple button is first/top
3. Both buttons are equal size and prominence
4. Apple button uses the standard Apple design (black with white logo)

---

## Quick Reference

**Bundle ID:** Check in Xcode under General → Identity
**Firebase Project:** thebusychristian-app
**Apple Developer:** https://developer.apple.com/account

---

Once you complete these steps, rebuild your app and resubmit to Apple!
