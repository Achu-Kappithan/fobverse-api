import { BadRequestException, ConflictException, Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { CANDIDATE_SERVICE, ICandidateService } from "src/candidates/interfaces/candidate-service.interface";
import { UserDocument } from "src/candidates/schema/candidate.schema";
import * as bcrypt from 'bcrypt'
import { EmailService } from "src/email/email.service";
import { JwtAccessPayload, JwtVerificationPayload } from "./interfaces/jwt-payload.interface";
import { RegisterCandidateDto } from "./dto/register-candidate.dto";
import { IAuthService } from "./interfaces/IAuthCandiateService";


@Injectable()
export class AuthService implements IAuthService {
    private readonly logger = new Logger(AuthService.name)

    constructor(
        private readonly jwtService:JwtService,
        private readonly configService:ConfigService,
        @Inject(CANDIDATE_SERVICE)
        private readonly candidateService:ICandidateService,
        private readonly emailService:EmailService
    ) {}

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

    async login(user: any): Promise<any> {
        const payload: JwtAccessPayload = {
            userId:user._id,
            email: user.email,
            role:user.role,
            is_verified: user.isVerified
        }

        return {
            accessToken:this.jwtService.sign(payload)
        }
    }

    async registerCandidate(dto: RegisterCandidateDto): Promise<any> {
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
            message: 'Registration successful. Please use the generated token to verify your account. (Email sending skipped for demo)',
            user:newUser
        };

    }

    async verifyEmail(token: string): Promise<any> {
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
            verifieduser
        }
    }
}