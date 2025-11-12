# Helpful Resources & Services

This document lists all the external services, APIs, and resources used to build The Busy Christian app.

## 🚀 Deployment & Hosting

### Vercel
- **Website**: https://vercel.com
- **Used For**: Web app hosting and deployment
- **Dashboard**: https://vercel.com/doug-gilfords-projects/busy-preacher-mvp
- **Docs**: https://vercel.com/docs

## 📱 Mobile Development

### Capacitor
- **Website**: https://capacitorjs.com
- **Used For**: Converting web app to native iOS app
- **Docs**: https://capacitorjs.com/docs

### Capacitor Assets
- **Package**: `@capacitor/assets`
- **Used For**: Generating app icons and splash screens
- **Docs**: https://github.com/ionic-team/capacitor-assets

## 🔥 Firebase

### Firebase Console
- **Website**: https://console.firebase.google.com
- **Project**: thebusychristian-app
- **Used For**:
  - Authentication
  - Firestore database (prayer requests)
  - Cloud Messaging (push notifications)
  - FCM tokens storage

### Firebase Documentation
- **Auth**: https://firebase.google.com/docs/auth
- **Firestore**: https://firebase.google.com/docs/firestore
- **Cloud Messaging**: https://firebase.google.com/docs/cloud-messaging

## 🗄️ Supabase

### Supabase Dashboard
- **Website**: https://supabase.com
- **Project URL**: https://fteolzeggftsjevmseyn.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/fteolzeggftsjevmseyn
- **Used For**:
  - Sermon database storage
  - Vector search with pgvector
  - AI embeddings for semantic search
  - Moderation logs

### Supabase Documentation
- **Main Docs**: https://supabase.com/docs
- **pgvector**: https://supabase.com/docs/guides/ai/vector-columns
- **API**: https://supabase.com/docs/guides/api

## 🤖 AI Services

### OpenAI
- **Website**: https://platform.openai.com
- **Dashboard**: https://platform.openai.com/api-keys
- **Used For**:
  - Sermon embeddings (text-embedding-ada-002)
  - AI commentary generation
  - Pastoral guidance chat
  - Content moderation

### OpenAI Documentation
- **API Reference**: https://platform.openai.com/docs/api-reference
- **Embeddings**: https://platform.openai.com/docs/guides/embeddings
- **Chat Completions**: https://platform.openai.com/docs/guides/chat-completions

## 📖 Bible APIs

### ESV Bible API
- **Website**: https://api.esv.org
- **Used For**: Fetching Bible verses and passages
- **Docs**: https://api.esv.org/docs/
- **Get API Key**: https://api.esv.org/account/create-application/

### Bible API (Alternative)
- **Website**: https://bible-api.com
- **Used For**: Additional Bible verse lookups
- **Docs**: https://bible-api.com

## ☁️ Cloud Storage

### Microsoft OneDrive
- **Developer Portal**: https://developer.microsoft.com/en-us/onedrive
- **Used For**: Importing sermon archives
- **OAuth Setup**: https://docs.microsoft.com/en-us/onedrive/developer/rest-api/getting-started/graph-oauth

### OneDrive Graph API
- **Docs**: https://learn.microsoft.com/en-us/graph/api/resources/onedrive
- **API Reference**: https://learn.microsoft.com/en-us/graph/api/overview

## 📧 Email Services

### Resend
- **Website**: https://resend.com
- **Used For**: Sending transactional emails
- **Docs**: https://resend.com/docs

## 🎨 Design Resources

### Lucide Icons
- **Website**: https://lucide.dev
- **Used For**: All UI icons in the app
- **React Docs**: https://lucide.dev/guide/packages/lucide-react

### Tailwind CSS
- **Website**: https://tailwindcss.com
- **Used For**: Styling and responsive design
- **Docs**: https://tailwindcss.com/docs

## 🔧 Development Tools

### Next.js
- **Website**: https://nextjs.org
- **Version**: 15.5.4
- **Docs**: https://nextjs.org/docs

### React
- **Website**: https://react.dev
- **Docs**: https://react.dev/reference/react

### TypeScript
- **Website**: https://www.typescriptlang.org
- **Docs**: https://www.typescriptlang.org/docs

## 📦 Package Management

### npm
- **Website**: https://www.npmjs.com
- **Registry**: https://registry.npmjs.org

## 🔐 API Keys Required

To run this project, you need API keys from:

1. **Firebase** (3 keys):
   - API Key
   - VAPID Key
   - Service Account (for admin features)

2. **Supabase** (2 keys):
   - Anon Key (public)
   - Service Role Key (private)

3. **OpenAI** (1 key):
   - API Key

4. **ESV Bible API** (1 key):
   - API Key

5. **Resend** (1 key):
   - API Key

6. **OneDrive** (OAuth):
   - Client ID
   - Client Secret

## 📚 Learning Resources

### Next.js + Capacitor
- **Tutorial**: https://capacitorjs.com/docs/guides/nextjs

### Firebase + React
- **Tutorial**: https://firebase.google.com/docs/web/setup

### Supabase + Next.js
- **Tutorial**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

### Vector Search with pgvector
- **Guide**: https://supabase.com/blog/openai-embeddings-postgres-vector

## 🆘 Support & Community

### Stack Overflow
- **Next.js**: https://stackoverflow.com/questions/tagged/next.js
- **React**: https://stackoverflow.com/questions/tagged/reactjs
- **Firebase**: https://stackoverflow.com/questions/tagged/firebase

### GitHub Issues
- **Next.js**: https://github.com/vercel/next.js/issues
- **Capacitor**: https://github.com/ionic-team/capacitor/issues
- **Supabase**: https://github.com/supabase/supabase/issues

## 📱 App Store

### Apple Developer
- **Website**: https://developer.apple.com
- **Used For**: Publishing iOS app to App Store
- **App Store Connect**: https://appstoreconnect.apple.com

## 🌐 Domain & DNS

### Vercel Domains
- **Manage Domains**: https://vercel.com/docs/concepts/projects/domains

## 📊 Analytics (Optional Future Integration)

### Vercel Analytics
- **Docs**: https://vercel.com/docs/analytics

### Google Analytics
- **Website**: https://analytics.google.com

## 🔒 Security

### Vercel Security
- **Docs**: https://vercel.com/docs/security/secure-applications

### Firebase Security Rules
- **Docs**: https://firebase.google.com/docs/rules

### Supabase Row Level Security
- **Docs**: https://supabase.com/docs/guides/auth/row-level-security

---

## Quick Links for This Project

- **Production URL**: https://thebusypreacher.vercel.app
- **Firebase Project**: thebusychristian-app
- **Supabase Project**: fteolzeggftsjevmseyn
- **GitHub Repo**: https://github.com/douggil74/busy-preacher-mvp

---

*Last Updated: 2025-01-11*
