import {
  generalResponce,
  LoginResponce,
  RegisterResponce,
  tokenresponce,
  verificatonResponce,
} from './api-response.interface';
import { forgotPasswordDto, LoginDto, UpdatePasswordDto } from '../dto/login.dto';
import { UserDocument } from '../schema/user.schema';
import { userDto } from '../dto/user.dto';
import { Response } from 'express';
import { RegisterCandidateDto } from '../dto/register-candidate.dto';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { PaginatedResponse } from '../../admin/interfaces/responce.interface';
import { InternalUserResponceDto } from '../../company/dtos/responce.allcompany';
import { changePassDto, InternalUserDto, UpdateInternalUserDto } from '../../company/dtos/update.profile.dtos';

export interface IAuthService {
  validateUser(
    email: string,
    password: string,
    role: string,
  ): Promise<userDto>;
  registerCandidate(dto: RegisterCandidateDto): Promise<RegisterResponce>;
  verifyEmail(token: string): Promise<verificatonResponce>;
  login(user: userDto,res:Response): Promise<LoginResponce<userDto>>;
  regenerateAccessToken(paylod: UserDocument,res:Response): Promise<tokenresponce>
  googleLogin(idToken:string, role:string,res:Response): Promise<LoginResponce<userDto>>
  findByEmail(email: string): Promise<UserDocument | null>;
  linkGoogleAccount(id: string, googleId: string): Promise<UserDocument | null>;
  findById(id: string): Promise<UserDocument | null>;
  validateAdmin(dto: LoginDto): Promise<userDto>;
  validateEmailAndRoleExistence(dto:forgotPasswordDto):Promise<generalResponce>
  updateNewPassword(dto:UpdatePasswordDto):Promise<generalResponce>
  companyUserLogin(dto: LoginDto,res:Response): Promise<LoginResponce<userDto>>
  getAllUsers(id:string,pagination:PaginationDto):Promise<PaginatedResponse<InternalUserResponceDto[]>>
  createInternalUser(id:string, dto: InternalUserDto): Promise<InternalUserResponceDto>
  getUserProfile(id:string):Promise<InternalUserResponceDto>
  updateUserProfile(id:string,dto:UpdateInternalUserDto):Promise<InternalUserResponceDto>
  changePassword(id:string,dto:changePassDto):Promise<generalResponce>
  
}

export const AUTH_SERVICE = 'AUTH_SERVICE';
