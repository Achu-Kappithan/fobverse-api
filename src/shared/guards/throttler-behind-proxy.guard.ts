import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

/**
 * Custom ThrottlerGuard that extracts the real client IP
 * when the server is running behind a reverse proxy (e.g. Render.com, Nginx).
 *
 * Without this, all requests would appear to come from the proxy IP,
 * causing ALL users to share a single rate limit bucket.
 *
 * Priority order:
 *  1. X-Forwarded-For header (set by proxy) — first IP in the chain is the real client
 *  2. X-Real-IP header (some proxies set this)
 *  3. req.ip (fallback for direct connections / local dev)
 */
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Request): Promise<string> {
    const forwardedFor = req.headers['x-forwarded-for'] as string | undefined;
    if (forwardedFor) {
      // X-Forwarded-For can be a comma-separated list: "client, proxy1, proxy2"
      // The first value is always the original client IP
      return Promise.resolve(forwardedFor.split(',')[0].trim());
    }

    const realIp = req.headers['x-real-ip'] as string | undefined;
    if (realIp) {
      return Promise.resolve(realIp.trim());
    }

    return Promise.resolve(req.ip ?? 'unknown');
  }
}
