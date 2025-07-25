import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { JwtTokenService } from '../jwt.services/jwt-service';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
} from '../interfaces/jwt-payload.interface';
import { AUTH_SERVICE, IAuthService } from '../interfaces/IAuthCandiateService';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private jwtTokenService: JwtTokenService,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {
    super({
      clientID: configService.get<string>('CLIENT_ID') || '',
      clientSecret: configService.get<string>('CLIENT_SECRET') || '',
      callbackURL: 'http://localhost:3000/auth/callback',
      passReqToCallback: true,
      scope: ['profile'],
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile,
    done: Function,
  ) {
    try {
      this.logger.debug(`Google profile received: ${JSON.stringify(profile)}`);
      const userEmail =
        profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : null;
      const googleId = profile.id;
      const name = profile.displayName;

      if (userEmail) {
        this.logger.warn(
          `Google profile missing email for user ID: ${googleId}`,
        );
        throw new UnauthorizedException(
          'Google profile missing email. Cannot proceed with login.',
        );
      }

      let user = await this.authService.findByEmail(userEmail);

      if (!user) {
        this.logger.log(
          `Creating new user with googleId ${googleId} and ${userEmail}`,
        );
      } else if (!user.googleId) {
        this.logger.log(
          `Linking existing user ${userEmail} to Google ID: ${googleId}`,
        );
        user = await this.authService.linkGoogleAccount(user._id.toString(), googleId);
      }

      const AccessPayload: JwtAccessPayload = {
        email: user!.email,
        UserId: user!._id.toString(),
        role: user!.role,
        profileId: user!.companyId!.toString()
      };

      const RefreshPayload: JwtRefreshPayload = {
        email: user!.email,
        UserId: user!._id.toString(),
      };

      const accessToken =
        this.jwtTokenService.generateAccessToken(AccessPayload);
      const refreshToken =
        this.jwtTokenService.generateRefreshToken(RefreshPayload);
      done(null, {
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (err) {
      this.logger.error(
        `Error during Google authentication for user: ${profile.emails?.[0]?.value || profile.id}`,
        err.stack,
      );
      done(err, false);
    }
  }
}
