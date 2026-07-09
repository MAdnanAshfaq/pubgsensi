/**
 * Simple in-memory rate limiter for Next.js Edge Runtime.
 * Prevents endpoint abuse by tracking request counts per IP address.
 */
const ipCache = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function rateLimit(
  ip: string,
  limit = 10,
  windowMs = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  
  // Clean up expired cache items to prevent memory leaks
  for (const [key, val] of ipCache.entries()) {
    if (now > val.resetTime) {
      ipCache.delete(key);
    }
  }

  const cached = ipCache.get(ip);

  if (!cached || now > cached.resetTime) {
    const resetTime = now + windowMs;
    ipCache.set(ip, { count: 1, resetTime });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTime
    };
  }

  cached.count += 1;
  
  if (cached.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: cached.resetTime
    };
  }

  return {
    success: true,
    limit,
    remaining: limit - cached.count,
    reset: cached.resetTime
  };
}
