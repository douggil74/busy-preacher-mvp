# Pastoral Messaging System

A comprehensive two-tier system for pastoral follow-up that combines **optional contact sharing** with **in-app messaging**.

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [How It Works](#how-it-works)
3. [Database Setup](#database-setup)
4. [User Experience](#user-experience)
5. [Pastor Experience](#pastor-experience)
6. [Privacy & Safety](#privacy--safety)

---

## System Overview

### The Two-Tier Approach

**Tier 1: Contact Modal (Crisis/Serious Situations)**
- Shows after detecting crisis or serious keywords
- User can optionally provide email & phone
- Different urgency levels (🚨 Crisis vs. ⚠️ Serious)
- 100% optional - users can skip

**Tier 2: In-App Messaging (Always Available)**
- Anonymous messaging between pastor and user
- No contact info required
- Works even if user skipped contact modal
- Messages persist across sessions

### Why This Approach?

✅ **Respects Privacy**: Users control what they share
✅ **No One Falls Through Cracks**: In-app messaging as backup
✅ **Crisis Response**: Can reach people who need urgent help
✅ **Pastoral Care**: Personal follow-up when appropriate

---

## How It Works

### For Users

1. **User asks a question** in "Ask the Pastor" page
2. **AI responds** with pastoral guidance
3. **System detects** crisis or serious keywords:
   - **Crisis**: suicide, self-harm, etc.
   - **Serious**: abuse, divorce, addiction, terminal illness, etc.
4. **Contact modal appears** (if detected):
   - Explains why pastor wants to personally help
   - Asks for email (required) and phone (optional)
   - Can click "No thanks, I prefer to stay anonymous"
5. **Conversation continues** normally
6. **If pastor sends a message** later:
   - Floating notification badge appears: "Pastor Doug sent you a message!"
   - Click to open in-app inbox
   - Can reply without revealing contact info

### For Pastor (You)

1. **Email alerts** for crisis/serious situations (already implemented)
2. **Admin panel** shows all conversations:
   - `/admin/pastoral-messages`
   - Filter by: All / Flagged / Has Contact
   - See who provided contact info (email/phone shown in green)
3. **View full conversation** including AI responses
4. **Send personal messages**:
   - To users who provided contact → can also email/call them
   - To anonymous users → they'll see message in-app next visit
5. **User replies** appear in real-time

---

## Database Setup

### Step 1: Run SQL Schema

Execute this in Supabase SQL Editor:

```sql
-- File: supabase-pastoral-messages.sql
```

This creates two tables:
- `pastoral_conversations` - One per user session
- `pastoral_messages` - All messages (user, AI, pastor)

### Step 2: Verify Tables

In Supabase dashboard, check:
- Table Editor → `pastoral_conversations`
- Table Editor → `pastoral_messages`

Should see automatic triggers for:
- Updating last_activity timestamp
- Marking unread messages from pastor

---

## User Experience

### Initial Conversation (No Crisis)

```
User: How do I handle conflict in relationships?
AI: [Responds with pastoral guidance]
→ No modal, conversation continues normally
```

### Crisis Detected

```
User: I don't think I can go on anymore
AI: [Crisis response with 988 Lifeline]
→ 🚨 Modal appears:
   "I Care About You - I'm genuinely concerned..."
   [Email field]
   [Phone field (optional)]
   [Yes, Please Reach Out] [No thanks, I prefer anonymous]
```

### Serious Situation Detected

```
User: My marriage is falling apart...
AI: [Compassionate response]
→ ⚠️ Modal appears:
   "Let Me Help Personally - This feels like something
   we should talk about face-to-face"
   [Email field]
   [Phone field (optional)]
   [Yes, Please Reach Out] [No thanks, I prefer anonymous]
```

### Later: Pastor Sends Message

```
→ Floating badge appears bottom-right:
  "Pastor Doug sent you a message!"

→ Click to open inbox:
  [Chat-style interface]
  Pastor: "Hey, I've been thinking about you..."
  [Reply field]
```

---

## Pastor Experience

### Admin Panel: `/admin/pastoral-messages`

**Left Side - Conversations List:**
```
┌─────────────────────────────┐
│ Conversations               │
├─────────────────────────────┤
│ 👤 Sarah                   │
│ ✉️ sarah@email.com        ⚠️ │
│ "I'm struggling with..."    │
│ 🕐 2 hours ago  [1 unread] │
├─────────────────────────────┤
│ 👤 Anonymous               │
│ "How do I forgive..."       │
│ 🕐 1 day ago                │
└─────────────────────────────┘
```

**Right Side - Messages Panel:**
```
┌──────────────────────────────────┐
│ Sarah • sarah@email.com  [FLAGGED]│
├──────────────────────────────────┤
│                                  │
│ Sarah (user):                    │
│ "I'm struggling with addiction..." │
│                                  │
│ AI: [response]                   │
│                                  │
│ You (Pastor):                    │
│ "Sarah, I'm here for you..."     │
│                                  │
├──────────────────────────────────┤
│ [Write a personal message...]    │
│                            [Send]│
└──────────────────────────────────┘
```

### Filters

- **All** - Every conversation
- **Flagged** - Only crisis/serious situations
- **Has Contact** - Users who shared email/phone

### Contact Info Display

When user provides contact:
- ✉️ Green email address
- 📞 Green phone number

You can:
- Message them in-app
- Email them directly
- Call them directly

---

## Privacy & Safety

### What's Collected

**Always:**
- First name (from onboarding)
- Session ID (anonymous)
- Questions and AI responses
- Timestamps

**Only if User Provides:**
- Email address
- Phone number

### What's NOT Collected

❌ Full name
❌ Location/IP tracking
❌ Account creation
❌ Payment info

### Session Tracking

- Browser generates unique session ID
- Stored in localStorage: `bc-pastoral-session-id`
- Persists across page reloads
- Allows continued conversation
- Allows pastor messages to reach user

### Data Retention

Messages are kept indefinitely for:
- Continuity of pastoral care
- Context for future conversations
- Learning to improve AI responses

User can:
- Stay completely anonymous
- Share contact only when comfortable
- Delete localStorage to reset session

---

## Crisis Detection Keywords

### 🚨 Crisis (Immediate Danger)
- suicide/suicidal
- kill myself
- end my life
- want to die
- self harm
- hurt myself

### ⚠️ Serious (Follow-up Needed)
- abuse/being hurt/molest/assault
- overdose
- divorce
- leaving god/walk away from faith
- addiction/alcoholic
- pornography
- terminal/cancer
- died/death of/lost my
- job loss

---

## Email Notifications

You receive emails for:
- 🚨 Crisis situations (immediate danger)
- ⚠️ Serious situations (needs follow-up)

Email includes:
- User's question
- AI's response
- Severity level
- User IP (for context)
- Timestamp

---

## Files Overview

### Database
- `supabase-pastoral-messages.sql` - Schema and triggers

### Components
- `components/PastoralContactModal.tsx` - Contact request modal
- `components/PastoralInbox.tsx` - User's message inbox

### API Routes
- `app/api/pastoral-contact/route.ts` - Save contact info
- `app/api/pastoral-messages/route.ts` - Send/receive messages
- `app/api/pastoral-conversations/route.ts` - Manage conversations

### Pages
- `app/pastoral-guidance/page.tsx` - Main chat interface (updated)
- `app/admin/pastoral-messages/page.tsx` - Pastor's message interface

---

## Testing the System

### Test Crisis Detection

1. Go to `/pastoral-guidance`
2. Ask: "I don't think I can go on anymore"
3. Should see:
   - AI crisis response with 988 Lifeline
   - 🚨 Red modal asking for contact
   - Email alert sent to you

### Test Serious Detection

1. Ask: "My marriage is falling apart"
2. Should see:
   - AI response with guidance
   - ⚠️ Amber modal offering personal support
   - Email alert sent to you

### Test In-App Messaging

1. User asks question (can skip contact modal)
2. Go to `/admin/pastoral-messages`
3. Select conversation
4. Send a message: "Hi, I'm here if you need to talk"
5. Return to `/pastoral-guidance` as user
6. Should see floating notification badge
7. Click to open inbox and reply

### Test Contact Sharing

1. Ask a serious question
2. Fill in email in modal
3. Go to `/admin/pastoral-messages`
4. Conversation should show green ✉️ with email address

---

## Common Questions

**Q: What if user clears their localStorage?**
A: New session ID is generated, loses access to old conversation. Intentional privacy feature.

**Q: Can anonymous users still get messages from pastor?**
A: Yes! Through in-app messaging system. They'll see notification next visit.

**Q: What if I want to disable the contact modal?**
A: Edit `app/pastoral-guidance/page.tsx` and comment out lines 168-171 (the modal trigger).

**Q: Can I adjust which keywords trigger the modal?**
A: Yes! Edit lines 128-129 in `app/pastoral-guidance/page.tsx` to customize the regex patterns.

**Q: How do I reach someone who didn't provide contact?**
A: Send them a message in `/admin/pastoral-messages`. They'll see it next time they visit.

---

## Future Enhancements

Possible additions:
- Push notifications when pastor messages
- Export conversation transcripts
- Tag/categorize conversations
- Search conversations
- Bulk message capabilities
- Read receipts
- Typing indicators

---

## Support

For questions or issues:
1. Check Supabase logs for database errors
2. Check browser console for client errors
3. Check email spam folder for alerts
4. Verify RESEND_API_KEY is set in .env.local
