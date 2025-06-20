import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CANDIDATE_SERVICE, ICandidateService } from 'src/candidates/interfaces/candidate-service.interface';
import { JwtAccessPayload, JwtVerificationPayload } from '../interfaces/jwt-payload.interface';
import { UserDocument } from 'src/candidates/schema/candidate.schema';
import { Request } from 'express';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy,'jwt-access') {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CANDIDATE_SERVICE) 
    private readonly candidateService: ICandidateService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request:Request) => {
          return request?.cookies?.['access_token']
        }
      ]),
      ignoreExpiration: false,
      secretOrKey:configService.get<string>('JWT_ACCESS_SECRET') || ""
    })
  }

  async validate(payload:JwtAccessPayload): Promise<UserDocument> {
    const {userId} = payload;
    const candidate = await this.candidateService.findById(userId);

    if (!candidate) {
      throw new UnauthorizedException('Access denied: Candidate not found.');
    }

    if (!candidate.isVerified) {
      throw new UnauthorizedException('Access denied: Your account is not verified. Please verify your email.');
    }
    return candidate.toObject({ getters: true, virtuals: true }) as UserDocument;
  }

}