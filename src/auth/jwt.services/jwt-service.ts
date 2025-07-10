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
import {
  CANDIDATE_SERVICE,
  ICandidateService,
} from 'src/candiate/interfaces/candidate-service.interface';

@Injectable()
export class JwtTokenService {
  private readonly logger = new Logger(JwtTokenService.name);

  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    @Inject(CANDIDATE_SERVICE)
    private readonly candidateService: ICandidateService,
  ) {}

  generateVerificationToken(payload: JwtVerificationPayload): string {
    try {
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_VERIFICATION_EXPIRES_IN',
        ),
      });
      return token;
    } catch (error) {
      this.logger.error(
        `Error generating verificaton token for user ${payload.userId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to generate verification token.',
      );
    }
  }

  generateAccessToken(payload: JwtAccessPayload): string {
    try {
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
      });
      return token;
    } catch (error) {
      this.logger.error(
        `Error generating access token for user ${payload.userId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to generate access token.',
      );
    }
  }

  generateRefreshToken(payload: JwtRefreshPayload): string {
    try {
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      });
      return token;
    } catch (error) {
      this.logger.error(
        `Error generating refresh token for user ${payload.userId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to generate refresh token.',
      );
    }
  }

  GeneratePassResetToken(payload: passwordResetPayload): string {
    try {
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_VERIFICATION_EXPIRES_IN',
        ),
      });
      return token;
    } catch (error) {
      this.logger.error(
        `Error generating passwordReestToken for user ${payload.id}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to generate passwordReestToken token.',
      );
    }
  }
}
