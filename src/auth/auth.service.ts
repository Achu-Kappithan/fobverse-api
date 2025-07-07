import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
  JwtVerificationPayload,
  passwordResetPayload,
} from './interfaces/jwt-payload.interface';
import { RegisterCandidateDto } from './dto/register-candidate.dto';
import { IAuthService } from './interfaces/IAuthCandiateService';
import {
  generalResponce,
  LoginResponce,
  RegisterResponce,
  tokenresponce,
  verificatonResponce,
} from './interfaces/api-response.interface';
import { forgotPasswordDto, LoginDto, UpdatePasswordDto } from './dto/login.dto';
import { OAuth2Client } from 'google-auth-library';
import { JwtTokenService } from './jwt.services/jwt-service';
import { UserDocument } from './schema/candidate.schema';
import { AUTH_REPOSITORY, IAuthRepository } from './interfaces/IAuthRepository';
import { COMPANY_SERVICE, IComapnyService } from 'src/company/interface/profile.service.interface';
import { CreateProfileDto } from 'src/company/dtos/create.profile.dto';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClint: OAuth2Client;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(COMPANY_SERVICE)
    private readonly _companyService: IComapnyService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly jwtTokenService: JwtTokenService,
  ) {
    this.googleClint = new OAuth2Client(
      this.configService.get<string>('CLIENT_ID'),
    );
  }

  private toPlainUser(user: UserDocument | null): UserDocument | null {
    if (!user) return null;
    return user.toObject({ virtuals: true, getters: true }) as UserDocument;
  }

  // find user by Email

  async findByEmail(email: string): Promise<UserDocument | null> {
    this.logger.debug(`Finding user by email: ${email}`);
    return this.authRepository.findByEmail(email);
  }

  //find user by Id

  async findById(id: string): Promise<UserDocument | null> {
    this.logger.debug(`Finding user by Id:${id}`);
    return this.authRepository.findById(id);
  }

  //vaildate user for login 

  async validateUser(
    email: string,
    password: string,
    role: string,
  ): Promise<UserDocument | null> {
    this.logger.debug(`Attempting to validate user: ${email}`);
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      this.logger.warn(`Login attempt for ${email}: User not found.`);
      throw new UnauthorizedException(`Login attempt for ${email}: User not found.`)
      return null;
    }

    if (user.role !== role) {
      this.logger.warn(`Mismath of User Role ${role}`);
      throw new UnauthorizedException('Invaid User role');
    }

    if (!user.isVerified) {
      this.logger.warn(`Login attempt for ${email}: User not verified.`);
      throw new UnauthorizedException('Please verify your email address.');
    }

    if (!(await bcrypt.compare(password, user.password!))) {
      this.logger.warn(`Login attempt for ${email}: Invalid password.`);
      throw new UnauthorizedException(`Invalid Email or Password`)
    }

    this.logger.log(`User ${email} successfully validated.`);
    return user;
  }

  //complete user login process

  async login(user: UserDocument): Promise<LoginResponce> {
    this.logger.debug(
      `[AuthService.login] Preparing payload for tokens for user: ${user.email}`,
    );
    const AccessPayload: JwtAccessPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      is_verified: user.isVerified,
    };

    const RefreshPayload: JwtRefreshPayload = {
      userId: user.id,
      email: user.email,
    };

    const AccessToken = await this.jwtTokenService.generateAccessToken(AccessPayload)
    const RefreshToken = await this.jwtTokenService.generateRefreshToken(RefreshPayload)

    return {
      accessToken: AccessToken,
      refreshToken: RefreshToken,
      data: this.toPlainUser(user),
    };
  }

  //  registering new user

  async registerCandidate(
    dto: RegisterCandidateDto,
  ): Promise<RegisterResponce> {
    const existingUser = await this.authRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email address already registered.');
    }

    const newUser = await this.createUser(
      dto.fullName,
      dto.email,
      dto.password!,
      dto.role,
    );
    if (newUser) {
      this.logger.log(`New candidate registered: ${newUser.email}`);
      const verificationPayload: JwtVerificationPayload = {
        userId: newUser._id.toString(),
        email: newUser.email,
      };

      const verificationToken = this.jwtService.sign(verificationPayload, {
        secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_VERIFICATION_EXPIRES_IN',
        ),
      });

      this.emailService.sendVerificationEmail(newUser.email, verificationToken);
      this.logger.warn(
        `Verification email token generated: ${verificationToken}`,
      );
    }

    return {
      message:
        'Registration successful. Please use the generated token to verify your account',
      user: newUser!.toObject({
        getters: true,
        virtuals: false,
      }) as UserDocument,
    };
  }

  // create a new user 

  async createUser(
    name: string,
    email: string,
    password: string,
    role: string,
  ): Promise<UserDocument | null> {
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email,
      password: hashPassword,
      role: role,
    };
    this.logger.log(`Creating new candidate: ${email}`);
    return this.authRepository.create(newUser);
  }

// Email verification  (Registration Process)

  async verifyEmail(token: string): Promise<verificatonResponce> {
    let payload: JwtVerificationPayload;
    try {
      if (!token) {
        throw new BadRequestException('Verification token is missing.');
      }

      payload = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
      });
      this.logger.log(
        `Verification token valid for user ID: ${payload.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Email verification failed: Invalid or expired token - ${error.message}`,
      );
      throw new BadRequestException('Invalid or expired verification link.');
    }

    const user = await this.authRepository.findById(payload.userId);

    if (!user) {
      this.logger.warn(
        `Email verification attempt for non-existent user ID: ${payload.userId}`,
      );
      throw new BadRequestException('User not found.');
    }

    if (user.isVerified) {
      this.logger.log(`User ${user.email} is already verified.`);
      throw new BadRequestException('Email already verified.');
    }

    const verifieduser = await this.authRepository.updateVerificationStatus(
      user._id.toString(),
      true,
    );
    const profiledata:CreateProfileDto = {
      userId:verifieduser!._id,
      companyName:verifieduser!.name
    }

    this.logger.log(`User ${verifieduser} successfully verified.`);
    this._companyService.createProfile(profiledata)

    return {
      message: 'Email successfully verified. You can now log in.',
      user: verifieduser!,
    };
  }

  // create new Access Token user RefreshTokens

  async regenerateAccessToken(
    paylod: JwtRefreshPayload,
  ): Promise<tokenresponce> {
    if (!paylod || !paylod.userId || !paylod.email) {
      throw new UnauthorizedException(
        'Invalid refresh token payload or user data.',
      );
    }

    const user = await this.authRepository.findByEmail(paylod.email);

    if (!user) {
      throw new UnauthorizedException(' Issue Regading the account Status');
    }

    const tokenPaylod: JwtAccessPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      is_verified: user.isVerified,
    };

    const newAccessToken = this.jwtService.sign(tokenPaylod, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });
    return {
      message: 'Access token refreshed successfully',
      newAccess: newAccessToken,
    };
  }

  // google Login

  async googleLogin(idToken: string, role: string): Promise<LoginResponce> {
    this.logger.log(
      `[authService] googleId${idToken} and User role is ${role}`,
    );

    const ticket = await this.googleClint.verifyIdToken({
      idToken,
      audience: this.configService.get<string>('CLIENT_ID'),
    });

    const payload = ticket.getPayload();
    this.logger.log(
      `[authService] get details from the google payload${payload}`,
    );

    if (!payload) {
      throw new UnauthorizedException('Invalid Google Token Payload');
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const isVerified = payload.email_verified;

    if (!email) {
      throw new UnauthorizedException(
        'Google ID Token did not cotain User Email',
      );
    }

    let user = await this.authRepository.findByEmail(email);

    if (user && user.role !== role) {
      throw new ConflictException(' User alredy Exist Try with another email');
    }

    if (!user) {
      user = await this.authRepository.create({
        name: name,
        email: email,
        googleId: googleId,
        isVerified: isVerified,
        role: role,
      });

      console.log('newly creatd user', user);

      if (!user) {
        throw new UnauthorizedException(
          'Faild to create new user during the Login',
        );
      }
    } else {
      if (!user.googleId && user.googleId !== googleId && user.role === role) {
        this.logger.log(
          `Linking Google is To the Existinng User ${user.email}`,
        );
      }
      user = await this.authRepository.UpdateGoogleId(
        user._id.toString(),
        googleId,
      );
      if (!user) {
        throw new UnauthorizedException(
          'Faild to link google a/c to the existing user',
        );
      }
      this.logger.log(`existing user logged in  view  googleId`);
    }

    const AccessPayload: JwtAccessPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      is_verified: user.isVerified,
    };

    const RefreshPayload: JwtRefreshPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = this.jwtTokenService.generateAccessToken(AccessPayload);
    const refreshToken =
      this.jwtTokenService.generateRefreshToken(RefreshPayload);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      data: this.toPlainUser(user),
    };
  }

  // link google id to existing User

  async linkGoogleAccount(
    id: string,
    googleId: string,
  ): Promise<UserDocument | null> {
    return this.authRepository.UpdateGoogleId(id, googleId);
  }

  async validateAdmin(dto: LoginDto): Promise<UserDocument | null> {
    this.logger.debug('[authService] adminLogin dto', dto);
 
    const user = await this.authRepository.findUserbyEmailAndRole(dto.email,dto.role);

    if (!user) {
      this.logger.warn(`Login attempt for ${dto.email}: User not found.`);
      throw new UnauthorizedException(`Invalid User or User not found`)
    }

    if (!user.isGlobalAdmin) {
      throw new UnauthorizedException(
        'You are not authorized to access the admin panel.',
      );
    }

    if (!user.isVerified) {
      this.logger.warn(`Login attempt for ${dto.email}: User not verified.`);
      throw new UnauthorizedException('Please verify your email address.');
    }

    if (!(await bcrypt.compare(dto.password, user.password!))) {
      this.logger.warn(`Login attempt for ${dto.email}: Invalid password.`);
      throw new UnauthorizedException(`Invalid Email or Passwrod`)
    }

    this.logger.log(`User ${dto.email} successfully validated.`);
    return user;
  }

  // validate Email with User role  for Updateing password

  async validateEmailAndRoleExistence(dto: forgotPasswordDto): Promise<generalResponce> {
    const {email,role }= dto
    this.logger.log('[authService] data from the frondend  for reset password',dto)

    const user  = await this.authRepository.findUserbyEmailAndRole(email,role)
    this.logger.debug('[authService] fetch user from db for udpateing password ',user)

    if(!user){
      throw new UnauthorizedException("Invalid User Try with another Email")
    }

    if(!user.isVerified){
      throw new UnauthorizedException("Unverified User. Please verify your account.")
    }

    const Tokenpayload :passwordResetPayload= {
      id:user._id,
      email: user.email,
      role: user.role
    }

    const verificationToken = await  this.jwtTokenService.GeneratePassResetToken(Tokenpayload)
    this.logger.debug(`[authService] create token for password updation${verificationToken}`)

    this.emailService.sendForgotPasswordEmail(user.email,verificationToken)

    return {
      message: 'Password reset link sent. Please check your email to update your password.'
    }
  }

  // update  New password

  async UpdateNewPassword(dto: UpdatePasswordDto): Promise<generalResponce> {
    const {password,token } = dto
    let payload: passwordResetPayload

    try {
      if (!token) {
        throw new BadRequestException('Verification token is missing.');
      }
      console.log(token)

      payload = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
      });
      console.log("token get",payload)
      this.logger.log(
        `Verification token valid for user ID: ${payload.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Email verification failed: Invalid or expired token - ${error.message}`,
      );
      throw new BadRequestException('Invalid or expired verification link.');
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const updatedUser = await this.authRepository.update({ _id: payload.id }, { $set: { password: hashPassword } })

    if(!updatedUser){
      throw new BadRequestException("Can'Update Password Try again")
    }
    
    return {
      message: "You've successfully reset your password. Please log in to continue."
    }

  }

}
