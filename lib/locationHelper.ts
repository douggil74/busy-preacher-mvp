// lib/locationHelper.ts
// Get user's city, state, country for prayer sharing

export interface UserLocation {
  city?: string;
  state?: string;
  country: string;
  formatted: string; // "City, State, Country" or "City, Country"
}

/**
 * Get user's location using browser geolocation + reverse geocoding
 */
export async function getUserLocation(): Promise<UserLocation | null> {
  // Check if already stored
  const stored = localStorage.getItem('busy_christian_user_location');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid stored data, continue to get fresh location
    }
  }

  // Get fresh location
  try {
    // Get coordinates from browser
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      });
    });

    const { latitude, longitude } = position.coords;

    // Reverse geocode using Nominatim (OpenStreetMap - free, no API key)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'TheBusyChristianApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    const address = data.address;

    // Extract location parts
    const city = address.city || address.town || address.village || address.county;
    const state = address.state;
    const country = address.country;

    // Format location string
    let formatted = '';
    if (city && state && country === 'United States') {
      formatted = `${city}, ${state}`;
    } else if (city && country) {
      formatted = `${city}, ${country}`;
    } else if (state && country) {
      formatted = `${state}, ${country}`;
    } else if (country) {
      formatted = country;
    } else {
      formatted = 'Unknown Location';
    }

    const location: UserLocation = {
      city,
      state,
      country: country || 'Unknown',
      formatted
    };

    // Save to localStorage
    localStorage.setItem('busy_christian_user_location', JSON.stringify(location));

    return location;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

/**
 * Clear stored location (user wants to update)
 */
export function clearStoredLocation(): void {
  localStorage.removeItem('busy_christian_user_location');
}

/**
 * Get stored location without fetching new
 */
export function getStoredLocation(): UserLocation | null {
  const stored = localStorage.getItem('busy_christian_user_location');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}