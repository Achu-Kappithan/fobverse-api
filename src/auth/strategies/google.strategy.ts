// import {
//   Inject,
//   Injectable,
//   Logger,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-google-oauth20';
// import { JwtTokenService } from '../jwt.services/jwt-service';
// import {
//   JwtAccessPayload,
//   JwtRefreshPayload,
// } from '../interfaces/jwt-payload.interface';
// import { AUTH_SERVICE, IAuthService } from '../interfaces/IAuthCandiateService';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   private readonly _logger = new Logger(GoogleStrategy.name);
//   constructor(
//     private readonly _configService: ConfigService,
//     private _jwtTokenService: JwtTokenService,
//     @Inject(AUTH_SERVICE)
//     private readonly _authService: IAuthService,
//   ) {
//     super({
//       clientID: _configService.get<string>('CLIENT_ID') || '',
//       clientSecret: _configService.get<string>('CLIENT_SECRET') || '',
//       callbackURL: 'http://localhost:3000/auth/callback',
//       passReqToCallback: true,
//       scope: ['profile'],
//     });
//   }

//   async validate(profile, done: Function) {
//     try {
//       this._logger.debug(`Google profile received: ${JSON.stringify(profile)}`);
//       const userEmail =
//         profile.emails && profile.emails.length > 0
//           ? profile.emails[0].value
//           : null;
//       const googleId = profile.id;
//       const name = profile.displayName;

//       if (userEmail) {
//         this._logger.warn(
//           `Google profile missing email for user ID: ${googleId}`,
//         );
//         throw new UnauthorizedException(
//           'Google profile missing email. Cannot proceed with login.',
//         );
//       }

//       let user = await this._authService.findByEmail(userEmail);

//       if (!user) {
//         this._logger.log(
//           `Creating new user with googleId ${googleId} and ${userEmail}`,
//         );
//       } else if (!user.googleId) {
//         this._logger.log(
//           `Linking existing user ${userEmail} to Google ID: ${googleId}`,
//         );
//         user = await this._authService.linkGoogleAccount(
//           user._id.toString(),
//           googleId,
//         );
//       }

//       const AccessPayload: JwtAccessPayload = {
//         email: user!.email,
//         UserId: user!._id.toString(),
//         role: user!.role,
//         profileId: user!.companyId!.toString(),
//       };

//       const RefreshPayload: JwtRefreshPayload = {
//         email: user!.email,
//         UserId: user!._id.toString(),
//       };

//       const accessToken =
//         this._jwtTokenService.generateAccessToken(AccessPayload);
//       const refreshToken =
//         this._jwtTokenService.generateRefreshToken(RefreshPayload);
//       done(null, {
//         user: user,
//         accessToken: accessToken,
//         refreshToken: refreshToken,
//       });
//     } catch (err) {
//       this._logger.error(
//         `Error during Google authentication for user: ${profile.emails?.[0]?.value || profile.id}`,
//         err.stack,
//       );
//       done(err, false);
//     }
//   }
// }

import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { JwtTokenService } from '../jwt.services/jwt-service';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
} from '../interfaces/jwt-payload.interface';
import { AUTH_SERVICE, IAuthService } from '../interfaces/IAuthCandiateService';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly _logger = new Logger(GoogleStrategy.name);

  constructor(
    private readonly _configService: ConfigService,
    private readonly _jwtTokenService: JwtTokenService,
    @Inject(AUTH_SERVICE) private readonly _authService: IAuthService,
  ) {
    super({
      clientID: _configService.get<string>('CLIENT_ID') || '',
      clientSecret: _configService.get<string>('CLIENT_SECRET') || '',
      callbackURL: 'http://localhost:3000/auth/callback',
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      this._logger.debug(`Google profile received: ${JSON.stringify(profile)}`);

      const userEmail = profile.emails?.[0]?.value ?? null;
      const googleId = profile.id;
      // const name = profile.displayName;

      if (!userEmail) {
        this._logger.warn(
          `Google profile missing email for user ID: ${googleId}`,
        );
        throw new UnauthorizedException(
          'Google profile missing email. Cannot proceed with login.',
        );
      }

      let user = await this._authService.findByEmail(userEmail);

      if (!user) {
        this._logger.log(
          `Creating new user with googleId ${googleId} and ${userEmail}`,
        );
        // probably call this._authService.create(...) here
      } else if (!user.googleId) {
        this._logger.log(
          `Linking existing user ${userEmail} to Google ID: ${googleId}`,
        );
        user = await this._authService.linkGoogleAccount(
          user._id.toString(),
          googleId,
        );
      }

      const AccessPayload: JwtAccessPayload = {
        email: user!.email,
        UserId: user!._id.toString(),
        role: user!.role,
        profileId: user?.companyId?.toString(),
      };

      const RefreshPayload: JwtRefreshPayload = {
        email: user!.email,
        UserId: user!._id.toString(),
      };

      const newAccessToken =
        this._jwtTokenService.generateAccessToken(AccessPayload);
      const newRefreshToken =
        this._jwtTokenService.generateRefreshToken(RefreshPayload);

      done(null, {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        this._logger.error(
          `Error during Google authentication for user: ${profile.emails?.[0]?.value || profile.id}`,
          err.stack,
        );
      }
      done(err, false);
    }
  }
}
