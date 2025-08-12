import { ConfigService } from '@nestjs/config';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
  JwtVerificationPayload,
  passwordResetPayload,
} from '../interfaces/jwt-payload.interface';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenService {
  private readonly _logger = new Logger(JwtTokenService.name);

  constructor(
    private readonly _configService: ConfigService,
    private _jwtService: JwtService,
  ) {}

  generateVerificationToken(payload: JwtVerificationPayload): string {
    try {
      const token = this._jwtService.sign(payload, {
        secret: this._configService.get<string>('JWT_VERIFICATION_SECRET'),
        expiresIn: this._configService.get<string>(
          'JWT_VERIFICATION_EXPIRES_IN',
        ),
      });
      return token;
    } catch (error) {
      this._logger.error(
        `Error generating verificaton token for user ${payload.UserId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to generate verification token.',
      );
    }
  }

  generateAccessToken(payload: JwtAccessPayload): string {
    try {
      const token = this._jwtService.sign(payload, {
        secret: this._configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this._configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
      });
      return token;
    } catch (error) {
      this._logger.error(
        `Error generating access token for user ${payload.UserId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to generate access token.',
      );
    }
  }

  generateRefreshToken(payload: JwtRefreshPayload): string {
    try {
      const token = this._jwtService.sign(payload, {
        secret: this._configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this._configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      });
      return token;
    } catch (error) {
      this._logger.error(
        `Error generating refresh token for user ${payload.UserId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to generate refresh token.',
      );
    }
  }

  GeneratePassResetToken(payload: passwordResetPayload): string {
    try {
      const token = this._jwtService.sign(payload, {
        secret: this._configService.get<string>('JWT_VERIFICATION_SECRET'),
        expiresIn: this._configService.get<string>(
          'JWT_VERIFICATION_EXPIRES_IN',
        ),
      });
      return token;
    } catch (error) {
      this._logger.error(
        `Error generating passwordReestToken for user ${payload.id}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to generate passwordReestToken token.',
      );
    }
  }
}
