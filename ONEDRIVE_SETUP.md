# OneDrive Integration Setup
## Bulk Import Your Sermon Archive

This guide will help you set up OneDrive integration to automatically import all your sermons.

---

## Why OneDrive Integration?

Instead of manually copy/pasting 25 years of sermons, this will:
- Import ALL sermons at once
- Extract metadata automatically (dates, titles)
- Generate AI embeddings for each sermon
- Skip duplicates automatically
- Take about 5-10 minutes for hundreds of sermons

---

## Prerequisites

1. Your sermons must be in OneDrive (which you said they are!)
2. Files should be in .txt, .doc, .docx, or .pdf format
3. A Microsoft/Azure account (free)

---

## Step 1: Register an Azure App

1. Go to https://portal.azure.com
2. Sign in with your Microsoft account
3. Search for "Azure Active Directory" or "Microsoft Entra ID"
4. Click **App registrations** in the left sidebar
5. Click **+ New registration**

### Fill in the form:
- **Name**: `Busy Christian Sermon Importer`
- **Supported account types**: `Accounts in any organizational directory and personal Microsoft accounts`
- **Redirect URI**:
  - Platform: **Web**
  - URI: `http://localhost:3000/admin/import-onedrive`

6. Click **Register**

---

## Step 2: Configure API Permissions

1. In your new app, click **API permissions** in the left sidebar
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Search for and check:
   - `Files.Read.All` (Read files in all site collections)
   - `offline_access` (Maintain access to data you have given it access to)
6. Click **Add permissions**
7. Click **Grant admin consent for [Your Name]** (blue button at top)
8. Click **Yes** to confirm

---

## Step 3: Enable Implicit Grant

1. Click **Authentication** in the left sidebar
2. Scroll down to **Implicit grant and hybrid flows**
3. Check both:
   - ✅ **Access tokens**
   - ✅ **ID tokens**
4. Click **Save** at the top

---

## Step 4: Get Your Client ID

1. Click **Overview** in the left sidebar
2. Copy the **Application (client) ID**
   - It looks like: `12345678-1234-1234-1234-123456789abc`
3. Save this for the next step

---

## Step 5: Add to Environment Variables

1. Open `.env.local` in your project
2. Add this line:

```bash
NEXT_PUBLIC_ONEDRIVE_CLIENT_ID=your-client-id-here
```

3. Replace `your-client-id-here` with the ID you copied
4. Save the file
5. Restart your dev server: `npm run dev`

---

## Step 6: Organize Your Sermons in OneDrive

Recommended folder structure:
```
OneDrive/
└── Sermons/
    ├── 2020-01-05 New Year New You.txt
    ├── 2020-01-12 Walking by Faith.txt
    ├── 2020-01-19 God's Promises.txt
    └── ...
```

### File Naming Convention (Recommended):
```
YYYY-MM-DD Sermon Title.txt
```

This format allows automatic date extraction!

---

## Step 7: Import Your Sermons

1. Go to http://localhost:3000/admin/import-onedrive
2. Click **"Sign in with Microsoft"**
3. Authorize the app to read your files
4. Enter your folder path (e.g., `root:/Sermons`)
5. Click **"Start Import"**
6. Wait for the magic to happen!

---

## What Happens During Import

### For Each Sermon File:
1. **Downloads** the file content
2. **Extracts** title from filename
3. **Extracts** date from filename (if formatted as YYYY-MM-DD)
4. **Searches** for scripture references in content
5. **Generates** first paragraph as summary
6. **Creates** AI embedding (for semantic search)
7. **Stores** in Supabase database

### Processing Time:
- **1 sermon**: ~2-3 seconds
- **100 sermons**: ~5-8 minutes
- **500 sermons**: ~20-30 minutes

The system will show progress as it imports.

---

## Supported File Types

| Format | Support | Notes |
|--------|---------|-------|
| `.txt` | ✅ Full | Best format - fastest processing |
| `.doc` | ✅ Full | Will extract text content |
| `.docx` | ✅ Full | Will extract text content |
| `.pdf` | ⚠️ Basic | Text extraction only (no images) |

---

## File Content Format

Your sermon files can be plain text or formatted. The system will handle:

```
Walking by Faith
2 Corinthians 5:7

For we walk by faith, not by sight...

[Main sermon content here]
```

Or simpler:
```
This is my sermon about faith and trusting God
even when circumstances seem impossible...
```

The AI will understand either format!

---

## Troubleshooting

### "Sign in with Microsoft" doesn't work
**Solutions**:
1. Check that your redirect URI matches exactly: `http://localhost:3000/admin/import-onedrive`
2. Make sure implicit grant is enabled in Azure
3. Try clearing browser cache and cookies

### "Failed to fetch OneDrive files"
**Solutions**:
1. Check that API permissions are granted
2. Verify folder path is correct (case-sensitive!)
3. Make sure folder exists in your OneDrive

### Import is slow
**This is normal!**
- Generating AI embeddings takes time
- 2-3 seconds per sermon is expected
- Large sermons (>5000 words) take longer

### Some sermons are skipped
**Common reasons**:
- Duplicate titles (system prevents duplicates)
- Empty files
- Unsupported file types
- Files over 8000 words (will be truncated)

### Import stops partway through
**Solutions**:
1. Check your OpenAI API key has credits
2. Check your internet connection
3. Run import again - it will skip duplicates

---

## After Import

Once your sermons are imported:

1. ✅ Test the Pastoral Counseling feature
2. ✅ Ask questions related to your sermon topics
3. ✅ Watch Claude cite YOUR actual teachings!

Example questions to try:
- "What have you taught about dealing with doubt?"
- "How do you counsel people struggling with anxiety?"
- "What does the Bible say about forgiveness?"

---

## Cost Estimates

### OpenAI Embeddings:
- **Cost**: ~$0.0001 per 1,000 tokens
- **Average sermon**: ~3,000 tokens = $0.0003 per sermon
- **500 sermons**: ~$0.15 total

### Supabase Storage:
- Covered by free tier (500MB)
- 500 sermons ≈ 10MB

**Total one-time cost**: Less than $1 for your entire archive!

---

## Security & Privacy

- Your sermons are stored securely in Supabase
- Only you can import (admin-only feature)
- Public users can only search (via Pastoral Counseling)
- Original OneDrive files remain unchanged
- Access token is temporary and not stored

---

## Advanced: Bulk Re-Import

If you need to re-import after making changes:

1. Delete sermons from Supabase (SQL Editor):
```sql
DELETE FROM sermons;
```

2. Run the import again

The system will treat everything as new and re-import all files.

---

## Need Help?

- **Microsoft Graph API Docs**: https://docs.microsoft.com/en-us/graph/api/resources/onedrive
- **Azure Portal**: https://portal.azure.com
- **Supabase Dashboard**: https://app.supabase.com

---

*Last Updated: November 11, 2025*
