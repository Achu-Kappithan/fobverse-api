import { ApiResponse } from '../../shared/responses/api.response';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { CreateProfileDto } from '../dtos/create.profile.dto';
import { populateProfileDto } from '../dtos/populatedprofile.res.dto';
import {
  CompanyProfileResponseDto,
  UserResponseDto,
} from '../dtos/response.allcompany';
import {
  changePassDto,
  InternalUserDto,
  TeamMemberDto,
  UpdateInternalUserDto,
  UpdateProfileDto,
} from '../dtos/update.profile.dtos';
import { DashboardResponseDto } from '../dtos/dashboard.dto';
import { PaginatedResponse } from '../../shared/responses/api.response';

export interface IComapnyService {
  createProfile(dto: CreateProfileDto): Promise<CompanyProfileResponseDto>;

  getProfile(id: string): Promise<ApiResponse<CompanyProfileResponseDto>>;

  updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<ApiResponse<CompanyProfileResponseDto>>;

  createUser(
    id: string,
    dto: InternalUserDto,
  ): Promise<ApiResponse<UserResponseDto>>;

  getInternalUsers(
    comapanyId: string,
    userId: string,
    pagination: PaginationDto,
  ): Promise<ApiResponse<UserResponseDto[]>>;

  getUserProfile(id: string): Promise<ApiResponse<UserResponseDto>>;

  updateUserProfile(
    id: string,
    dto: UpdateInternalUserDto,
  ): Promise<ApiResponse<UserResponseDto>>;

  updatePassword(id: string, dto: changePassDto): Promise<ApiResponse<unknown>>;

  addTeamMembers(
    id: string,
    dto: TeamMemberDto,
  ): Promise<ApiResponse<CompanyProfileResponseDto>>;

  getPublicProfile(id: string): Promise<ApiResponse<populateProfileDto>>;

  removeUser(id: string): Promise<ApiResponse<unknown>>;

  getHrUsers(companyId: string): Promise<ApiResponse<UserResponseDto[]>>;

  getInterviewers(companyId: string): Promise<ApiResponse<UserResponseDto[]>>;

  getAllCompanies(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>>;

  getDashboardData(
    companyId: string,
  ): Promise<ApiResponse<DashboardResponseDto>>;
}

export const COMPANY_SERVICE = 'COMPANY_SERVICE';
