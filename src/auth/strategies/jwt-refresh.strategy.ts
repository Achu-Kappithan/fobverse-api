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
import { UserDocument } from '../schema/candidate.schema';
import { AUTH_SERVICE, IAuthService } from '../interfaces/IAuthCandiateService';

@Injectable()
export class jwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  logger = new Logger(jwtRefreshStrategy.name);
  constructor(
    private readonly configService: ConfigService,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          this.logger.debug(
            `[ExtractJwt] Full request.cookies object: ${JSON.stringify(request?.cookies)}`,
          );
          const token = request?.cookies?.['refresh_token'];
          if (!token) {
            this.logger.warn(`[ExtractJwt] No refresh_Token found in cookie.`);
          }
          return token;
        }, 
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') || '',
    });
    this.logger.debug(
      `[Strategy Init] JwtAccessStrategy initialized. Secret status: ${configService.get<string>('JWT_SECRET') ? 'SET' : 'NOT_SET_OR_EMPTY'}`,
    );
  }

  async validate(payload: JwtRefreshPayload): Promise<UserDocument> {
    const { userId } = payload;
    const candidate = await this.authService.findById(userId);

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
