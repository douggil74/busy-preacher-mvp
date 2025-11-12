# Storage Migration Guide

## Overview
This project is being migrated from `localStorage` to Capacitor `Preferences` API for better iOS compatibility. The new storage wrapper (`lib/storage.ts`) provides a unified API that works on both web and native iOS.

## Why Migrate?
- **iOS Compatibility**: Capacitor Preferences API works reliably on iOS
- **Better Performance**: Native storage is optimized for mobile
- **Unified API**: One interface for web and native platforms
- **Type Safety**: Better TypeScript support with the wrapper

## Storage Wrapper API

### Import
```typescript
import storage, { STORAGE_KEYS } from '@/lib/storage';
```

### Basic Usage

#### Get Item (Async)
```typescript
// Old (sync)
const userName = localStorage.getItem('bc-user-name');

// New (async)
const userName = await storage.getItem(STORAGE_KEYS.USER_NAME);
```

#### Set Item (Async)
```typescript
// Old (sync)
localStorage.setItem('bc-user-name', 'John');

// New (async)
await storage.setItem(STORAGE_KEYS.USER_NAME, 'John');
```

#### Get JSON (Async)
```typescript
// Old (sync)
const savedStudies = JSON.parse(localStorage.getItem('bc-saved-studies') || '[]');

// New (async)
const savedStudies = await storage.getJSON<Study[]>(STORAGE_KEYS.SAVED_STUDIES) || [];
```

#### Set JSON (Async)
```typescript
// Old (sync)
localStorage.setItem('bc-saved-studies', JSON.stringify(studies));

// New (async)
await storage.setJSON(STORAGE_KEYS.SAVED_STUDIES, studies);
```

#### Remove Item (Async)
```typescript
// Old (sync)
localStorage.removeItem('bc-user-name');

// New (async)
await storage.removeItem(STORAGE_KEYS.USER_NAME);
```

## Migration Patterns

### Pattern 1: Simple Component State
```typescript
// BEFORE
function MyComponent() {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('bc-user-name') || '';
  });

  const handleSave = () => {
    localStorage.setItem('bc-user-name', userName);
  };

  return <input value={userName} onChange={e => setUserName(e.target.value)} />;
}

// AFTER
function MyComponent() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Load on mount
    storage.getItem(STORAGE_KEYS.USER_NAME).then(value => {
      if (value) setUserName(value);
    });
  }, []);

  const handleSave = async () => {
    await storage.setItem(STORAGE_KEYS.USER_NAME, userName);
  };

  return <input value={userName} onChange={e => setUserName(e.target.value)} />;
}
```

### Pattern 2: Utility Functions
```typescript
// BEFORE
export function getUserName(): string | null {
  return localStorage.getItem('bc-user-name');
}

export function saveUserName(name: string): void {
  localStorage.setItem('bc-user-name', name);
}

// AFTER
export async function getUserName(): Promise<string | null> {
  return await storage.getItem(STORAGE_KEYS.USER_NAME);
}

export async function saveUserName(name: string): Promise<void> {
  await storage.setItem(STORAGE_KEYS.USER_NAME, name);
}
```

### Pattern 3: Complex Objects
```typescript
// BEFORE
interface Prayer {
  id: string;
  text: string;
  date: string;
}

function savePrayers(prayers: Prayer[]): void {
  localStorage.setItem('busyChristian_prayers', JSON.stringify(prayers));
}

function loadPrayers(): Prayer[] {
  const data = localStorage.getItem('busyChristian_prayers');
  return data ? JSON.parse(data) : [];
}

// AFTER
interface Prayer {
  id: string;
  text: string;
  date: string;
}

async function savePrayers(prayers: Prayer[]): Promise<void> {
  await storage.setJSON(STORAGE_KEYS.PRAYERS, prayers);
}

async function loadPrayers(): Promise<Prayer[]> {
  return await storage.getJSON<Prayer[]>(STORAGE_KEYS.PRAYERS) || [];
}
```

## Available Storage Keys

Use the predefined constants from `STORAGE_KEYS`:

```typescript
STORAGE_KEYS.USER_NAME              // 'bc-user-name'
STORAGE_KEYS.STYLE                  // 'bc-style'
STORAGE_KEYS.SAVED_STUDIES          // 'bc-saved-studies'
STORAGE_KEYS.NOTES                  // 'bc-notes'
STORAGE_KEYS.SUBSCRIBED             // 'bc-subscribed'
STORAGE_KEYS.SHOW_DEVOTIONAL        // 'bc-show-devotional'
STORAGE_KEYS.SHOW_READING_PLAN      // 'bc-show-reading-plan'
STORAGE_KEYS.DEVOTIONAL_LAST_SHOWN  // 'bc-devotional-last-shown'
STORAGE_KEYS.PRAYERS                // 'busyChristian_prayers'
STORAGE_KEYS.THEME                  // 'theme'
STORAGE_KEYS.ONBOARDING_COMPLETED   // 'bc-onboarding-completed'
STORAGE_KEYS.LAST_SYNC              // 'bc-last-sync'
STORAGE_KEYS.READING_PLAN_PROGRESS  // 'bc-reading-plan-progress'
STORAGE_KEYS.STUDY_STREAK           // 'bc-study-streak'
STORAGE_KEYS.COURSES_PROGRESS       // 'bc-courses-progress'
```

## Files to Migrate (42 total)

### Critical Priority (Core Functionality)
- [ ] `lib/prayerStorage.ts` - Prayer data persistence
- [ ] `lib/progressTracker.ts` - Study progress tracking
- [ ] `lib/courseTracker.ts` - Course progress
- [ ] `app/components/SettingsModal.tsx` - User settings
- [ ] `app/components/GlobalSettingsManager.tsx` - Global settings

### High Priority (Main Features)
- [ ] `app/page.tsx` - Main application page
- [ ] `app/library/page.tsx` - Saved studies library
- [ ] `app/deep-study/page.tsx` - Deep study feature
- [ ] `app/my-prayers/page.tsx` - Prayer journal
- [ ] `app/reading-plan/page.tsx` - Reading plan
- [ ] `app/courses/[courseId]/page.tsx` - Course pages

### Medium Priority (Utilities & Helpers)
- [ ] `lib/notificationService.ts` - Notification handling
- [ ] `lib/metricsTracker.ts` - Analytics tracking
- [ ] `lib/prayedForStorage.ts` - Prayer tracking
- [ ] `lib/locationHelper.ts` - Location services
- [ ] `utils/safeStorage.ts` - Safe storage utilities
- [ ] `utils/verseCache.ts` - Bible verse caching

### Lower Priority (UI Components)
- [ ] `app/HeaderBar.tsx`
- [ ] `app/layout.tsx`
- [ ] `components/ThemeCustomizer.tsx`
- [ ] `components/PrayerNotification.tsx`
- [ ] `components/TodaysReadingWidget.tsx`
- [ ] `app/components/EnhancedOnboarding.tsx`
- [ ] `app/components/EnhancedSettings.tsx`
- [ ] `app/components/DevotionalBellNotification.tsx`
- [ ] `app/components/DevotionalNotification.tsx`
- [ ] `app/components/CheckInModal.tsx`

### Other Files
- [ ] `app/reading-plans/page.tsx`
- [ ] `app/setup/page.tsx`
- [ ] `app/mynotes/page.tsx`
- [ ] `app/privacy/page.tsx`
- [ ] `app/hooks/useStudyJourney.ts`
- [ ] `app/hooks/useStudyStyle.tsx`
- [ ] `app/my-prayers/debug.tsx`
- [ ] `app/debug-storage/page.tsx`

## Testing Checklist

After migration, test:

- [ ] Web browser (localhost:3000)
- [ ] iOS simulator
- [ ] iOS device
- [ ] Data persistence across app restarts
- [ ] Data migration from old localStorage (if applicable)

## Common Gotchas

1. **Async/Await Required**: All storage operations are now async
2. **useEffect for Loading**: Load data in useEffect, not in useState initializer
3. **Error Handling**: Wrap storage operations in try-catch blocks
4. **Type Safety**: Use TypeScript generics with getJSON/setJSON

## Need Help?

- Review examples in `lib/storage.ts`
- Check this migration guide
- Test incrementally (migrate one file at a time)
