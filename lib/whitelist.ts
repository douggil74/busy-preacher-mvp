/**
 * Whitelist System
 *
 * Roles:
 * - owner: Full access + admin dashboard
 * - developer: Full access + admin dashboard
 * - admin: Full access + admin dashboard
 * - user: Premium app access only (bypasses paywall, NO admin)
 *
 * Sources:
 * - ADMIN_EMAILS: Hardcoded owner/developer accounts
 * - PREMIUM_EMAILS: Hardcoded premium users
 * - Firestore whitelist: Dynamic list with roles managed via admin panel
 */

import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// Roles that can access admin dashboard
export const ADMIN_ROLES = ['owner', 'developer', 'admin'] as const;
export type AdminRole = typeof ADMIN_ROLES[number];
export type WhitelistRole = AdminRole | 'user';

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
interface WhitelistCacheEntry {
  exists: boolean;
  role?: WhitelistRole;
  timestamp: number;
}
const whitelistCache: Map<string, WhitelistCacheEntry> = new Map();
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
    return cached.exists;
  }

  // Check Firestore whitelist
  try {
    const whitelistRef = doc(db, 'whitelist', normalizedEmail);
    const whitelistDoc = await getDoc(whitelistRef);
    const isInFirestore = whitelistDoc.exists();
    const data = whitelistDoc.data();
    const role = (data?.role as WhitelistRole) || 'user';

    // Update cache with role info
    whitelistCache.set(normalizedEmail, {
      exists: isInFirestore,
      role: isInFirestore ? role : undefined,
      timestamp: Date.now()
    });

    if (isInFirestore) {
      console.log(`🔒 Whitelist check: ${normalizedEmail} → ✅ FIRESTORE (role: ${role})`);
    }

    return isInFirestore;
  } catch (error) {
    console.error('Error checking Firestore whitelist:', error);
    return false;
  }
}

/**
 * Check if user has admin access (can access admin dashboard) - async version
 * Checks both hardcoded ADMIN_EMAILS and Firestore roles (admin, developer, owner)
 */
export async function isAdminAsync(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();

  // Check hardcoded admin list first
  if (ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail)) {
    return true;
  }

  // Check cache for role
  const cached = whitelistCache.get(normalizedEmail);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.exists && cached.role !== undefined && ADMIN_ROLES.includes(cached.role as AdminRole);
  }

  // Check Firestore for role
  try {
    const whitelistRef = doc(db, 'whitelist', normalizedEmail);
    const whitelistDoc = await getDoc(whitelistRef);

    if (!whitelistDoc.exists()) {
      whitelistCache.set(normalizedEmail, { exists: false, timestamp: Date.now() });
      return false;
    }

    const data = whitelistDoc.data();
    const role = (data?.role as WhitelistRole) || 'user';

    // Update cache
    whitelistCache.set(normalizedEmail, {
      exists: true,
      role,
      timestamp: Date.now()
    });

    const hasAdminRole = ADMIN_ROLES.includes(role as AdminRole);
    if (hasAdminRole) {
      console.log(`🔒 Admin check: ${normalizedEmail} → ✅ HAS ADMIN ROLE (${role})`);
    }

    return hasAdminRole;
  } catch (error) {
    console.error('Error checking admin role:', error);
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
