# iOS Quick Reference Guide

## 🚀 Essential Commands

```bash
# Development
npm run dev                    # Start Next.js dev server (localhost:3000)
npm run ios:dev               # Run iOS app in development mode
npm run ios:open              # Open Xcode project

# Building
npm run ios:sync              # Sync web code to iOS
npm run ios:build             # Build iOS app

# Assets
npm run ios:resources         # Generate app icons & splash screens

# Maintenance
cd ios/App && pod install     # Update iOS dependencies
npm install                   # Update Node dependencies
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor configuration (dev/prod URLs) |
| `lib/storage.ts` | Unified storage API (web + iOS) |
| `lib/pushNotifications.ts` | Push notification service |
| `ios/App/App/Info.plist` | iOS permissions and settings |
| `ios/App/App/GoogleService-Info.plist` | Firebase configuration (add this) |
| `resources/icon.png` | App icon source (1024x1024) |
| `resources/splash.png` | Splash screen source (2732x2732) |

## 🔑 Environment Variables

**Development** (`.env.development`):
- Uses `localhost:3000`
- Set `CAP_ENV=dev`

**Production** (`.env.production`):
- Uses `https://thebusychristianapp.com`
- Set `CAP_ENV=prod`

## ✅ Pre-Launch Checklist

### Must Do Before App Store Submission

- [ ] Create app icon (1024x1024) → `resources/icon.png`
- [ ] Create splash screen (2732x2732) → `resources/splash.png`
- [ ] Run `npm run ios:resources`
- [ ] Set up Firebase push notifications (see `IOS_FIREBASE_SETUP.md`)
- [ ] Add `GoogleService-Info.plist` to Xcode
- [ ] Configure signing in Xcode with Apple Developer account
- [ ] Test on physical iPhone/iPad
- [ ] Verify push notifications work
- [ ] Complete storage migration (see `STORAGE_MIGRATION.md`)
- [ ] Prepare App Store screenshots
- [ ] Write app description
- [ ] Create privacy policy page

## 🎯 Next Steps Priority

### 1. Immediate (Required)
1. Create app assets (icon + splash)
2. Set up Firebase push notifications
3. Configure Xcode signing
4. Test on physical device

### 2. Short-term (Recommended)
5. Complete storage migration (41 files remaining)
6. Prepare App Store listing
7. Test CI/CD pipeline

### 3. Before Launch
8. App Store submission
9. TestFlight beta testing
10. Marketing materials

## 📚 Documentation

| Guide | When to Use |
|-------|-------------|
| `IOS_BUILD_GUIDE.md` | Complete build and deployment process |
| `IOS_FIREBASE_SETUP.md` | Setting up push notifications |
| `STORAGE_MIGRATION.md` | Migrating from localStorage |
| `resources/README.md` | Creating app icons and splash screens |
| `IOS_INTEGRATION_SUMMARY.md` | Overview of what was done |

## 🐛 Quick Troubleshooting

**App won't build?**
```bash
cd ios/App
pod deintegrate && pod install
cd ../..
npm run ios:sync
```

**White screen?**
- Check capacitor.config.ts server URL
- Verify dev server is running (`npm run dev`)
- Check Safari Web Inspector console

**Push notifications not working?**
- Must use physical device (not simulator)
- Check Firebase APNs certificate
- Verify Info.plist permissions

**Storage not persisting?**
- Use `lib/storage.ts` not `localStorage`
- Check migration status
- Test on device

## 📞 Get Help

1. Check documentation files listed above
2. Run `npx cap doctor`
3. Review `STORAGE_MIGRATION.md` for migration help
4. Check GitHub Issues
5. Contact development team

---

**Bundle ID**: `com.busychristian.app`  
**Firebase Project**: `thebusychristian-app`  
**Production URL**: `https://thebusychristianapp.com`  
**Min iOS Version**: 14.0
