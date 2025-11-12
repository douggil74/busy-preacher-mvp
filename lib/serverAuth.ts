import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates that a request is coming from an authenticated admin
 * Returns null if auth passes, or a NextResponse error if it fails
 */
export async function validateAdminRequest(request: NextRequest): Promise<NextResponse | null> {
  // Get authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[Auth] Missing or invalid authorization header');
    return NextResponse.json(
      { error: 'Unauthorized - Missing authentication token' },
      { status: 401 }
    );
  }

  // Extract token
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const expectedToken = process.env.ADMIN_API_SECRET;

  // Check if secret is configured
  if (!expectedToken) {
    console.error('[Auth] ADMIN_API_SECRET not configured in environment');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Validate token
  if (token !== expectedToken) {
    console.error('[Auth] Invalid token provided');
    return NextResponse.json(
      { error: 'Unauthorized - Invalid authentication token' },
      { status: 401 }
    );
  }

  // Auth passed
  return null;
}

/**
 * Helper to get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
