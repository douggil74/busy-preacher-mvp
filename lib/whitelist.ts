/**
 * Whitelist System
 * Two tiers:
 * - ADMIN_EMAILS: Full access + admin dashboard (no password needed)
 * - PREMIUM_EMAILS: Premium app access only (bypasses paywall, NO admin)
 * - Firestore whitelist: Dynamic list managed via admin panel
 */

import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// ========================================
// ADMIN USERS - Full access + admin dashboard
// ========================================
const ADMIN_EMAILS = [
  'doug.cag@gmail.com',
  'developer@ilovecornerstone.com',
];

// ========================================
// PREMIUM USERS - App access only (no admin)
// ========================================
const PREMIUM_EMAILS = [
  'cory.gilford@gmail.com',
];

// Cache for Firestore whitelist checks (5 min TTL)
const whitelistCache: Map<string, { result: boolean; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if user has premium access (admin OR premium list) - synchronous check only
 */
export function isWhitelisted(email: string | null | undefined): boolean {
  if (!email) {
    console.log('🔒 Whitelist check: No email provided');
    return false;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const isAdminUser = ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail);
  const isPremium = PREMIUM_EMAILS.some(e => e.toLowerCase() === normalizedEmail);
  const hasAccess = isAdminUser || isPremium;

  console.log(`🔒 Whitelist check: ${normalizedEmail} → ${hasAccess ? (isAdminUser ? '✅ ADMIN' : '✅ PREMIUM') : '❌ Not on list'}`);
  return hasAccess;
}

/**
 * Check if user has premium access including Firestore whitelist (async)
 */
export async function isWhitelistedAsync(email: string | null | undefined): Promise<boolean> {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check hardcoded lists first
  const isAdminUser = ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail);
  const isPremium = PREMIUM_EMAILS.some(e => e.toLowerCase() === normalizedEmail);

  if (isAdminUser || isPremium) {
    return true;
  }

  // Check cache
  const cached = whitelistCache.get(normalizedEmail);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  // Check Firestore whitelist
  try {
    const whitelistRef = doc(db, 'whitelist', normalizedEmail);
    const whitelistDoc = await getDoc(whitelistRef);
    const isInFirestore = whitelistDoc.exists();

    // Update cache
    whitelistCache.set(normalizedEmail, { result: isInFirestore, timestamp: Date.now() });

    if (isInFirestore) {
      console.log(`🔒 Whitelist check: ${normalizedEmail} → ✅ FIRESTORE`);
    }

    return isInFirestore;
  } catch (error) {
    console.error('Error checking Firestore whitelist:', error);
    return false;
  }
}

/**
 * Check if user is an admin (can access admin dashboard)
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail);
}

/**
 * Get list of whitelisted emails (for debugging)
 */
export function getWhitelistEmails(): string[] {
  return [...ADMIN_EMAILS, ...PREMIUM_EMAILS];
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
