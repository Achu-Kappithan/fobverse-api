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
import { LoginDto } from "./dto/login.dto";
import { JwtTokenService } from "./jwt.services/jwt-service";


@Injectable()
export class AuthService implements IAuthService {
    private readonly logger = new Logger(AuthService.name)

    constructor(
        
        @Inject(CANDIDATE_SERVICE)
        private readonly candidateService:ICandidateService,
        private readonly emailService:EmailService,
        private readonly jwtService:JwtService,
        private readonly configService:ConfigService,

    ) {}

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

    async login(dto: LoginDto): Promise<LoginResponce> {
        this.logger.log(`Attempting login for email: ${dto.email}`)

        const user = await this.candidateService.findByEmail(dto.email)
        
        if(!user){
            throw new UnauthorizedException('Invalid credentials')
        }

        if(!user.isVerified){
            throw new UnauthorizedException('Account not verified. Please check your email for verification instructions.')
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
        
        const AccessToken = this.jwtService.sign(AccessPayload, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
            });

        const RefreshToken = this.jwtService.sign(RefreshPayload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
            });

            this.logger.log(AccessToken,RefreshToken)

        return {
            accessToken: AccessToken,
            refreshToken: RefreshToken
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
}