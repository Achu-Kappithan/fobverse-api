import { generalResponce } from '../../auth/interfaces/api-response.interface';
import { CandidateProfileResponseDto } from '../../candiate/dtos/candidate-responce.dto';
import {
  CompanyProfileResponseDto,
  UserResponceDto,
} from '../../company/dtos/responce.allcompany';
import { changePassDto } from '../../company/dtos/update.profile.dtos';
import { AllJobsAdminResponce } from '../../jobs/dtos/responce.job.dto';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { ApiResponce } from '../../shared/interface/api.responce';
import { UpdateAdminProfileDto } from '../dtos/admin-profile.dto';
import { PaginatedResponse, PlainResponse } from './responce.interface';

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
  ): Promise<PaginatedResponse<AllJobsAdminResponce[]>>;

  updateJobStatus(id: string): Promise<PlainResponse>;

  getAdminProfile(id: string): Promise<ApiResponce<UserResponceDto>>;

  updatePassword(id: string, dto: changePassDto): Promise<generalResponce>;

  upateUserProfile(
    id: string,
    dto: UpdateAdminProfileDto,
  ): Promise<ApiResponce<UserResponceDto>>;
}

export const ADMIN_SERVICE = 'ADMIN_SERVICE';
