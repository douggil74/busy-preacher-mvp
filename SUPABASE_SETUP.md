# Supabase Setup Guide for Sermon Database

This guide will help you set up Supabase to store and search your 25 years of sermons for the Pastoral Counseling feature.

---

## Step 1: Create a Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create a new organization (e.g., "The Busy Christian")

---

## Step 2: Create a New Project

1. Click "New Project"
2. Fill in:
   - **Name**: `busy-christian-sermons` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan**: Start with **Free** (includes 500MB, plenty for testing)
3. Click "Create new project"
4. Wait 2-3 minutes for provisioning

---

## Step 3: Run the Database Schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **"+ New query"**
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste it into the SQL editor
5. Click **"Run"** or press Cmd/Ctrl + Enter
6. You should see "Success. No rows returned" (this is good!)

This creates:
- `sermons` table with vector embeddings
- Vector search function `match_sermons()`
- Storage bucket for sermon files
- Proper indexes for fast searches

---

## Step 4: Get Your API Keys

1. Click **Project Settings** (gear icon) in the left sidebar
2. Click **API** in the settings menu
3. Copy these values:

### Keys You Need:
```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (different from anon)
```

⚠️ **IMPORTANT**: The `service_role` key is SECRET! Never commit it to Git.

---

## Step 5: Add Environment Variables

1. Open your `.env.local` file in the project root
2. Add these three new variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-service-role-key...
```

3. Save the file
4. Restart your dev server: `npm run dev`

---

## Step 6: Verify the Setup

1. Go to http://localhost:3000/admin/sermons
2. You should see the sermon upload form
3. Try uploading a test sermon:
   - **Title**: "Test Sermon on Faith"
   - **Content**: "Faith is being sure of what we hope for..."
   - Click **Upload Sermon**

4. If successful, you'll see a green success message!

---

## Step 7: Upload Your Sermon Archive

You have two options:

### Option A: Manual Upload (Recommended for Starting)
1. Go to http://localhost:3000/admin/sermons
2. Copy/paste sermon text one at a time
3. Fill in metadata (date, scripture, topics)
4. Click Upload

### Option B: Bulk Upload (For Many Sermons)
If you have sermons in text files, I can create a bulk upload script that:
- Reads all .txt/.pdf files from a folder
- Extracts metadata
- Uploads them all at once

Let me know if you want Option B!

---

## How It Works

### The Flow:
1. **User asks a question** in Pastoral Counseling
2. **System searches sermons** using semantic similarity (AI embeddings)
3. **Top 3 relevant sermons** are found
4. **Claude AI** receives both the question AND relevant sermon excerpts
5. **Response includes** your actual pastoral teachings

### Example:
**User Question**: "How do I deal with anxiety?"

**System**:
- Searches all sermons for content about anxiety
- Finds: "Peace in Turbulent Times" (similarity: 0.89)
- Finds: "Casting Your Cares on God" (similarity: 0.85)
- Finds: "When Fear Overwhelms" (similarity: 0.82)

**Claude**: Gets sermon excerpts and generates response like:
> "I understand how overwhelming anxiety can feel. In my sermon 'Peace in Turbulent Times,' I talked about how Philippians 4:6-7 teaches us..."

---

## Cost Breakdown

### Free Tier (Current):
- **500 MB** database storage (~500-1,000 sermons depending on length)
- **1 GB** bandwidth per month
- **50,000** monthly active users
- Enough for testing and initial launch!

### Pro Tier ($25/month):
- **8 GB** database storage
- **50 GB** bandwidth
- **100,000** monthly active users
- Recommended once you have significant traffic

### Database Size Estimates:
- Average sermon (3,000 words) ≈ 15 KB text
- With embeddings ≈ 20 KB per sermon
- 500 sermons ≈ 10 MB (plenty of room!)

---

## Troubleshooting

### "Module not found: '@supabase/supabase-js'"
**Solution**: Run `npm install @supabase/supabase-js`

### "relation 'sermons' does not exist"
**Solution**: Run the SQL schema again in Supabase SQL Editor

### "Invalid API key"
**Solution**: Double-check your environment variables match the keys from Supabase dashboard

### Upload fails silently
**Solution**: Check browser console (F12) for errors. Usually missing environment variables.

### Search returns no results
**Solution**: Make sure you have uploaded at least one sermon. The system gracefully handles empty databases.

---

## Security Notes

- The `service_role` key bypasses Row Level Security - keep it secret!
- Only you (admin) can upload sermons via the API
- Public users can only read/search sermons (via the Pastoral Counseling feature)
- Never commit `.env.local` to Git

---

## Next Steps

Once Supabase is configured:
1. Upload a few test sermons
2. Try the Pastoral Counseling feature
3. Ask questions related to your sermons
4. Watch Claude cite your actual teachings!

---

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Vector Search Guide**: https://supabase.com/docs/guides/ai/vector-embeddings

---

*Last Updated: November 11, 2025*
