import storage, { STORAGE_KEYS } from '@/lib/storage';

const DEFAULT_ADMIN_PASSWORD = 'password';

export async function hasAdminPassword(): Promise<boolean> {
  const password = await storage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
  // If no password set, initialize with default
  if (!password) {
    await setAdminPassword(DEFAULT_ADMIN_PASSWORD);
    return true;
  }
  return !!password;
}

export async function setAdminPassword(password: string): Promise<void> {
  // Simple hash (in production, use bcrypt or similar)
  const hashed = btoa(password); // Base64 encoding for now
  await storage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, hashed);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const stored = await storage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
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
