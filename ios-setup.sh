{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww26840\viewh16960\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 #!/bin/bash\
\
# \uc0\u55356 \u57166  The Busy Christian - iOS Pre-Launch Setup Script\
# This script automates all iOS optimizations and setup\
\
set -e  # Exit on error\
\
# Colors\
GREEN='\\033[0;32m'\
BLUE='\\033[0;34m'\
YELLOW='\\033[1;33m'\
RED='\\033[0;31m'\
NC='\\033[0m'\
\
echo -e "$\{BLUE\}\uc0\u55356 \u57166  The Busy Christian - iOS Pre-Launch Setup$\{NC\}"\
echo -e "$\{BLUE\}=============================================$\{NC\}\\n"\
\
# Get project root\
PROJECT_ROOT=$(pwd)\
\
# Check if we're in the right directory\
if [ ! -f "package.json" ]; then\
    echo -e "$\{RED\}\uc0\u10060  Error: package.json not found. Run this from your project root.$\{NC\}"\
    exit 1\
fi\
\
echo -e "$\{YELLOW\}\uc0\u55357 \u56523  Step 1/8: Creating PWA manifest...$\{NC\}"\
\
# Create public directory if it doesn't exist\
mkdir -p public\
\
# Create manifest.json\
cat > public/manifest.json << 'EOF'\
\{\
  "name": "The Busy Christian",\
  "short_name": "TBC",\
  "description": "Deep Bible study powered by AI, classic commentaries, and trusted teachers",\
  "start_url": "/",\
  "display": "standalone",\
  "background_color": "#0f172a",\
  "theme_color": "#facc15",\
  "orientation": "portrait",\
  "icons": [\
    \{\
      "src": "/icon-192.png",\
      "sizes": "192x192",\
      "type": "image/png",\
      "purpose": "any maskable"\
    \},\
    \{\
      "src": "/icon-512.png",\
      "sizes": "512x512",\
      "type": "image/png",\
      "purpose": "any maskable"\
    \}\
  ]\
\}\
EOF\
\
echo -e "$\{GREEN\}\uc0\u9989  PWA manifest created$\{NC\}\\n"\
\
echo -e "$\{YELLOW\}\uc0\u55357 \u56523  Step 2/8: Creating iOS-specific CSS...$\{NC\}"\
\
# Create iOS optimizations CSS file\
cat > app/ios-optimizations.css << 'EOF'\
/* iOS-Specific Optimizations */\
\
/* Safe Area for iPhone notch and home indicator */\
body \{\
  padding-top: env(safe-area-inset-top);\
  padding-bottom: env(safe-area-inset-bottom);\
  padding-left: env(safe-area-inset-left);\
  padding-right: env(safe-area-inset-right);\
\}\
\
/* Prevent iOS zoom on input focus */\
input,\
textarea,\
select,\
button \{\
  font-size: 16px !important;\
\}\
\
/* Touch-friendly targets (44x44px minimum) */\
button,\
a,\
input[type="submit"],\
input[type="button"] \{\
  min-height: 44px;\
  min-width: 44px;\
  padding: 12px 16px;\
\}\
\
/* Smooth scrolling on iOS */\
html \{\
  -webkit-overflow-scrolling: touch;\
  scroll-behavior: smooth;\
\}\
\
/* Disable pull-to-refresh if it conflicts */\
body \{\
  overscroll-behavior-y: contain;\
\}\
\
/* Prevent tap highlight */\
* \{\
  -webkit-tap-highlight-color: transparent;\
  -webkit-touch-callout: none;\
\}\
\
/* Allow text selection for verses */\
.verse-text,\
.commentary-text \{\
  -webkit-user-select: text;\
  user-select: text;\
\}\
\
/* Reduce motion for accessibility */\
@media (prefers-reduced-motion: reduce) \{\
  *,\
  *::before,\
  *::after \{\
    animation-duration: 0.01ms !important;\
    animation-iteration-count: 1 !important;\
    transition-duration: 0.01ms !important;\
    scroll-behavior: auto !important;\
  \}\
\}\
\
/* Dark mode support */\
@media (prefers-color-scheme: dark) \{\
  :root \{\
    color-scheme: dark;\
  \}\
\}\
\
/* Keyboard resize handling */\
.keyboard-open \{\
  height: 100vh;\
  overflow: hidden;\
\}\
\
/* Fix for iOS Safari bottom bar */\
.full-height \{\
  min-height: 100vh;\
  min-height: -webkit-fill-available;\
\}\
EOF\
\
echo -e "$\{GREEN\}\uc0\u9989  iOS CSS optimizations created$\{NC\}\\n"\
\
echo -e "$\{YELLOW\}\uc0\u55357 \u56523  Step 3/8: Creating Capacitor config...$\{NC\}"\
\
# Create capacitor.config.ts\
cat > capacitor.config.ts << 'EOF'\
import \{ CapacitorConfig \} from '@capacitor/cli';\
\
const config: CapacitorConfig = \{\
  appId: 'com.busychristian.app',\
  appName: 'The Busy Christian',\
  webDir: 'out',\
  bundledWebRuntime: false,\
  server: \{\
    androidScheme: 'https',\
    hostname: 'thebusychristian.com',\
    iosScheme: 'capacitor'\
  \},\
  ios: \{\
    contentInset: 'automatic',\
    backgroundColor: '#0f172a',\
    allowsLinkPreview: false,\
    scrollEnabled: true,\
    limitsNavigationsToAppBoundDomains: true\
  \},\
  plugins: \{\
    SplashScreen: \{\
      launchShowDuration: 2000,\
      backgroundColor: "#0f172a",\
      showSpinner: false,\
      androidSpinnerStyle: "small",\
      iosSpinnerStyle: "small",\
      splashFullScreen: true,\
      splashImmersive: true\
    \},\
    Keyboard: \{\
      resize: "body",\
      style: "dark",\
      resizeOnFullScreen: true\
    \},\
    StatusBar: \{\
      style: "dark",\
      backgroundColor: "#0f172a"\
    \}\
  \}\
\};\
\
export default config;\
EOF\
\
echo -e "$\{GREEN\}\uc0\u9989  Capacitor config created$\{NC\}\\n"\
\
echo -e "$\{YELLOW\}\uc0\u55357 \u56523  Step 4/8: Creating safe localStorage wrapper...$\{NC\}"\
\
# Create safe localStorage utility\
cat > utils/safeStorage.ts << 'EOF'\
/**\
 * Safe localStorage wrapper for iOS\
 * Handles private browsing mode and missing localStorage\
 */\
\
class SafeStorage \{\
  private storage: Map<string, string> = new Map();\
  private isAvailable: boolean = false;\
\
  constructor() \{\
    this.checkAvailability();\
  \}\
\
  private checkAvailability(): void \{\
    try \{\
      if (typeof window === 'undefined') \{\
        this.isAvailable = false;\
        return;\
      \}\
\
      const test = '__storage_test__';\
      localStorage.setItem(test, test);\
      localStorage.removeItem(test);\
      this.isAvailable = true;\
    \} catch (e) \{\
      console.warn('localStorage not available, using memory fallback');\
      this.isAvailable = false;\
    \}\
  \}\
\
  getItem(key: string): string | null \{\
    if (this.isAvailable) \{\
      try \{\
        return localStorage.getItem(key);\
      \} catch (e) \{\
        console.error('Error reading from localStorage:', e);\
      \}\
    \}\
    return this.storage.get(key) || null;\
  \}\
\
  setItem(key: string, value: string): void \{\
    if (this.isAvailable) \{\
      try \{\
        localStorage.setItem(key, value);\
        return;\
      \} catch (e) \{\
        console.error('Error writing to localStorage:', e);\
      \}\
    \}\
    this.storage.set(key, value);\
  \}\
\
  removeItem(key: string): void \{\
    if (this.isAvailable) \{\
      try \{\
        localStorage.removeItem(key);\
        return;\
      \} catch (e) \{\
        console.error('Error removing from localStorage:', e);\
      \}\
    \}\
    this.storage.delete(key);\
  \}\
\
  clear(): void \{\
    if (this.isAvailable) \{\
      try \{\
        localStorage.clear();\
      \} catch (e) \{\
        console.error('Error clearing localStorage:', e);\
      \}\
    \}\
    this.storage.clear();\
  \}\
\}\
\
export const safeStorage = new SafeStorage();\
EOF\
\
echo -e "$\{GREEN\}\uc0\u9989  Safe storage wrapper created$\{NC\}\\n"\
\
echo -e "$\{YELLOW\}\uc0\u55357 \u56523  Step 5/8: Creating mobile-optimized layout wrapper...$\{NC\}"\
\
# Create mobile layout component\
mkdir -p components/mobile\
cat > components/mobile/MobileLayout.tsx << 'EOF'\
'use client';\
\
import \{ useEffect, useState \} from 'react';\
\
export function MobileLayout(\{ children \}: \{ children: React.ReactNode \}) \{\
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);\
\
  useEffect(() => \{\
    // Detect keyboard open/close on iOS\
    const handleResize = () => \{\
      const viewportHeight = window.visualViewport?.height || window.innerHeight;\
      const windowHeight = window.innerHeight;\
      setIsKeyboardOpen(viewportHeight < windowHeight * 0.75);\
    \};\
\
    if (typeof window !== 'undefined' && window.visualViewport) \{\
      window.visualViewport.addEventListener('resize', handleResize);\
      return () => \{\
        window.visualViewport?.removeEventListener('resize', handleResize);\
      \};\
    \}\
  \}, []);\
\
  return (\
    <div className=\{`full-height $\{isKeyboardOpen ? 'keyboard-open' : ''\}`\}>\
      \{children\}\
    </div>\
  );\
\}\
EOF\
\
echo -e "$\{GREEN\}\uc0\u9989  Mobile layout component created$\{NC\}\\n"\
\
echo -e "$\{YELLOW\}\uc0\u55357 \u56523  Step 6/8: Updating Next.js config for static export...$\{NC\}"\
\
# Check if next.config.js exists\
if [ -f "next.config.js" ]; then\
    # Backup existing config\
    cp next.config.js next.config.js.backup\
    echo -e "$\{BLUE\}\uc0\u8505 \u65039   Backed up existing next.config.js$\{NC\}"\
fi\
\
# Create/update next.config.js for Capacitor\
cat > next.config.js << 'EOF'\
/** @type \{import('next').NextConfig\} */\
const nextConfig = \{\
  output: 'export',\
  distDir: 'out',\
  images: \{\
    unoptimized: true, // Required for static export\
  \},\
  trailingSlash: true, // Better for iOS file paths\
  \
  // Remove asset prefix for Capacitor\
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.CAPACITOR !== 'true' \
    ? undefined \
    : '',\
  \
  // Optimize for mobile\
  compress: true,\
  poweredByHeader: false,\
  \
  // Webpack optimization\
  webpack: (config, \{ isServer \}) => \{\
    if (!isServer) \{\
      config.optimization.splitChunks = \{\
        chunks: 'all',\
        cacheGroups: \{\
          default: false,\
          vendors: false,\
          commons: \{\
            name: 'commons',\
            chunks: 'all',\
            minChunks: 2,\
          \},\
        \},\
      \};\
    \}\
    return config;\
  \},\
\};\
\
module.exports = nextConfig;\
EOF\
\
echo -e "$\{GREEN\}\uc0\u9989  Next.js config updated for iOS$\{NC\}\\n"\
\
echo -e "$\{YELLOW\}\uc0\u55357 \u56523  Step 7/8: Installing Capacitor dependencies...$\{NC\}"\
\
# Check if dependencies are already installed\
if ! grep -q "@capacitor/core" package.json; then\
    npm install @capacitor/core @capacitor/cli\
    npm install @capacitor/ios\
    npm install @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen\
    echo -e "$\{GREEN\}\uc0\u9989  Capacitor dependencies installed$\{NC\}\\n"\
else\
    echo -e "$\{BLUE\}\uc0\u8505 \u65039   Capacitor already installed, skipping...$\{NC\}\\n"\
fi\
\
echo -e "$\{YELLOW\}\uc0\u55357 \u56523  Step 8/8: Creating deployment scripts...$\{NC\}"\
\
# Create build script for iOS\
cat > scripts/build-ios.sh << 'EOF'\
#!/bin/bash\
\
echo "\uc0\u55357 \u56616  Building for iOS..."\
\
# Clean previous builds\
rm -rf .next out\
\
# Build Next.js app\
echo "\uc0\u55357 \u56550  Building Next.js..."\
CAPACITOR=true npm run build\
\
# Check if build succeeded\
if [ ! -d "out" ]; then\
    echo "\uc0\u10060  Build failed - no 'out' directory found"\
    exit 1\
fi\
\
# Sync to Capacitor\
echo "\uc0\u55357 \u56580  Syncing to Capacitor..."\
npx cap sync ios\
\
echo "\uc0\u9989  Build complete! Opening Xcode..."\
npx cap open ios\
EOF\
\
chmod +x scripts/build-ios.sh\
\
# Create test script for mobile\
cat > scripts/test-mobile.sh << 'EOF'\
#!/bin/bash\
\
echo "\uc0\u55357 \u56561  Starting mobile test server..."\
echo ""\
echo "Visit on your iPhone:"\
\
# Get local IP\
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")\
\
echo "http://$IP:3000"\
echo ""\
echo "Press Ctrl+C to stop"\
\
npm run dev -- -H 0.0.0.0\
EOF\
\
chmod +x scripts/test-mobile.sh\
\
echo -e "$\{GREEN\}\uc0\u9989  Deployment scripts created$\{NC\}\\n"\
\
# Create iOS checklist\
cat > IOS_CHECKLIST.md << 'EOF'\
# \uc0\u55356 \u57166  iOS Pre-Launch Checklist\
\
## \uc0\u9989  Automated Setup (COMPLETED)\
- [x] PWA manifest created\
- [x] iOS-specific CSS added\
- [x] Capacitor config created\
- [x] Safe localStorage wrapper\
- [x] Mobile layout component\
- [x] Next.js config updated\
- [x] Capacitor dependencies installed\
- [x] Build scripts created\
\
## \uc0\u55357 \u56561  Manual Steps Required\
\
### 1. Create App Icons\
- [ ] Create 1024x1024px app icon\
- [ ] Place as `public/icon-512.png` and `public/icon-192.png`\
- [ ] Use https://www.appicon.co/ to generate all sizes\
\
### 2. Update app/layout.tsx\
Add this to your `<head>`:\
```tsx\
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />\
<meta name="theme-color" content="#facc15" />\
<meta name="apple-mobile-web-app-capable" content="yes" />\
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\
<link rel="manifest" href="/manifest.json" />\
<link rel="apple-touch-icon" href="/icon-192.png" />\
```\
\
Import iOS CSS:\
```tsx\
import './ios-optimizations.css';\
```\
\
### 3. Update utils/verseCache.ts\
Replace all `localStorage` calls with `safeStorage`:\
```typescript\
import \{ safeStorage \} from './safeStorage';\
\
// Replace:\
localStorage.getItem(key) \uc0\u8594  safeStorage.getItem(key)\
localStorage.setItem(key, value) \uc0\u8594  safeStorage.setItem(key, value)\
localStorage.removeItem(key) \uc0\u8594  safeStorage.removeItem(key)\
```\
\
### 4. Initialize Capacitor\
```bash\
npx cap init\
```\
When prompted:\
- App name: The Busy Christian\
- App ID: com.busychristian.app\
- Web directory: out\
\
### 5. Add iOS Platform\
```bash\
npx cap add ios\
```\
\
### 6. Build and Test\
```bash\
# Build the app\
./scripts/build-ios.sh\
\
# Or test on mobile browser first\
./scripts/test-mobile.sh\
# Then visit http://YOUR_IP:3000 on iPhone\
```\
\
### 7. In Xcode\
\
#### First Time Setup:\
- [ ] Select your Development Team\
- [ ] Update Bundle Identifier if needed\
- [ ] Add app icons in Assets.xcassets\
- [ ] Configure Launch Screen\
\
#### Privacy Strings (if needed):\
Add to `Info.plist`:\
- [ ] Camera usage description (if you add QR scanner)\
- [ ] Photo library usage (if you add image upload)\
\
#### App Store Assets:\
- [ ] Screenshots (6.5" and 5.5" sizes)\
- [ ] Privacy policy URL\
- [ ] Support URL\
- [ ] App description\
\
### 8. Testing Checklist\
- [ ] Keyboard doesn't hide inputs\
- [ ] Safe area (notch) respected\
- [ ] Smooth scrolling\
- [ ] Verse caching works offline\
- [ ] Copy/paste verse text works\
- [ ] Loading states show properly\
- [ ] Errors handled gracefully\
- [ ] Back navigation works\
- [ ] Touch targets are 44x44px minimum\
- [ ] No zoom on input focus\
\
### 9. Performance Testing\
- [ ] Lighthouse score 85+ on mobile\
- [ ] Fast load time (<3s)\
- [ ] Smooth animations (60fps)\
- [ ] No memory leaks\
- [ ] Works in iOS Safari private mode\
\
### 10. App Store Submission\
- [ ] Product \uc0\u8594  Archive in Xcode\
- [ ] Distribute to App Store\
- [ ] Complete App Store Connect metadata\
- [ ] Submit for review\
\
## \uc0\u55357 \u56960  Quick Commands\
\
```bash\
# Test on mobile device\
./scripts/test-mobile.sh\
\
# Build and open in Xcode\
./scripts/build-ios.sh\
\
# Sync changes\
npx cap sync ios\
\
# Update app version\
npm version patch\
npx cap sync\
```\
\
## \uc0\u55356 \u56728  Troubleshooting\
\
**Build fails:**\
```bash\
rm -rf .next out node_modules\
npm install\
npm run build\
```\
\
**Capacitor errors:**\
```bash\
npx cap sync ios\
npx cap doctor\
```\
\
**localStorage not working:**\
- Check SafeStorage is imported correctly\
- Test in iOS Safari private mode\
\
**Keyboard issues:**\
- Check MobileLayout is wrapping your app\
- Verify ios-optimizations.css is imported\
\
## \uc0\u55357 \u56542  Support\
\
Check documentation:\
- Next.js: https://nextjs.org/docs\
- Capacitor: https://capacitorjs.com/docs/ios\
- App Store: https://developer.apple.com/app-store/review/guidelines/\
EOF\
\
echo -e "$\{GREEN\}\uc0\u9989  iOS checklist created$\{NC\}\\n"\
\
# Print summary\
echo -e "$\{BLUE\}\uc0\u9556 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9559 $\{NC\}"\
echo -e "$\{BLUE\}\uc0\u9553           \u55356 \u57225  Setup Complete! \u55356 \u57225                 \u9553 $\{NC\}"\
echo -e "$\{BLUE\}\uc0\u9562 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9552 \u9565 $\{NC\}\\n"\
\
echo -e "$\{GREEN\}\uc0\u9989  Created Files:$\{NC\}"\
echo "  \uc0\u55357 \u56516  public/manifest.json"\
echo "  \uc0\u55357 \u56516  app/ios-optimizations.css"\
echo "  \uc0\u55357 \u56516  capacitor.config.ts"\
echo "  \uc0\u55357 \u56516  utils/safeStorage.ts"\
echo "  \uc0\u55357 \u56516  components/mobile/MobileLayout.tsx"\
echo "  \uc0\u55357 \u56516  next.config.js (updated)"\
echo "  \uc0\u55357 \u56516  scripts/build-ios.sh"\
echo "  \uc0\u55357 \u56516  scripts/test-mobile.sh"\
echo "  \uc0\u55357 \u56516  IOS_CHECKLIST.md"\
echo ""\
\
echo -e "$\{YELLOW\}\uc0\u55357 \u56523  Next Steps:$\{NC\}"\
echo "  1. Read IOS_CHECKLIST.md for manual steps"\
echo "  2. Create app icons (1024x1024px)"\
echo "  3. Update app/layout.tsx with meta tags"\
echo "  4. Update verseCache.ts to use safeStorage"\
echo "  5. Run: npx cap init"\
echo "  6. Run: npx cap add ios"\
echo "  7. Run: ./scripts/build-ios.sh"\
echo ""\
\
echo -e "$\{BLUE\}\uc0\u55357 \u56561  Test on iPhone:$\{NC\}"\
echo "  ./scripts/test-mobile.sh"\
echo "  Then visit http://YOUR_IP:3000 on your iPhone"\
echo ""\
\
echo -e "$\{GREEN\}\uc0\u55357 \u56960  Ready to build for iOS!$\{NC\}"\
EOF\
\
chmod +x /mnt/user-data/outputs/ios-setup.sh}