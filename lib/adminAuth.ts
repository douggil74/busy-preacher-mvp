import storage, { STORAGE_KEYS } from '@/lib/storage';

const ADMIN_PASSWORD_KEY = 'bc-admin-password';

// Add to storage keys if not already there
if (!Object.values(STORAGE_KEYS).includes(ADMIN_PASSWORD_KEY)) {
  (STORAGE_KEYS as any).ADMIN_PASSWORD = ADMIN_PASSWORD_KEY;
}

export async function hasAdminPassword(): Promise<boolean> {
  const password = await storage.getItem(ADMIN_PASSWORD_KEY);
  return !!password;
}

export async function setAdminPassword(password: string): Promise<void> {
  // Simple hash (in production, use bcrypt or similar)
  const hashed = btoa(password); // Base64 encoding for now
  await storage.setItem(ADMIN_PASSWORD_KEY, hashed);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const stored = await storage.getItem(ADMIN_PASSWORD_KEY);
  if (!stored) return false;

  const hashed = btoa(password);
  return hashed === stored;
}

export async function clearAdminSession(): Promise<void> {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('admin-authenticated');
  }
}

export function setAdminSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('admin-authenticated', 'true');
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('admin-authenticated') === 'true';
}
