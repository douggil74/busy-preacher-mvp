# Screenshots for App Store

## 📸 How to Add Screenshots

Place your app screenshots in this directory.

### Required
At least **3-5 screenshots** for iPhone 15 Pro Max (6.7" display).

### How to Take Screenshots

#### Option 1: Using iOS Simulator (Recommended)
1. Open Xcode
2. Select **iPhone 15 Pro Max** simulator
3. Run your app (⌘R)
4. Navigate to your best screens
5. Press **⌘S** to save screenshots
6. Screenshots will save to your Desktop
7. Move them to this folder

#### Option 2: Using Your iPhone
1. Open the app on your iPhone
2. Take screenshots (Volume Up + Side Button)
3. AirDrop to your Mac
4. Move to this folder

### Naming Convention
- `iPhone-15-Pro-Max-1.png`
- `iPhone-15-Pro-Max-2.png`
- `iPhone-15-Pro-Max-3.png`
- etc.

Or Fastlane will auto-detect any PNG files in this directory.

### Best Practices
✅ Show key features:
- Home screen / devotional
- Prayer community
- Pastoral guidance
- User profile / settings
- Any unique features

✅ Use real content (not Lorem Ipsum)
✅ Remove status bar clutter (Fastlane can help)
✅ Consistent styling across all screenshots

### Screenshot Dimensions
- **iPhone 15 Pro Max (6.7")**: 1290 x 2796 pixels
- **iPhone 15 Pro (6.1")**: 1179 x 2556 pixels (optional)
- **iPhone 8 Plus (5.5")**: 1242 x 2208 pixels (optional)

### After Adding Screenshots
Run:
```bash
cd ../../../  # Back to ios directory
bundle exec fastlane upload_metadata
```

This will upload all screenshots to App Store Connect.
