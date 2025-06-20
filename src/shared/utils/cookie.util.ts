import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

export function setJwtCookie(
  response: Response,
  configService: ConfigService,
  cookieName: string,
  token: string,
  expirationTimeEnvKey: string,
  isHttpOnly: boolean = true, // <-- NEW PARAMETER, defaults to true for security
): void {
  const maxAgeMs = parseInt(configService.get<string>('COOKIES_EXP_IN') ||'7d', 10);

  if (isNaN(maxAgeMs)) {
    console.error(`[CookieUtil] Invalid expiration time for cookie ${cookieName}: ${expirationTimeEnvKey}. Using default (session).`);
    // Fallback or throw an error based on your application's error handling strategy
    // For now, if maxAgeMs is NaN, the cookie will be a session cookie (expires when browser closes)
  }

  response.cookie(cookieName, token, {
    httpOnly: isHttpOnly, // <-- Use the new parameter here
    secure: configService.get<string>('NODE_ENV') === 'production',
    maxAge: isNaN(maxAgeMs) ? undefined : maxAgeMs, // Set maxAge only if it's a valid number
    sameSite: 'strict',
  });
}