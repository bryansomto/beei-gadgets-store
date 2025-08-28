// lib/rate-limit.ts
import { NextRequest } from 'next/server';

// In-memory store for rate limiting (consider Redis for production)
const memoryStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval?: number; // Max unique tokens per interval
}

export default class RateLimit {
  private interval: number;
  private uniqueTokenPerInterval: number;

  constructor(options: RateLimitOptions) {
    this.interval = options.interval;
    this.uniqueTokenPerInterval = options.uniqueTokenPerInterval || 500;
  }

  /**
   * Check if rate limit is exceeded for a given identifier
   * @param identifier - Unique identifier for rate limiting (IP, user ID, etc.)
   * @param limit - Maximum number of requests allowed in the interval
   * @returns Object with limit information and whether it's exceeded
   */
  check(identifier: string, limit: number): {
    limited: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const key = `${identifier}:${limit}`;

    // Clean up old entries
    this.cleanup();

    // Get or create the rate limit record
    let record = memoryStore.get(key);
    
    if (!record) {
      record = {
        count: 1,
        resetTime: now + this.interval
      };
      memoryStore.set(key, record);
    } else {
      // Reset if interval has passed
      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + this.interval;
      } else {
        record.count += 1;
      }
    }

    const remaining = Math.max(0, limit - record.count);
    
    return {
      limited: record.count > limit,
      remaining,
      resetTime: record.resetTime
    };
  }

  /**
   * Clean up expired rate limit records
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime + this.interval * 2) { // Extra buffer time
        memoryStore.delete(key);
      }
    }
  }

  /**
   * Middleware function for Next.js API routes
   * @param req - NextRequest object
   * @param limit - Maximum number of requests
   * @param identifier - Custom identifier (defaults to IP)
   * @throws Error if rate limit exceeded
   */
  async middleware(
    req: NextRequest, 
    limit: number, 
    identifier?: string
  ): Promise<void> {
    const id = identifier || this.getClientIP(req);
    const result = this.check(id, limit);

    if (result.limited) {
      throw new Error('Rate limit exceeded');
    }
  }

  /**
   * Get client IP from request
   */
  private getClientIP(req: NextRequest): string {
    // Try to get IP from headers (common in deployed environments)
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    // Fallback to direct connection IP
    const realIP = req.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    // Last resort (for local development)
    return '127.0.0.1';
  }
}

/**
 * Create a rate limiter instance with default settings
 */
export function createRateLimiter(intervalMs: number = 60000) {
  return new RateLimit({
    interval: intervalMs,
    uniqueTokenPerInterval: 500
  });
}

// Default rate limiter instance
export const defaultLimiter = createRateLimiter();