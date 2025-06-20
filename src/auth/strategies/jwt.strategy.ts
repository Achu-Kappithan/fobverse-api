import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CANDIDATE_SERVICE, ICandidateService } from 'src/candidates/interfaces/candidate-service.interface';
import { JwtVerificationPayload } from '../interfaces/jwt-payload.interface';
import { UserDocument } from 'src/candidates/schema/candidate.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CANDIDATE_SERVICE) // Inject IUserService via its token
    private readonly userService: ICandidateService,
  ) {
super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_VERIFICATION_SECRET') || 'default-fallback-secret-for-development',
    });
  }

  /**
   * This method is called after the JWT is extracted and verified (signature and expiry).
   * It takes the decoded payload and returns the validated user object.
   * If valid, the user object will be attached to the `req.user` in the controller.
   * @param payload The decoded JWT payload.
   * @returns The user object that will be attached to `req.user`.
   * @throws UnauthorizedException if the user is not found or not verified.
   */
  async validate(payload: JwtVerificationPayload): Promise<UserDocument> {
    const { userId, email } = payload;
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    // Ensure the user is verified before allowing access to protected routes
    if (!user.isVerified) {
      throw new UnauthorizedException('Your account is not verified. Please verify your email.');
    }

    // Return the user object, which will be attached to `req.user`
    // It's common to omit sensitive data like password here.
    const { password, ...result } = user.toObject();
    return result as UserDocument;
  }
}