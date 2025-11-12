/**
 * Helper utilities for making authenticated admin API requests
 */

/**
 * Get the admin API authentication header
 */
function getAdminAuthHeader(): Record<string, string> {
  const secret = process.env.NEXT_PUBLIC_ADMIN_API_SECRET || '';

  if (!secret) {
    console.error('[Admin API] NEXT_PUBLIC_ADMIN_API_SECRET not configured');
  }

  return {
    'Authorization': `Bearer ${secret}`
  };
}

/**
 * Make an authenticated admin API request
 */
export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...options.headers,
    ...getAdminAuthHeader(),
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Make an authenticated POST request with JSON body
 */
export async function adminPostJSON(url: string, data: any): Promise<Response> {
  return adminFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Make an authenticated POST request with FormData (for file uploads)
 */
export async function adminPostFormData(url: string, formData: FormData): Promise<Response> {
  return adminFetch(url, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Make an authenticated GET request
 */
export async function adminGet(url: string): Promise<Response> {
  return adminFetch(url, {
    method: 'GET',
  });
}
