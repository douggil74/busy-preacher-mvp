# iOS App Assets Guide

## Overview
This directory contains source files for generating iOS app icons and splash screens using Capacitor Assets.

## Requirements

### App Icon
- **File**: `icon.png`
- **Size**: 1024x1024 pixels (minimum)
- **Format**: PNG with transparency
- **Background**: Dark (#1a1a1a) to match app theme
- **Design**: Should feature the ✝️ cross or app logo
- **Color scheme**: Gold (#FFD700) on dark background

### Splash Screen
- **File**: `splash.png`
- **Size**: 2732x2732 pixels (minimum, for iPad Pro)
- **Format**: PNG with transparency
- **Background**: Dark (#1a1a1a)
- **Design**: Simple, clean loading screen with logo/cross
- **Content**: Should be centered and work on all device sizes

## Generating Assets

Once you have your `icon.png` and `splash.png` files in this directory:

1. **Install Capacitor Assets** (already done):
   ```bash
   npm install -D @capacitor/assets
   ```

2. **Generate all icons and splash screens**:
   ```bash
   npm run ios:resources
   ```

   This will automatically generate:
   - All required iOS app icon sizes
   - All required iOS splash screen sizes
   - Properly sized assets for iPhone and iPad

3. **Generated files location**:
   - Icons: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Splash: `ios/App/App/Assets.xcassets/Splash.imageset/`

## Design Recommendations

### Icon Design
- Keep it simple and recognizable at small sizes
- Use high contrast for visibility
- Avoid text (becomes unreadable at small sizes)
- Test at 60x60 pixels to ensure clarity
- Consider iOS rounded corners in your design
- Use gold (#FFD700) as accent color

### Splash Screen Design
- Minimal design - users should see it briefly
- Center your logo/icon
- Use dark theme colors to match app
- Leave safe area around edges (10% margin)
- Keep text minimal or avoid it entirely

## Creating Source Images

### Option 1: Design Tool (Recommended)
Use Figma, Sketch, or Adobe Illustrator:
1. Create 1024x1024 artboard for icon
2. Create 2732x2732 artboard for splash
3. Export as PNG with transparency
4. Save to `resources/` directory

### Option 2: Online Tools
- [App Icon Generator](https://appicon.co/)
- [Icon Slate](https://www.kodlian.com/apps/icon-slate)
- [MakeAppIcon](https://makeappicon.com/)

### Option 3: Quick Placeholder
For testing, create simple placeholders:

```bash
# Requires ImageMagick
convert -size 1024x1024 xc:'#1a1a1a' \
  -gravity center \
  -pointsize 500 \
  -fill '#FFD700' \
  -font Arial-Bold \
  -annotate +0+0 '✝' \
  resources/icon.png

convert -size 2732x2732 xc:'#1a1a1a' \
  -gravity center \
  -pointsize 800 \
  -fill '#FFD700' \
  -font Arial-Bold \
  -annotate +0-200 '✝' \
  -pointsize 200 \
  -fill '#f5f5f5' \
  -annotate +0+300 'The Busy Christian' \
  resources/splash.png
```

## Verify Generated Assets

After generation:

1. Open Xcode:
   ```bash
   npm run ios:open
   ```

2. Check assets in Xcode:
   - Navigate to `App` → `Assets.xcassets`
   - Verify `AppIcon` has all sizes
   - Verify `Splash` images look correct

3. Test on simulator/device:
   - Check app icon on home screen
   - Check splash screen on launch
   - Verify colors match app theme

## Icon Size Reference

Capacitor Assets will generate these sizes automatically:

| Size (px) | Usage | Device |
|-----------|-------|--------|
| 20x20 | Notification | iPhone/iPad |
| 29x29 | Settings | iPhone/iPad |
| 40x40 | Spotlight | iPhone/iPad |
| 58x58 | Settings @2x | iPhone/iPad |
| 60x60 | App | iPhone |
| 76x76 | App | iPad |
| 80x80 | Spotlight @2x | iPhone/iPad |
| 87x87 | Settings @3x | iPhone |
| 120x120 | App @2x | iPhone |
| 152x152 | App @2x | iPad |
| 167x167 | App @2x | iPad Pro |
| 180x180 | App @3x | iPhone |
| 1024x1024 | App Store | All |

## Troubleshooting

### "Source file not found"
- Ensure `icon.png` and `splash.png` exist in `resources/`
- Check file names match exactly (case-sensitive)

### Generated assets look wrong
- Verify source image resolution is high enough
- Check source image has transparent background
- Ensure colors are correct in source file

### Xcode doesn't show new assets
- Clean build folder in Xcode (⌘+Shift+K)
- Close and reopen Xcode
- Re-run `npm run ios:sync`

## Need Help?

- [Capacitor Assets Docs](https://github.com/ionic-team/capacitor-assets)
- [iOS Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [iOS Human Interface Guidelines - Launch Screens](https://developer.apple.com/design/human-interface-guidelines/launch-screen)
