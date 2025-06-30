import {
  Injectable,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAccessPayload } from '../interfaces/jwt-payload.interface';
import { Request } from 'express';
import { UserDocument } from '../schema/candidate.schema';
import { AUTH_SERVICE, IAuthService } from '../interfaces/IAuthCandiateService';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'access_token',
) {
  logger = new Logger(JwtAccessStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.['access_token'];
          this.logger.log(`[jwtStratagy] jwt token from cookies${token}`);
          if (!token) {
            this.logger.warn(`[ExtractJwt] No access_token found in cookie.`);
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || '',
    });
  }

  async validate(payload: JwtAccessPayload): Promise<UserDocument> {
    this.logger.debug(
      `[Validate] JwtAccessStrategy validate method called with payload: ${JSON.stringify(payload)}`,
    );

    if (!payload.userId) {
      this.logger.warn(
        `[Validate] Token payload missing userId. Payload: ${JSON.stringify(payload)}`,
      );
      throw new UnauthorizedException('Invalid token payload: userId missing.');
    }

    const { userId } = payload;
    const user = await this.authService.findById(userId);

    if (!user) {
      this.logger.warn(
        `[Validate] Candidate not found in DB for userId: ${payload.userId}`,
      );
      throw new UnauthorizedException('Access denied: Candidate not found.');
    }

    if (!user.isVerified) {
      this.logger.warn(
        `[Validate] Candidate ${user.email} is not verified. Access denied.`,
      );
      throw new UnauthorizedException(
        'Access denied: Your account is not verified. Please verify your email.',
      );
    }
    const sanitizedUser = user.toObject({
      getters: true,
      virtuals: true,
    }) as UserDocument;
    return sanitizedUser;
  }
}
