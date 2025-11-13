/**
 * Safe fetch wrapper that validates JSON responses before parsing
 * Prevents "Unexpected token '<'" errors when API returns HTML error pages
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(
      `Expected JSON response but got ${contentType}. Response: ${text.substring(0, 100)}`
    );
  }

  return response.json();
}
