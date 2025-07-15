import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import {
  forgotPasswordDto,
  LoginDto,
  UpdatePasswordDto,
} from './dto/login.dto';
import { OAuth2Client } from 'google-auth-library';
import { JwtTokenService } from './jwt.services/jwt-service';
import { UserDocument } from './schema/candidate.schema';
import { AUTH_REPOSITORY, IAuthRepository } from './interfaces/IAuthRepository';
import {
  COMPANY_SERVICE,
  IComapnyService,
} from 'src/company/interface/profile.service.interface';
import { CreateProfileDto } from 'src/company/dtos/create.profile.dto';
import {
  CANDIDATE_SERVICE,
  ICandidateService,
} from 'src/candiate/interfaces/candidate-service.interface';
import { MESSAGES } from 'src/shared/constants/constants.messages';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClint: OAuth2Client;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(COMPANY_SERVICE)
    private readonly _companyService: IComapnyService,
    @Inject(CANDIDATE_SERVICE)
    private readonly _candidateService: ICandidateService,
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
    let profileData;

    if (role === 'candidate') {
      profileData = await this.authRepository.findCandidateByEmail(email);
    } else if (role === 'company') {
      profileData = await this.authRepository.findCompanyByEmail(email);
    }
    profileData = profileData[0];

    if (!profileData) {
      this.logger.warn(`Login attempt for ${email}: User not found.`);
      throw new UnauthorizedException(
        MESSAGES.AUTH.USER_NOT_FOUD
      );
    }

    if (!profileData.password) {
      throw new BadRequestException(
        MESSAGES.AUTH.ACCOUNT_LINKED_WITH_GOOGLE
      );
    }

    if (!(await bcrypt.compare(password, profileData.password!))) {
      this.logger.warn(`Login attempt for ${email}: Invalid password.`);
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_EMAIL_PASSWORD);
    }

    if (profileData.role !== role) {
      this.logger.warn(`Mismath of User Role ${role}`);
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_USER_ROLE);
    }

    if (!profileData.isVerified) {
      this.logger.warn(`Login attempt for ${email}: User not verified.`);
      throw new UnauthorizedException(MESSAGES.AUTH.EMAIL_NOT_VERIFIED)
    }

    if (!profileData.profile.isActive) {
      throw new ForbiddenException(
        MESSAGES.AUTH.USER_BLOCKED
      );
    }

    const { profile, ...cleanedProfile } = profileData;

    this.logger.log(`User ${email} successfully validated.`);
    return cleanedProfile;
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
      userId: user._id,
      email: user.email,
    };

    const AccessToken =
      await this.jwtTokenService.generateAccessToken(AccessPayload);
    const RefreshToken =
      await this.jwtTokenService.generateRefreshToken(RefreshPayload);

    return {
      accessToken: AccessToken,
      refreshToken: RefreshToken,
      data: user,
    };
  }

  //  registering new user

  async registerCandidate(
    dto: RegisterCandidateDto,
  ): Promise<RegisterResponce> {
    const existingUser = await this.authRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(MESSAGES.AUTH.EMAIL_ALREADY_EXISTS);
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
        MESSAGES.AUTH.REGISTRATION_SUCCESS,
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
        throw new BadRequestException(MESSAGES.AUTH.VERIFICATION_TOKEN_MISSING);
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
      throw new BadRequestException(MESSAGES.AUTH.VERIFICATION_LINK_INVALID_OR_EXPIRED);
    }

    const user = await this.authRepository.findById(payload.userId);

    if (!user) {
      this.logger.warn(
        `Email verification attempt for non-existent user ID: ${payload.userId}`,
      );
      throw new BadRequestException(MESSAGES.AUTH.USER_NOT_FOUD);
    }

    if (user.isVerified) {
      this.logger.log(`User ${user.email} is already verified.`);
      throw new BadRequestException(MESSAGES.AUTH.EMAIL_ALREADY_VERIFIED);
    }

    const verifieduser = await this.authRepository.updateVerificationStatus(
      user._id.toString(),
      true,
    );

    const profiledata: CreateProfileDto = {
      userId: verifieduser!._id,
      name: verifieduser!.name,
    };

    this.logger.log(`User ${verifieduser} successfully verified.`);

    try {
      if (user.role == 'candidate') {
        this._candidateService.createPorfile(profiledata);
      } else if (user.role === 'company') {
        this._companyService.createProfile(profiledata);
      }
    } catch (error) {
      throw error;
    }

    return {
      message: MESSAGES.AUTH.EMAIL_VERIFIED,
      user: verifieduser!,
    };
  }

  // create new Access Token user RefreshTokens

  async regenerateAccessToken(paylod: UserDocument): Promise<tokenresponce> {
    const tokenPaylod: JwtAccessPayload = {
      userId: paylod._id,
      email: paylod.email,
      role: paylod.role,
      is_verified: paylod.isVerified,
    };

    const newAccessToken =
      await this.jwtTokenService.generateAccessToken(tokenPaylod);

    return {
      message: MESSAGES.AUTH.ACCESS_TOKEN_REFRESHED,
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
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_GOOGLE_TOKEN);
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const isVerified = payload.email_verified;

    if (!email) {
      throw new UnauthorizedException(
        MESSAGES.AUTH.INVALID_GOOGLE_TOKEN,
      );
    }

    let user;
    if (role === 'candidate') {
      user = await this.authRepository.findCandidateByEmail(email);
    } else if (role === 'company') {
      user = await this.authRepository.findCompanyByEmail(email);
    }

    user = user[0]
    if (user && user.role !== role) {
      throw new ConflictException(MESSAGES.AUTH.EMAIL_ALREADY_EXISTS);
    }

    if (!user) {
      user = await this.authRepository.create({
        name: name,
        email: email,
        googleId: googleId,
        isVerified: isVerified,
        role: role,
      });

      if (!user) {
        throw new UnauthorizedException(
          MESSAGES.AUTH.PROFILE_CREATION_FAIILD,
        );
      }

      const profiledata: CreateProfileDto = {
        userId: user!._id,
        name: user!.name,
      };

      try {
        if (user.role == 'candidate') {
          this._candidateService.createPorfile(profiledata);
        } else if (user.role === 'company') {
          this._companyService.createProfile(profiledata);
        }
      } catch (error) {
        throw error;
      }
    } else {
      if (!user.profile.isActive) {
        throw new ForbiddenException(
          MESSAGES.AUTH.USER_BLOCKED,
        );
      }

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
          MESSAGES.AUTH.EMAIL_ALREADY_EXISTS,
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
    const refreshToken = this.jwtTokenService.generateRefreshToken(RefreshPayload);

    const { profile, ...cleanedProfile } = user.toObject()

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      data: cleanedProfile
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

    const user = await this.authRepository.findUserbyEmailAndRole(
      dto.email,
      dto.role,
    );

    if (!user) {
      this.logger.warn(`Login attempt for ${dto.email}: User not found.`);
      throw new UnauthorizedException(MESSAGES.AUTH.USER_NOT_FOUD);
    }

    if (!user.isGlobalAdmin) {
      throw new UnauthorizedException(
        'You are not authorized to access the admin panel.',
      );
    }

    if (!user.isVerified) {
      this.logger.warn(`Login attempt for ${dto.email}: User not verified.`);
      throw new UnauthorizedException(MESSAGES.AUTH.EMAIL_NOT_VERIFIED);
    }

    if (!(await bcrypt.compare(dto.password, user.password!))) {
      this.logger.warn(`Login attempt for ${dto.email}: Invalid password.`);
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_EMAIL_PASSWORD);
    }

    this.logger.log(`User ${dto.email} successfully validated.`);
    return  this.toPlainUser(user)
  }

  // validate Email with User role  for Updateing password

  async validateEmailAndRoleExistence(
    dto: forgotPasswordDto,
  ): Promise<generalResponce> {
    const { email, role } = dto;
    this.logger.log(
      '[authService] data from the frondend  for reset password',
      dto,
    );

    const user = await this.authRepository.findUserbyEmailAndRole(email, role);
    this.logger.debug(
      '[authService] fetch user from db for udpateing password ',
      user,
    );

    if (!user) {
      throw new UnauthorizedException(MESSAGES.AUTH.USER_NOT_FOUD);
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        MESSAGES.AUTH.UNVERIFIED_USER,
      );
    }

    const Tokenpayload: passwordResetPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const verificationToken =
      await this.jwtTokenService.GeneratePassResetToken(Tokenpayload);
    this.logger.debug(
      `[authService] create token for password updation${verificationToken}`,
    );

    this.emailService.sendForgotPasswordEmail(user.email, verificationToken);

    return {
      message:
        MESSAGES.AUTH.PASSWORD_RESET_LINK_SENT,
    };
  }

  // update  New password

  async UpdateNewPassword(dto: UpdatePasswordDto): Promise<generalResponce> {
    const { password, token } = dto;
    let payload: passwordResetPayload;

    try {
      if (!token) {
        throw new BadRequestException(MESSAGES.AUTH.VERIFICATION_TOKEN_MISSING);
      }

      payload = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
      });
      this.logger.log(`Verification token valid for user ID: ${payload.id}`);
    } catch (error) {
      this.logger.error(
        `Email verification failed: Invalid or expired token - ${error.message}`,
      );
      throw new BadRequestException(MESSAGES.AUTH.VERIFICATION_LINK_INVALID_OR_EXPIRED);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const updatedUser = await this.authRepository.update(
      { _id: payload.id },
      { $set: { password: hashPassword } },
    );

    if (!updatedUser) {
      throw new BadRequestException(MESSAGES.AUTH.CANNOT_UPDATE_PASSWORD);
    }

    return {
      message:
        MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
    };
  }
}
