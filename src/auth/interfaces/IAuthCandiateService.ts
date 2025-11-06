import {
  generalResponce,
  LoginResponce,
  RegisterResponce,
  tokenresponce,
  verificatonResponce,
} from './api-response.interface';
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
import {
  PaginatedResponse,
  PlainResponse,
} from '../../admin/interfaces/responce.interface';
import { UserResponceDto } from '../../company/dtos/responce.allcompany';
import {
  changePassDto,
  InternalUserDto,
  UpdateInternalUserDto,
} from '../../company/dtos/update.profile.dtos';
import { comapnyResponceInterface } from '../../company/interface/responce.interface';

export interface IAuthService {
  validateUser(email: string, password: string, role: string): Promise<userDto>;
  registerCandidate(dto: RegisterCandidateDto): Promise<RegisterResponce>;
  verifyEmail(token: string): Promise<verificatonResponce>;
  login(user: userDto, res: Response): LoginResponce<userDto>;
  regenerateAccessToken(paylod: UserDocument, res: Response): tokenresponce;
  googleLogin(
    idToken: string,
    role: string,
    res: Response,
  ): Promise<LoginResponce<userDto>>;
  findByEmail(email: string): Promise<UserDocument | null>;
  linkGoogleAccount(id: string, googleId: string): Promise<UserDocument | null>;
  findById(id: string): Promise<UserDocument | null>;
  validateAdmin(dto: LoginDto): Promise<userDto>;
  validateEmailAndRoleExistence(
    dto: forgotPasswordDto,
  ): Promise<generalResponce>;
  updateNewPassword(dto: UpdatePasswordDto): Promise<generalResponce>;
  companyUserLogin(
    dto: LoginDto,
    res: Response,
  ): Promise<LoginResponce<userDto>>;
  getAllUsers(
    companyId: string,
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<UserResponceDto[]>>;
  createInternalUser(
    id: string,
    dto: InternalUserDto,
  ): Promise<UserResponceDto>;
  getUserProfile(id: string): Promise<UserResponceDto>;
  updateUserProfile(
    id: string,
    dto: UpdateInternalUserDto,
  ): Promise<UserResponceDto>;
  changePassword(id: string, dto: changePassDto): Promise<generalResponce>;
  removeUser(id: string): Promise<PlainResponse>;
  getHrUsers(
    companyId: string,
  ): Promise<comapnyResponceInterface<UserResponceDto[]>>;
}

export const AUTH_SERVICE = 'AUTH_SERVICE';
