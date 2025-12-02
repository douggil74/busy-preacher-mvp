// Simple in-memory rate limiter for API protection
// Limits requests per user/IP to prevent API abuse

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store rate limit data in memory (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;      // Max requests allowed
  windowMs: number;         // Time window in milliseconds
  identifier: string;       // User ID, email, or IP
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;          // Seconds until reset
}

export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { maxRequests, windowMs, identifier } = config;
  const now = Date.now();
  const key = identifier;

  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    // First request or window expired - start fresh
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: maxRequests - 1,
      resetIn: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((existing.resetTime - now) / 1000),
    };
  }

  // Increment count
  existing.count++;
  return {
    success: true,
    remaining: maxRequests - existing.count,
    resetIn: Math.ceil((existing.resetTime - now) / 1000),
  };
}

// Helper to get identifier from request
export function getIdentifier(request: Request, userId?: string): string {
  // Prefer user ID if logged in
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';
  return `ip:${ip}`;
}

// Pre-configured rate limiters for different use cases
export const RATE_LIMITS = {
  // AI endpoints - more restrictive (costs money)
  AI_CHAT: { maxRequests: 20, windowMs: 60 * 1000 },        // 20/min
  AI_STUDY: { maxRequests: 15, windowMs: 60 * 1000 },       // 15/min
  AI_GENERATION: { maxRequests: 10, windowMs: 60 * 1000 },  // 10/min

  // Standard endpoints
  STANDARD: { maxRequests: 60, windowMs: 60 * 1000 },       // 60/min

  // Auth/sensitive endpoints
  AUTH: { maxRequests: 5, windowMs: 60 * 1000 },            // 5/min
};

// Helper function to create rate limit error response
export function rateLimitResponse(resetIn: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please slow down.',
      retryAfter: resetIn,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(resetIn),
      },
    }
  );
}
