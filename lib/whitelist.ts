/**
 * Whitelist System
 * Admin and friends get full access to everything, bypassing all restrictions
 */

// Add your email and friends' emails here
const WHITELIST_EMAILS = [
  'doug.cag@gmail.com',
  'developer@ilovecornerstone.com',
  // Add more emails below:
  // 'friend1@example.com',
  // 'friend2@example.com',
];

/**
 * Check if user email is whitelisted
 */
export function isWhitelisted(email: string | null | undefined): boolean {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();
  return WHITELIST_EMAILS.some(
    whitelistedEmail => whitelistedEmail.toLowerCase() === normalizedEmail
  );
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
