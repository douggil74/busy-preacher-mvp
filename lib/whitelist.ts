/**
 * Whitelist System
 * Admin and friends get full access to everything, bypassing all restrictions
 *
 * HOW TO USE:
 * 1. Add email addresses to the WHITELIST_EMAILS array below
 * 2. Commit and push to deploy
 * 3. Whitelisted users get:
 *    - Full app access (bypasses subscription/paywall)
 *    - Admin dashboard access (bypasses password)
 */

// ========================================
// ADD OR REMOVE EMAILS HERE
// ========================================
const WHITELIST_EMAILS = [
  // Admin
  'doug.cag@gmail.com',
  'developer@ilovecornerstone.com',

  // Friends & Testers - add emails below:
  // 'friend@example.com',
  // 'tester@example.com',
];

/**
 * Check if user email is whitelisted
 */
export function isWhitelisted(email: string | null | undefined): boolean {
  if (!email) {
    console.log('🔒 Whitelist check: No email provided');
    return false;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const isOnList = WHITELIST_EMAILS.some(
    whitelistedEmail => whitelistedEmail.toLowerCase() === normalizedEmail
  );

  console.log(`🔒 Whitelist check: ${normalizedEmail} → ${isOnList ? '✅ WHITELISTED' : '❌ Not on list'}`);
  return isOnList;
}

/**
 * Get list of whitelisted emails (for debugging)
 */
export function getWhitelistEmails(): string[] {
  return [...WHITELIST_EMAILS];
}

/**
 * Check if user should have full access
 * Returns true if:
 * - User is whitelisted (admin/friends)
 * - User is from iOS app (paid $2.99)
 */
export function hasFullAccess(
  email: string | null | undefined,
  isFromApp: boolean
): boolean {
  return isWhitelisted(email) || isFromApp;
}
