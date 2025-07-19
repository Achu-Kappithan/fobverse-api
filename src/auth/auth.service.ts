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
import { AwsClient, OAuth2Client } from 'google-auth-library';
import { JwtTokenService } from './jwt.services/jwt-service';
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
import { UserDocument, UserRole } from './schema/user.schema';
import { plainToInstance } from 'class-transformer';
import { ResponseRegisterDto } from './dto/response.dto';
import { InternalUserResponceDto } from 'src/company/dtos/responce.allcompany';
import { Types } from 'mongoose';
import { changePassDto, InternalUserDto, UpdateInternalUserDto } from 'src/company/dtos/update.profile.dtos';
import { map } from 'rxjs';
import { PassThrough } from 'stream';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClint: OAuth2Client;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject( forwardRef(()=>COMPANY_SERVICE))
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

    profileData = await this.authRepository.findCandidateByEmail(email);
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
    console.log(profileData)

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
      UserId: user._id.toString(),
      email: user.email,
      role: user.role,
      profileId:user.companyId?.toString()
    };

    const RefreshPayload: JwtRefreshPayload = {
      UserId: user._id.toString(),
      email: user.email,
    };

    const AccessToken =
      await this.jwtTokenService.generateAccessToken(AccessPayload);
    const RefreshToken =
      await this.jwtTokenService.generateRefreshToken(RefreshPayload);

      const mappedData = plainToInstance(
        ResponseRegisterDto,
        user
      )

    return {
      accessToken: AccessToken,
      refreshToken: RefreshToken,
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
      this.logger.log(`New candidate registered: ${newUser.email}`);
      const verificationPayload: JwtVerificationPayload = {
        UserId: newUser._id.toString(),
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
        `Verification token valid for user ID: ${payload.UserId}`,
      );
    } catch (error) {
      this.logger.error(
        `Email verification failed: Invalid or expired token - ${error.message}`,
      );
      throw new BadRequestException(MESSAGES.AUTH.VERIFICATION_LINK_INVALID_OR_EXPIRED);
    }

    const user = await this.authRepository.findById(payload.UserId);

    if (!user) {
      this.logger.warn(
        `Email verification attempt for non-existent user ID: ${payload.UserId}`,
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

    const profiledataDto: CreateProfileDto = {
      adminUserId: verifieduser!._id.toString(),
      name: verifieduser!.name,
    };

    let newProfile

    this.logger.log(`User ${verifieduser} successfully verified.`);

    try {
      if (user.role == UserRole.CANDIDATE) {
       newProfile = await this._candidateService.createPorfile(profiledataDto);
      } else if (user.role === UserRole.COMPANY_ADMIN) {
        newProfile = await  this._companyService.createProfile(profiledataDto);
          if(newProfile){
            const finaldata = await this.authRepository.update({_id:newProfile.adminUserId},{$set:{companyId:newProfile._id}})
            this.logger.debug(`[AuthService], completed company profile${finaldata}`)
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

  async regenerateAccessToken(paylod: UserDocument): Promise<tokenresponce> {
    const tokenPaylod: JwtAccessPayload = {
      UserId: paylod._id.toString(),
      email: paylod.email,
      role: paylod.role,
      profileId: paylod?.companyId?.toString()
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

    let user = await this.authRepository.findCandidateByEmail(email);

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
        adminUserId: user!._id,
        name: user!.name,
      };

      try {
          this._candidateService.createPorfile(profiledata);
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
      UserId: user._id.toString(),
      email: user.email,
      role: user.role,
      profileId: user?.companyId?.toString()
    };

    const RefreshPayload: JwtRefreshPayload = {
      UserId: user.id.toString(),
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
      id: user._id.toString(),
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


  async companyUserLogin(dto: LoginDto): Promise<LoginResponce> {
    this.logger.log(`[AuthSevice] ComapnyUsers${dto.role}try to login`)

    let  user = await this.authRepository.findCompanyByEmail(dto.email)
    user= user[0]

    if(!user){
      throw new NotFoundException(MESSAGES.AUTH.USER_NOT_FOUD)
    }

    if (!(await bcrypt.compare(dto.password, user.password!))) {
      this.logger.warn(`Login attempt for ${dto.email}: Invalid password.`);
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_EMAIL_PASSWORD);
    }

    if (user.role !== dto.role) {
      this.logger.warn(`Mismath of User Role ${dto.role}`);
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_USER_ROLE);
    }

    if (!user.isVerified) {
      this.logger.warn(`Login attempt for ${dto.email}: User not verified.`);
      throw new UnauthorizedException(MESSAGES.AUTH.EMAIL_NOT_VERIFIED)
    }
    console.log(user)

    if (!user.profile.isActive) {
      throw new ForbiddenException(
        MESSAGES.AUTH.USER_BLOCKED
      );
    }

    const jwtAccessPayload: JwtAccessPayload = {
      UserId: user._id,
      email: user.email,
      role: user.role,
      profileId:user.companyId
    }

    const RefreshPayload :JwtRefreshPayload = {
      email:user.email,
      UserId:user._id
    }

    const accessToken = await this.jwtTokenService.generateAccessToken(jwtAccessPayload)
    const refreshToken = await  this.jwtTokenService.generateRefreshToken(RefreshPayload)

    const mappedData = plainToInstance(
      ResponseRegisterDto,
      user
    )
    return {
      accessToken:accessToken,
      refreshToken:refreshToken,
      data:mappedData
    }

  }

  //create InternalUsers

  async createInternalUser(id:string, dto: InternalUserDto): Promise<InternalUserResponceDto> {
      const existinguser = await this.authRepository.findByEmail(dto.email)

      if(existinguser){
      this.logger.log(`[AuthService] Email alredy Exist${dto.email}`)
      throw new ConflictException(MESSAGES.COMPANY.ALREADY_EXIST)
      }

      const hashedPassword = await bcrypt.hash(dto.password,10)

      console.log("before creatin ",id)

      const newUser = {
      name: dto.name,
      email: dto.email,
      role: dto.role,
      password: hashedPassword,
      isVerified: true,
      companyId: new Types.ObjectId(id)
      }

      console.log("after createion",newUser.companyId)

      const data = await this.authRepository.create(newUser)
      this.logger.log(`[comapnyService] new company member is added${data.toJSON()}`)

      const mappedData = plainToInstance(
      InternalUserResponceDto,
      {
          ...data?.toJSON()
      },
      {excludeExtraneousValues:true}
      )
      console.log('udpdated responce in service file',mappedData)
      return mappedData
  }

  // getUsers
  async getUsers(id: string): Promise<InternalUserResponceDto[]> {
    this.logger.log(`[AuthService] comapny id for get internal users :${id}`)
    const companyId = new Types.ObjectId(id)
    const  users = await this.authRepository.findInternalUsers(companyId)
    const plaindata = users.map((val)=>val.toJSON())

      const mappedData = plainToInstance(
        InternalUserResponceDto,
        users
      )
      console.log("mapped daata",mappedData)
    return mappedData
  }

  //get UserProfile

  async getUserProfile(id:string):Promise<InternalUserResponceDto>{
    this.logger.log('[AuthService] geting Company active userprofile',id)
    const data = await this.authRepository.findById(id)
    const  mappedData = plainToInstance(
      InternalUserResponceDto,
      data?.toJSON()
    )
    this.logger.debug(`[AuthService] profile details gets${mappedData}`)
    return mappedData
  }

  // update User Profile

  async updateUserProfile(id: string, dto:UpdateInternalUserDto): Promise<InternalUserResponceDto> {
    const data = await this.authRepository.update({_id:id},{$set:dto})
    const mappedData = plainToInstance(
      InternalUserResponceDto,
      data?.toJSON()
    )
    this.logger.debug(`[AuthService] User profile updated ${mappedData}`)
    return mappedData
  }

  //Update Password

  async changePassword(id:string,dto:changePassDto):Promise<generalResponce>{
    this.logger.log(`[AuthsService] Try to Update password id: ${id} newPass : ${dto.newPass}`)
    const User = await this.authRepository.findById(id);
    
    if(!User){
      throw new ForbiddenException(MESSAGES.AUTH.USER_NOT_FOUD)
    }
    console.log(User)
    const matchExistingPass = await  bcrypt.compare(dto.currPass, User.password!)
    this.logger.log(`[AuthService] Password mathing for updating password is: ${matchExistingPass}`)
    if(!matchExistingPass){
      throw new ForbiddenException(MESSAGES.AUTH.PASSWORD_MISMATCH_ERROR)
    }
    const newHashedPassword = await bcrypt.hash(dto.newPass,10)
    await this.authRepository.update({_id:id},{$set:{password:newHashedPassword}})

    return {
      message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS
    }
  }

}
