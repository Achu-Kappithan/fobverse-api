import { Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { CandidateService } from "src/candidates/candidate.service";
import { JwtTokenService } from "../jwt.services/jwt-service";
import { JwtAccessStrategy } from "./jwt.strategy";
import { JwtAccessPayload, JwtRefreshPayload } from "../interfaces/jwt-payload.interface";
import { RegisterResponce } from "../interfaces/api-response.interface";
import { CANDIDATE_SERVICE, ICandidateService } from "src/candidates/interfaces/candidate-service.interface";
import { AUTH_SERVICE, IAuthService } from "../interfaces/IAuthCandiateService";
import { AuthService } from "../auth.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy,'google'){
    private readonly logger = new Logger(GoogleStrategy.name)
    constructor(
        private readonly configService: ConfigService,
            private jwtService : JwtService,
            private jwtTokenService: JwtTokenService,
            // @Inject(CANDIDATE_SERVICE)
            // private readonly candidateService:ICandidateService,
            @Inject(AUTH_SERVICE)
            private readonly authService: IAuthService
    ){
        super({
            clientID    : configService.get<string>('CLIENT_ID') || "",
            clientSecret: configService.get<string>('CLIENT_SECRET') || "",
            callbackURL : 'http://localhost:3000/auth/callback',
            passReqToCallback: true,
            scope: ['profile']
        })
    }

     async validate(request: any, accessToken: string, refreshToken: string, profile, done: Function)
    {
        try
        {
            this.logger.debug(`Google profile received: ${JSON.stringify(profile)}`)
            const userEmail = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
            const googleId = profile.id;
            const name = profile.displayName;

             if (userEmail) {
                this.logger.warn(`Google profile missing email for user ID: ${googleId}`);
                throw new UnauthorizedException('Google profile missing email. Cannot proceed with login.');
            }

            let user = await this.authService.findByEmail(userEmail);

            if(!user){
                this.logger.log(`Creating new user with googleId ${googleId} and ${userEmail}`)

                // user = await this.candidateService.createGoogleUser(name,userEmail,googleId)

            }else if(!user.googleId){
                this.logger.log(`Linking existing user ${userEmail} to Google ID: ${googleId}`);
                user = await this.authService.linkGoogleAccount(user._id, googleId);
            }


            const AccessPayload :JwtAccessPayload ={
                email:user!.email,
                userId:user!._id,
                role: user!.role,
                is_verified: user!.isVerified
            }

            const RefreshPayload :JwtRefreshPayload ={
                email:user!.email,
                userId:user!._id

            }

            const accessToken = this.jwtTokenService.generateAccessToken(AccessPayload)
            const refreshToken = this.jwtTokenService.generateRefreshToken(RefreshPayload)
            done(null,{
                user:user,
                accessToken:accessToken,
                refreshToken:refreshToken
            });
        }
        catch(err)
        {
            this.logger.error(`Error during Google authentication for user: ${profile.emails?.[0]?.value || profile.id}`, err.stack);
            done(err, false);
        }
    }


}