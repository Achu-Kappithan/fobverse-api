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
  populatedpData,
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
import { FilterQuery, Types } from 'mongoose';
import { userDto } from './dto/user.dto';
import { Response } from 'express';
import {
  COMPANY_SERVICE,
  IComapnyService,
} from '../company/interface/profile.service.interface';
import {
  CANDIDATE_SERVICE,
  ICandidateService,
} from '../candiate/interfaces/candidate-service.interface';
import { EmailService } from '../email/email.service';
import { MESSAGES } from '../shared/constants/constants.messages';
import { setJwtCookie } from '../shared/utils/cookie.util';
import { CreateProfileDto } from '../company/dtos/create.profile.dto';
import {
  changePassDto,
  InternalUserDto,
  UpdateInternalUserDto,
} from '../company/dtos/update.profile.dtos';
import {
  CompanyProfileResponseDto,
  UserResponceDto,
} from '../company/dtos/responce.allcompany';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { CandidateProfileResponseDto } from '../candiate/dtos/candidate-responce.dto';
import {
  PaginatedResponse,
  PlainResponse,
} from '../admin/interfaces/responce.interface';

@Injectable()
export class AuthService implements IAuthService {
  private readonly _logger = new Logger(AuthService.name);
  private _googleClint: OAuth2Client;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly _authRepository: IAuthRepository,
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
    return this._authRepository.findByEmail(email);
  }

  //find user by Id

  async findById(id: string): Promise<UserDocument | null> {
    this._logger.log(`Finding user by Id:${id}`);
    const user = await this._authRepository.findById(id);
    return user;
  }

  //vaildate user for login

  async validateUser(
    email: string,
    password: string,
    role: UserRole,
  ): Promise<userDto> {
    this._logger.debug(`Attempting to validate user: ${email}`);

    const profileData = await this._authRepository.findCandidateByEmail(email);

    if (!profileData) {
      this._logger.warn(`Login attempt for ${email}: User not found.`);
      throw new UnauthorizedException(MESSAGES.AUTH.USER_NOT_FOUD);
    }

    if (!profileData.password) {
      throw new BadRequestException(MESSAGES.AUTH.ACCOUNT_LINKED_WITH_GOOGLE);
    }

    if (!(await bcrypt.compare(password, profileData.password))) {
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

  login(user: userDto, res: Response): LoginResponce<userDto> {
    this._logger.debug(
      `[AuthService.login] Preparing payload for tokens for user: ${user.email}`,
    );
    const AccessPayload: JwtAccessPayload = {
      UserId: (user._id as unknown as Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
      profileId: user.companyId?.toString(),
    };

    const RefreshPayload: JwtRefreshPayload = {
      UserId: (user._id as unknown as Types.ObjectId).toString(),
      email: user.email,
    };

    const AccessToken =
      this._jwtTokenService.generateAccessToken(AccessPayload);
    const RefreshToken =
      this._jwtTokenService.generateRefreshToken(RefreshPayload);

    const accessTokenExpiresIn = this._configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshTokenExpiresIn = this._configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    setJwtCookie(
      res,
      this._configService,
      'access_token',
      AccessToken,
      'JWT_ACCESS_EXPIRES_IN',
      true,
      parseInt(accessTokenExpiresIn!),
    );

    setJwtCookie(
      res,
      this._configService,
      'refresh_token',
      RefreshToken,
      'JWT_REFRESH_EXPIRES_IN',
      false,
      parseInt(refreshTokenExpiresIn!),
    );

    const mappedData = plainToInstance(userDto, user);

    return {
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      data: mappedData,
    };
  }

  //  registering new user

  async registerCandidate(
    dto: RegisterCandidateDto,
  ): Promise<RegisterResponce> {
    const existingUser = await this._authRepository.findByEmail(dto.email);
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

      await this._emailService.sendVerificationEmail(
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
    } as UserDocument;
    this._logger.log(`Creating new candidate: ${email}`);
    return await this._authRepository.create(newUser);
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
        `Email verification failed: Invalid or expired token - ${error}`,
      );
      throw new BadRequestException(
        MESSAGES.AUTH.VERIFICATION_LINK_INVALID_OR_EXPIRED,
      );
    }

    const user = await this._authRepository.findById(payload.UserId);

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

    const verifieduser = await this._authRepository.updateVerificationStatus(
      user._id.toString(),
      true,
    );

    const profiledataDto: CreateProfileDto = {
      UserId: verifieduser!._id.toString(),
      name: verifieduser!.name,
    };

    let newProfile:
      | CandidateProfileResponseDto
      | CompanyProfileResponseDto
      | undefined;

    this._logger.log(
      `User ${JSON.stringify(verifieduser)} successfully verified.`,
    );

    if (user.role == UserRole.CANDIDATE) {
      newProfile = await this._candidateService.createPorfile(profiledataDto);
    } else if (user.role === UserRole.COMPANY_ADMIN) {
      newProfile = await this._companyService.createProfile(profiledataDto);
      if (newProfile) {
        const finaldata = await this._authRepository.update(
          { _id: newProfile.adminUserId },
          { $set: { companyId: newProfile._id } },
        );
        this._logger.debug(
          `[AuthService], completed company profile${JSON.stringify(finaldata)}`,
        );
      }
    }

    return {
      message: MESSAGES.AUTH.EMAIL_VERIFIED,
      user: verifieduser!,
    };
  }

  // create new Access Token user RefreshTokens

  regenerateAccessToken(paylod: UserDocument, res: Response): tokenresponce {
    const tokenPaylod: JwtAccessPayload = {
      UserId: paylod._id.toString(),
      email: paylod.email,
      role: paylod.role,
      profileId: paylod?.companyId?.toString(),
    };

    const newAccessToken =
      this._jwtTokenService.generateAccessToken(tokenPaylod);

    const accessTokenExpiresIn = this._configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );

    setJwtCookie(
      res,
      this._configService,
      'access_token',
      newAccessToken,
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME_MS',
      true,
      parseInt(accessTokenExpiresIn!),
    );

    return {
      message: MESSAGES.AUTH.ACCESS_TOKEN_REFRESHED,
    };
  }

  // google Login

  async googleLogin(
    idToken: string,
    role: UserRole,
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
      `[authService] get details from the google payload${JSON.stringify(payload)}`,
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

    let user: populatedpData | UserDocument | null;

    user = await this._authRepository.findCandidateByEmail(email);
    console.log('get candiate usering email ', user);

    if (user && user.role !== role) {
      throw new ConflictException(MESSAGES.AUTH.EMAIL_ALREADY_EXISTS);
    }

    if (!user) {
      user = await this._authRepository.create({
        name: name!,
        email: email,
        googleId: googleId,
        isVerified: isVerified!,
        role: role,
      } as UserDocument);

      if (!user) {
        throw new UnauthorizedException(MESSAGES.AUTH.PROFILE_CREATION_FAIILD);
      }

      const profiledata: CreateProfileDto = {
        UserId: user._id.toString(),
        name: user.name,
      };

      await this._candidateService.createPorfile(profiledata);
    } else {
      const populatedUser = user as populatedpData;
      if (!populatedUser.profile.isActive) {
        throw new ForbiddenException(MESSAGES.AUTH.USER_BLOCKED);
      }

      if (!user.googleId && user.googleId !== googleId && user.role === role) {
        this._logger.log(
          `Linking Google is To the Existinng User ${user.email}`,
        );
      }
      user = await this._authRepository.UpdateGoogleId(
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
      UserId: user._id.toString(),
      email: user.email,
    };

    const accessToken =
      this._jwtTokenService.generateAccessToken(AccessPayload);
    const refreshToken =
      this._jwtTokenService.generateRefreshToken(RefreshPayload);

    const accessTokenExpiresIn = this._configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshTokenExpiresIn = this._configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    setJwtCookie(
      res,
      this._configService,
      'access_token',
      accessToken,
      'JWT_ACCESS_EXPIRES_IN',
      true,
      parseInt(accessTokenExpiresIn!),
    );

    setJwtCookie(
      res,
      this._configService,
      'refresh_token',
      refreshToken,
      'JWT_REFRESH_EXPIRES_IN',
      false,
      parseInt(refreshTokenExpiresIn!),
    );

    const mappedData = plainToInstance(userDto, user);

    return {
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      data: mappedData,
    };
  }

  // link google id to existing User

  async linkGoogleAccount(
    id: string,
    googleId: string,
  ): Promise<UserDocument | null> {
    return this._authRepository.UpdateGoogleId(id, googleId);
  }

  async validateAdmin(dto: LoginDto): Promise<userDto> {
    this._logger.debug('[authService] adminLogin dto', dto);

    const user = await this._authRepository.findUserbyEmailAndRole(
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

    const mappedData = plainToInstance(
      userDto,
      {
        ...user.toObject(),
        _id: user._id.toString(),
        companyId: user.companyId?.toString(),
      },
      {
        excludeExtraneousValues: true,
      },
    );
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

    const user = await this._authRepository.findUserbyEmailAndRole(email, role);
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
      this._jwtTokenService.GeneratePassResetToken(Tokenpayload);
    this._logger.debug(
      `[authService] create token for password updation${verificationToken}`,
    );

    await this._emailService.sendForgotPasswordEmail(
      user.email,
      verificationToken,
    );

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
        `Email verification failed: Invalid or expired token - ${error}`,
      );
      throw new BadRequestException(
        MESSAGES.AUTH.VERIFICATION_LINK_INVALID_OR_EXPIRED,
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const updatedUser = await this._authRepository.update(
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

  async companyUserLogin(
    dto: LoginDto,
    res: Response,
  ): Promise<LoginResponce<userDto>> {
    this._logger.log(`[AuthSevice] ComapnyUsers${dto.role}try to login`);

    const user = await this._authRepository.findCompanyByEmail(dto.email);

    if (!user) {
      throw new NotFoundException(MESSAGES.AUTH.USER_NOT_FOUD);
    }
    const compareResult = await bcrypt.compare(dto.password, user.password!);
    if (!compareResult) {
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
      UserId: user._id.toString(),
      email: user.email,
      role: user.role,
      profileId: user.companyId?.toString(),
    };

    const RefreshPayload: JwtRefreshPayload = {
      email: user.email,
      UserId: user._id.toString(),
    };

    const accessToken =
      this._jwtTokenService.generateAccessToken(jwtAccessPayload);
    const refreshToken =
      this._jwtTokenService.generateRefreshToken(RefreshPayload);

    const accessTokenExpiresIn = this._configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshTokenExpiresIn = this._configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    setJwtCookie(
      res,
      this._configService,
      'access_token',
      accessToken,
      'JWT_ACCESS_EXPIRES_IN',
      true,
      parseInt(accessTokenExpiresIn!),
    );

    setJwtCookie(
      res,
      this._configService,
      'refresh_token',
      refreshToken,
      'JWT_REFRESH_EXPIRES_IN',
      false,
      parseInt(refreshTokenExpiresIn!),
    );

    const mappedData = plainToInstance(userDto, user);
    return {
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      data: mappedData,
    };
  }

  //create InternalUsers

  async createInternalUser(
    id: string,
    dto: InternalUserDto,
  ): Promise<UserResponceDto> {
    const existinguser = await this._authRepository.findByEmail(dto.email);

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
    } as UserDocument;

    const data = await this._authRepository.create(newUser);
    this._logger.log(
      `[comapnyService] new company member is added${JSON.stringify(data)}`,
    );

    const mappedData = plainToInstance(
      UserResponceDto,
      {
        ...data?.toJSON(),
      },
      { excludeExtraneousValues: true },
    );
    return mappedData;
  }

  // getUsers
  async getAllUsers(
    companyId: string,
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<UserResponceDto[]>> {
    const { search, page = 1, limit = 6, filtervalue } = pagination;
    const filter: FilterQuery<UserDocument> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: `^${search}`, $options: 'i' } },
        { role: { $regex: `^${search}`, $options: 'i' } },
      ];
    }

    if (filtervalue) {
      filter.role = { $regex: `^${filtervalue}`, $options: 'i' };
    }

    const companyObjId = new Types.ObjectId(companyId);
    filter.companyId = companyObjId;

    const userObjId = new Types.ObjectId(userId);
    filter._id = { $ne: userObjId };

    this._logger.log(
      `[AuthService] comapny id for get internal users :${companyId} Serchquery ${JSON.stringify(filter)} and filterQuery: ${filtervalue}`,
    );
    const skip = (page - 1) * limit;

    const { data, total } = await this._authRepository.findManyWithPagination(
      filter,
      {
        skip,
        limit,
      },
    );
    const plaindata = data.map((val) => {
      const user = val.toJSON();
      return {
        ...user,
        _id: user._id.toString(),
      };
    });

    const mappedData = plainToInstance(UserResponceDto, plaindata);
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

  async getUserProfile(id: string): Promise<UserResponceDto> {
    this._logger.log('[AuthService] geting Company active userprofile', id);
    const data = await this._authRepository.findById(id);
    const mappedData = plainToInstance(UserResponceDto, data?.toJSON());
    this._logger.debug(
      `[AuthService] profile details gets${JSON.stringify(mappedData)}`,
    );
    return mappedData;
  }

  // update User Profile

  async updateUserProfile(
    id: string,
    dto: UpdateInternalUserDto,
  ): Promise<UserResponceDto> {
    const data = await this._authRepository.update({ _id: id }, { $set: dto });
    const mappedData = plainToInstance(UserResponceDto, data?.toJSON());
    this._logger.debug(
      `[AuthService] User profile updated ${JSON.stringify(mappedData)}`,
    );
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
    const User = await this._authRepository.findById(id);

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
    await this._authRepository.update(
      { _id: id },
      { $set: { password: newHashedPassword } },
    );

    return {
      message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
    };
  }

  async removeUser(id: string): Promise<PlainResponse> {
    const filter: FilterQuery<UserDocument> = {};
    const userObjId = new Types.ObjectId(id);
    filter._id = userObjId;
    const data = await this._authRepository.delete(filter);
    console.log(data);
    return {
      message: MESSAGES.COMPANY.USER_REMOVED,
    };
  }
}
