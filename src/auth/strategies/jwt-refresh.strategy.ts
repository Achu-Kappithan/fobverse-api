import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { CANDIDATE_REPOSITORY } from "src/candidates/interfaces/candidate-repository.interface";
import { ICandidateService } from "src/candidates/interfaces/candidate-service.interface";
import { UserDocument } from "src/candidates/schema/candidate.schema";
import { JwtRefreshPayload } from "../interfaces/jwt-payload.interface";


@Injectable()
export class jwtRefreshStrategy extends PassportStrategy(Strategy,'jwt-Refresh'){
    constructor(
        private readonly configService: ConfigService,
        @Inject(CANDIDATE_REPOSITORY)
        private readonly candidateService:ICandidateService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
            (request:Request) => {
                    return request?.cookies?.['refresh_token']
                }
            ]),
            ignoreExpiration: false,
            secretOrKey:configService.get<string>('JWT_ACCESS_SECRET') || ""
        })
    }

    async validate(payload: JwtRefreshPayload): Promise<UserDocument> { // <-- Validate JwtRefreshPayload
    const { userId } = payload;
    const candidate = await this.candidateService.findById(userId);

    if (!candidate) {
      throw new UnauthorizedException('Refresh token invalid: Candidate not found.');
    }

    return candidate.toObject({ getters: true, virtuals: true }) as UserDocument; // Ensure it's a plain object
  }
}