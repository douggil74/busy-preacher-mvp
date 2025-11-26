# Paywall System - Usage Guide

Your app now has a paywall system that automatically detects iOS app users and gives them full access (since they paid $2.99 upfront).

## How It Works

✅ **iOS App Users**: Paid $2.99 → Full access to everything
💰 **Web Users**: See paywall → Can purchase iOS app or subscribe on web

## Quick Start

### Wrap Premium Content

```tsx
import { Paywall } from '@/components/Paywall';

export default function PremiumFeaturePage() {
  return (
    <div>
      <h1>Premium Feature</h1>

      {/* Content that should be behind paywall */}
      <Paywall>
        <div>
          <h2>This content is only for paid users!</h2>
          <p>iOS app users see this automatically.</p>
          <p>Web users need to subscribe.</p>
        </div>
      </Paywall>
    </div>
  );
}
```

### Check Access Programmatically

```tsx
'use client';

import { usePlatform } from '@/hooks/usePlatform';

export default function ConditionalContent() {
  const { isPaid, platform, isApp } = usePlatform();

  if (!isPaid) {
    return <div>Please subscribe to access this feature.</div>;
  }

  return (
    <div>
      <p>Welcome! You have full access.</p>
      <p>Platform: {platform}</p>
      {isApp && <p>Thanks for downloading the app!</p>}
    </div>
  );
}
```

### Simple Access Check

```tsx
import { useHasAccess } from '@/components/Paywall';

export default function MyComponent() {
  const hasAccess = useHasAccess();

  return hasAccess ? (
    <PremiumContent />
  ) : (
    <UpgradePrompt />
  );
}
```

## Example: Protect Prayer Feature

```tsx
// app/prayer/page.tsx
import { Paywall } from '@/components/Paywall';

export default function PrayerPage() {
  return (
    <div>
      <h1>Prayer Community</h1>

      {/* Free preview */}
      <div>
        <p>Join our prayer community...</p>
      </div>

      {/* Premium content */}
      <Paywall showPreview>
        <PrayerList />
        <SubmitPrayerForm />
        <PrayerChat />
      </Paywall>
    </div>
  );
}
```

## Platform Detection

The system automatically detects:
- ✅ Capacitor runtime (iOS app)
- ✅ User agent contains "Capacitor"
- ✅ URL parameter `?source=ios-app`

## Future: Add Web Subscriptions

When ready to add web subscriptions (with Stripe, etc.):

```tsx
// Update Paywall.tsx button onClick:
<button
  onClick={() => {
    // Redirect to Stripe checkout
    window.location.href = '/api/checkout';
  }}
>
  Subscribe for $4.99/month
</button>
```

Then check subscription status:
```tsx
const { isPaid } = usePlatform();
const hasWebSubscription = await checkStripeSubscription();
const fullAccess = isPaid || hasWebSubscription;
```

## Files Created

1. **`lib/platform-detector.ts`** - Core detection logic
2. **`hooks/usePlatform.ts`** - React hook for platform detection
3. **`components/Paywall.tsx`** - Paywall UI component

## Testing

**Test as iOS app user:**
- Open app on iPhone or simulator
- Should see all content automatically

**Test as web user:**
- Open website in browser
- Should see paywall on protected content

## Next Steps

1. **Now**: All content is accessible (no paywalls active)
2. **When ready**: Wrap premium features with `<Paywall>`
3. **Later**: Add web subscription with Stripe

## Important Notes

⚠️ **Apple Guidelines**: If you add in-app subscriptions WITHIN the iOS app later, you MUST use Apple's In-App Purchase system (not Stripe).

✅ **This is OK**:
- iOS app = $2.99 one-time purchase
- Web = Separate Stripe subscription
- Different platforms, different payments

❌ **This violates Apple rules**:
- iOS app tries to sell Stripe subscriptions
- iOS app links to external payment
