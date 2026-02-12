import { CandidateProfileResponseDto } from '../../candiate/dtos/candidate-response.dto';
import {
  CompanyProfileResponseDto,
  UserResponseDto,
} from '../../company/dtos/response.allcompany';
import { changePassDto } from '../../company/dtos/update.profile.dtos';
import { AllJobsAdminResponse } from '../../jobs/dtos/response.job.dto';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import {
  ApiResponse,
  PaginatedResponse,
  PlainResponse,
} from '../../shared/responses/api.response';
import { UpdateAdminProfileDto } from '../dtos/admin-profile.dto';
import { AdminDashboardDto } from '../dtos/admin-dashboard.dto';

export interface IAdminService {
  getAllCompnys(
    dto: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>>;

  getAllCandidates(
    dto: PaginationDto,
  ): Promise<PaginatedResponse<CandidateProfileResponseDto[]>>;
  updateCompanyStatus(id: string): Promise<PlainResponse>;

  updateCandidateStatus(id: string): Promise<PlainResponse>;

  getAllJobs(
    dto: PaginationDto,
  ): Promise<PaginatedResponse<AllJobsAdminResponse[]>>;

  updateJobStatus(id: string): Promise<PlainResponse>;

  getAdminProfile(id: string): Promise<ApiResponse<UserResponseDto>>;

  updatePassword(id: string, dto: changePassDto): Promise<ApiResponse<unknown>>;

  upateUserProfile(
    id: string,
    dto: UpdateAdminProfileDto,
  ): Promise<ApiResponse<UserResponseDto>>;

  getDashboardStats(): Promise<ApiResponse<AdminDashboardDto>>;
}

export const ADMIN_SERVICE = 'ADMIN_SERVICE';
