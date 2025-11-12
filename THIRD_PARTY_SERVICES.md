# Third-Party Services & APIs
## The Busy Christian App - Complete Integration List

*Last Updated: November 11, 2025*

---

## 🤖 AI & Language Models

### 1. Anthropic Claude API
- **Purpose**: AI commentary, outline generation, pastoral counseling
- **Website**: https://anthropic.com
- **Cost**: Pay-per-token (~$3-15 per 1M tokens)
- **API Key**: `ANTHROPIC_API_KEY`
- **Status**: ✅ Active

### 2. OpenAI API
- **Purpose**: Alternative AI processing (backup option)
- **Website**: https://openai.com
- **Cost**: Pay-per-token
- **API Key**: `OPENAI_API_KEY`
- **Status**: ⚠️ Configured (secondary)

---

## 📖 Bible & Religious Content

### 3. ESV API (English Standard Version)
- **Purpose**: Bible text retrieval, audio scripture
- **Website**: https://api.esv.org
- **Cost**: Free for non-commercial use
- **API Key**: `ESV_API_KEY`, `NEXT_PUBLIC_ESV_API_KEY`
- **Status**: ✅ Active

### 4. Bible API
- **Purpose**: Multiple Bible translations (KJV, WEB, ASV)
- **Website**: https://bible-api.com
- **Cost**: Free
- **API Key**: `BIBLE_API_KEY`
- **Status**: ✅ Active

### 5. Bible Study Tools
- **Purpose**: Matthew Henry & John Gill commentaries (web scraping)
- **Website**: https://biblestudytools.com
- **Cost**: Free
- **Status**: ✅ Active (web scraping)

### 6. Desiring God
- **Purpose**: John Piper sermons (web scraping)
- **Website**: https://desiringgod.org
- **Cost**: Free
- **Status**: ✅ Active (web scraping)

---

## 🗄️ Infrastructure & Database

### 7. Vercel
- **Purpose**: Web hosting, deployment, Edge Config
- **Website**: https://vercel.com
- **Cost**: Free tier (Hobby), Pro $20/month
- **Status**: ✅ Active (hosting)

### 8. Vercel Postgres
- **Purpose**: Database storage for user data
- **Website**: https://vercel.com/storage/postgres
- **Cost**: Free tier, then $0.30/GB
- **Status**: ✅ Active

### 9. Firebase (Google)
- **Purpose**: Authentication, Firestore, Cloud Messaging (Push Notifications)
- **Website**: https://firebase.google.com
- **Cost**: Free Spark plan, Blaze pay-as-you-go
- **API Keys**:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- **Status**: ⚠️ Configured (Firebase init temporarily disabled in iOS)
- **Note**: GoogleService-Info.plist needs to be properly added to Xcode project

---

## 📧 Communication & Email

### 10. Resend
- **Purpose**: Transactional emails, newsletter subscriptions
- **Website**: https://resend.com
- **Cost**: 3,000 free emails/month, then $20/month
- **API Key**: `RESEND_API_KEY`
- **Status**: ✅ Active

### 11. RapidAPI
- **Purpose**: Various API integrations
- **Website**: https://rapidapi.com
- **Cost**: Varies by API
- **API Key**: `RAPIDAPI_KEY`
- **Status**: ✅ Active

---

## 🎥 Media & Content

### 12. YouTube Data API
- **Purpose**: Fetching sermon/study videos
- **Website**: https://developers.google.com/youtube
- **Cost**: Free (10,000 units/day quota)
- **API Key**: `YOUTUBE_API_KEY`
- **Status**: ✅ Active

---

## 📱 Mobile (iOS)

### 13. Capacitor (Ionic Framework)
- **Purpose**: Native iOS wrapper for web app
- **Website**: https://capacitorjs.com
- **Cost**: Free (open source)
- **Version**: 7.4.4
- **Plugins Used**:
  - @capacitor/app
  - @capacitor/preferences
  - @capacitor/push-notifications
  - @capacitor/share
  - @capacitor/splash-screen
- **Status**: ✅ Active

### 14. Apple Push Notification Service (APNs)
- **Purpose**: iOS push notifications
- **Website**: https://developer.apple.com/notifications
- **Cost**: Free (requires Apple Developer account $99/year)
- **Status**: ✅ Configured

---

## 🔮 Planned Additions

### 15. Supabase (Upcoming)
- **Purpose**: Vector database for sermon storage + semantic search
- **Website**: https://supabase.com
- **Cost**: Free tier (500MB storage), Pro $25/month
- **Features Needed**:
  - PostgreSQL database with pgvector extension
  - File storage for sermon PDFs/transcripts
  - Vector embeddings for semantic search
- **Status**: 🔜 Pending implementation

---

## 💰 Cost Summary

### Current Monthly Costs (Estimates)
- **Anthropic Claude**: $10-30 (usage-based)
- **Vercel**: $0-20 (depending on plan)
- **Resend**: $0-20 (depending on email volume)
- **Firebase**: $0-10 (low usage expected)
- **All Others**: Free tiers

**Current Total**: $10-80/month depending on usage

### With Supabase Addition
**Projected Total**: $35-105/month

---

## 🔐 Security Notes

- All API keys stored in `.env.local` (not committed to git)
- Production keys should be set in Vercel environment variables
- Firebase config requires GoogleService-Info.plist for iOS
- Apple Developer account required for App Store distribution

---

## 📝 Environment Variables Checklist

Required in `.env.local`:
```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
ESV_API_KEY=
NEXT_PUBLIC_ESV_API_KEY=
BIBLE_API_KEY=
RESEND_API_KEY=
RAPIDAPI_KEY=
YOUTUBE_API_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

To add for Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 🔗 Useful Links

- **Project Repository**: (your GitHub repo)
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com
- **Apple Developer**: https://developer.apple.com
- **App Store Connect**: https://appstoreconnect.apple.com

---

## 📞 Support Contacts

- **Anthropic Support**: support@anthropic.com
- **Vercel Support**: https://vercel.com/support
- **Firebase Support**: https://firebase.google.com/support
- **Apple Developer Support**: https://developer.apple.com/support

---

*This document is maintained as part of The Busy Christian app development.*
*Update this file whenever new services are added or removed.*
