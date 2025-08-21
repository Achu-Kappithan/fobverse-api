import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtRefreshPayload } from '../interfaces/jwt-payload.interface';
import { AUTH_SERVICE, IAuthService } from '../interfaces/IAuthCandiateService';
import { UserDocument } from '../schema/user.schema';

@Injectable()
export class jwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  logger = new Logger(jwtRefreshStrategy.name);
  constructor(
    private readonly _configService: ConfigService,
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          this.logger.debug(
            `[ExtractJwt] Full request.cookies object: ${JSON.stringify(request?.cookies)}`,
          );
          const token: string | null =
            (request?.cookies as Record<string, string> | undefined)?.[
              'refresh_token'
            ] ?? null;
          if (!token) {
            this.logger.warn(`[ExtractJwt] No refresh_Token found in cookie.`);
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: _configService.get<string>('JWT_REFRESH_SECRET') || '',
    });
    this.logger.debug(
      `[Strategy Init] JwtAccessStrategy initialized. Secret status: ${_configService.get<string>('JWT_SECRET') ? 'SET' : 'NOT_SET_OR_EMPTY'}`,
    );
  }

  async validate(payload: JwtRefreshPayload): Promise<UserDocument> {
    const { UserId } = payload;
    const candidate = await this._authService.findById(UserId);

    if (!candidate) {
      throw new UnauthorizedException(
        'Refresh token invalid: Candidate not found.',
      );
    }

    return candidate.toObject({
      getters: true,
      virtuals: true,
    }) as UserDocument;
  }
}
