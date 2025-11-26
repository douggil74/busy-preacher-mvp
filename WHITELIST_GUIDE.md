# Whitelist System - Admin Backdoor

You and your friends have **full access** to everything, bypassing all restrictions.

## How It Works

✅ **Whitelisted users get:**
- No login required on website
- No paywalls
- No restrictions
- Full access to all features
- Same access as iOS app users

## Your Current Whitelist

Located in: `lib/whitelist.ts`

**Current whitelisted emails:**
- `doug.cag@gmail.com` (you)
- `developer@ilovecornerstone.com` (you)

## Add Friends to Whitelist

1. **Open file:** `lib/whitelist.ts`

2. **Add emails to the array:**
```typescript
const WHITELIST_EMAILS = [
  'doug.cag@gmail.com',
  'developer@ilovecornerstone.com',
  'friend1@example.com',        // Add here
  'friend2@example.com',        // Add here
  'pastor@church.com',          // Add here
];
```

3. **Save, commit, and push:**
```bash
git add lib/whitelist.ts
git commit -m "Add friends to whitelist"
git push
```

4. **Done!** Changes deploy automatically in 1-2 minutes.

## Access Levels

### 🔓 Full Access (No Restrictions):
1. **iOS app users** - Paid $2.99
2. **Whitelisted emails** - You + friends
3. **Web users who signed in** - Free accounts

### 🔐 Limited Access (Must Sign In):
- Anonymous web visitors - Must create free account

## Testing

**To test if someone is whitelisted:**
1. Have them sign in with their Google account
2. Check browser console - you'll see: `whitelisted: true`
3. They should have instant access to everything

## Important Notes

⚠️ **Case Insensitive**: `Doug@Email.com` = `doug@email.com`
⚠️ **Must Match Exactly**: Email must match their Google sign-in email
⚠️ **Changes Deploy in 1-2 min**: After you push to GitHub

## Priority Order

When someone accesses your app/website, the system checks:

1. ✅ **Is their email whitelisted?** → Full access
2. ✅ **Are they from iOS app?** → Full access
3. ✅ **Are they signed in?** → Full access
4. ❌ **Anonymous?** → Must sign in

## Example: Adding Multiple Friends

```typescript
const WHITELIST_EMAILS = [
  // Admins
  'doug.cag@gmail.com',
  'developer@ilovecornerstone.com',

  // Church staff
  'pastor@church.com',
  'youth.pastor@church.com',
  'admin@church.com',

  // Friends & family
  'friend1@gmail.com',
  'friend2@yahoo.com',

  // Beta testers
  'beta.tester1@example.com',
  'beta.tester2@example.com',
];
```

## Remove Someone

Just delete their line from the array:

```typescript
const WHITELIST_EMAILS = [
  'doug.cag@gmail.com',
  // 'removed.user@example.com',  // Removed!
];
```

Then commit and push.

---

**Your backdoor is ready!** You and whitelisted friends will never see login screens or paywalls. 🎉
