// lib/utils.ts

export function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return 'Anonymous';
  const trimmed = fullName.trim();
  const firstName = trimmed.split(' ')[0];
  return firstName || 'Anonymous';
}

export function getState(location: string | null | undefined): string {
  if (!location) return '';
  const trimmed = location.trim();
  
  // If there's a comma, take the part after it
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',');
    return parts[parts.length - 1].trim();
  }
  
  // If no comma, return as-is
  return trimmed;
}

/**
 * Format user display for prayer cards
 * Example: "John Smith" from "New York, NY" → "John from NY"
 */
export function formatPrayerUser(
  fullName: string | null | undefined,
  location: string | null | undefined
): string {
  const firstName = getFirstName(fullName);
  const state = getState(location);
  
  if (state) {
    return `${firstName} from ${state}`;
  }
  
  return firstName;
}