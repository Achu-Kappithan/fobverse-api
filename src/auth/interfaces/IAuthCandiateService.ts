import { ApiResponse } from '../../shared/responses/api.response';
import {
  forgotPasswordDto,
  LoginDto,
  UpdatePasswordDto,
} from '../dto/login.dto';
import { UserDocument } from '../schema/user.schema';
import { userDto } from '../dto/user.dto';
import { Response } from 'express';
import { RegisterCandidateDto } from '../dto/register-candidate.dto';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { PaginatedResponse } from '../../shared/responses/api.response';
import { UserResponseDto } from '../../company/dtos/response.allcompany';
import {
  changePassDto,
  InternalUserDto,
  UpdateInternalUserDto,
} from '../../company/dtos/update.profile.dtos';

export interface IAuthService {
  validateUser(email: string, password: string, role: string): Promise<userDto>;

  registerCandidate(
    dto: RegisterCandidateDto,
  ): Promise<ApiResponse<{ user: UserDocument }>>;

  verifyEmail(token: string): Promise<ApiResponse<{ user: UserDocument }>>;

  login(user: userDto, res: Response): ApiResponse<userDto>;

  regenerateAccessToken(
    paylod: UserDocument,
    res: Response,
  ): ApiResponse<{ newAccess: string }>;

  googleLogin(
    idToken: string,
    role: string,
    res: Response,
  ): Promise<ApiResponse<userDto>>;

  findByEmail(email: string): Promise<UserDocument | null>;

  linkGoogleAccount(id: string, googleId: string): Promise<UserDocument | null>;

  findById(id: string): Promise<UserDocument | null>;

  validateAdmin(dto: LoginDto): Promise<userDto>;

  validateEmailAndRoleExistence(
    dto: forgotPasswordDto,
  ): Promise<ApiResponse<unknown>>;
  updateNewPassword(dto: UpdatePasswordDto): Promise<ApiResponse<unknown>>;

  companyUserLogin(dto: LoginDto, res: Response): Promise<ApiResponse<userDto>>;

  getAllUsers(
    companyId: string,
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<UserResponseDto[]>>;

  createInternalUser(
    id: string,
    dto: InternalUserDto,
  ): Promise<UserResponseDto>;

  getUserProfile(id: string): Promise<UserResponseDto>;

  updateUserProfile(
    id: string,
    dto: UpdateInternalUserDto,
  ): Promise<UserResponseDto>;

  changePassword(id: string, dto: changePassDto): Promise<ApiResponse<unknown>>;

  removeUser(id: string): Promise<ApiResponse<unknown>>;

  getHrUsers(companyId: string): Promise<ApiResponse<UserResponseDto[]>>;

  getInterviewers(companyId: string): Promise<ApiResponse<UserResponseDto[]>>;
}

export const AUTH_SERVICE = 'AUTH_SERVICE';
