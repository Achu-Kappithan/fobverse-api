import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
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
import { AUTH_REPOSITORY, IAuthRepository } from './interfaces/IAuthRepository';
import { UserDocument, UserRole } from './schema/user.schema';
import { plainToInstance } from 'class-transformer';
import { ResponseRegisterDto } from './dto/response.dto';
import { FilterQuery, Types } from 'mongoose';
import { userDto } from './dto/user.dto';
import { Response } from 'express';
import { COMPANY_SERVICE, IComapnyService } from '../company/interface/profile.service.interface';
import { CANDIDATE_SERVICE, ICandidateService } from '../candiate/interfaces/candidate-service.interface';
import { EmailService } from '../email/email.service';
import { MESSAGES } from '../shared/constants/constants.messages';
import { setJwtCookie } from '../shared/utils/cookie.util';
import { CreateProfileDto } from '../company/dtos/create.profile.dto';
import { changePassDto, InternalUserDto, UpdateInternalUserDto } from '../company/dtos/update.profile.dtos';
import { InternalUserResponceDto } from '../company/dtos/responce.allcompany';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { PaginatedResponse } from '../admin/interfaces/responce.interface';

@Injectable()
export class AuthService implements IAuthService {
  private readonly _logger = new Logger(AuthService.name);
  private _googleClint: OAuth2Client;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(forwardRef(() => COMPANY_SERVICE))
    private readonly _companyService: IComapnyService,
    @Inject(CANDIDATE_SERVICE)
    private readonly _candidateService: ICandidateService,
    private readonly _emailService: EmailService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
    private readonly _jwtTokenService: JwtTokenService,
  ) {
    this._googleClint = new OAuth2Client(
      this._configService.get<string>('CLIENT_ID'),
    );
  }


  // find user by Email

  async findByEmail(email: string): Promise<UserDocument | null> {
    this._logger.debug(`Finding user by email: ${email}`);
    return this.authRepository.findByEmail(email);
  }

  //find user by Id

  async findById(id: string): Promise<UserDocument | null> {
    this._logger.debug(`Finding user by Id:${id}`);
    return this.authRepository.findById(id);
  }

  //vaildate user for login

  async validateUser(
    email: string,
    password: string,
    role: string,
  ): Promise<userDto> {
    this._logger.debug(`Attempting to validate user: ${email}`);
    let profileData;

    profileData = await this.authRepository.findCandidateByEmail(email);
    profileData = profileData[0];

    if (!profileData) {
      this._logger.warn(`Login attempt for ${email}: User not found.`);
      throw new UnauthorizedException(MESSAGES.AUTH.USER_NOT_FOUD);
    }

    if (!profileData.password) {
      throw new BadRequestException(MESSAGES.AUTH.ACCOUNT_LINKED_WITH_GOOGLE);
    }

    if (!(await bcrypt.compare(password, profileData.password!))) {
      this._logger.warn(`Login attempt for ${email}: Invalid password.`);
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_EMAIL_PASSWORD);
    }

    if (profileData.role !== role) {
      this._logger.warn(`Mismath of User Role ${role}`);
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_USER_ROLE);
    }

    if (!profileData.isVerified) {
      this._logger.warn(`Login attempt for ${email}: User not verified.`);
      throw new UnauthorizedException(MESSAGES.AUTH.EMAIL_NOT_VERIFIED);
    }

    if (!profileData.profile.isActive) {
      throw new ForbiddenException(MESSAGES.AUTH.USER_BLOCKED);
    }

    const mappedData = plainToInstance(userDto, profileData);

    this._logger.log(`User ${email} successfully validated.`);
    return mappedData;
  }

  //complete user login process

  async login(user: userDto, res: Response): Promise<LoginResponce<userDto>> {
    this._logger.debug(
      `[AuthService.login] Preparing payload for tokens for user: ${user.email}`,
    );
    const AccessPayload: JwtAccessPayload = {
      UserId: user._id.toString(),
      email: user.email,
      role: user.role,
      profileId: user.companyId?.toString(),
    };

    const RefreshPayload: JwtRefreshPayload = {
      UserId: user._id.toString(),
      email: user.email,
    };

    const AccessToken =
      await this._jwtTokenService.generateAccessToken(AccessPayload);
    const RefreshToken =
      await this._jwtTokenService.generateRefreshToken(RefreshPayload);

    setJwtCookie(
      res,
      this._configService,
      'access_token',
      AccessToken,
      'JWT_ACCESS_EXPIRES_IN',
      true,
      7 * 24 * 60 * 60 * 1000,
    );

    setJwtCookie(
      res,
      this._configService,
      'refresh_token',
      RefreshToken,
      'JWT_REFRESH_EXPIRES_IN',
      false,
      7 * 24 * 60 * 60 * 1000,
    );

    const mappedData = plainToInstance(ResponseRegisterDto, user);

    return {
      message:MESSAGES.AUTH.LOGIN_SUCCESS,
      data: mappedData,
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
      dto.name,
      dto.email,
      dto.password!,
      dto.role,
    );
    if (newUser) {
      this._logger.log(`New candidate registered: ${newUser.email}`);
      const verificationPayload: JwtVerificationPayload = {
        UserId: newUser._id.toString(),
        email: newUser.email,
      };

      const verificationToken = this._jwtService.sign(verificationPayload, {
        secret: this._configService.get<string>('JWT_VERIFICATION_SECRET'),
        expiresIn: this._configService.get<string>(
          'JWT_VERIFICATION_EXPIRES_IN',
        ),
      });

      this._emailService.sendVerificationEmail(
        newUser.email,
        verificationToken,
      );
      this._logger.warn(
        `Verification email token generated: ${verificationToken}`,
      );
    }

    return {
      message: MESSAGES.AUTH.REGISTRATION_SUCCESS,
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
    this._logger.log(`Creating new candidate: ${email}`);
    return this.authRepository.create(newUser);
  }

  // Email verification  (Registration Process)

  async verifyEmail(token: string): Promise<verificatonResponce> {
    let payload: JwtVerificationPayload;
    try {
      if (!token) {
        throw new BadRequestException(MESSAGES.AUTH.VERIFICATION_TOKEN_MISSING);
      }

      payload = await this._jwtService.verify(token, {
        secret: this._configService.get<string>('JWT_VERIFICATION_SECRET'),
      });
      this._logger.log(
        `Verification token valid for user ID: ${payload.UserId}`,
      );
    } catch (error) {
      this._logger.error(
        `Email verification failed: Invalid or expired token - ${error.message}`,
      );
      throw new BadRequestException(
        MESSAGES.AUTH.VERIFICATION_LINK_INVALID_OR_EXPIRED,
      );
    }

    const user = await this.authRepository.findById(payload.UserId);

    if (!user) {
      this._logger.warn(
        `Email verification attempt for non-existent user ID: ${payload.UserId}`,
      );
      throw new BadRequestException(MESSAGES.AUTH.USER_NOT_FOUD);
    }

    if (user.isVerified) {
      this._logger.log(`User ${user.email} is already verified.`);
      throw new BadRequestException(MESSAGES.AUTH.EMAIL_ALREADY_VERIFIED);
    }

    const verifieduser = await this.authRepository.updateVerificationStatus(
      user._id.toString(),
      true,
    );

    const profiledataDto: CreateProfileDto = {
      UserId: verifieduser!._id.toString(),
      name: verifieduser!.name,
    };

    let newProfile;

    this._logger.log(`User ${verifieduser} successfully verified.`);

    try {
      if (user.role == UserRole.CANDIDATE) {
        newProfile = await this._candidateService.createPorfile(profiledataDto);
      } else if (user.role === UserRole.COMPANY_ADMIN) {
        newProfile = await this._companyService.createProfile(profiledataDto);
        if (newProfile) {
          const finaldata = await this.authRepository.update(
            { _id: newProfile.adminUserId },
            { $set: { companyId: newProfile._id } },
          );
          this._logger.debug(
            `[AuthService], completed company profile${finaldata}`,
          );
        }
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

  async regenerateAccessToken(
    paylod: UserDocument,
    res: Response,
  ): Promise<tokenresponce> {
    const tokenPaylod: JwtAccessPayload = {
      UserId: paylod._id.toString(),
      email: paylod.email,
      role: paylod.role,
      profileId: paylod?.companyId?.toString(),
    };

    const newAccessToken =
      await this._jwtTokenService.generateAccessToken(tokenPaylod);

    setJwtCookie(
      res,
      this._configService,
      'access_token',
      newAccessToken,
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME_MS',
      true,
      7 * 24 * 60 * 60 * 1000,
    );

    return {
      message: MESSAGES.AUTH.ACCESS_TOKEN_REFRESHED,
    };
  }

  // google Login

  async googleLogin(
    idToken: string,
    role: string,
    res: Response,
  ): Promise<LoginResponce<userDto>> {
    this._logger.log(
      `[authService] googleId${idToken} and User role is ${role}`,
    );

    const ticket = await this._googleClint.verifyIdToken({
      idToken,
      audience: this._configService.get<string>('CLIENT_ID'),
    });

    const payload = ticket.getPayload();
    this._logger.log(
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
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_GOOGLE_TOKEN);
    }

    let user = await this.authRepository.findCandidateByEmail(email);

    user = user[0];
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
        throw new UnauthorizedException(MESSAGES.AUTH.PROFILE_CREATION_FAIILD);
      }

      const profiledata: CreateProfileDto = {
        UserId: user!._id,
        name: user!.name,
      };

      try {
        this._candidateService.createPorfile(profiledata);
      } catch (error) {
        throw error;
      }
    } else {
      if (!user.profile.isActive) {
        throw new ForbiddenException(MESSAGES.AUTH.USER_BLOCKED);
      }

      if (!user.googleId && user.googleId !== googleId && user.role === role) {
        this._logger.log(
          `Linking Google is To the Existinng User ${user.email}`,
        );
      }
      user = await this.authRepository.UpdateGoogleId(
        user._id.toString(),
        googleId,
      );
      if (!user) {
        throw new UnauthorizedException(MESSAGES.AUTH.EMAIL_ALREADY_EXISTS);
      }
      this._logger.log(`existing user logged in  view  googleId`);
    }

    const AccessPayload: JwtAccessPayload = {
      UserId: user._id.toString(),
      email: user.email,
      role: user.role,
      profileId: user?.companyId?.toString(),
    };

    const RefreshPayload: JwtRefreshPayload = {
      UserId: user.id.toString(),
      email: user.email,
    };

    const accessToken =
      this._jwtTokenService.generateAccessToken(AccessPayload);
    const refreshToken =
      this._jwtTokenService.generateRefreshToken(RefreshPayload);

    setJwtCookie(
      res,
      this._configService,
      'access_token',
      accessToken!,
      'JWT_ACCESS_EXPIRES_IN',
      true,
      7 * 24 * 60 * 60 * 1000,
    );

    setJwtCookie(
      res,
      this._configService,
      'refresh_token',
      refreshToken!,
      'JWT_REFRESH_EXPIRES_IN',
      false,
      7 * 24 * 60 * 60 * 1000,
    );

    const { profile, ...cleanedProfile } = user.toObject();

    return {
      message:MESSAGES.AUTH.LOGIN_SUCCESS,
      data: cleanedProfile,
    };
  }

  // link google id to existing User

  async linkGoogleAccount(
    id: string,
    googleId: string,
  ): Promise<UserDocument | null> {
    return this.authRepository.UpdateGoogleId(id, googleId);
  }

  async validateAdmin(dto: LoginDto): Promise<userDto> {
    this._logger.debug('[authService] adminLogin dto', dto);

    const user = await this.authRepository.findUserbyEmailAndRole(
      dto.email,
      dto.role,
    );

    if (!user) {
      this._logger.warn(`Login attempt for ${dto.email}: User not found.`);
      throw new UnauthorizedException(MESSAGES.AUTH.USER_NOT_FOUD);
    }

    if (!user.isVerified) {
      this._logger.warn(`Login attempt for ${dto.email}: User not verified.`);
      throw new UnauthorizedException(MESSAGES.AUTH.EMAIL_NOT_VERIFIED);
    }

    if (!(await bcrypt.compare(dto.password, user.password!))) {
      this._logger.warn(`Login attempt for ${dto.email}: Invalid password.`);
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_EMAIL_PASSWORD);
    }

    this._logger.log(`User ${dto.email} successfully validated.`);
    const mappedData = plainToInstance(userDto, user);
    return mappedData;
  }

  // validate Email with User role  for Updateing password

  async validateEmailAndRoleExistence(
    dto: forgotPasswordDto,
  ): Promise<generalResponce> {
    const { email, role } = dto;
    this._logger.log(
      '[authService] data from the frondend  for reset password',
      dto,
    );

    const user = await this.authRepository.findUserbyEmailAndRole(email, role);
    this._logger.debug(
      '[authService] fetch user from db for udpateing password ',
      user,
    );

    if (!user) {
      throw new UnauthorizedException(MESSAGES.AUTH.USER_NOT_FOUD);
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(MESSAGES.AUTH.UNVERIFIED_USER);
    }

    const Tokenpayload: passwordResetPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const verificationToken =
      await this._jwtTokenService.GeneratePassResetToken(Tokenpayload);
    this._logger.debug(
      `[authService] create token for password updation${verificationToken}`,
    );

    this._emailService.sendForgotPasswordEmail(user.email, verificationToken);

    return {
      message: MESSAGES.AUTH.PASSWORD_RESET_LINK_SENT,
    };
  }

  // update  New password

  async updateNewPassword(dto: UpdatePasswordDto): Promise<generalResponce> {
    const { password, token } = dto;
    let payload: passwordResetPayload;

    try {
      if (!token) {
        throw new BadRequestException(MESSAGES.AUTH.VERIFICATION_TOKEN_MISSING);
      }

      payload = await this._jwtService.verify(token, {
        secret: this._configService.get<string>('JWT_VERIFICATION_SECRET'),
      });
      this._logger.log(`Verification token valid for user ID: ${payload.id}`);
    } catch (error) {
      this._logger.error(
        `Email verification failed: Invalid or expired token - ${error.message}`,
      );
      throw new BadRequestException(
        MESSAGES.AUTH.VERIFICATION_LINK_INVALID_OR_EXPIRED,
      );
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
      message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
    };
  }

  async companyUserLogin(dto: LoginDto, res: Response): Promise<LoginResponce<userDto>> {
    this._logger.log(`[AuthSevice] ComapnyUsers${dto.role}try to login`);

    let user = await this.authRepository.findCompanyByEmail(dto.email);
    user = user[0];

    if (!user) {
      throw new NotFoundException(MESSAGES.AUTH.USER_NOT_FOUD);
    }

    if (!(await bcrypt.compare(dto.password, user.password!))) {
      this._logger.warn(`Login attempt for ${dto.email}: Invalid password.`);
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_EMAIL_PASSWORD);
    }

    if (user.role !== dto.role) {
      this._logger.warn(`Mismath of User Role ${dto.role}`);
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_USER_ROLE);
    }

    if (!user.isVerified) {
      this._logger.warn(`Login attempt for ${dto.email}: User not verified.`);
      throw new UnauthorizedException(MESSAGES.AUTH.EMAIL_NOT_VERIFIED);
    }

    if (!user.profile.isActive) {
      throw new ForbiddenException(MESSAGES.AUTH.USER_BLOCKED);
    }

    const jwtAccessPayload: JwtAccessPayload = {
      UserId: user._id,
      email: user.email,
      role: user.role,
      profileId: user.companyId,
    };

    const RefreshPayload: JwtRefreshPayload = {
      email: user.email,
      UserId: user._id,
    };

    const accessToken =
      await this._jwtTokenService.generateAccessToken(jwtAccessPayload);
    const refreshToken =
      await this._jwtTokenService.generateRefreshToken(RefreshPayload);

    setJwtCookie(
      res,
      this._configService,
      'access_token',
      accessToken!,
      'JWT_ACCESS_EXPIRES_IN',
      true,
      7 * 24 * 60 * 60 * 1000,
    );

    setJwtCookie(
      res,
      this._configService,
      'refresh_token',
      refreshToken!,
      'JWT_REFRESH_EXPIRES_IN',
      false,
      7 * 24 * 60 * 60 * 1000,
    );

    const mappedData = plainToInstance(ResponseRegisterDto, user);
    return {
      message:MESSAGES.AUTH.LOGIN_SUCCESS,
      data: mappedData,
    };
  }

  //create InternalUsers

  async createInternalUser(
    id: string,
    dto: InternalUserDto,
  ): Promise<InternalUserResponceDto> {
    const existinguser = await this.authRepository.findByEmail(dto.email);

    if (existinguser) {
      this._logger.log(`[AuthService] Email alredy Exist${dto.email}`);
      throw new ConflictException(MESSAGES.COMPANY.ALREADY_EXIST);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = {
      name: dto.name,
      email: dto.email,
      role: dto.role,
      password: hashedPassword,
      isVerified: true,
      companyId: new Types.ObjectId(id),
    };

    const data = await this.authRepository.create(newUser);
    this._logger.log(
      `[comapnyService] new company member is added${data.toJSON()}`,
    );

    const mappedData = plainToInstance(
      InternalUserResponceDto,
      {
        ...data?.toJSON(),
      },
      { excludeExtraneousValues: true },
    );
    return mappedData;
  }

  // getUsers
  async getAllUsers(
    id: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<InternalUserResponceDto[]>> {
    const { search, page = 1, limit = 6 } = pagination;
    const filter: FilterQuery<UserDocument> = {};

    if (search) {
      filter.name = { $regex: `^${search}`, $options: 'i' };
    }
    const companyId = new Types.ObjectId(id);
    filter.companyId = companyId;

    this._logger.log(
      `[AuthService] comapny id for get internal users :${id} and query ${filter}`,
    );
    const skip = (page - 1) * limit;

    const { data, total } = await this.authRepository.findManyWithPagination(
      filter,
      {
        skip,
        limit,
      },
    );
    const plaindata = data.map((val) => val.toJSON());

    const mappedData = plainToInstance(InternalUserResponceDto, data);
    const totalPages = Math.ceil(total / limit);
    return {
      data: mappedData,
      message: MESSAGES.COMPANY.USERS_GET_SUCCESS,
      currentPage: page,
      totalItems: total,
      totalPages: totalPages,
      itemsPerPage: limit,
    };
  }

  //get UserProfile

  async getUserProfile(id: string): Promise<InternalUserResponceDto> {
    this._logger.log('[AuthService] geting Company active userprofile', id);
    const data = await this.authRepository.findById(id);
    const mappedData = plainToInstance(InternalUserResponceDto, data?.toJSON());
    this._logger.debug(`[AuthService] profile details gets${mappedData}`);
    return mappedData;
  }

  // update User Profile

  async updateUserProfile(
    id: string,
    dto: UpdateInternalUserDto,
  ): Promise<InternalUserResponceDto> {
    const data = await this.authRepository.update({ _id: id }, { $set: dto });
    const mappedData = plainToInstance(InternalUserResponceDto, data?.toJSON());
    this._logger.debug(`[AuthService] User profile updated ${mappedData}`);
    return mappedData;
  }

  //Update Password

  async changePassword(
    id: string,
    dto: changePassDto,
  ): Promise<generalResponce> {
    this._logger.log(
      `[AuthsService] Try to Update password id: ${id} newPass : ${dto.newPass}`,
    );
    const User = await this.authRepository.findById(id);

    if (!User) {
      throw new ForbiddenException(MESSAGES.AUTH.USER_NOT_FOUD);
    }
    const matchExistingPass = await bcrypt.compare(
      dto.currPass,
      User.password!,
    );
    this._logger.log(
      `[AuthService] Password mathing for updating password is: ${matchExistingPass}`,
    );
    if (!matchExistingPass) {
      throw new ForbiddenException(MESSAGES.AUTH.PASSWORD_MISMATCH_ERROR);
    }
    const newHashedPassword = await bcrypt.hash(dto.newPass, 10);
    await this.authRepository.update(
      { _id: id },
      { $set: { password: newHashedPassword } },
    );

    return {
      message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
    };
  }
}
