# iOS Build & Deployment Guide
## The Busy Christian App

This guide covers the complete process of building and deploying The Busy Christian app to iOS.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Development Workflow](#development-workflow)
4. [Building for iOS](#building-for-ios)
5. [App Store Submission](#app-store-submission)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- ✅ macOS (required for iOS development)
- ✅ Xcode 15.0+ ([Download from Mac App Store](https://apps.apple.com/us/app/xcode/id497799835))
- ✅ Node.js 22.x+ (`node --version`)
- ✅ CocoaPods (`sudo gem install cocoapods`)
- ✅ Git

### Required Accounts
- ✅ Apple Developer Account ($99/year) - [Sign up here](https://developer.apple.com/programs/)
- ✅ Firebase Project - Already created (thebusychristian-app)
- ✅ GitHub Account (for CI/CD)

### Verify Installation
```bash
node --version          # Should show v22.x.x
npm --version          # Should show 10.x.x
pod --version          # Should show 1.x.x
xcodebuild -version    # Should show Xcode 15.x
```

---

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-username/busy-preacher-mvp.git
cd busy-preacher-mvp

# Install Node dependencies
npm install

# Install iOS dependencies
cd ios/App
pod install
cd ../..
```

### 2. Configure Environment Variables

Copy and configure environment files:

```bash
# Copy development environment
cp .env.development.example .env.development

# Edit with your API keys
nano .env.development
```

Required API keys:
- OpenAI API key
- ESV Bible API key
- YouTube API key
- Resend email API key
- Firebase credentials (already configured)

### 3. Set Up Firebase for iOS

Follow the complete guide in `IOS_FIREBASE_SETUP.md`:

1. Create APNs authentication key in Apple Developer Portal
2. Upload APNs key to Firebase Console
3. Download `GoogleService-Info.plist`
4. Add `GoogleService-Info.plist` to Xcode project
5. Update `ios/App/Podfile` with Firebase dependencies
6. Run `pod install`

### 4. Generate App Icons and Splash Screens

```bash
# 1. Add your source images to resources/ directory
#    - icon.png (1024x1024)
#    - splash.png (2732x2732)

# 2. Generate all required sizes
npm run ios:resources

# This creates all iOS icon and splash screen sizes automatically
```

See `resources/README.md` for detailed asset guidelines.

### 5. Configure Xcode Project

Open the project in Xcode:
```bash
npm run ios:open
```

In Xcode, configure:

**Signing & Capabilities** tab:
1. Select **Automatically manage signing**
2. Choose your **Team** (Apple Developer account)
3. Verify **Bundle Identifier**: `com.busychristian.app`
4. Add capabilities:
   - ✅ Push Notifications
   - ✅ Background Modes (Remote notifications, Background fetch)

**General** tab:
1. Set **Display Name**: `The Busy Christian`
2. Set **Version**: `3.85` (or current version)
3. Set **Build**: `1` (increment for each build)
4. Set **Deployment Target**: iOS 14.0

---

## Development Workflow

### Running Development Server

```bash
# Start Next.js development server
npm run dev

# In another terminal, run iOS app pointing to localhost
CAP_ENV=dev npm run ios:dev
```

The iOS app will load from `http://localhost:3000` in development mode.

### Testing on iOS Simulator

```bash
# Sync changes to iOS
npm run ios:sync

# Open Xcode
npm run ios:open

# In Xcode, select simulator (e.g., iPhone 15 Pro)
# Press ⌘+R to build and run
```

### Testing on Physical Device

1. Connect iPhone/iPad via USB
2. In Xcode, select your device from device menu
3. Trust the device if prompted
4. Press ⌘+R to build and run
5. On device, go to Settings → General → VPN & Device Management
6. Trust your developer certificate

**Note**: Push notifications ONLY work on physical devices, not simulators.

### Making Changes

When you modify code:

**Web code changes** (React/Next.js):
1. Changes hot-reload automatically in browser
2. For iOS, run `npm run ios:sync` to sync changes
3. Reload app in Xcode

**Native code changes** (Swift/Info.plist):
1. Make changes directly in Xcode
2. Build and run (⌘+R)

**Capacitor plugin changes**:
1. Update `package.json` with new plugins
2. Run `npm install`
3. Run `npm run ios:sync`
4. Run `cd ios/App && pod install`

---

## Building for iOS

### Development Build (Debug)

For testing on your device or sharing with testers:

```bash
# 1. Sync latest changes
npm run ios:sync

# 2. Open Xcode
npm run ios:open

# 3. In Xcode:
#    - Select "Any iOS Device" or your connected device
#    - Product → Archive (⌘+B to build first)
#    - Wait for archive to complete
```

### Production Build (Release)

For App Store submission:

```bash
# 1. Update version number
#    Edit ios/App/App.xcodeproj or use Xcode

# 2. Sync changes
npm run ios:sync

# 3. Open Xcode
npm run ios:open

# 4. In Xcode:
#    - Select "Any iOS Device"
#    - Product → Archive
#    - Window → Organizer
#    - Select your archive
#    - Click "Distribute App"
#    - Choose "App Store Connect"
#    - Follow wizard to upload
```

### Build via Command Line

```bash
# Build iOS app (creates archive)
npm run ios:build

# This runs: cap build ios
# The build will be created in Xcode archives
```

### Automated Builds (CI/CD)

GitHub Actions automatically builds on push to `main` or `develop`:

1. Push code to GitHub
2. GitHub Actions runs iOS build workflow
3. On success, IPA file is available as artifact
4. (Optional) Auto-upload to TestFlight

See `.github/workflows/ios-build.yml` for configuration.

---

## App Store Submission

### 1. Prepare App Store Assets

Create in App Store Connect:

**App Information**:
- App Name: `The Busy Christian`
- Subtitle: `Daily Devotionals & Bible Study`
- Category: Reference / Lifestyle
- Age Rating: 4+

**Screenshots** (required sizes):
- 6.7" Display (iPhone 15 Pro Max): 1290x2796 px
- 6.5" Display (iPhone 14 Plus): 1284x2778 px
- 5.5" Display (iPhone 8 Plus): 1242x2208 px
- 12.9" iPad Pro: 2048x2732 px

**App Preview** (optional):
- 30-second video demonstration

**Description**:
```
The Busy Christian helps believers deepen their faith with:

• AI-Powered Bible Study - Generate personalized study outlines
• Daily Devotionals - Start each day with Scripture and reflection  
• Prayer Journal - Track prayers and answered petitions
• Reading Plans - Follow structured Bible reading schedules
• Deep Study Tools - Commentary, word studies, and more
• Community Prayers - Connect with prayer warriors worldwide

Perfect for busy Christians who want to grow spiritually without the overwhelm.
```

**Keywords**:
```
bible,devotional,prayer,study,christian,scripture,faith,god,jesus
```

**Support URL**: `https://thebusychristianapp.com/support`
**Privacy Policy URL**: `https://thebusychristianapp.com/privacy`

### 2. Create App Store Connect Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: The Busy Christian
   - Primary Language: English (U.S.)
   - Bundle ID: com.busychristian.app
   - SKU: busychristian-app-001
4. Click **Create**

### 3. Upload Build

**Via Xcode**:
1. Archive your app (Product → Archive)
2. Window → Organizer
3. Select archive → Distribute App
4. Choose App Store Connect
5. Upload
6. Wait for processing (10-30 minutes)

**Via Command Line** (after setting up API key):
```bash
xcrun altool --upload-app \
  --type ios \
  --file build/App.ipa \
  --apiKey YOUR_API_KEY \
  --apiIssuer YOUR_ISSUER_ID
```

### 4. Submit for Review

1. In App Store Connect, go to your app
2. Select the build you uploaded
3. Fill in **What's New in This Version**
4. Add screenshots
5. Complete **App Review Information**:
   - Demo account credentials (if required)
   - Contact information
   - Notes for reviewer
6. Click **Submit for Review**

### 5. Review Process

- **Review time**: 1-3 days typically
- **Common rejections**:
  - Missing privacy policy
  - Inaccurate screenshots
  - Crashes on reviewer's device
  - Missing demo account
  - API key issues

**Status updates**:
- Waiting for Review
- In Review
- Pending Developer Release / Ready for Sale
- Rejected (with feedback)

---

## Environment Management

### Development vs Production

**Development** (localhost testing):
```bash
CAP_ENV=dev npm run ios:dev
```
- Loads from `http://localhost:3000`
- Uses development API keys
- Allows HTTP connections

**Production** (App Store):
```bash
CAP_ENV=prod npm run ios:build
```
- Loads from `https://thebusychristianapp.com`
- Uses production API keys
- HTTPS only

### Environment Variables

Stored in:
- `.env.development` - Local development
- `.env.production` - Production builds
- Xcode project settings - Native iOS config
- Vercel dashboard - Backend API keys

---

## Troubleshooting

### Build Errors

**"Command PhaseScriptExecution failed"**
```bash
cd ios/App
pod deintegrate
pod install
cd ../..
npm run ios:sync
```

**"No signing certificate found"**
- Open Xcode → Preferences → Accounts
- Add your Apple ID
- Download certificates
- Enable "Automatically manage signing"

**"Module not found"**
```bash
rm -rf node_modules
npm install
cd ios/App
pod install
cd ../..
```

### Runtime Errors

**White screen on launch**
- Check capacitor.config.ts server URL
- Verify web server is running
- Check browser console in Safari Web Inspector

**Push notifications not working**
- Must test on physical device (not simulator)
- Check APNs certificate in Firebase
- Verify Info.plist permissions
- Check notification permissions in Settings

**Storage not persisting**
- Verify using storage wrapper (not localStorage directly)
- Check file migration status
- Test on device (not just simulator)

### Network Errors

**"Failed to load resource"**
- Check CORS configuration
- Verify API endpoints are accessible
- Check Info.plist App Transport Security settings

**"SSL certificate error"**
- Update to HTTPS URLs
- Check certificate validity
- Verify domain is correct

---

## Testing Checklist

Before submission, test:

- [ ] App launches successfully
- [ ] All main features work
- [ ] Push notifications deliver
- [ ] Storage persists across app restarts
- [ ] Works on iPhone and iPad
- [ ] Works on iOS 14, 15, 16, 17
- [ ] Offline functionality works
- [ ] No console errors
- [ ] Privacy policy accessible
- [ ] Support contact works
- [ ] Subscription flow (if applicable)
- [ ] In-app purchases (if applicable)

---

## Useful Commands

```bash
# Development
npm run dev                    # Start Next.js dev server
npm run ios:dev               # Run iOS app in dev mode
npm run ios:open              # Open Xcode project

# Building
npm run ios:sync              # Sync web code to iOS
npm run ios:build             # Build iOS app
npm run ios:resources         # Generate app icons/splash

# Maintenance
cd ios/App && pod install     # Update iOS dependencies
npm install                   # Update Node dependencies
git pull origin main          # Update codebase

# Debugging
npx cap doctor                # Check Capacitor setup
npx cap ls                    # List installed plugins
```

---

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Apple Developer Portal](https://developer.apple.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Firebase Console](https://console.firebase.google.com)
- [Next.js Documentation](https://nextjs.org/docs)

---

## Support

For help with iOS integration:
1. Check this guide and related documentation
2. Review Firebase setup guide (`IOS_FIREBASE_SETUP.md`)
3. Check storage migration guide (`STORAGE_MIGRATION.md`)
4. Review assets guide (`resources/README.md`)
5. Search GitHub Issues
6. Contact the development team

---

**Last Updated**: 2025-11-10  
**Version**: 3.85  
**iOS Minimum**: 14.0  
**Xcode Version**: 15.0+
