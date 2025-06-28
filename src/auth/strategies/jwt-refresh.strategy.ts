import { Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { CANDIDATE_REPOSITORY } from "src/candidates/interfaces/candidate-repository.interface";
import { ICandidateService } from "src/candidates/interfaces/candidate-service.interface";
import { UserDocument } from "src/candidates/schema/candidate.schema";
import { JwtRefreshPayload } from "../interfaces/jwt-payload.interface";


@Injectable()
export class jwtRefreshStrategy extends PassportStrategy(Strategy,'jwt-refresh'){
    logger = new Logger(jwtRefreshStrategy.name)
    constructor(
        private readonly configService: ConfigService,
        @Inject(CANDIDATE_REPOSITORY)
        private readonly candidateService:ICandidateService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request:Request) => {
                    this.logger.debug(`[ExtractJwt] Full request.cookies object: ${JSON.stringify(request?.cookies)}`);
                    const token = request?.cookies?.['refresh_token']
                    if(!token){
                        this.logger.warn(`[ExtractJwt] No access_token found in cookie.`);
                    }
                    return  token
                }
            ]),
            ignoreExpiration: false,
            secretOrKey:configService.get<string>('JWT_ACCESS_SECRET') || ""
        })
        this.logger.debug(`[Strategy Init] JwtAccessStrategy initialized. Secret status: ${configService.get<string>('JWT_SECRET') ? 'SET' : 'NOT_SET_OR_EMPTY'}`);
    }

    async validate(payload: JwtRefreshPayload): Promise<UserDocument> { 
    const { userId } = payload;
    const candidate = await this.candidateService.findById(userId);

    if (!candidate) {
      throw new UnauthorizedException('Refresh token invalid: Candidate not found.');
    }

    return candidate.toObject({ getters: true, virtuals: true }) as UserDocument; 
  }
}