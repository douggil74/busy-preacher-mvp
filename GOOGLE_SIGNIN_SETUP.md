# Email/Password Authentication Setup Guide

This document outlines the authentication implementation for The Busy Christian app.

## What's Been Implemented

### ✅ Completed Features

1. **Email/Password Authentication Context** (`contexts/AuthContext.tsx`)
   - Firebase Email/Password authentication
   - User profile creation with first name and full name
   - Location detection using geolocation + reverse geocoding
   - User profile stored in Firestore with:
     - `uid`: User ID
     - `firstName`: User-provided first name
     - `fullName`: User-provided full name
     - `email`: User email
     - `location`: { city, state, country }
     - `createdAt`, `lastSignIn`: Timestamps

2. **Sign-In/Sign-Up UI** (`components/SignInModal.tsx`)
   - Beautiful modal with email/password form
   - Toggle between sign-in and sign-up modes
   - Error handling with helpful messages
   - Privacy note about first name display
   - "Maybe Later" option for optional sign-in

3. **Header Bar Integration** (`app/HeaderBar.tsx`)
   - Sign-In button when not authenticated
   - User profile button with first name + photo when authenticated
   - Sign-out functionality

4. **Crisis Detection System** (`lib/crisisDetection.ts`)
   - Keyword detection for:
     - Suicide/self-harm language
     - Severe mental health crisis
     - Abuse/danger situations
     - Addiction crisis
     - Severe distress
   - Automatic logging to Firestore `crisis_alerts` collection
   - Email notification to pastor via Resend API

5. **Crisis Alert API** (`app/api/crisis-alert/route.ts`)
   - Sends urgent email to pastor when crisis detected
   - Includes user info, location, prayer request text
   - Lists detected keywords
   - Professional crisis response formatting

## Required Setup Steps

### 1. Enable Email/Password Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `thebusychristian-app`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password** provider
5. Click **Enable**
6. Click **Save**

### 2. Add Pastor Email to Environment Variables

Add the following to your `.env.local` file:

```bash
# Pastor email for crisis alerts
PASTOR_EMAIL=your-pastor-email@example.com

# Or use ADMIN_EMAIL if already configured
ADMIN_EMAIL=your-pastor-email@example.com
```

The crisis alert system will use `PASTOR_EMAIL` if available, otherwise fall back to `ADMIN_EMAIL`.

### 3. Verify Resend API Key

Make sure your Resend API key is configured in `.env.local`:

```bash
RESEND_API_KEY=your-resend-api-key
```

### 4. Update Authorized Domains (Optional)

If deploying to production, add your domain to Firebase authorized domains:

1. Firebase Console → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Add your production domain (e.g., `thebusychristian.com`)

## How It Works

### User Sign-In Flow

1. User clicks "Sign In" button in header
2. Sign-In modal appears with Google button
3. User authenticates with Google
4. App creates user profile in Firestore
5. App requests location permission (optional)
6. If granted, detects city/state via geolocation + reverse geocoding
7. User is signed in, header shows their first name + photo

### Privacy Features

- **Only first name displayed**: Full name stored in database but never shown publicly
- **General location only**: City and state (never exact GPS coordinates)
- **Optional location**: Users can skip location permission
- **Explicit consent**: Clear messaging about what info is collected

### Crisis Prevention Flow

1. User submits prayer request in community
2. System checks text for crisis keywords
3. If crisis detected:
   - Request saved normally
   - Crisis alert logged to `crisis_alerts` Firestore collection
   - Email sent immediately to pastor with:
     - User's name (first name only in public UI, full name in alert)
     - User's email (for direct contact)
     - User's general location
     - Full prayer request text
     - List of detected keywords
4. Pastor can respond directly to user

### Database Structure

**Users Collection** (`users/{uid}`):
```json
{
  "uid": "google-user-id",
  "firstName": "John",
  "fullName": "John Doe",
  "email": "john@example.com",
  "photoURL": "https://...",
  "location": {
    "city": "Springfield",
    "state": "Illinois",
    "country": "USA"
  },
  "createdAt": "2024-11-14T...",
  "lastSignIn": "2024-11-14T..."
}
```

**Crisis Alerts Collection** (`crisis_alerts/{userId}_{timestamp}`):
```json
{
  "userId": "google-user-id",
  "userName": "John",
  "userEmail": "john@example.com",
  "userLocation": "Springfield, Illinois",
  "prayerRequest": "Full text of prayer request",
  "detectedKeywords": ["suicide", "hopeless"],
  "createdAt": "2024-11-14T...",
  "status": "new",
  "pastorNotes": ""
}
```

## Testing

### Test Sign-In

1. Click "Sign In" in header
2. Complete Google authentication
3. Verify:
   - User redirected back to app
   - First name appears in header
   - User profile created in Firestore

### Test Location Detection

1. Sign in with new account
2. Allow location permission when prompted
3. Check Firestore user profile
4. Verify location has city/state

### Test Crisis Detection (Use Test Prayer Only!)

**WARNING**: Only test with clearly marked test prayers!

```
TEST PRAYER - DO NOT RESPOND: I'm feeling hopeless and want to end my life
```

1. Submit test prayer with crisis keywords
2. Verify email sent to pastor
3. Check `crisis_alerts` collection in Firestore
4. Verify alert contains all required info

## Next Steps

After completing setup:

1. Test authentication flow
2. Test crisis detection with safe test data
3. Set up Firestore security rules to protect user data
4. Consider adding:
   - Admin dashboard to view crisis alerts
   - Two-way messaging between pastor and users
   - Prayer warrior notifications for urgent requests

## Support

If you encounter issues:

1. Check Firebase Console for authentication errors
2. Verify all environment variables are set
3. Check browser console for client-side errors
4. Check Vercel logs for server-side errors
5. Ensure Firestore database is in same region as Functions

## Security Considerations

1. **User Data Protection**:
   - Never expose email addresses in public UI
   - Show only first names in community features
   - Location limited to city/state

2. **Crisis Alerts**:
   - Stored securely in Firestore
   - Only accessible by authenticated pastor/admin
   - Email includes crisis hotline info

3. **Authentication**:
   - Uses Google's secure OAuth 2.0
   - Firebase handles all credential management
   - No passwords stored in your database
