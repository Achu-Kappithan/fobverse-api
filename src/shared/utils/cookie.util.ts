import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

export function parseDurationToMs(
  duration: string | number | undefined,
): number | null {
  if (duration === undefined || duration === null || duration === '') return null;
  if (typeof duration === 'number') return duration;

  if (/^\d+$/.test(duration)) {
    return parseInt(duration, 10);
  }

  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

export function setJwtCookie(
  response: Response,
  configService: ConfigService,
  cookieName: string,
  token: string,
  expirationTimeEnvKey: string,
  isHttpOnly = true,
  maxAgeMsParam?: number,
): void {
  const envDuration = configService.get<string>(expirationTimeEnvKey);
  const parsedMaxAge = maxAgeMsParam ?? parseDurationToMs(envDuration);

  if (parsedMaxAge === null || isNaN(parsedMaxAge)) {
    console.error(
      `[CookieUtil] Invalid expiration time for cookie ${cookieName}: ${envDuration} (from ${expirationTimeEnvKey}). Using default (session).`,
    );
  }

  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  response.cookie(cookieName, token, {
    httpOnly: isHttpOnly,
    secure: isProduction,
    maxAge: parsedMaxAge ?? undefined,
    sameSite: isProduction ? 'none' : 'lax',
    domain: isProduction ? '.achuu.online' : undefined,
    path: '/',
  });
}

