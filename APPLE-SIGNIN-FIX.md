# Apple Sign-In Fix - Redirect Loop Issue

## Problem
Apple Sign-In redirects to Apple ID page repeatedly instead of completing authentication.

## Root Cause
Firebase needs the correct OAuth redirect URIs configured for Apple Sign-In to work in your web app.

## Solution - Add OAuth Redirect URIs

### Step 1: Get Your Auth Domain

Your Firebase auth domain is: `thebusychristian-app.firebaseapp.com`

### Step 2: Configure Apple Sign-In in Firebase

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select**: thebusychristian-app
3. **Go to**: Authentication → Sign-in method
4. **Click on**: Apple
5. **You should see a section that says "OAuth redirect URI"**

6. **Copy these two URIs:**
   ```
   https://thebusychristian-app.firebaseapp.com/__/auth/handler
   https://www.thebusychristianapp.com/__/auth/handler
   ```

### Step 3: Add URIs to Apple Developer

1. **Go to**: https://developer.apple.com/account/resources/identifiers/list/serviceId

2. **Find or Create a Services ID**:
   - If you don't have one: Click "+" to create
   - Identifier: `com.thebusychristian.signin` (or similar)
   - Description: "The Busy Christian Sign In"

3. **Configure the Services ID**:
   - Check "Sign in with Apple"
   - Click "Configure"

4. **Add Your Domains and Return URLs**:
   - Primary App ID: Select your app's Bundle ID
   - Domains:
     - `thebusychristian-app.firebaseapp.com`
     - `www.thebusychristianapp.com`

   - Return URLs (add BOTH):
     - `https://thebusychristian-app.firebaseapp.com/__/auth/handler`
     - `https://www.thebusychristianapp.com/__/auth/handler`

5. **Save everything**

### Step 4: Update Firebase with Services ID

1. **Back in Firebase Console** (Authentication → Sign-in method → Apple)

2. **Find "Services ID" field**

3. **Enter your Services ID**: `com.thebusychristian.signin`

4. **Add OAuth Code Flow Configuration** (if requested):
   - Key ID: (from Apple Developer → Certificates, Identifiers & Profiles → Keys)
   - Team ID: (your Apple Developer Team ID)
   - Private Key: (download from Apple Developer)

5. **Click "Save"**

---

## Alternative Quick Fix (If above is complex)

If the above is too complex, we can use **Firebase Redirect** instead of popup:

### Update AuthContext.tsx

Change Apple Sign-In to use redirect instead of popup:

```typescript
const signInWithApple = async () => {
  try {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');

    console.log('🍎 Attempting Apple sign-in with redirect...');

    // Use redirect instead of popup
    await signInWithRedirect(auth, provider);

  } catch (error: any) {
    console.error('❌ Apple sign in error:', error);
    throw error;
  }
};
```

And add a handler in the component that mounts:

```typescript
useEffect(() => {
  // Handle redirect result
  getRedirectResult(auth).then((result) => {
    if (result) {
      console.log('✅ Sign-in redirect successful:', result.user);
    }
  }).catch((error) => {
    console.error('Redirect error:', error);
  });
}, []);
```

---

## Testing After Fix

1. Clear your browser/app cache
2. Sign out completely
3. Try "Continue with Apple" again
4. Should redirect to Apple, then back to your app successfully

---

## Current Status

- ✅ Apple Sign-In button added (appears first, above Google)
- ✅ Firebase Apple authentication enabled
- ✅ Xcode capability added
- ⚠️  OAuth redirect URIs need configuration (see above)

Once you configure the OAuth redirect URIs in Apple Developer Portal and Firebase, Apple Sign-In will work smoothly!
