import { BadRequestException, ConflictException, Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { CANDIDATE_SERVICE, ICandidateService } from "src/candidates/interfaces/candidate-service.interface";
import { UserDocument } from "src/candidates/schema/candidate.schema";
import * as bcrypt from 'bcrypt'
import { EmailService } from "src/email/email.service";
import { JwtAccessPayload, JwtRefreshPayload, JwtVerificationPayload } from "./interfaces/jwt-payload.interface";
import { RegisterCandidateDto } from "./dto/register-candidate.dto";
import { IAuthService } from "./interfaces/IAuthCandiateService";
import { LoginResponce, RegisterResponce, tokenresponce, verificatonResponce } from "./interfaces/api-response.interface";
import { GoogleLoginDto, LoginDto } from "./dto/login.dto";
import { OAuth2Client } from "google-auth-library";
import { CANDIDATE_REPOSITORY, ICandidateRepository } from "src/candidates/interfaces/candidate-repository.interface";
import { privateDecrypt } from "crypto";
import { use } from "passport";
import { JwtTokenService } from "./jwt.services/jwt-service";


@Injectable()
export class AuthService implements IAuthService {
    private readonly logger = new Logger(AuthService.name)
    private googleClint:OAuth2Client

    constructor(
        
        @Inject(CANDIDATE_SERVICE)
        private readonly candidateService:ICandidateService,
        @Inject(CANDIDATE_REPOSITORY)
        private readonly candidateRepository:ICandidateRepository,
        private readonly emailService:EmailService,
        private readonly jwtService:JwtService,
        private readonly configService:ConfigService,
        private readonly jwtTokenService: JwtTokenService

    ) {
        this.googleClint = new OAuth2Client(
            this.configService.get<string>('CLIENT_ID')
        )
    }

    private toPlainUser(user: UserDocument | null): UserDocument | null {
        if (!user) return null;
        return user.toObject({ virtuals: true, getters: true }) as UserDocument;
    }

    async validateUser(email: string, password: string): Promise<UserDocument | null> {
        this.logger.debug(`Attempting to validate user: ${email}`)
        const user = await this.candidateService.findByEmail(email)

        if(!user){
            this.logger.warn(`Login attempt for ${email}: User not found.`)
            return null
        }

         if (!user.isVerified) {
            this.logger.warn(`Login attempt for ${email}: User not verified.`);
            throw new UnauthorizedException('Please verify your email address.');
        }

        if (!(await bcrypt.compare(password, user.password!))) {
            this.logger.warn(`Login attempt for ${email}: Invalid password.`);
            return null;
        }
        this.logger.log(`User ${email} successfully validated.`);
        return user
    }

    async login(user: UserDocument): Promise<LoginResponce> {

        this.logger.debug(`[AuthService.login] Preparing payload for tokens for user: ${user.email}`);
        const AccessPayload: JwtAccessPayload = {
            userId:user._id,
            email: user.email,
            role:user.role,
            is_verified: user.isVerified
        }

        const RefreshPayload:JwtRefreshPayload ={
            userId: user.id,
            email : user.email
        }

        const AccessToken = this.jwtService.sign(AccessPayload, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
            });

        const RefreshToken = this.jwtService.sign(RefreshPayload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
            });


        return {
            accessToken: AccessToken,
            refreshToken: RefreshToken,
            userData:this.toPlainUser(user)
        }
    }

    async registerCandidate(dto: RegisterCandidateDto): Promise<RegisterResponce> {
        const existingUser = await this.candidateService.findByEmail(dto.email)
        if (existingUser) {
            throw new ConflictException('Email address already registered.');
        }
        
        const newUser = await this.candidateService.createCandidate(dto.fullName,dto.email,dto.password!)
        if(newUser){
            this.logger.log(`New candidate registered: ${newUser.email}`)
            const verificationPayload: JwtVerificationPayload = {
                userId: newUser._id.toString(),
                email: newUser.email,
            };

            const verificationToken = await this.jwtService.sign(verificationPayload ,{
                secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
                expiresIn: this.configService.get<string>('JWT_VERIFICATION_EXPIRES_IN'),
            });

            this.emailService.sendVerificationEmail(newUser.email,verificationToken)
            this.logger.warn(`Verification email token generated: ${verificationToken}`);
        }

        return {
            message: 'Registration successful. Please use the generated token to verify your account',
            user:newUser!.toObject({ getters: true, virtuals: false }) as UserDocument,
        };
    }

    async verifyEmail(token: string): Promise<verificatonResponce> {
        let payload:JwtVerificationPayload
        try {
            if (!token) {
                throw new BadRequestException('Verification token is missing.');
            }

            payload = await this.jwtService.verify(token,{
                secret:this.configService.get<string>('JWT_VERIFICATION_SECRET')
            })
            this.logger.log(`Verification token valid for user ID: ${payload.userId}`);
        } catch (error) {
            this.logger.error(`Email verification failed: Invalid or expired token - ${error.message}`);
            throw new BadRequestException('Invalid or expired verification link.');
        }

        const user = await this.candidateService.findById(payload.userId)

        if (!user) {
            this.logger.warn(`Email verification attempt for non-existent user ID: ${payload.userId}`);
            throw new BadRequestException('User not found.');
        }

        if (user.isVerified) {
            this.logger.log(`User ${user.email} is already verified.`);
            throw new BadRequestException('Email already verified.');
        }

        const verifieduser =await this.candidateService.updateVerificationStatus(user._id.toString(),true)
        this.logger.log(`User ${verifieduser} successfully verified.`)

        return {
            message: 'Email successfully verified. You can now log in.',
            user:verifieduser!
        }
    }

    async  regenerateAccessToken(paylod: JwtRefreshPayload): Promise<tokenresponce> {
        
        if (!paylod || !paylod.userId || !paylod.email ) {
            throw new UnauthorizedException('Invalid refresh token payload or user data.');
        }

        const  user = await this.candidateService.findByEmail(paylod.email)

        if(!user){
            throw new UnauthorizedException(" Issue Regading the account Status")
        }

        const tokenPaylod:JwtAccessPayload ={
            userId: user._id,
            email: user.email,
            role: user.role,
            is_verified: user.isVerified
        }

        const newAccessToken = this.jwtService.sign(tokenPaylod,{
            secret:this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN')
        })
        return {
            message:"Access token refreshed successfully",
            newAccess: newAccessToken
        }
    }

    async googleLogin(idToken:string): Promise<LoginResponce | null> {
        this.logger.log(`[authService] googleId${idToken}`)

        const ticket = await this.googleClint.verifyIdToken({
            idToken,
            audience:this.configService.get<string>('CLIENT_ID')
        });

        const payload = ticket.getPayload()
        this.logger.log(`[authService] get details from the google payload${payload}`)

        if(!payload) {
            throw new UnauthorizedException("Invalid Google Token Payload")
        }

        const googleId = payload.sub
        const email = payload.email
        const name = payload.name
        const isVerified = payload.email_verified

        if(!email){
            throw new  UnauthorizedException('Google ID Token did not cotain User Email')
        }

        let user = await this.candidateRepository.findByEmail(email)

        this.logger.debug(`[authService] fetch user  using google email${user}`)

        if(!user){
            user = await this.candidateRepository.create({
                name: name,
                email: email,
                googleId:googleId,
                isVerified:isVerified
            })

            if(!user){
                throw new UnauthorizedException('Faild to create new user during the Login')
            }
        }else {
            if(!user.googleId && user.googleId !== googleId){
                this.logger.log(`Linking Google is To the Existinng User ${user.email}`)
            }
            user = await  this.candidateRepository.UpdateGoogleId(user._id.toString(),googleId)
            if(!user){
                throw new UnauthorizedException("Faild to link google a/c to the existing user")
            }
            this.logger.log(`existing user logged in  view  googleId`)
        }

        const AccessPayload: JwtAccessPayload = {
            userId:user._id,
            email: user.email,
            role:user.role,
            is_verified: user.isVerified
        }

        const RefreshPayload:JwtRefreshPayload ={
            userId: user.id,
            email : user.email
        }

        const accessToken = this.jwtTokenService.generateAccessToken(AccessPayload)
        const refreshToken = this.jwtTokenService.generateRefreshToken(RefreshPayload)

            return {
            accessToken: accessToken,
            refreshToken: refreshToken,
            userData:this.toPlainUser(user)
        }
    }
}