import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
export function setJwtCookie(
  response: Response,
  configService: ConfigService,
  cookieName: string,
  token: string,
  expirationTimeEnvKey: string,
  isHttpOnly: boolean = true,
  maxAgeMs: number,
): void {
  if (isNaN(maxAgeMs)) {
    console.error(
      `[CookieUtil] Invalid expiration time for cookie ${cookieName}: ${expirationTimeEnvKey}. Using default (session).`,
    );
  }

  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  response.cookie(cookieName, token, {
    httpOnly: isHttpOnly,
    secure: isProduction,
    maxAge: maxAgeMs,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
}
