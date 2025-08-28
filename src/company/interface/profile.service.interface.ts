import { generalResponce } from '../../auth/interfaces/api-response.interface';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { CreateProfileDto } from '../dtos/create.profile.dto';
import { populateProfileDto } from '../dtos/populatedprofile.res.dto';
import {
  CompanyProfileResponseDto,
  UserResponceDto,
} from '../dtos/responce.allcompany';
import {
  changePassDto,
  InternalUserDto,
  TeamMemberDto,
  UpdateInternalUserDto,
  UpdateProfileDto,
} from '../dtos/update.profile.dtos';
import { comapnyResponceInterface } from './responce.interface';

export interface IComapnyService {
  createProfile(dto: CreateProfileDto): Promise<CompanyProfileResponseDto>;

  getPorfile(
    id: string,
  ): Promise<comapnyResponceInterface<CompanyProfileResponseDto>>;

  updatePorfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<comapnyResponceInterface<CompanyProfileResponseDto>>;

  createUser(
    id: string,
    dto: InternalUserDto,
  ): Promise<comapnyResponceInterface<UserResponceDto>>;

  getInternalUsers(
    id: string,
    pagination: PaginationDto,
  ): Promise<comapnyResponceInterface<UserResponceDto[]>>;

  getUserProfile(
    id: string,
  ): Promise<comapnyResponceInterface<UserResponceDto>>;

  upateUserProfile(
    id: string,
    dto: UpdateInternalUserDto,
  ): Promise<comapnyResponceInterface<UserResponceDto>>;

  updatePassword(id: string, dto: changePassDto): Promise<generalResponce>;

  addTeamMembers(
    id: string,
    dto: TeamMemberDto,
  ): Promise<comapnyResponceInterface<CompanyProfileResponseDto>>;

  getPublicPorfile(
    id: string,
  ): Promise<comapnyResponceInterface<populateProfileDto>>;
}

export const COMPANY_SERVICE = 'COMPANY_SERVICE';
