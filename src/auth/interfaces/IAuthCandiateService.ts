import { RegisterCandidateDto } from 'src/auth/dto/register-candidate.dto';
import {
  generalResponce,
  LoginResponce,
  RegisterResponce,
  tokenresponce,
  verificatonResponce,
} from './api-response.interface';
import { forgotPasswordDto, LoginDto, UpdatePasswordDto } from '../dto/login.dto';
import { UserDocument } from '../schema/user.schema';
import { InternalUserDto } from 'src/company/dtos/update.profile.dtos';
import { comapnyResponceInterface } from 'src/company/interface/responce.interface';
import { InternalUserResponceDto } from 'src/company/dtos/responce.allcompany';

export interface IAuthService {
  validateUser(
    email: string,
    password: string,
    role: string,
  ): Promise<UserDocument | null>;
  registerCandidate(dto: RegisterCandidateDto): Promise<RegisterResponce>;
  verifyEmail(token: string): Promise<verificatonResponce>;
  // resendVerificationEmail(email:string):Promise<any>
  login(user: any): Promise<LoginResponce>;
  regenerateAccessToken(paylod: UserDocument): Promise<tokenresponce>;
  googleLogin(idToken: string, role: string): Promise<LoginResponce>;
  findByEmail(email: string): Promise<UserDocument | null>;
  linkGoogleAccount(id: string, googleId: string): Promise<UserDocument | null>;
  findById(id: string): Promise<UserDocument | null>;
  validateAdmin(dto: LoginDto): Promise<UserDocument | null>;
  validateEmailAndRoleExistence(dto:forgotPasswordDto):Promise<generalResponce>
  UpdateNewPassword(dto:UpdatePasswordDto):Promise<generalResponce>
  companyUserLogin(dot:LoginDto): Promise<LoginResponce>
  getUsers(id:string):Promise<InternalUserResponceDto[]>
  createInternalUser(id:string, dto: InternalUserDto): Promise<InternalUserResponceDto>
}

export const AUTH_SERVICE = 'AUTH_SERVICE';
