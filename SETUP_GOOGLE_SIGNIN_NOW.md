# 🔥 QUICK SETUP - Google & Email Sign-In (3 Steps)

## Step 1: Update Vercel Environment Variable (1 minute)

Go to: https://vercel.com/doug-gilfords-projects/busy-preacher-mvp/settings/environment-variables

Find: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

**Change it from:**
```
thebusychristian-app.appspot.com
```

**To:**
```
thebusychristian-app.firebasestorage.app
```

Click **Save**

## Step 2: Enable Google Sign-In in Firebase (2 minutes)

Go to: https://console.firebase.google.com/project/thebusychristian-app/authentication/providers

1. Find **Google** in the list of Sign-in providers
2. Click on it
3. Toggle **Enable** to ON
4. Add project support email: `doug.cag@gmail.com`
5. Click **Save**

## Step 3: Enable Email/Password Sign-In in Firebase (1 minute)

Go to: https://console.firebase.google.com/project/thebusychristian-app/authentication/providers

1. Find **Email/Password** in the list of Sign-in providers
2. Click on it
3. Toggle **Enable** to ON
4. Click **Save**

## That's It!

After completing both steps, run:

```bash
vercel --prod
```

Then test the sign-in at: https://busy-preacher-mvp.vercel.app

Click "Sign In" in the header and try signing in with your Google account!

---

## What This Fixes

The error you're seeing ("missing credentials") happens because:
1. ✅ The storage bucket URL was wrong (just fixed in `.env.local`)
2. ⏳ Google Sign-In needs to be enabled in Firebase Console (you need to do this)

Once you complete Step 2 above, everything will work!
